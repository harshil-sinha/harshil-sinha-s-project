import nodemailer, { Transporter } from "nodemailer";

const emailConfig: Transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: "harshilsinha17@gmail.com",
    pass: "jtdhqxphaxoqdagn",
  },
});

export default emailConfig;
