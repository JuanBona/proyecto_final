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

describe('Trips validation (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let travelerToken: string;

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
    await prisma.approval.deleteMany();
    await prisma.tripRequest.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.createMany({
      data: [
        {
          email: 'traveler@example.com',
          passwordHash: await bcrypt.hash('secret123', 10),
          role: 'traveler',
        },
        {
          email: 'approver@example.com',
          passwordHash: await bcrypt.hash('secret123', 10),
          role: 'approver',
        },
      ],
    });

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'traveler@example.com', password: 'secret123' });

    travelerToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /trips returns 400 VALIDATION_ERROR for invalid payload', async () => {
    const response = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', 'Bearer ' + travelerToken)
      .send({
        destination: '',
        startDate: '2025-06-01',
        endDate: '2025-06-03',
        reason: '',
        budget: 'not-a-number',
        costCenter: '',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      }),
    );
  });

  it('POST /trips returns 400 VALIDATION_ERROR when endDate is not after startDate', async () => {
    const response = await request(app.getHttpServer())
      .post('/trips')
      .set('Authorization', 'Bearer ' + travelerToken)
      .send({
        destination: 'Madrid',
        startDate: '2025-06-10',
        endDate: '2025-06-10',
        reason: 'Client meeting',
        budget: 1500,
        costCenter: 'CC-001',
      });

    expect(response.status).toBe(400);
    expect(response.body).toEqual(
      expect.objectContaining({
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        message: 'endDate must be after startDate',
      }),
    );
  });
});
