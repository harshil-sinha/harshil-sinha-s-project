import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

interface Train {
  train_name: string;
  train_number: string;
  arrival_time: string;
  departure_time: string;
  fare: number;
  travel_time: { hours: number };
}

interface Station {
  id: number;
  station_name: string;
  station_code: string;
  location: string;
  updated_at: string;
}

interface Ticket {
  pnr: string;
  train_name: string;
  journey_date: string;
  booking_class: string;
  booking_status: string;
  seat_number: string;
  user_email: string;
  user_name: string;
  train_id: string;
  total_amount: string;
  gender: string;
  from_city: string;
  to_city: string;
}

interface TrainSearchResponse {
  success: boolean;
  message: string;
  data: Train[];
}

interface StationResponse {
  success: boolean;
  data: Station[];
}

@Component({
  selector: 'app-train-search',
  templateUrl: './train-search.component.html',
  styleUrls: ['./train-search.component.css'],
})
export class TrainSearchComponent implements OnInit {
  trainSearchForm: FormGroup;
  trains: Train[] = [];
  stations: Station[] = [];
  userTickets: Ticket[] = [];
  errorMessage: string = '';
  ticketErrorMessage: string = '';
  isLoading: boolean = false;
  searchedFrom: string = '';
  searchedTo: string = '';
  userEmail: string | null = null; 
  showTicketPopup: boolean = false;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.trainSearchForm = this.fb.group({
      from: [''],
      to: [''],
    });

    this.userEmail = localStorage.getItem('userEmail');
  }

  ngOnInit(): void {
    this.fetchStations();
  }

  fetchStations(): void {
    this.http
      .get<StationResponse>(`${environment.apiBaseUrl}/get_station`)
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.stations = response.data;
          } else {
            Swal.fire('Error!', 'Failed to load stations.', 'error');
          }
        },
        error: () => {
          Swal.fire('Error!', 'Failed to fetch station names.', 'error');
        },
      });
  }

  onSubmit(): void {
    if (this.trainSearchForm.valid) {
      this.isLoading = true;
      const { from, to } = this.trainSearchForm.value;

      this.http
        .post<TrainSearchResponse>(`${environment.apiBaseUrl}/search`, {
          from,
          to,
        })
        .subscribe({
          next: (response) => {
            this.isLoading = false;
            if (response.success) {
              this.trains = response.data;
              this.errorMessage = '';
              this.searchedFrom = from;
              this.searchedTo = to;
            } else {
              this.trains = [];
              this.errorMessage = response.message;
            }
          },
          error: () => {
            this.isLoading = false;
            this.errorMessage = 'Error occurred while fetching trains.';
          },
        });
    } else {
      Swal.fire('Invalid Input!', 'Please select valid stations.', 'warning');
    }
  }

  openBookingForm(train: Train): void {
    Swal.fire({
      title: 'Enter Booking Details',
      html: `
        <input type="text" id="user_name" class="swal2-input" placeholder="Name">
        <select id="gender" class="swal2-input">
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>
        <select id="booking_class" class="swal2-input">
          <option value="">Select Class</option>
          <option value="AC First Class">AC First Class</option>
          <option value="Executive Class">Executive Class</option>
          <option value="AC 2 Tier">AC 2 Tier</option>
          <option value="Sleeper Class">Sleeper Class</option>
          <option value="Second Class">Second Class</option>
        </select>
        <input type="date" id="journey_date" class="swal2-input" placeholder="Journey Date">
      `,
      confirmButtonText: 'Book',
      focusConfirm: false,
      preConfirm: () => {
        const user_name = (
          document.getElementById('user_name') as HTMLInputElement
        ).value;
        const gender = (document.getElementById('gender') as HTMLSelectElement)
          .value;
        const booking_class = (
          document.getElementById('booking_class') as HTMLSelectElement
        ).value;
        const journey_date = (
          document.getElementById('journey_date') as HTMLInputElement
        ).value;

        if (!user_name || !gender || !booking_class || !journey_date) {
          Swal.showValidationMessage('Please fill out all fields');
          return;
        }

        return { user_name, gender, booking_class, journey_date };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const { user_name, gender, booking_class, journey_date } = result.value;

        let seat_number = Math.floor(Math.random() * 100) + 1;

        let seatExists = true;
        let attempts = 0;
        while (seatExists && attempts < 100) {
          seatExists = this.userTickets.some(
            (ticket) =>
              ticket.seat_number === seat_number.toString() &&
              ticket.user_email === this.userEmail
          );
          if (seatExists) {
            seat_number = Math.floor(Math.random() * 100) + 1; 
          }
          attempts++;
        }

        if (seatExists) {
          Swal.fire(
            'Error!',
            'No available seat found for you. Please try again later.',
            'error'
          );
          return;
        }

        const bookingData = {
          pnr: Math.floor(100000000 + Math.random() * 900000000),
          user_id: Math.floor(1 + Math.random() * 100), 
          train_id: train.train_number,
          journey_date: journey_date,
          booking_status: 'Confirmed',
          total_amount: train.fare,
          seat_numbers: [seat_number.toString()], 
          user_name: user_name,
          gender: gender,
          email: this.userEmail, 
          from_city: this.searchedFrom,
          to_city: this.searchedTo,
          booking_class: booking_class,
        };

        this.http
          .post(`${environment.apiBaseUrl}/create`, bookingData)
          .subscribe({
            next: () => {
              Swal.fire('Success!', 'Booking created successfully.', 'success');
              this.fetchUserTickets(); 
            },
            error: () => {
              Swal.fire('Error!', 'Failed to create booking.', 'error');
            },
          });
      }
    });
  }

  fetchUserTickets(): void {
    if (!this.userEmail) {
      Swal.fire(
        'Error!',
        'You must be logged in to view your tickets.',
        'error'
      );
      return;
    }

    this.http
      .get<{ success: boolean; tickets: Ticket[] }>(
        `${environment.apiBaseUrl}/tickets/${this.userEmail}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.userTickets = response.tickets;
            this.ticketErrorMessage = '';
            this.showTicketPopup = true;
          }
        },
        error: (err) => {
          this.userTickets = [];
          this.ticketErrorMessage =
            err.status === 404
              ? 'No tickets found for this email.'
              : 'Error fetching tickets.';
        },
      });
  }

  cancelTicket(pnr: string): void {
    if (!pnr) {
      Swal.fire('Error!', 'PNR is required to cancel the ticket.', 'error');
      return;
    }

    this.http.post(`${environment.apiBaseUrl}/cancel`, { pnr }).subscribe({
      next: (response) => {
        if (response) {
          Swal.fire('Success!', 'Your ticket has been cancelled.', 'success');
          this.fetchUserTickets(); 
        } else {
          Swal.fire('Error!', 'Failed to cancel the ticket.', 'error');
        }
      },
      error: (err) => {
        Swal.fire(
          'Error!',
          'An error occurred while cancelling the ticket.',
          'error'
        );
      },
    });
  }

  closeTicketPopup() {
    this.showTicketPopup = false;
  }
  onLogout(): void {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('userEmail');
      this.userEmail = null; 
      this.router.navigate(['/login']);
    }
  }
}
