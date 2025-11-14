import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AccountsDashboardComponent } from './accounts-dashboard.component';
import { AccountsService } from './accounts.service';

describe('AccountsDashboardComponent', () => {
  let fixture: ComponentFixture<AccountsDashboardComponent>;
  let component: AccountsDashboardComponent;
  let accountsService: jest.Mocked<AccountsService>;

  const accountSummary = {
    id: 'ACC-0001',
    holder: 'Alice',
    balance: 1500,
    currency: 'EUR',
    transactions: []
  };

  const accountDetails = {
    ...accountSummary,
    iban: 'FR10 1234 1234 1234',
    transactions: [
      {
        id: 'TX-001',
        type: 'credit' as const,
        amount: 200,
        label: 'Salaire',
        timestamp: '2024-01-01T00:00:00Z'
      }
    ]
  };

  beforeEach(async () => {
    accountsService = {
      getHealth: jest.fn(),
      getAccounts: jest.fn(),
      getAccount: jest.fn(),
      createTransaction: jest.fn(),
      generateAccounts: jest.fn()
    } as jest.Mocked<AccountsService>;

    accountsService.getHealth.mockReturnValue(
      of({
        status: 'ok',
        service: 'api',
        timestamp: '2024-01-01T00:00:00Z'
      })
    );
    accountsService.getAccounts.mockReturnValue(of([accountSummary]));
    accountsService.getAccount.mockReturnValue(of(accountDetails));
    accountsService.createTransaction.mockReturnValue(
      of({
        message: 'Transaction enregistrée',
        account: { id: 'ACC-0001', balance: 1300, currency: 'EUR' },
        transaction: {
          id: 'TX-002',
          type: 'debit',
          amount: 200,
          label: 'Test',
          timestamp: '2024-01-02T00:00:00Z'
        }
      })
    );

    accountsService.generateAccounts.mockReturnValue(
      of({
        message: '3 accounts created successfully',
        data: []
      })
    );

    await TestBed.configureTestingModule({
      imports: [AccountsDashboardComponent],
      providers: [{ provide: AccountsService, useValue: accountsService }]
    }).compileComponents();

    fixture = TestBed.createComponent(AccountsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load accounts and select the first one', () => {
    expect(component.accounts().length).toBe(1);
    expect(component.selectedAccount()?.id).toBe('ACC-0001');
    expect(accountsService.getAccount).toHaveBeenCalledWith('ACC-0001');
  });

  it('should create a transaction from the form values', () => {
    component.transactionForm.patchValue({
      type: 'debit',
      amount: 250,
      label: 'Paiement resto '
    });

    component.submitTransaction();

    expect(accountsService.createTransaction).toHaveBeenCalledWith('ACC-0001', {
      type: 'debit',
      amount: 250,
      label: 'Paiement resto'
    });
  });

  it('should request account generation with provided payload', () => {
    component.generateAccountsForm.patchValue({
      count: 3,
      userId: 7
    });

    component.generateAccounts();

    expect(accountsService.generateAccounts).toHaveBeenCalledWith({
      count: 3,
      userId: 7
    });
  });
});
