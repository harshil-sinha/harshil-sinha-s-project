import { Request, Response } from "express";
import { Pool } from "pg";
import moment from "moment";
import { bookingValidation } from "../Validations/bookingValidation";
import { getBookingByPNR, cancelBooking } from "../models/bookingModel";
import pool from "../config/db";

interface Booking {
  pnr: string;
  user_id: number;
  train_id: number;
  journey_date: string;
  booking_status: string;
  total_amount: number;
  seat_numbers: string[];
  user_name: string;
  gender: string;
  email: string;
  from_city: string;
  to_city: string;
  booking_class: string;
}

const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      pnr,
      user_id,
      train_id,
      journey_date,
      booking_status,
      total_amount,
      seat_numbers,
      user_name,
      gender,
      email,
      from_city,
      to_city,
      booking_class,
    }: Booking = req.body;

    if (
      !pnr ||
      !user_id ||
      !train_id ||
      !journey_date ||
      !total_amount ||
      !seat_numbers ||
      !user_name ||
      !gender ||
      !email ||
      !from_city ||
      !to_city ||
      !booking_class
    ) {
      res.status(400).json({ message: "Missing required fields 😡" });
      return;
    }

    const query = `
      INSERT INTO booking (
        pnr, user_id, train_id, journey_date, booking_status,
        booking_date, total_amount, seat_number, user_name, gender,
        email, from_city, to_city, booking_class
      ) VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;

    const result = await pool.query(query, [
      pnr,
      user_id,
      train_id,
      journey_date,
      booking_status || "Pending",
      total_amount,
      seat_numbers.join(","),
      user_name,
      gender,
      email,
      from_city,
      to_city,
      booking_class,
    ]);

    res.status(201).json({
      message: "Booking created successfully 😍",
      booking: result.rows[0],
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("Error occurred:", err.message);
      res.status(500).json({ message: "Internal server error 😡" });
    } else {
      console.error("Unknown error occurred");
      res.status(500).json({ message: "Internal server error 😡" });
    }
  }
};

const cancelTicket = async (req: Request, res: Response): Promise<void> => {
  try {
    const { pnr }: { pnr: string } = req.body;

    if (!pnr) {
      res.status(400).json({ message: "PNR is required 😡" });
      return;
    }

    const booking = await getBookingByPNR(pnr);

    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    if (booking.booking_status === "Cancelled") {
      res
        .status(400)
        .json({ message: "This booking has already been cancelled 😒" });
      return;
    }

    const journeyDate = moment(booking.journey_date);
    const currentTime = moment().format("MMMM Do YYYY, h:mm:ss a");

    const hoursDiff = journeyDate.diff(currentTime, "hours");

    let refundAmount = 0;
    const farePerPassenger =
      booking.total_amount / booking.seat_number.split(",").length;
    const seatNumbers = booking.seat_number;

    if (hoursDiff > 48) {
      if (
        booking.booking_class === "AC First Class" ||
        booking.booking_class === "Executive Class"
      ) {
        refundAmount = booking.total_amount - 240;
      } else if (
        booking.booking_class === "AC 2 Tier" ||
        booking.booking_class === "First Class"
      ) {
        refundAmount = booking.total_amount - 200;
      } else if (
        ["AC 3 Tier", "AC Chair Car", "AC 3 Economy"].includes(
          booking.booking_class
        )
      ) {
        refundAmount = booking.total_amount - 180;
      } else if (booking.booking_class === "Sleeper Class") {
        refundAmount = booking.total_amount - 120;
      } else if (booking.booking_class === "Second Class") {
        refundAmount = booking.total_amount - 60;
      }
    } else if (hoursDiff <= 48 && hoursDiff > 12) {
      refundAmount = Math.max(booking.total_amount * 0.75, 60);
    } else if (hoursDiff <= 12 && hoursDiff > 4) {
      refundAmount = Math.max(booking.total_amount * 0.5, 60);
    } else {
      refundAmount = 0;
    }

    const updatedBooking = await cancelBooking(pnr, refundAmount, seatNumbers);

    res.status(200).json({
      message: "Ticket cancelled successfully",
      booking: updatedBooking,
      refundAmount,
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error occurred:", err.message);
      res.status(500).json({ message: err.message });
    } else {
      console.error("Unknown error occurred");
      res.status(500).json({ message: "Internal server error 😡" });
    }
  }
};

const getTicketsByEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.params;

    if (!email) {
      res.status(400).json({ message: "Email is required" });
      return;
    }

    const query = `SELECT * FROM booking WHERE email = $1 ORDER BY booking_date DESC;`;
    const result = await pool.query(query, [email]);

    if (result.rows.length === 0) {
      res.status(404).json({ message: "No tickets found for this email" });
      return;
    }

    res.status(200).json({
      success: true,
      tickets: result.rows,
    });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { createBooking, cancelTicket, getTicketsByEmail };
