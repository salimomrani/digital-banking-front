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
}
