import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    private configService: ConfigService,
  ) {}

  async sendEmailVerification(
    email: string,
    firstName: string | null,
    token: string,
  ): Promise<void> {
    const frontendUrl =
      this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;

    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Paharnama! Please verify your email 🏔️',
      template: './email-verification',
      context: {
        firstName: firstName || 'there',
        verificationUrl,
      },
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string | null,
  ): Promise<void> {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Welcome to Paharnama! 🏔️',
      template: './welcome',
      context: {
        firstName: firstName || 'there',
      },
    });
  }
}
