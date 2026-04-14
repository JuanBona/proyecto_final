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

const travelerPayload = {
  destination: 'Madrid',
  startDate: '2026-05-10T00:00:00.000Z',
  endDate: '2026-05-15T00:00:00.000Z',
  reason: 'Client meeting',
  budget: 1200,
  costCenter: 'CC-100',
};

const quoteIdentifier = (identifier: string) => `"${identifier.replace(/"/g, '""')}"`;

describe('Bookings (e2e)', () => {
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
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND (lower(name) LIKE '%booking%' OR lower(name) LIKE '%outbox%')",
    );

    for (const { name } of auxTables) {
      if (name === '_prisma_migrations') continue;
      await prisma.$executeRawUnsafe(`DELETE FROM ${quoteIdentifier(name)}`);
    }

    await prisma.approval.deleteMany();
    await prisma.tripRequest.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
      data: [
        { email: 'traveler@test.com', passwordHash, role: 'traveler' },
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

  const createAndSubmitTrip = async (travelerToken: string) => {
    const createResponse = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${travelerToken}`)
      .send(travelerPayload);

    expect(createResponse.status).toBe(201);

    const submitResponse = await request(app.getHttpServer())
      .post(`/trips/${createResponse.body.id}/submit`)
      .set('Authorization', `Bearer ${travelerToken}`)
      .send();

    expect(submitResponse.status).toBe(201);
    expect(submitResponse.body.status).toBe('pending_approval');

    return submitResponse.body.id as string;
  };

  const findBookingConfirmedInOutbox = async () => {
    const outboxTables = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
      "SELECT name FROM sqlite_master WHERE type='table' AND lower(name) LIKE '%outbox%'",
    );

    for (const { name } of outboxTables) {
      const columns = await prisma.$queryRawUnsafe<Array<{ name: string }>>(
        `PRAGMA table_info(${quoteIdentifier(name)})`,
      );

      const columnList = columns.map((column) => quoteIdentifier(column.name)).join(', ');
      if (!columnList) continue;

      const rows = await prisma.$queryRawUnsafe<Array<Record<string, unknown>>>(
        `SELECT ${columnList} FROM ${quoteIdentifier(name)} ORDER BY rowid DESC LIMIT 50`,
      );

      const hasBookingConfirmed = rows.some((row) =>
        Object.values(row).some(
          (value) => typeof value === 'string' && value.includes('BookingConfirmed'),
        ),
      );

      if (hasBookingConfirmed) {
        return true;
      }
    }

    return false;
  };

  it('allows approver to confirm booking after trip approval and writes BookingConfirmed to outbox', async () => {
    const travelerToken = await login('traveler@test.com');
    const approverToken = await login('approver@test.com');

    const tripId = await createAndSubmitTrip(travelerToken);

    const approveResponse = await request(app.getHttpServer())
      .post(`/trips/${tripId}/approve`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ comment: 'Approved for booking' });

    expect(approveResponse.status).toBe(201);
    expect(approveResponse.body.status).toBe('approved');

    const optionsResponse = await request(app.getHttpServer())
      .get(`/bookings/options/${tripId}`)
      .set('Authorization', `Bearer ${approverToken}`);

    expect(optionsResponse.status).toBe(200);

    const options = Array.isArray(optionsResponse.body)
      ? optionsResponse.body
      : optionsResponse.body.options;

    expect(Array.isArray(options)).toBe(true);
    expect(options.length).toBeGreaterThan(0);

    const selectedOptionId = options[0]?.id;
    expect(selectedOptionId).toEqual(expect.any(String));

    const confirmResponse = await request(app.getHttpServer())
      .post('/bookings/confirm')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ tripId, optionId: selectedOptionId });

    expect([200, 201]).toContain(confirmResponse.status);
    expect(confirmResponse.body.status).toBe('booked');

    const hasBookingConfirmed = await findBookingConfirmedInOutbox();
    expect(hasBookingConfirmed).toBe(true);
  });

  it('returns 409 INVALID_STATUS when confirming booking for a trip that is not approved', async () => {
    const travelerToken = await login('traveler@test.com');
    const approverToken = await login('approver@test.com');

    const tripId = await createAndSubmitTrip(travelerToken);

    const optionsResponse = await request(app.getHttpServer())
      .get(`/bookings/options/${tripId}`)
      .set('Authorization', `Bearer ${approverToken}`);

    expect(optionsResponse.status).toBe(200);

    const options = Array.isArray(optionsResponse.body)
      ? optionsResponse.body
      : optionsResponse.body.options;

    const selectedOptionId = options?.[0]?.id;
    expect(selectedOptionId).toEqual(expect.any(String));

    const response = await request(app.getHttpServer())
      .post('/bookings/confirm')
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ tripId, optionId: selectedOptionId });

    expect(response.status).toBe(409);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'INVALID_STATUS',
      }),
    );
  });
});
