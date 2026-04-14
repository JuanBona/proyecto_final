import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
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

describe('Trips security (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    setTokenSecrets();

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await prisma.approval.deleteMany();
    await prisma.tripRequest.deleteMany();
    await prisma.user.deleteMany();

    const passwordHash = await bcrypt.hash('password123', 10);

    await prisma.user.createMany({
      data: [
        { email: 'traveler@test.com', passwordHash, role: 'traveler' },
        { email: 'approver@test.com', passwordHash, role: 'approver' },
        { email: 'self-approver@test.com', passwordHash, role: 'approver' },
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

    return response.body.accessToken as string;
  };

  const createPendingTrip = async (token: string) => {
    const createResponse = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', `Bearer ${token}`)
      .send(travelerPayload);

    const submitResponse = await request(app.getHttpServer())
      .post(`/trips/${createResponse.body.id}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    return submitResponse.body.id as string;
  };

  it('allows approver to view pending_approval trip detail but forbids approved trip detail', async () => {
    const travelerToken = await login('traveler@test.com');
    const approverToken = await login('approver@test.com');

    const pendingTripId = await createPendingTrip(travelerToken);

    const pendingResponse = await request(app.getHttpServer())
      .get(`/trips/${pendingTripId}`)
      .set('Authorization', `Bearer ${approverToken}`);

    expect(pendingResponse.status).toBe(200);
    expect(pendingResponse.body.status).toBe('pending_approval');

    const approveResponse = await request(app.getHttpServer())
      .post(`/trips/${pendingTripId}/approve`)
      .set('Authorization', `Bearer ${approverToken}`)
      .send({ comment: 'Looks good' });

    expect(approveResponse.status).toBe(201);
    expect(approveResponse.body.status).toBe('approved');

    const approvedDetailResponse = await request(app.getHttpServer())
      .get(`/trips/${pendingTripId}`)
      .set('Authorization', `Bearer ${approverToken}`);

    expect(approvedDetailResponse.status).toBe(403);
    expect(approvedDetailResponse.body).toEqual(
      expect.objectContaining({
        code: 'FORBIDDEN',
      }),
    );
  });

  it('forbids self-approval when approver is also traveler', async () => {
    const selfApprover = await prisma.user.findUniqueOrThrow({
      where: { email: 'self-approver@test.com' },
    });

    const trip = await prisma.tripRequest.create({
      data: {
        travelerId: selfApprover.id,
        destination: travelerPayload.destination,
        startDate: new Date(travelerPayload.startDate),
        endDate: new Date(travelerPayload.endDate),
        reason: travelerPayload.reason,
        budget: travelerPayload.budget,
        costCenter: travelerPayload.costCenter,
        status: 'pending_approval',
      },
    });

    const selfApproverToken = await login('self-approver@test.com');

    const response = await request(app.getHttpServer())
      .post(`/trips/${trip.id}/approve`)
      .set('Authorization', `Bearer ${selfApproverToken}`)
      .send({ comment: 'Approving my own trip' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'FORBIDDEN',
      }),
    );
  });

  it('forbids self-rejection when approver is also traveler', async () => {
    const selfApprover = await prisma.user.findUniqueOrThrow({
      where: { email: 'self-approver@test.com' },
    });

    const trip = await prisma.tripRequest.create({
      data: {
        travelerId: selfApprover.id,
        destination: travelerPayload.destination,
        startDate: new Date(travelerPayload.startDate),
        endDate: new Date(travelerPayload.endDate),
        reason: travelerPayload.reason,
        budget: travelerPayload.budget,
        costCenter: travelerPayload.costCenter,
        status: 'pending_approval',
      },
    });

    const selfApproverToken = await login('self-approver@test.com');

    const response = await request(app.getHttpServer())
      .post(`/trips/${trip.id}/reject`)
      .set('Authorization', `Bearer ${selfApproverToken}`)
      .send({ comment: 'Rejecting my own trip' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'FORBIDDEN',
      }),
    );
  });
});
