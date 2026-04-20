import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: false,
  auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.SMTP_USER) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return;
  }

  await transporter.sendMail({
    from: `"WorkScheduler" <${env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
}

export async function sendSchedulePublishedEmail(
  to: string,
  weekStart: string,
  employeeName: string
): Promise<void> {
  await sendEmail(
    to,
    'New Schedule Published',
    `<h2>Hi ${employeeName},</h2>
     <p>A new schedule has been published for the week of ${weekStart}.</p>
     <p>Log in to WorkScheduler to view your shifts.</p>`
  );
}

export async function sendSwapRequestEmail(
  to: string,
  requesterName: string,
  shiftDate: string
): Promise<void> {
  await sendEmail(
    to,
    'Shift Swap Request',
    `<h2>Shift Swap Request</h2>
     <p>${requesterName} has requested to swap a shift with you on ${shiftDate}.</p>
     <p>Log in to WorkScheduler to respond.</p>`
  );
}

export async function sendConstraintReminderEmail(
  to: string,
  employeeName: string,
  deadline: string
): Promise<void> {
  await sendEmail(
    to,
    'Availability Submission Reminder',
    `<h2>Hi ${employeeName},</h2>
     <p>Please submit your availability preferences before ${deadline}.</p>
     <p>Log in to WorkScheduler to submit your constraints.</p>`
  );
}
