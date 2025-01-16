import pool from "../config/db";

interface UserData {
  first_name: string;
  last_name: string;
  gender: string;
  dob: string;
  email: string;
  password: string;
  mobile: string;
  create_ip: string;
  otp: string;
  otp_expires_at: Date;
}

export const createUser = async (userData: UserData) => {
  const {
    first_name,
    last_name,
    gender,
    dob,
    email,
    password,
    mobile,
    otp,
    create_ip,
    otp_expires_at,
  } = userData;
  const query = `
    INSERT INTO users (first_name, last_name, gender, dob, email, password, mobile, otp, create_ip, otp_expires_at) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
    RETURNING *;
  `;
  const values = [
    first_name,
    last_name,
    gender,
    dob,
    email,
    password,
    mobile,
    otp,
    create_ip,
    otp_expires_at,
  ];
  return pool.query(query, values);
};

export const updateUserStatus = async (id: string, status: string) => {
  const query = `UPDATE users SET status = $1 WHERE id = $2`;
  return pool.query(query, [status, id]);
};

export const clearOtp = async (id: string) => {
  const query = `UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE id = $1`;
  return pool.query(query, [id]);
};

export const findUserByEmail = async (email: string) => {
  const query = `SELECT * FROM users WHERE email = $1`;
  return pool.query(query, [email]);
};

export const updateLastLogin = async (id: string) => {
  const query = `UPDATE users SET last_login = NOW() WHERE id = $1`;
  return pool.query(query, [id]);
};

module.exports = {
  createUser,
  findUserByEmail,
  updateLastLogin,
  updateUserStatus,
  clearOtp,
};
