import { CurrencyPipe, DatePipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Account, GenerateAccountsPayload, HealthStatus } from './accounts.types';
import { AccountsService } from './accounts.service';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [NgClass, ReactiveFormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './accounts-dashboard.component.html'
})
export class AccountsDashboardComponent {
  private readonly accountsService = inject(AccountsService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly healthStatus = signal<HealthStatus | null>(null);
  protected readonly accounts = signal<Account[]>([]);
  protected readonly selectedAccount = signal<Account | null>(null);

  protected readonly loadingAccounts = signal(false);
  protected readonly loadingAccountDetails = signal(false);
  protected readonly submittingTransaction = signal(false);
  protected readonly generatingAccounts = signal(false);

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly transactionFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  protected readonly generationFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  protected readonly transactionForm = this.fb.group({
    type: this.fb.nonNullable.control<'credit' | 'debit'>('credit'),
    amount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    label: this.fb.control('', { validators: [Validators.maxLength(80)] })
  });

  protected readonly generateAccountsForm = this.fb.group({
    count: this.fb.nonNullable.control(1, {
      validators: [Validators.required, Validators.min(1), Validators.max(50)]
    }),
    userId: this.fb.control<number | null>(null, { validators: [Validators.min(1)] })
  });

  constructor() {
    this.loadHealth();
    this.loadAccounts();
  }

  protected refreshAll() {
    this.loadHealth();
    this.loadAccounts();
  }

  protected reloadAccounts() {
    this.loadAccounts();
  }

  protected trackAccount(_index: number, account: Account) {
    return account.id;
  }

  protected selectAccount(accountId: string) {
    if (!accountId || this.loadingAccountDetails()) {
      return;
    }

    this.fetchAccountDetails(accountId);
  }

  protected submitTransaction() {
    if (this.disableSubmit()) {
      return;
    }

    const formValue = this.transactionForm.getRawValue();
    const account = this.selectedAccount();
    if (!account || formValue.amount === null) {
      return;
    }

    this.transactionFeedback.set(null);
    this.submittingTransaction.set(true);
    this.accountsService
      .createTransaction(account.id, {
        type: formValue.type,
        amount: Number(formValue.amount),
        label: formValue.label?.trim() || undefined
      })
      .pipe(
        finalize(() => this.submittingTransaction.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.transactionForm.reset({ type: 'credit', amount: null, label: '' });
          this.transactionFeedback.set({ type: 'success', message: 'Transaction enregistrée.' });
          this.fetchAccountDetails(account.id);
        },
        error: (error: Error) => {
          this.transactionFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de créer la transaction.'
          });
        }
      });
  }

  protected generateAccounts() {
    if (this.generateAccountsForm.invalid) {
      this.generateAccountsForm.markAllAsTouched();
      return;
    }

    if (this.generatingAccounts()) {
      return;
    }

    const { count, userId } = this.generateAccountsForm.getRawValue();
    if (!count) {
      return;
    }

    const payload: GenerateAccountsPayload = { count };
    if (userId) {
      payload.userId = userId;
    }

    this.generationFeedback.set(null);
    this.generatingAccounts.set(true);
    this.accountsService
      .generateAccounts(payload)
      .pipe(
        finalize(() => this.generatingAccounts.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.generateAccountsForm.patchValue({ count: 1 });
          this.generationFeedback.set({
            type: 'success',
            message: response.message || 'Comptes générés.'
          });
          this.loadAccounts();
        },
        error: (error: Error) => {
          this.generationFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de générer des comptes.'
          });
        }
      });
  }

  private loadHealth() {
    this.accountsService
      .getHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (health) => this.healthStatus.set(health),
        error: () => this.healthStatus.set(null)
      });
  }

  private loadAccounts() {
    this.loadingAccounts.set(true);
    this.errorMessage.set(null);
    this.accountsService
      .getAccounts()
      .pipe(
        finalize(() => this.loadingAccounts.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (accounts) => {
          this.accounts.set(accounts);
          if (accounts.length) {
            this.fetchAccountDetails(accounts[0].id);
          } else {
            this.selectedAccount.set(null);
          }
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message ?? 'Impossible de récupérer les comptes.');
        }
      });
  }

  private fetchAccountDetails(accountId: string) {
    this.loadingAccountDetails.set(true);
    this.errorMessage.set(null);
    this.accountsService
      .getAccount(accountId)
      .pipe(
        finalize(() => this.loadingAccountDetails.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (account) => {
          this.selectedAccount.set(account);
          this.accounts.update((items) =>
            items.map((item) => (item.id === account.id ? account : item))
          );
        },
        error: (error: Error) => {
          this.errorMessage.set(error.message ?? 'Impossible de charger le compte.');
        }
      });
  }

  protected disableSubmit() {
    return this.transactionForm.invalid || !this.selectedAccount() || this.submittingTransaction();
  }

  protected disableGenerateAccounts() {
    return this.generateAccountsForm.invalid || this.generatingAccounts();
  }
}
