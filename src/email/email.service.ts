import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST, // Utilisation correcte de la variable d'env
      port: Number(process.env.MAIL_PORT), // Convertir en nombre si nécessaire
      secure: false, // false pour TLS, true pour SSL
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  async sendEmail({ subject, recipients, html }: { subject: string; recipients: { address: string }[]; html: string }) {
    try {
      const mailOptions = {
        from: process.env.MAIL_USER,
        to: recipients.map(r => r.address).join(','), 
        subject,
        html,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé: ', info.response);
      return info;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      throw new Error('Problème lors de l\'envoi de l\'email');
    }
  }

}
