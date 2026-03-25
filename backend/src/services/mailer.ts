import nodemailer from "nodemailer";
import { config } from "../config.js";

const transport =
  config.emailUser && config.emailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: config.emailUser, pass: config.emailPass }
      })
    : null;

export async function sendMail(to: string, subject: string, text: string) {
  if (!transport) {
    // In dev or without credentials, skip sending (but keep API behavior working).
    return;
  }

  await transport.sendMail({
    from: config.emailUser,
    to,
    subject,
    text
  });
}

