import { FraudDetectionService } from '../src/services/fraudDetection';
import { LoggerService } from '../src/services/logger';
import { PaymentRequest } from '../src/types';

jest.mock('../src/utils/geminiHandler', () => ({
  getGeminiFraudSummary: jest.fn().mockResolvedValue(['Mock summary'])
}));

describe('FraudDetectionService', () => {
  const service = new FraudDetectionService();

  it('assigns high score for large amount', async () => {
    const req: PaymentRequest = { amount: 10000, email: 'user@example.com', method: 'paypal', source: 'web' };
    const result = await service.calculateFraudScore(req);
    expect(result.score).toBeGreaterThanOrEqual(0.6);
  });

  it('assigns high score for suspicious domain', async () => {
    const req: PaymentRequest = { amount: 10, email: 'user@test.com', method: 'paypal', source: 'web' };
    const result = await service.calculateFraudScore(req);
    expect(result.score).toBeGreaterThanOrEqual(0.5);
  });

  it('blocks if score >= 0.5', async () => {
    const req: PaymentRequest = { amount: 10000, email: 'user@test.com', method: 'paypal', source: 'web' };
    const result = await service.calculateFraudScore(req);
    expect(service.isTransactionAllowed(result.score)).toBe(false);
  });

  it('allows if score < 0.5', async () => {
    const req: PaymentRequest = { amount: 10, email: 'user@example.com', method: 'paypal', source: 'web' };
    const result = await service.calculateFraudScore(req);
    expect(service.isTransactionAllowed(result.score)).toBe(true);
  });
});

describe('LoggerService', () => {
  it('logs transactions in memory', () => {
    const log = { transactionId: '1', timestamp: new Date().toISOString(), request: { amount: 1, email: 'a@b.com', method: 'paypal', source: 'web' }, response: { success: true, riskScore: 0, explanation: ['ok'], status: 'allowed', transactionId: '1', timestamp: new Date().toISOString() } };
    const logger = new LoggerService();
    logger.logTransaction(log);
    expect(LoggerService.getLogs()).toContainEqual(log);
  });
}); 