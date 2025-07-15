import request from 'supertest';
import express from 'express';
import { PaymentController } from '../src/controllers/paymentController';

// Create a test app
const app = express();
app.use(express.json());
app.use('/charge', (req, res) => {
  const controller = new PaymentController();
  controller.processPayment(req, res);
});

describe('PaymentController', () => {
  describe('POST /charge', () => {
    it('should process valid payment request successfully', async () => {
      const validRequest = {
        amount: 100,
        email: 'user@example.com',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(validRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body).toHaveProperty('riskScore');
      expect(response.body).toHaveProperty('explanation');
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('transactionId');
      expect(response.body).toHaveProperty('timestamp');
      expect(['allowed', 'blocked']).toContain(response.body.status);
    });

    it('should block high-risk transaction', async () => {
      const highRiskRequest = {
        amount: 15000,
        email: 'user@example.ru',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(highRiskRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('blocked');
      expect(response.body.riskScore).toBeGreaterThanOrEqual(0.5);
    });

    it('should allow low-risk transaction', async () => {
      const lowRiskRequest = {
        amount: 50,
        email: 'user@example.com',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(lowRiskRequest)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.status).toBe('allowed');
      expect(response.body.riskScore).toBeLessThan(0.5);
    });

    it('should return 400 for missing amount', async () => {
      const invalidRequest = {
        email: 'user@example.com',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain("Amount is required");
    });

    it('should return 400 for missing email', async () => {
      const invalidRequest = {
        amount: 100,
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Email is required');
    });

    it('should return 400 for missing method', async () => {
      const invalidRequest = {
        amount: 100,
        email: 'user@example.com',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Method is required');
    });

    it('should return 400 for missing source', async () => {
      const invalidRequest = {
        amount: 100,
        email: 'user@example.com',
        method: 'paypal'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Source is required');
    });

    it('should return 400 for invalid email format', async () => {
      const invalidRequest = {
        amount: 100,
        email: 'invalid-email',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Email must be a valid email address');
    });

    it('should return 400 for negative amount', async () => {
      const invalidRequest = {
        amount: -100,
        email: 'user@example.com',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain("Amount must be a positive number");
    });

    it('should return 400 for zero amount', async () => {
      const invalidRequest = {
        amount: 0,
        email: 'user@example.com',
        method: 'paypal',
        source: 'web'
      };

      const response = await request(app)
        .post('/charge')
        .send(invalidRequest)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain("Amount must be a positive number");
    });
  });
}); 