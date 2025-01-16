import { PoolClient } from "pg";
import pool from "../config/db";

interface Booking {
  booking_class: string;
  user_id: number;
  user_name: string;
  email: string;
  pnr: string;
  train_id: number;
  train_name: string;
  journey_date: string;
  booking_status: string;
  booking_date: string;
  total_amount: number;
  refund_amount: number;
  seat_number: string;
}

const getBookingByPNR = async (pnr: string): Promise<Booking | null> => {
  const query = "SELECT * FROM booking WHERE pnr = $1";
  const result = await pool.query(query, [pnr]);
  return result.rows[0] || null;  
};

const cancelBooking = async (
  pnr: string,
  refundAmount: number,
  seatNumbers: string
): Promise<Booking> => {
  const query1 = `
    UPDATE booking
    SET booking_status = 'Cancelled'
    WHERE pnr = $1
    RETURNING *;
  `;

  const query2 = `
    INSERT INTO cancel_tickets (
      user_id, user_name, email, pnr, train_id, train_name, journey_date,
      booking_status, booking_date, total_amount, refund_amount, seat_number
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
  `;

  const client: PoolClient = await pool.connect();

  try {
    await client.query("BEGIN");

    const bookingResult = await client.query(query1, [pnr]);
    const booking: Booking = bookingResult.rows[0];

    if (!booking) {
      throw new Error("Booking not found");
    }

    const trainName = booking.train_name || "Unknown Train";

    const values = [
      booking.user_id,
      booking.user_name,
      booking.email,
      booking.pnr,
      booking.train_id,
      trainName,
      booking.journey_date,
      "Cancelled",
      booking.booking_date,
      booking.total_amount,
      refundAmount,
      seatNumbers,
    ];

    await client.query(query2, values);
    await client.query("COMMIT");

    return booking;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export {
  getBookingByPNR,
  cancelBooking,
};