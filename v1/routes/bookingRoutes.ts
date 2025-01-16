import express, { Request, Response } from "express";
import {
  createBooking,
  cancelTicket,
  getTicketsByEmail,
} from "../controllers/bookingController";

const router = express.Router();

interface CreateBookingRequestBody {
  userId: string;
  seatId: string;
  scheduleId: string;
  status: string;
}

interface CancelTicketRequestBody {
  bookingId: string;
}

router.post(
  "/create",
  async (req: Request<{}, {}, CreateBookingRequestBody>, res: Response) => {
    try {
      await createBooking(req, res);
    } catch (error) {
      console.error("Error during booking creation:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during booking creation.",
      });
    }
  }
);

router.post(
  "/cancel",
  async (req: Request<{}, {}, CancelTicketRequestBody>, res: Response) => {
    try {
      await cancelTicket(req, res);
    } catch (error) {
      console.error("Error during booking cancellation:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during booking cancellation.",
      });
    }
  }
);
router.get("/tickets/:email", getTicketsByEmail);

export default router;
