import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { PaymentRequest, TransactionResponse, TransactionLog } from '../types';
import { FraudDetectionService } from '../services/fraudDetection';
import { LoggerService } from '../services/logger';
import { ValidationService } from '../utils/validation';

export class PaymentController {
  private fraudDetectionService: FraudDetectionService;
  private loggerService: LoggerService;

  constructor() {
    this.fraudDetectionService = new FraudDetectionService();
    this.loggerService = new LoggerService();
  }

  public processPayment = async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const validation = ValidationService.validatePaymentRequest(req.body);
      if (!validation.isValid) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: validation.errors
        });
        return;
      }

      // Sanitize and process request
      const paymentRequest: PaymentRequest = ValidationService.sanitizePaymentRequest(req.body);
      const transactionId = uuidv4();
      const timestamp = new Date().toISOString();

      // Calculate fraud score (now async)
      const fraudScore = await this.fraudDetectionService.calculateFraudScore(paymentRequest);
      const isAllowed = this.fraudDetectionService.isTransactionAllowed(fraudScore.score);

      // Route or block based on score
      let status: 'allowed' | 'blocked';
      if (isAllowed) {
        // Simulate routing to payment processor
        status = 'allowed';
      } else {
        // Block submission
        status = 'blocked';
      }

      // Create response
      const response: TransactionResponse = {
        success: true,
        riskScore: fraudScore.score,
        explanation: fraudScore.explanation,
        status,
        transactionId,
        timestamp
      };

      // Log transaction
      const transactionLog: TransactionLog = {
        transactionId,
        timestamp,
        request: paymentRequest,
        response
      };

      this.loggerService.logTransaction(transactionLog);

      // Return response
      res.status(200).json(response);

    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'An error occurred while processing the payment'
      });
    }
  };
}