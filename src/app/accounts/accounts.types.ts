export interface Transaction {
  id?: string;
  type: 'credit' | 'debit';
  amount: number;
  label?: string;
  timestamp?: string;
}

export interface Account {
  id: string;
  holder: string;
  balance: number;
  currency: string;
  iban?: string;
  lastUpdated?: string;
  transactions: Transaction[];
}

export interface HealthStatus {
  status: string;
  service: string;
  timestamp: string;
}

export interface AccountsResponse {
  accounts: Account[];
}

export interface AccountResponse {
  account: Account;
}

export interface TransactionResponse {
  message: string;
  account: Pick<Account, 'id' | 'balance' | 'currency'>;
  transaction: Transaction;
}

export interface NewTransactionPayload {
  type: Transaction['type'];
  amount: number;
  label?: string;
}
