import { Routes } from '@angular/router';
import { AccountsDashboardComponent } from './accounts/accounts-dashboard.component';
import { OperationsWorkbenchComponent } from './operations/operations-workbench.component';

export const routes: Routes = [
  {
    path: 'accounts',
    component: AccountsDashboardComponent
  },
  {
    path: 'operations',
    component: OperationsWorkbenchComponent
  },
  {
    path: '',
    redirectTo: 'accounts',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'accounts',
    pathMatch: 'full'
  }
];
