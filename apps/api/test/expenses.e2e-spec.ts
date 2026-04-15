import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { createRequestValidationPipe } from '../src/common/request-validation';
import { PrismaService } from '../src/prisma/prisma.service';

const setTokenSecrets = () => {
  process.env.ACCESS_TOKEN_SECRET = 'access-secret';
  process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
  delete process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_REFRESH_SECRET;
};

const quoteIdentifier = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

describe('Expenses (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    setTokenSecrets();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(createRequestValidationPipe());
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    const auxTables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND (lower(name) LIKE '%expense%' OR lower(name) LIKE '%audit%')",
    );

    for (const { name } of auxTables) {
      if (name === '_prisma_migrations') continue;
      await prisma.$executeRawUnsafe(`DELETE FROM ${quoteIdentifier(name)}`);
    }

    await prisma.outboxEvent.deleteMany();
    await prisma.booking.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.tripRequest.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
      data: [
        { email: 'traveler-a@test.com', passwordHash, role: 'traveler' },
        { email: 'traveler-b@test.com', passwordHash, role: 'traveler' },
        { email: 'approver@test.com', passwordHash, role: 'approver' },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  const login = async (email: string) => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'password123' });

    expect(response.status).toBe(201);
    return response.body.accessToken as string;
  };

  const createTrip = async (travelerToken: string, budget = 1200) => {
    const createResponse = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({
        destination: 'Madrid',
        startDate: '2026-05-10T00:00:00.000Z',
        endDate: '2026-05-15T00:00:00.000Z',
        reason: 'Client meeting',
        budget,
        costCenter: 'CC-100',
      });

    expect(createResponse.status).toBe(201);
    return createResponse.body.id as string;
  };

  const submitTrip = async (travelerToken: string, tripId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/trips/${tripId}/submit`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .send();

    expect(response.status).toBe(201);
    return response.body;
  };

  const approveTrip = async (approverToken: string, tripId: string) => {
    const response = await request(app.getHttpServer())
      .post(`/trips/${tripId}/approve`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ comment: 'Approved for expenses' });

    expect(response.status).toBe(201);
    expect(response.body.status).toBe('approved');
    return response.body;
  };

  const bookTrip = async (approverToken: string, tripId: string) => {
    const optionsResponse = await request(app.getHttpServer())
      .get(`/bookings/options/${tripId}`)
      .set('Authorization', `Bearer ${approverToken}`);

    expect(optionsResponse.status).toBe(200);
    const optionId = optionsResponse.body?.[0]?.id;
    expect(optionId).toEqual(expect.any(String));

    const confirmResponse = await request(app.getHttpServer())
      .post('/bookings/confirm')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ tripId, optionId });

    expect([200, 201]).toContain(confirmResponse.status);
    expect(confirmResponse.body.status).toBe('booked');
  };

  const submitExpense = async (
    travelerToken: string,
    tripId: string,
    amount: number,
    category = 'meal',
    description?: string,
  ) =>
    request(app.getHttpServer())
      .post(`/expenses/${tripId}`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .send({ amount, category, description });

  const hasAuditAction = async (action: string) => {
    const escapedAction = action.replace(/'/g, "''");
    const tables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND lower(name) LIKE '%audit%'",
    );

    for (const { name } of tables) {
      const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `PRAGMA table_info(${quoteIdentifier(name)})`,
      );
      const columnNames = columns.map((column) => column.name);
      if (columnNames.length === 0) continue;

      if (columnNames.includes('action')) {
        const countRows = await prisma.$queryRawUnsafe<Array<{ count: number }>>(
          `SELECT COUNT(*) as count FROM ${quoteIdentifier(name)} WHERE action = '${escapedAction}'`,
        );
        if ((countRows[0]?.count ?? 0) > 0) return true;
      }

      const columnList = columnNames.map((column) => quoteIdentifier(column)).join(', ');
      const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT ${columnList} FROM ${quoteIdentifier(name)} ORDER BY rowid DESC LIMIT 100`,
      );
      const found = rows.some((row) =>
        Object.values(row).some((value) => typeof value === 'string' && value.includes(action)),
      );
      if (found) return true;
    }

    return false;
  };

  it('returns flagged when traveler submits an expense above the policy cap', async () => {
    const travelerToken = await login('traveler-a@test.com');
    const approverToken = await login('approver@test.com');
    const tripId = await createTrip(travelerToken, 500);
    await submitTrip(travelerToken, tripId);
    await approveTrip(approverToken, tripId);
    await bookTrip(approverToken, tripId);

    const response = await submitExpense(
      travelerToken,
      tripId,
      1500,
      'hotel',
      'Hotel upgrade over policy',
    );

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'flagged',
      }),
    );
  });

  it('returns submitted when traveler submits an expense under the policy cap', async () => {
    const travelerToken = await login('traveler-a@test.com');
    const approverToken = await login('approver@test.com');
    const tripId = await createTrip(travelerToken, 2000);
    await submitTrip(travelerToken, tripId);
    await approveTrip(approverToken, tripId);
    await bookTrip(approverToken, tripId);

    const response = await submitExpense(
      travelerToken,
      tripId,
      70,
      'meal',
      'Lunch with client',
    );

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: 'submitted',
      }),
    );
  });

  it("returns 403 FORBIDDEN when submitting an expense for another traveler's trip", async () => {
    const travelerAToken = await login('traveler-a@test.com');
    const approverToken = await login('approver@test.com');
    const travelerBToken = await login('traveler-b@test.com');
    const travelerBTripId = await createTrip(travelerBToken);
    await submitTrip(travelerBToken, travelerBTripId);
    await approveTrip(approverToken, travelerBTripId);
    await bookTrip(approverToken, travelerBTripId);

    const response = await submitExpense(travelerAToken, travelerBTripId, 80, 'taxi');

    expect(response.status).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'FORBIDDEN',
      }),
    );
  });

  it('returns 409 INVALID_STATUS when submitting an expense for a trip in pending_approval', async () => {
    const travelerToken = await login('traveler-a@test.com');
    const tripId = await createTrip(travelerToken);
    await submitTrip(travelerToken, tripId);

    const response = await submitExpense(travelerToken, tripId, 95, 'meal');

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'INVALID_STATUS',
      }),
    );
  });

  it('writes audit log action EXPENSE_SUBMITTED when expense submission succeeds', async () => {
    const travelerToken = await login('traveler-a@test.com');
    const approverToken = await login('approver@test.com');
    const tripId = await createTrip(travelerToken);
    await submitTrip(travelerToken, tripId);
    await approveTrip(approverToken, tripId);
    await bookTrip(approverToken, tripId);

    const response = await submitExpense(travelerToken, tripId, 70, 'meal', 'Team dinner');

    expect([200, 201]).toContain(response.status);
    expect(response.body).toEqual(
      expect.objectContaining({
        status: expect.stringMatching(/submitted|flagged/),
      }),
    );

    const auditFound = await hasAuditAction('EXPENSE_SUBMITTED');
    expect(auditFound).toBe(true);
  });
});
