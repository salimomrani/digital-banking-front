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

export interface GenerateAccountsPayload {
  count: number;
  userId?: number;
}

export interface GeneratedAccount {
  id: number;
  accountNumber: string;
  userId: number;
  balance: string;
  currency: 'EUR' | 'USD' | 'GBP';
  accountType: 'checking' | 'savings' | 'business';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateAccountsResponse {
  message: string;
  data: GeneratedAccount[];
}

export interface GenerateTransactionsPayload {
  count: number;
  accountId: number;
}

export interface GeneratedTransaction {
  id: number;
  accountId: number;
  transactionType: 'credit' | 'debit';
  amount: string;
  balanceAfter: string;
  description: string;
  reference: string;
  status: string;
  createdAt: string;
}

export interface GenerateTransactionsResponse {
  message: string;
  data: GeneratedTransaction[];
}

export interface TransferPayload {
  fromAccountId: number;
  toAccountId: number;
  amount: number;
  description?: string;
  transferType?: 'sepa' | 'international' | 'instant';
}

export interface TransferResponse {
  message: string;
  data: {
    success: boolean;
    transferType: string;
    amount: number;
    fromAccountId: number;
    toAccountId: number;
    timestamp: string;
  };
}

export interface CreateCardPayload {
  accountId: number;
  cardType: 'debit' | 'credit' | 'virtual';
  limit?: number;
}

export interface CardResource {
  id: number;
  accountId: number;
  cardNumber: string;
  cardType: 'debit' | 'credit' | 'virtual';
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  status: string;
  limit?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardResponse {
  message: string;
  data: CardResource;
}

export interface CreateLoanPayload {
  accountId: number;
  loanType: 'personal' | 'mortgage' | 'auto';
  amount: number;
  interestRate: number;
  durationMonths: number;
}

export interface LoanResource {
  id: number;
  accountId: number;
  loanType: 'personal' | 'mortgage' | 'auto';
  amount: string;
  remainingBalance: string;
  interestRate: string;
  durationMonths: number;
  monthlyPayment: string;
  status: string;
  startDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLoanResponse {
  message: string;
  data: LoanResource;
}
