import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { PrismaService } from "../prisma/prisma.service";

export interface SendMailAttachment {
  filename: string;
  path: string;
  cid?: string;
}

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: SendMailAttachment[];
}

@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter: Transporter | null = null;
  private isConfigured = false;
  private fromAddress = "VigilArt <no-reply@vigilart.app>";
  private appUrl = "http://localhost:3000";

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  onModuleInit() {
    const host = this.config.get<string>("SMTP_HOST");
    const port = Number(this.config.get<string>("SMTP_PORT") || 587);
    const secure = this.config.get<string>("SMTP_SECURE") === "true" || port === 465;
    const user = this.config.get<string>("SMTP_USER");
    const pass = this.config.get<string>("SMTP_PASS");
    const from = this.config.get<string>("SMTP_FROM");
    const configuredAppUrl = this.config.get<string>("APP_URL");

    if (from) {
      this.fromAddress = from;
    }
    if (configuredAppUrl) {
      this.appUrl = configuredAppUrl.replace(/\/$/, "");
    }

    if (host && user) {
      try {
        this.transporter = nodemailer.createTransport({
          host,
          port,
          secure,
          auth: {
            user,
            pass: pass || ""
          }
        });
        this.isConfigured = true;
        this.logger.log(`Mail service configured with SMTP server ${host}:${port}.`);
      } catch (err) {
        this.logger.error(`Failed to initialize SMTP transporter: ${err instanceof Error ? err.message : err}`);
      }
    } else {
      this.logger.warn(
        "SMTP not configured (missing SMTP_HOST and/or SMTP_USER). " +
        "MailService is running in simulation mode: emails will be logged instead of sent."
      );
    }
  }

  async sendMail(options: SendMailOptions): Promise<boolean> {
    if (!this.isConfigured || !this.transporter) {
      this.logger.log(
        `[SIMULATED EMAIL] To: ${options.to} | Subject: "${options.subject}"`
      );
      this.logger.debug(`[SIMULATED EMAIL BODY]\n${options.text}`);
      return true;
    }

    try {
      await this.transporter.sendMail({
        from: this.fromAddress,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments
      });
      this.logger.log(`Email successfully sent to ${options.to} (Subject: "${options.subject}")`);
      return true;
    } catch (err) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${err instanceof Error ? err.message : err}`,
        err instanceof Error ? err.stack : undefined
      );
      return false;
    }
  }

  async sendReportReadyEmail(userId: string, reportId: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        mailNotificationsEnabled: true
      }
    });

    if (!user) {
      this.logger.warn(`Cannot send report email: user ${userId} not found.`);
      return;
    }

    if (!user.mailNotificationsEnabled) {
      this.logger.debug(
        `User ${userId} has mail notifications disabled. Skipping report email.`
      );
      return;
    }

    const report = await this.prisma.artworksReport.findUnique({
      where: { id: reportId },
      include: {
        _count: {
          select: { matchingPages: true }
        }
      }
    });

    const matchCount = report?._count.matchingPages ?? 0;
    const reportDate = (report?.detectionDate ?? new Date()).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    const reportsUrl = `${this.appUrl}/dashboard`;
    const profileUrl = `${this.appUrl}/profile`;

    const blackWordmarkUrl = "https://vigilart.app/VigilArt_wordmark_black.png";
    const whiteWordmarkUrl = "https://vigilart.app/VigilArt_wordmark_white.png";

    const subject = "Your artwork scan report is ready - VigilArt";

    const text = `Hello ${user.firstName},\n\n` +
      `Your artwork scan report is ready.\n\n` +
      `Summary:\n` +
      `- Report Date: ${reportDate}\n` +
      `- Potential Matches Found: ${matchCount}\n\n` +
      `View your report online at: ${reportsUrl}\n\n` +
      `If unauthorized uses of your artworks were found, you can generate formal DMCA takedown notices directly through VigilArt.\n\n` +
      `---\n` +
      `You received this email because email notifications are enabled in your account.\n` +
      `Manage your preferences at ${profileUrl}.\n` +
      `© ${new Date().getFullYear()} VigilArt. All rights reserved.`;

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
      color: #0a0a0a;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f5f5f5;
      padding: 40px 16px;
      box-sizing: border-box;
    }
    .container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #e5e5e5;
      border-radius: 12px;
      overflow: hidden;
    }
    .header {
      padding: 16px 28px;
      border-bottom: 1px solid #e5e5e5;
    }
    .logo-img {
      display: block;
      width: 160px;
      max-width: 160px;
      height: auto;
      border: 0;
    }
    .logo-dark {
      display: none;
    }
    .logo-text {
      font-size: 22px;
      font-weight: 600;
      letter-spacing: -0.3px;
      color: #0a0a0a;
      text-decoration: none;
      display: inline-block;
    }
    .content {
      padding: 32px;
    }
    h1 {
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.2px;
      margin: 0 0 16px;
      color: #0a0a0a;
    }
    p {
      font-size: 15px;
      line-height: 1.6;
      color: #0a0a0a;
      margin: 0 0 16px;
    }
    .summary-card {
      background-color: #f5f5f5;
      border: 1px solid #e5e5e5;
      border-radius: 8px;
      padding: 4px 16px;
      margin: 24px 0;
    }
    .summary-item {
      padding: 12px 0;
      border-bottom: 1px solid #e5e5e5;
      font-size: 14px;
    }
    .summary-item:last-child {
      border-bottom: none;
    }
    .summary-row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px 16px;
    }
    .summary-label {
      color: #737373;
      font-size: 14px;
    }
    .summary-value {
      font-weight: 600;
      color: #0a0a0a;
      font-size: 14px;
      display: inline-block;
    }
    .badge {
      display: inline-block;
      padding: 3px 12px;
      border-radius: 9999px;
      font-size: 13px;
      font-weight: 500;
      ${matchCount > 0
        ? "background-color: #f1ebf6; color: #5e3b7d; border: 1px solid #d9c7eb;"
        : "background-color: #ebf7eb; color: #008300; border: 1px solid #b8e6b8;"}
    }
    .button-container {
      text-align: left;
      margin: 28px 0 20px;
    }
    .btn {
      display: inline-block;
      background-color: #5e3b7d;
      color: #ffffff !important;
      font-size: 14px;
      font-weight: 500;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
    }
    .note {
      font-size: 13px;
      color: #737373;
      line-height: 1.5;
      margin-top: 24px;
      margin-bottom: 0;
    }
    .footer {
      padding: 24px 32px;
      background-color: #fafafa;
      border-top: 1px solid #eeeeee;
      font-size: 12px;
      color: #737373;
      line-height: 1.6;
    }
    .footer p {
      color: #737373;
      font-size: 12px;
      margin: 0 0 6px;
    }
    .footer a {
      color: #5e3b7d;
      text-decoration: none;
    }
    .footer a:hover {
      text-decoration: underline;
    }

    @media only screen and (max-width: 600px) {
      .wrapper {
        padding: 12px 8px !important;
      }
      .container {
        border-radius: 8px !important;
      }
      .header {
        padding: 14px 16px !important;
      }
      .content {
        padding: 20px 16px !important;
      }
      .summary-card {
        padding: 4px 12px !important;
        margin: 16px 0 !important;
      }
      .footer {
        padding: 16px !important;
      }
    }

    @media (prefers-color-scheme: dark) {
      body, .wrapper {
        background-color: #0a0a0a !important;
        color: #fafafa !important;
      }
      .container {
        background-color: #171717 !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
      }
      .header {
        border-bottom-color: rgba(255, 255, 255, 0.10) !important;
      }
      .logo-light {
        display: none !important;
      }
      .logo-dark {
        display: block !important;
      }
      .logo-text {
        color: #fafafa !important;
      }
      h1 {
        color: #fafafa !important;
      }
      p {
        color: #fafafa !important;
      }
      .summary-card {
        background-color: #262626 !important;
        border-color: rgba(255, 255, 255, 0.10) !important;
      }
      .summary-item {
        border-bottom-color: rgba(255, 255, 255, 0.10) !important;
      }
      .summary-label {
        color: #a1a1aa !important;
      }
      .summary-value {
        color: #fafafa !important;
      }
      .btn {
        background-color: #b692db !important;
        color: #171717 !important;
      }
      .note, .footer, .footer p {
        color: #a1a1a1 !important;
      }
      .footer {
        background-color: #1a1a1a !important;
        border-top-color: rgba(255, 255, 255, 0.10) !important;
      }
      .footer a {
        color: #b692db !important;
      }
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <img src="${blackWordmarkUrl}" alt="VigilArt" class="logo-img logo-light" width="160" style="display: block; width: 160px; max-width: 160px; height: auto; border: 0;" />
        <!--[if !mso]><!--><img src="${whiteWordmarkUrl}" alt="VigilArt" class="logo-img logo-dark" width="160" style="display: none; width: 160px; max-width: 160px; height: auto; border: 0;" /><!--<![endif]-->
      </div>
      <div class="content">
        <h1>Hello ${user.firstName},</h1>
        <p>Your artwork scan report is ready. We analyzed your registered artworks to detect unauthorized uses across the web.</p>

        <div class="summary-card">
          <div class="summary-item" style="padding: 12px 0; border-bottom: 1px solid #e5e5e5;">
            <div class="summary-row" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;">
              <span class="summary-label" style="color: #737373; font-size: 14px;">Report Date:</span>
              <span class="summary-value" style="font-weight: 600; color: #0a0a0a; font-size: 14px; margin-top: 4px;">${reportDate}</span>
            </div>
          </div>
          <div class="summary-item" style="padding: 12px 0;">
            <div class="summary-row" style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;">
              <span class="summary-label" style="color: #737373; font-size: 14px;">Potential Matches:</span>
              <div class="summary-value" style="margin-top: 4px;">
                <span class="badge" style="display: inline-block; padding: 3px 12px; border-radius: 9999px; font-size: 13px; font-weight: 500; ${matchCount > 0 ? "background-color: #f1ebf6; color: #5e3b7d; border: 1px solid #d9c7eb;" : "background-color: #ebf7eb; color: #008300; border: 1px solid #b8e6b8;"}">${matchCount} ${matchCount === 1 ? "match" : "matches"}</span>
              </div>
            </div>
          </div>
        </div>

        <p>You can review detailed findings, source URLs, and category breakdowns in your VigilArt dashboard.</p>

        <div class="button-container">
          <a href="${reportsUrl}" class="btn" target="_blank">View Scan Report</a>
        </div>

        <p class="note">
          If you identify infringing copies of your work, you can generate formal DMCA takedown notices directly from the report findings.
        </p>
      </div>
      <div class="footer">
        <p>
          You received this email because email notifications are enabled in your VigilArt account.
        </p>
        <p style="margin: 0;">
          <a href="${profileUrl}">Manage notification preferences</a> &bull; &copy; ${new Date().getFullYear()} VigilArt. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>
`;

    await this.sendMail({
      to: user.email,
      subject,
      text,
      html
    });
  }
}
