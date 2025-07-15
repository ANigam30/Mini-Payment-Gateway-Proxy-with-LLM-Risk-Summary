import { TransactionLog } from '../types';

export class LoggerService {
  private static logs: TransactionLog[] = [];

  public logTransaction(log: TransactionLog): void {
    LoggerService.logs.push(log);
  }

  public static getLogs(): TransactionLog[] {
    return LoggerService.logs;
  }
} 