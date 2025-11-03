import { Routes } from '@angular/router';
import { MeritListComponent } from './components/merit-list/merit-list.component';
import { MeritDetailComponent } from './components/merit-detail/merit-detail.component';
import { MeritFormComponent } from './components/merit-form/merit-form.component';
import { LoginComponent } from './components/login/login.component';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'merits', pathMatch: 'full' },
  { path: 'merits', component: MeritListComponent },
  { path: 'merits/other', component: MeritListComponent },
  {
    path: 'merits/add',
    component: MeritFormComponent,
    canActivate: [AuthGuard],
  },
  { path: 'merits/:id', component: MeritDetailComponent },
  {
    path: 'merits/:id/edit',
    component: MeritFormComponent,
    canActivate: [AuthGuard],
  },
  { path: 'login', component: LoginComponent },
];
