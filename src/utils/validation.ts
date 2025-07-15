import { PaymentRequest } from '../types';

export class ValidationService {
  private static readonly allowedMethods = ['paypal', 'stripe'];

  public static validatePaymentRequest(request: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all required fields are present
    if (request.amount === undefined || request.amount === null) {
      errors.push('Amount is required');
    } else if (typeof request.amount !== 'number' || request.amount <= 0) {
      errors.push('Amount must be a positive number');
    }

    if (!request.email) {
      errors.push('Email is required');
    } else if (typeof request.email !== 'string' || !this.isValidEmail(request.email)) {
      errors.push('Email must be a valid email address');
    }

    if (!request.method) {
      errors.push('Method is required');
    } else if (!this.allowedMethods.includes(request.method.toLowerCase())) {
      errors.push(`Invalid payment method: '${request.method}'. Allowed methods: paypal, stripe.`);
    }

    if (!request.source) {
      errors.push('Source is required');
    } else if (typeof request.source !== 'string') {
      errors.push('Source must be a string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public static sanitizePaymentRequest(request: any): PaymentRequest {
    return {
      amount: Number(request.amount),
      email: String(request.email).toLowerCase().trim(),
      method: String(request.method).toLowerCase().trim(),
      source: String(request.source).toLowerCase().trim()
    };
  }
} 