import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

const setTokenSecrets = () => {
  process.env.ACCESS_TOKEN_SECRET = 'access-secret';
  process.env.REFRESH_TOKEN_SECRET = 'refresh-secret';
  delete process.env.JWT_ACCESS_SECRET;
  delete process.env.JWT_REFRESH_SECRET;
};

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaClient;

  beforeAll(async () => {
    process.env.DATABASE_URL = 'file:./dev.db';
    setTokenSecrets();

    prisma = new PrismaClient();
    await prisma.user.deleteMany();
    await prisma.user.create({
      data: {
        email: 'admin@example.com',
        passwordHash: await bcrypt.hash('secret123', 10),
        role: 'admin',
      },
    });

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
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

  it('/auth/refresh (POST) returns new accessToken and refreshToken', async () => {
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@example.com', password: 'secret123' });

    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: loginResponse.body.refreshToken });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      }),
    );
  });

  it('/auth/refresh (POST) rejects invalid refresh token', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({ refreshToken: 'not-a-valid-token' });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid refresh token');
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
