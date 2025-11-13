import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { AccountsService } from './accounts.service';
import { AccountResponse, AccountsResponse, TransactionResponse } from './accounts.types';

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
});
