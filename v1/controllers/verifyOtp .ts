import { Request, Response } from "express";
import {
  findUserByEmail,
  clearOtp,
  updateUserStatus,
} from "../models/userModel";

interface VerifyOtpRequestBody {
  email: string;
  otp_code: string;
}

const verifyOtp = async (
  req: Request<{}, {}, VerifyOtpRequestBody>,
  res: Response
): Promise<Response> => {
  const { email, otp_code } = req.body;

  try {
    const userResult = await findUserByEmail(email);
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const user = userResult.rows[0];

    if (
      user.otp_code !== otp_code ||
      new Date(user.otp_expires_at) < new Date()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    await clearOtp(user.id);
    await updateUserStatus(user.id, "verified");

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. User status updated to verified.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

export { verifyOtp };
