import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import {
  Account,
  AccountResponse,
  AccountsResponse,
  HealthStatus,
  GenerateAccountsPayload,
  GenerateAccountsResponse,
  GenerateTransactionsPayload,
  GenerateTransactionsResponse,
  TransferPayload,
  TransferResponse,
  CreateCardPayload,
  CreateCardResponse,
  CreateLoanPayload,
  CreateLoanResponse,
  NewTransactionPayload,
  TransactionResponse
} from './accounts.types';

@Injectable({
  providedIn: 'root'
})
export class AccountsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = 'http://localhost:4000';

  getHealth() {
    return this.http.get<HealthStatus>(`${this.apiBaseUrl}/health`);
  }

  getAccounts() {
    return this.http
      .get<AccountsResponse>(`${this.apiBaseUrl}/api/accounts`)
      .pipe(map((response) => response.accounts));
  }

  getAccount(accountId: string) {
    return this.http
      .get<AccountResponse>(`${this.apiBaseUrl}/api/accounts/${accountId}`)
      .pipe(map((response) => response.account));
  }

  createTransaction(accountId: string, payload: NewTransactionPayload) {
    return this.http.post<TransactionResponse>(
      `${this.apiBaseUrl}/api/accounts/${accountId}/transactions`,
      payload
    );
  }

  generateAccounts(payload: GenerateAccountsPayload) {
    return this.http.post<GenerateAccountsResponse>(
      `${this.apiBaseUrl}/api/bank/generate-accounts`,
      payload
    );
  }

  generateTransactions(payload: GenerateTransactionsPayload) {
    return this.http.post<GenerateTransactionsResponse>(
      `${this.apiBaseUrl}/api/bank/generate-transactions`,
      payload
    );
  }

  transferFunds(payload: TransferPayload) {
    return this.http.post<TransferResponse>(`${this.apiBaseUrl}/api/bank/transfers`, payload);
  }

  createCard(payload: CreateCardPayload) {
    return this.http.post<CreateCardResponse>(`${this.apiBaseUrl}/api/bank/cards`, payload);
  }

  createLoan(payload: CreateLoanPayload) {
    return this.http.post<CreateLoanResponse>(`${this.apiBaseUrl}/api/bank/loans`, payload);
  }
}
