export interface PaymentRequest {
  amount: number;
  email: string;
  method: string;
  source: string;
}

export interface FraudScore {
  score: number;
  explanation: string[];
}

export interface TransactionResponse {
  success: boolean;
  riskScore: number;
  explanation: string[];
  status: 'allowed' | 'blocked';
  transactionId: string;
  timestamp: string;
}

export interface TransactionLog {
  transactionId: string;
  timestamp: string;
  request: PaymentRequest;
  response: TransactionResponse;
}

export interface FraudRules {
  amountThreshold: number;
  amountScore: number;
  suspiciousEmailDomains: string[];
  emailDomainScore: number;
  blockingThreshold: number;
}

