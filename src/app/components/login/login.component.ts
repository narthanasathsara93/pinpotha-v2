import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import * as bcrypt from 'bcryptjs';

import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  userName = '';
  password = '';
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  async ngOnInit() {
    const auth = localStorage.getItem('auth');

    if (auth === 'true') {
      await this.router.navigate(['/merits']);
    }
  }
  async login() {
    this.loading = true;
    this.error = '';

    if (!this.userName || !this.password) {
      this.error = 'Username and password are required';
      this.loading = false;
      return;
    }
    try {
      const hash = await this.authService.getPasswordHash(this.userName);
      const isMatch = await bcrypt.compare(this.password, hash);

      if (isMatch) {
        localStorage.setItem('auth', 'true');
        this.router.navigate(['/merits']);
      } else {
        this.error = 'Invalid password';
        this.redirectToLogin();
      }
    } catch (e) {
      this.error = 'Login failed';
      this.redirectToLogin();
    } finally {
      this.loading = false;
    }
  }

  redirectToLogin() {
    this.router.navigate(['/login']);
  }

  // async onCreateUser() {
  //   this.loading = true;
  //   this.error = '';
  //   this.success = '';

  //   if (!this.userName || !this.password) {
  //     this.error = 'Username and password are required';
  //     this.loading = false;
  //     return;
  //   }
  //   const userExists = await this.authService.userNameExits(this.userName);
  //   if (userExists) {
  //     this.error = 'Username already exists';
  //     this.loading = false;
  //     return;
  //   }

  //   const error = await this.authService.createUser(
  //     this.userName,
  //     this.password
  //   );
  //   this.loading = false;

  //   if (error) {
  //     this.error = error;
  //   } else {
  //     this.success = 'User created successfully!';
  //     localStorage.setItem('auth', 'true');
  //     this.router.navigate(['/merits']);
  //     setTimeout(() => {
  //       this.success = '';
  //     }, 1500);
  //   }
  // }

  isUserExists(): boolean {
    return !!localStorage.getItem('auth');
  }
}
