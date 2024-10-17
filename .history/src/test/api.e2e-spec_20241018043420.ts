import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/util/prisma.service';
import { MockPrismaService } from '../src/mock/mock-prisma.service';

describe('E2E API 테스트', () => {
  let app: INestApplication;
  let prismaService: PrismaService | MockPrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('product controller', () => {
    it('모든 상품 가져오는지 확인 (/api/products GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });

    it('인기 상품 조회 테스트 (/api/products/popular GET)', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/products/popular')
        .expect(200);

      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBeGreaterThan(0);
    });
  });

  describe('user controller', () => {
    it('사용자 잔액 조회 테스트 (/api/balance/:userId GET)', async () => {
      const userId = 1; // 테스트용 사용자 ID
      const response = await request(app.getHttpServer())
        .get(`/api/balance/${userId}`)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(typeof response.body.balance).toBe('number');
    });

    it('잔액 충전 테스트 (/api/balance/charge POST)', async () => {
      const chargeData = { userId: 1, amount: 100 };
      const response = await request(app.getHttpServer())
        .post('/api/balance/charge')
        .send(chargeData)
        .expect(200);

      expect(response.body).toHaveProperty('balance');
      expect(response.body.balance).toBeGreaterThan(0);
    });
  });

  describe('order controller', () => {
    it('주문 생성 (/api/orders POST)', async () => {
      const orderData = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 1 },
        ],
      };

      const response = await request(app.getHttpServer())
        .post('/api/orders')
        .send(orderData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('userId', orderData.userId);
      expect(response.body).toHaveProperty('totalAmount');
      expect(response.body).toHaveProperty('status');
      expect(Array.isArray(response.body.items)).toBeTruthy();
      expect(response.body.items.length).toBe(orderData.items.length);
    });
  });
});