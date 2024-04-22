import Handlebars from "handlebars";
import nodemailer from "nodemailer";
import { emailTemplateService } from "../../services/index.js";
import { envs } from "../../config/index.js";

export const sendEmail = async (email, type, substitutions = {}) => {
  console.log(".....Email Service Called.....");
  const emailTemplate = await emailTemplateService.getTemplate(type);

  if (emailTemplate) {
    const template = Handlebars.compile(emailTemplate.text);
    const text = template(substitutions, {
      data: {
        intl: {
          locales: "en-US",
        },
      },
    });

    const transport = nodemailer.createTransport({
      host: envs.smtp.host,
      port: 465,
      // secure: true,
      requireSSL: true,
      auth: {
        user: envs.smtp.email,
        pass: envs.smtp.password,
      },
    });

    const mailInfo = {
      from: String(envs.smtp.fromEmail),
      to: email,
      subject: emailTemplate.title,
      html: text + " " + " " + "<br>" + "임시 비밀번호" + " - " + substitutions.rndPassword,
    };

    await transport.sendMail(mailInfo);
    console.log(".....MAIL SENT.....");
  }
};
