import { CurrencyPipe, DatePipe, NgClass, NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Account, HealthStatus } from './accounts.types';
import { AccountsService } from './accounts.service';

@Component({
  selector: 'app-accounts-dashboard',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, ReactiveFormsModule, CurrencyPipe, DatePipe, TitleCasePipe],
  templateUrl: './accounts-dashboard.component.html',
  styleUrl: './accounts-dashboard.component.css'
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

  protected readonly errorMessage = signal<string | null>(null);
  protected readonly transactionFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  protected readonly transactionForm = this.fb.group({
    type: this.fb.nonNullable.control<'credit' | 'debit'>('credit'),
    amount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01)]
    }),
    label: this.fb.control('', { validators: [Validators.maxLength(80)] })
  });

  protected readonly disableSubmit = computed(
    () => this.transactionForm.invalid || !this.selectedAccount() || this.submittingTransaction()
  );

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
}
