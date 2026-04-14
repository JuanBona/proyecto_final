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

describe('Auth (e2e)', () => {
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
    await prisma.approval.deleteMany();
    await prisma.tripRequest.deleteMany();
    await prisma.user.deleteMany();
    await prisma.user.createMany({
      data: [
        {
          email: 'admin@example.com',
          passwordHash: await bcrypt.hash('secret123', 10),
          role: 'admin',
        },
        {
          email: 'user@example.com',
          passwordHash: await bcrypt.hash('secret123', 10),
          role: 'user',
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) returns accessToken and refreshToken', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
  });

  it('/auth/refresh (POST) rotates refresh token and rejects replay', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });

    const rotatedResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(rotatedResponse.status).toBe(201);
    expect(rotatedResponse.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
    expect(rotatedResponse.body.refreshToken).not.toBe(
      loginResponse.body.refreshToken,
    );

    const replayResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });
    expect(replayResponse.status).toBe(401);
    expect(replayResponse.body.message).toBe('Invalid refresh token');

    const newestResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: rotatedResponse.body.refreshToken });
    expect(newestResponse.status).toBe(201);
  });

  it('/auth/refresh (POST) rejects invalid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'not-a-valid-token' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid refresh token');
  });

  it('/auth/me (GET) returns current user for valid access token', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });

    const response = await request(app.getHttpServer())
      .get('/auth/me')
      .set('Authorization', `Bearer ${loginResponse.body.accessToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        email: 'admin@example.com',
        role: 'admin',
      }),
    );
  });

  it('/auth/admin-check (GET) allows admin and forbids non-admin', async () => {
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });
    const adminResponse = await request(app.getHttpServer())
      .get('/auth/admin-check')
      .set('Authorization', `Bearer ${adminLogin.body.accessToken}`);
    expect(adminResponse.status).toBe(200);
    expect(adminResponse.body).toEqual({ ok: true });

    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'user@example.com', password: 'secret123' });
    const userResponse = await request(app.getHttpServer())
      .get('/auth/admin-check')
      .set('Authorization', `Bearer ${userLogin.body.accessToken}`);
    expect(userResponse.status).toBe(403);
    expect(userResponse.body.message).toBe('Forbidden resource');
  });
});

describe('Auth bootstrap (e2e)', () => {
  it('fails fast when refresh/access token secrets are missing', async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    delete process.env.ACCESS_TOKEN_SECRET;
    delete process.env.REFRESH_TOKEN_SECRET;
    delete process.env.JWT_ACCESS_SECRET;
    delete process.env.JWT_REFRESH_SECRET;

    await expect(
      Test.createTestingModule({
        imports: [AppModule],
      }).compile(),
    ).rejects.toThrow(
      /ACCESS_TOKEN_SECRET|REFRESH_TOKEN_SECRET/,
    );
    setTokenSecrets();
  });
});
