import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordError: boolean = false;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: [
        '',
        [
          // Validators.required,
          // Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}$/),
        ],
      ],
      password: ['', []],
    });
  }

  onSubmit(): void {
    this.passwordError = false;
    if (this.loginForm.valid) {
      this.isLoading = true;
      const loginData = this.loginForm.getRawValue();
      this.http.post(`${environment.apiBaseUrl}/login`, loginData).subscribe({
        next: (response: any) => {
          // Save user details in localStorage
          localStorage.setItem('userEmail', loginData.email);
          this.loginForm.reset();
          this.router.navigate(['/search']);
          this.isLoading = false;
        },
        error: (error) => {
          if (error.status === 401) {
            this.passwordError = true;
          }
          console.error('Login error:', error);
          this.isLoading = false;
        },
      });
    }
  }
}
