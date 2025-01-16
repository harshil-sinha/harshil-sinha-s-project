import { Request, Response } from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import transporter from "../config/emailConfig";
import signupSchema from "../Validations/signupSchema";
import loginSchema from "../Validations/loginSchema";
import {
  createUser,
  findUserByEmail,
  updateLastLogin,
  updateUserStatus,
  clearOtp,
} from "../models/userModel";

interface SignupRequestBody {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  email: string;
  password: string;
  mobile: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

const signup = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response
): Promise<Response> => {
  const { error } = signupSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { first_name, last_name, gender, dob, email, password, mobile } =
    req.body;

  try {
    const existingUser = await findUserByEmail(email);
    if (existingUser && existingUser.rows.length > 0) {
      return res
        .status(400)
        .json({ success: false, message: "Email already registered." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otpCode = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    const createIp = req.ip || "unknown";

    const newUser = await createUser({
      first_name,
      last_name,
      gender,
      dob,
      email,
      password: hashedPassword,
      mobile,
      create_ip: createIp,
      otp: otpCode,
      otp_expires_at: otpExpiresAt,
    });

    await transporter.sendMail({
      from: "harshilsinha17@gmail.com",
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP code is ${otpCode}. It will expire in 15 minutes.`,
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully. OTP sent to email.",
      data: newUser.rows[0],
    });
  } catch (error) {
    console.error("Error during signup:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const login = async (
  req: Request<{}, {}, LoginRequestBody>,
  res: Response
): Promise<Response> => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res
      .status(400)
      .json({ success: false, message: error.details[0].message });
  }

  const { email, password } = req.body;
  const ip = req.ip;

  try {
    const userResult = await findUserByEmail(email);
    if (userResult.rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const user = userResult.rows[0];

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials." });
    }

    await updateLastLogin(user.id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        mobile: user.mobile,
        last_login: user.last_login,
        create_ip: ip,
        updated_ip: ip,
      },
    });
  } catch (error) {
    console.error("Error during login:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error." });
  }
};

const verifyOtp = async (req: Request, res: Response): Promise<Response> => {
  const { email, otp } = req.body;

  try {
    const userResult = await findUserByEmail(email);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = userResult.rows[0];

    if (user.otp_expires_at < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    if (user.otp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    await updateUserStatus(user.id, "verified");
    await clearOtp(user.id);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};

export { signup, login, verifyOtp };
