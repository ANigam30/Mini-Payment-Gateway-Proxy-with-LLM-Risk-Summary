import { PaymentRequest, FraudScore } from '../types';
import dotenv from 'dotenv';
dotenv.config();
import { getGeminiFraudSummary } from '../utils/geminiHandler';

const DEFAULT_AMOUNT_THRESHOLD = parseFloat(process.env['FRAUD_AMOUNT_THRESHOLD'] || '1000');
const DEFAULT_SUSPICIOUS_DOMAINS = (process.env['FRAUD_SUSPICIOUS_DOMAINS'] || '.ru,test.com').split(',');

export class FraudDetectionService {
  public async calculateFraudScore(request: PaymentRequest): Promise<FraudScore> {
    let score = 0;
    // Heuristic: Large amount
    if (request.amount > DEFAULT_AMOUNT_THRESHOLD) {
      score += 0.6;
    }
    // Heuristic: Suspicious email domain
    const email = request.email.toLowerCase();
    if (DEFAULT_SUSPICIOUS_DOMAINS.some(domain => email.endsWith(domain.trim()))) {
      score += 0.5;
    }
    // Cap score at 1.0
    score = Math.min(score, 1.0);
    // Get LLM summary
    const explanation = await getGeminiFraudSummary(request, score);
    return {
      score,
      explanation
    };
  }

  public isTransactionAllowed(fraudScore: number): boolean {
    const blockingThreshold = parseFloat(process.env['FRAUD_BLOCKING_THRESHOLD'] || '0.5');
    return fraudScore < blockingThreshold;
  }
} 