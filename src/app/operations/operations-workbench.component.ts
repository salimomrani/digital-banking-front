import { CommonModule, NgClass } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  CreateCardPayload,
  CreateLoanPayload,
  GenerateAccountsPayload,
  GenerateTransactionsPayload,
  TransferPayload
} from '../accounts/accounts.types';
import { AccountsService } from '../accounts/accounts.service';

@Component({
  selector: 'app-operations-workbench',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NgClass],
  templateUrl: './operations-workbench.component.html'
})
export class OperationsWorkbenchComponent {
  private readonly accountsService = inject(AccountsService);
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly generatingAccounts = signal(false);
  protected readonly generatingTransactions = signal(false);
  protected readonly transferringFunds = signal(false);
  protected readonly creatingCard = signal(false);
  protected readonly creatingLoan = signal(false);

  protected readonly generationFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  protected readonly transactionsGenerationFeedback = signal<
    { type: 'success' | 'error'; message: string } | null
  >(null);
  protected readonly transferFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  protected readonly cardFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);
  protected readonly loanFeedback = signal<{ type: 'success' | 'error'; message: string } | null>(null);

  protected readonly generateAccountsForm = this.fb.group({
    count: this.fb.nonNullable.control(1, {
      validators: [Validators.required, Validators.min(1), Validators.max(50)]
    }),
    userId: this.fb.control<number | null>(null, { validators: [Validators.min(1)] })
  });

  protected readonly generateTransactionsForm = this.fb.group({
    count: this.fb.nonNullable.control(10, {
      validators: [Validators.required, Validators.min(1), Validators.max(100)]
    }),
    accountId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    })
  });

  protected readonly transferForm = this.fb.group({
    fromAccountId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    toAccountId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    amount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    description: this.fb.control(''),
    transferType: this.fb.nonNullable.control<'sepa' | 'international' | 'instant'>('sepa')
  });

  protected readonly cardForm = this.fb.group({
    accountId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    cardType: this.fb.nonNullable.control<'debit' | 'credit' | 'virtual'>('debit'),
    limit: this.fb.control<number | null>(null, { validators: [Validators.min(1)] })
  });

  protected readonly loanForm = this.fb.group({
    accountId: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    loanType: this.fb.nonNullable.control<'personal' | 'mortgage' | 'auto'>('personal'),
    amount: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(1)]
    }),
    interestRate: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(0), Validators.max(20)]
    }),
    durationMonths: this.fb.control<number | null>(null, {
      validators: [Validators.required, Validators.min(6), Validators.max(360)]
    })
  });

  protected generateAccounts() {
    if (this.generateAccountsForm.invalid || this.generatingAccounts()) {
      this.generateAccountsForm.markAllAsTouched();
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
        },
        error: (error: Error) => {
          this.generationFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de générer des comptes.'
          });
        }
      });
  }

  protected generateTransactions() {
    if (this.generateTransactionsForm.invalid || this.generatingTransactions()) {
      this.generateTransactionsForm.markAllAsTouched();
      return;
    }

    const { count, accountId } = this.generateTransactionsForm.getRawValue();
    if (!count || accountId === null) {
      return;
    }

    const payload: GenerateTransactionsPayload = {
      count,
      accountId
    };

    this.transactionsGenerationFeedback.set(null);
    this.generatingTransactions.set(true);
    this.accountsService
      .generateTransactions(payload)
      .pipe(
        finalize(() => this.generatingTransactions.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.transactionsGenerationFeedback.set({
            type: 'success',
            message: response.message || 'Transactions générées.'
          });
          this.generateTransactionsForm.patchValue({ count: 10 });
        },
        error: (error: Error) => {
          this.transactionsGenerationFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de générer des transactions.'
          });
        }
      });
  }

  protected submitTransfer() {
    if (this.transferForm.invalid || this.transferringFunds()) {
      this.transferForm.markAllAsTouched();
      return;
    }

    const { fromAccountId, toAccountId, amount, description, transferType } =
      this.transferForm.getRawValue();
    if (fromAccountId === null || toAccountId === null || amount === null) {
      return;
    }

    const payload: TransferPayload = {
      fromAccountId,
      toAccountId,
      amount,
      description: description?.trim() || undefined,
      transferType
    };

    this.transferFeedback.set(null);
    this.transferringFunds.set(true);
    this.accountsService
      .transferFunds(payload)
      .pipe(
        finalize(() => this.transferringFunds.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.transferFeedback.set({
            type: 'success',
            message: response.message || 'Virement effectué.'
          });
          this.transferForm.reset({ transferType: 'sepa' });
        },
        error: (error: Error) => {
          this.transferFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible d’effectuer le virement.'
          });
        }
      });
  }

  protected submitCardCreation() {
    if (this.cardForm.invalid || this.creatingCard()) {
      this.cardForm.markAllAsTouched();
      return;
    }

    const { accountId, cardType, limit } = this.cardForm.getRawValue();
    if (accountId === null) {
      return;
    }

    const payload: CreateCardPayload = {
      accountId,
      cardType
    };
    if (cardType === 'credit' && limit) {
      payload.limit = limit;
    }

    this.cardFeedback.set(null);
    this.creatingCard.set(true);
    this.accountsService
      .createCard(payload)
      .pipe(
        finalize(() => this.creatingCard.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.cardFeedback.set({
            type: 'success',
            message: response.message || 'Carte créée.'
          });
          this.cardForm.reset({ cardType: 'debit' });
        },
        error: (error: Error) => {
          this.cardFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de créer la carte.'
          });
        }
      });
  }

  protected submitLoanCreation() {
    if (this.loanForm.invalid || this.creatingLoan()) {
      this.loanForm.markAllAsTouched();
      return;
    }

    const { accountId, loanType, amount, interestRate, durationMonths } =
      this.loanForm.getRawValue();
    if (accountId === null || amount === null || interestRate === null || durationMonths === null) {
      return;
    }

    const payload: CreateLoanPayload = {
      accountId,
      loanType,
      amount,
      interestRate,
      durationMonths
    };

    this.loanFeedback.set(null);
    this.creatingLoan.set(true);
    this.accountsService
      .createLoan(payload)
      .pipe(
        finalize(() => this.creatingLoan.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.loanFeedback.set({
            type: 'success',
            message: response.message || 'Prêt créé.'
          });
          this.loanForm.reset({ loanType: 'personal' });
        },
        error: (error: Error) => {
          this.loanFeedback.set({
            type: 'error',
            message: error.message ?? 'Impossible de créer le prêt.'
          });
        }
      });
  }

  protected disableGenerateAccounts() {
    return this.generateAccountsForm.invalid || this.generatingAccounts();
  }

  protected disableGenerateTransactions() {
    return this.generateTransactionsForm.invalid || this.generatingTransactions();
  }

  protected disableTransfer() {
    return this.transferForm.invalid || this.transferringFunds();
  }

  protected disableCardCreation() {
    return this.cardForm.invalid || this.creatingCard();
  }

  protected disableLoanCreation() {
    return this.loanForm.invalid || this.creatingLoan();
  }
}
