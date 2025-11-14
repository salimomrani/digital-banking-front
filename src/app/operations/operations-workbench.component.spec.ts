import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { OperationsWorkbenchComponent } from './operations-workbench.component';
import { AccountsService } from '../accounts/accounts.service';

describe('OperationsWorkbenchComponent', () => {
  let fixture: ComponentFixture<OperationsWorkbenchComponent>;
  let component: OperationsWorkbenchComponent;
  let accountsService: jest.Mocked<AccountsService>;

  beforeEach(async () => {
    accountsService = {
      generateAccounts: jest.fn(),
      generateTransactions: jest.fn(),
      transferFunds: jest.fn(),
      createCard: jest.fn(),
      createLoan: jest.fn()
    } as Partial<jest.Mocked<AccountsService>> as jest.Mocked<AccountsService>;

    accountsService.generateAccounts.mockReturnValue(of({ message: 'ok', data: [] }));
    accountsService.generateTransactions.mockReturnValue(of({ message: 'ok', data: [] }));
    accountsService.transferFunds.mockReturnValue(
      of({ message: 'Transfer completed successfully', data: { success: true } } as any)
    );
    accountsService.createCard.mockReturnValue(
      of({ message: 'Card created successfully', data: {} } as any)
    );
    accountsService.createLoan.mockReturnValue(
      of({ message: 'Loan created successfully', data: {} } as any)
    );

    await TestBed.configureTestingModule({
      imports: [OperationsWorkbenchComponent],
      providers: [{ provide: AccountsService, useValue: accountsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(OperationsWorkbenchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should request account generation', () => {
    component.generateAccountsForm.patchValue({ count: 3, userId: 10 });
    component.generateAccounts();
    expect(accountsService.generateAccounts).toHaveBeenCalledWith({ count: 3, userId: 10 });
  });

  it('should request transaction generation', () => {
    component.generateTransactionsForm.patchValue({ count: 5, accountId: 7 });
    component.generateTransactions();
    expect(accountsService.generateTransactions).toHaveBeenCalledWith({ count: 5, accountId: 7 });
  });

  it('should submit a transfer payload', () => {
    component.transferForm.patchValue({
      fromAccountId: 1,
      toAccountId: 2,
      amount: 250,
      description: 'Test',
      transferType: 'instant'
    });
    component.submitTransfer();
    expect(accountsService.transferFunds).toHaveBeenCalledWith({
      fromAccountId: 1,
      toAccountId: 2,
      amount: 250,
      description: 'Test',
      transferType: 'instant'
    });
  });

  it('should create a card', () => {
    component.cardForm.patchValue({ accountId: 4, cardType: 'credit', limit: 4000 });
    component.submitCardCreation();
    expect(accountsService.createCard).toHaveBeenCalledWith({
      accountId: 4,
      cardType: 'credit',
      limit: 4000
    });
  });

  it('should create a loan', () => {
    component.loanForm.patchValue({
      accountId: 4,
      loanType: 'auto',
      amount: 20000,
      interestRate: 4.2,
      durationMonths: 60
    });
    component.submitLoanCreation();
    expect(accountsService.createLoan).toHaveBeenCalledWith({
      accountId: 4,
      loanType: 'auto',
      amount: 20000,
      interestRate: 4.2,
      durationMonths: 60
    });
  });
});
