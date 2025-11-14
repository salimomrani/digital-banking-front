import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AccountsService } from './accounts.service';
import {
  AccountResponse,
  AccountsResponse,
  GenerateAccountsResponse,
  TransactionResponse
} from './accounts.types';

describe('AccountsService', () => {
  let service: AccountsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    service = TestBed.inject(AccountsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should map the accounts list from the API response', () => {
    const mockResponse: AccountsResponse = {
      accounts: [
        {
          id: 'ACC-0001',
          holder: 'Alice Doe',
          balance: 1500,
          currency: 'EUR',
          transactions: []
        }
      ]
    };

    service.getAccounts().subscribe((accounts) => {
      expect(accounts.length).toBe(1);
      expect(accounts[0].id).toBe('ACC-0001');
    });

    const req = httpMock.expectOne('http://localhost:4000/api/accounts');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should fetch account details by id', () => {
    const mockResponse: AccountResponse = {
      account: {
        id: 'ACC-0002',
        holder: 'Bob',
        balance: 900,
        currency: 'USD',
        transactions: []
      }
    };

    service.getAccount('ACC-0002').subscribe((account) => {
      expect(account.id).toBe('ACC-0002');
    });

    const req = httpMock.expectOne('http://localhost:4000/api/accounts/ACC-0002');
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should post a new transaction payload', () => {
    const mockResponse: TransactionResponse = {
      message: 'ok',
      account: {
        id: 'ACC-0002',
        balance: 950,
        currency: 'USD'
      },
      transaction: {
        id: 'TX-001',
        type: 'credit',
        amount: 50,
        label: 'Test',
        timestamp: new Date().toISOString()
      }
    };

    service
      .createTransaction('ACC-0002', { type: 'credit', amount: 50, label: 'Test' })
      .subscribe((response) => {
        expect(response.transaction.amount).toBe(50);
      });

    const req = httpMock.expectOne('http://localhost:4000/api/accounts/ACC-0002/transactions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'credit', amount: 50, label: 'Test' });
    req.flush(mockResponse);
  });

  it('should call the generate accounts endpoint', () => {
    const mockResponse: GenerateAccountsResponse = {
      message: '2 accounts created successfully',
      data: []
    };

    service.generateAccounts({ count: 2 }).subscribe((response) => {
      expect(response.message).toContain('2 accounts');
    });

    const req = httpMock.expectOne('http://localhost:4000/api/bank/generate-accounts');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ count: 2 });
    req.flush(mockResponse);
  });

  it('should call the generate transactions endpoint', () => {
    service.generateTransactions({ count: 5, accountId: 3 }).subscribe();

    const req = httpMock.expectOne('http://localhost:4000/api/bank/generate-transactions');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ count: 5, accountId: 3 });
    req.flush({ message: 'ok', data: [] });
  });

  it('should post transfer payloads to the API', () => {
    service
      .transferFunds({
        fromAccountId: 1,
        toAccountId: 2,
        amount: 250,
        transferType: 'instant'
      })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:4000/api/bank/transfers');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      fromAccountId: 1,
      toAccountId: 2,
      amount: 250,
      transferType: 'instant'
    });
    req.flush({ message: 'Transfer completed successfully', data: { success: true } });
  });

  it('should call the cards endpoint', () => {
    service.createCard({ accountId: 4, cardType: 'debit' }).subscribe();

    const req = httpMock.expectOne('http://localhost:4000/api/bank/cards');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ accountId: 4, cardType: 'debit' });
    req.flush({ message: 'Card created successfully', data: {} });
  });

  it('should call the loans endpoint', () => {
    service
      .createLoan({
        accountId: 4,
        loanType: 'personal',
        amount: 10000,
        interestRate: 4.5,
        durationMonths: 36
      })
      .subscribe();

    const req = httpMock.expectOne('http://localhost:4000/api/bank/loans');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      accountId: 4,
      loanType: 'personal',
      amount: 10000,
      interestRate: 4.5,
      durationMonths: 36
    });
    req.flush({ message: 'Loan created successfully', data: {} });
  });
});
