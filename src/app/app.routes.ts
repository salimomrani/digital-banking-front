import { Routes } from '@angular/router';
import { AccountsDashboardComponent } from './accounts/accounts-dashboard.component';

export const routes: Routes = [
  {
    path: '',
    component: AccountsDashboardComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];
