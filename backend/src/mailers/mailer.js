import { Env } from "../config/env.config.js";
import { resend } from "../config/resend.config.js";



const mailer_sender = `Finora <${Env.RESEND_MAIL_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}) => {
  return await resend.emails.send({
    from,
    to: Array.isArray(to) ? to : [to],
    text,
    subject,
    html,
  });
};