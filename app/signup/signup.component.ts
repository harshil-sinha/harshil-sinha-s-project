import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'],
})
export class SignupComponent {
  signupForm: FormGroup;
  otpForm: FormGroup;
  otpSent: boolean = false;
  otpVerified: boolean = false;
  userEmail: string = '';
  isLoading: boolean = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      first_name: ['', []],
      last_name: [''],
      gender: [''],
      dob: [''],
      email: ['', []],
      password: ['', []],
      mobile: ['', []],
    });

    this.otpForm = this.fb.group({
      otp: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(6)],
      ],
    });
  }

  ngOnInit(): void {}

  onSubmit() {
    if (this.signupForm.valid) {
      this.isLoading = true;
      let signupData = this.signupForm.value;
      const formattedDob = this.datePipe.transform(
        signupData.dob,
        'yyyy-MM-dd'
      );
      signupData.dob = formattedDob;

      this.userEmail = signupData.email;

      this.http.post(`${environment.apiBaseUrl}/signup`, signupData).subscribe({
        next: (response) => {
          
          Swal.fire({
            title: 'Success!',
            text: 'Signup successful. Please check your email for OTP.',
            icon: 'success',
            confirmButtonText: 'OK',
          }).then(() => {
            this.signupForm.reset();
          });

          this.otpSent = true;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Signup error:', error);
          Swal.fire({
            title: 'Error!',
            text: 'Signup Failed. Please try again.',
            icon: 'error',
            confirmButtonText: 'OK',
          });
          this.isLoading = false;
        },
      });
    }
  }

  onVerifyOTP() {
    if (this.otpForm.valid) {
      this.isLoading = true;
      let otpData = this.otpForm.value;
      otpData.email = this.userEmail;

      this.http
        .post('http://localhost:4000/api/verify_otp', otpData)
        .subscribe({
          next: (response) => {
            Swal.fire({
              title: 'Success!',
              text: 'OTP verified successfully.',
              icon: 'success',
              confirmButtonText: 'OK',
            }).then(() => {
              this.otpVerified = true;
              this.router.navigate(['/login']);
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('OTP verification error:', error);
            Swal.fire({
              title: 'Error!',
              text: 'OTP verification failed. Please try again.',
              icon: 'error',
              confirmButtonText: 'OK',
            });
            this.isLoading = false;
          },
        });
    }
  }
}
