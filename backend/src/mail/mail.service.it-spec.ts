import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { Logger } from "@nestjs/common";
import { MailService } from "./mail.service";
import { PrismaService } from "../prisma/prisma.service";

describe("MailService", () => {
  let service: MailService;
  let mockPrismaService: {
    user: {
      findUnique: jest.Mock;
    };
    artworksReport: {
      findUnique: jest.Mock;
    };
  };
  let mockConfigService: {
    get: jest.Mock;
  };

  beforeEach(async () => {
    mockPrismaService = {
      user: {
        findUnique: jest.fn()
      },
      artworksReport: {
        findUnique: jest.fn()
      }
    };

    mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === "NEXT_PUBLIC_APP_URL") return "https://vigilart.app";
        return undefined;
      })
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: ConfigService, useValue: mockConfigService }
      ]
    }).compile();

    service = module.get<MailService>(MailService);
    service.onModuleInit();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  it("should skip sending email if user is not found", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("unknown-user", "report-1");

    expect(sendMailSpy).not.toHaveBeenCalled();
  });

  it("should skip sending email if mailNotificationsEnabled is false", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "artist@example.com",
      firstName: "Jane",
      lastName: "Doe",
      mailNotificationsEnabled: false
    });

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("user-1", "report-1");

    expect(sendMailSpy).not.toHaveBeenCalled();
  });

  it("should skip sending email if report is not found", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "artist@example.com",
      firstName: "Jane",
      lastName: "Doe",
      mailNotificationsEnabled: true
    });

    mockPrismaService.artworksReport.findUnique.mockResolvedValue(null);

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("user-1", "non-existent-report");

    expect(sendMailSpy).not.toHaveBeenCalled();
  });

  it("should generate and send report ready email with NEXT_PUBLIC_APP_URL links and userId", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: "user-1",
      email: "artist@example.com",
      firstName: "Jane",
      lastName: "Doe",
      mailNotificationsEnabled: true
    });

    mockPrismaService.artworksReport.findUnique.mockResolvedValue({
      id: "report-1",
      detectionDate: new Date("2026-10-17T12:00:00Z"),
      _count: { matchingPages: 3 }
    });

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("user-1", "report-1");

    expect(sendMailSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: "user-1",
        to: "artist@example.com",
        subject: "Your artwork scan report is ready - VigilArt",
        text: expect.stringContaining("https://vigilart.app/dashboard"),
        html: expect.stringContaining("https://vigilart.app/dashboard")
      })
    );

    const callArgs = sendMailSpy.mock.calls[0][0];
    expect(callArgs.text).toContain("https://vigilart.app/profile");
    expect(callArgs.html).toContain("https://vigilart.app/profile");
    expect(callArgs.text).not.toContain("localhost:3000");
    expect(callArgs.html).not.toContain("localhost:3000");
  });

  it("should escape firstName in HTML to prevent XSS / HTML injection", async () => {
    const maliciousName = '<script>alert("xss")</script><a href="https://phish.example.com">Login</a>';

    mockPrismaService.user.findUnique.mockResolvedValue({
      id: "user-xss",
      email: "victim@example.com",
      firstName: maliciousName,
      lastName: "Doe",
      mailNotificationsEnabled: true
    });

    mockPrismaService.artworksReport.findUnique.mockResolvedValue({
      id: "report-1",
      detectionDate: new Date("2026-10-17T12:00:00Z"),
      _count: { matchingPages: 1 }
    });

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("user-xss", "report-1");

    expect(sendMailSpy).toHaveBeenCalled();
    const callArgs = sendMailSpy.mock.calls[0][0];

    // HTML must contain escaped characters
    expect(callArgs.html).toContain(
      "&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;&lt;a href=&quot;https://phish.example.com&quot;&gt;Login&lt;/a&gt;"
    );
    // HTML must NOT contain unescaped executable script or phishing tags
    expect(callArgs.html).not.toContain("<script>");
    expect(callArgs.html).not.toContain('<a href="https://phish.example.com">');
  });

  it("should handle null or empty firstName gracefully without rendering 'Hello null'", async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: "user-null-name",
      email: "artist@example.com",
      firstName: null,
      lastName: null,
      mailNotificationsEnabled: true
    });

    mockPrismaService.artworksReport.findUnique.mockResolvedValue({
      id: "report-1",
      detectionDate: new Date("2026-10-17T12:00:00Z"),
      _count: { matchingPages: 0 }
    });

    const sendMailSpy = jest.spyOn(service, "sendMail");
    await service.sendReportReadyEmail("user-null-name", "report-1");

    expect(sendMailSpy).toHaveBeenCalled();
    const callArgs = sendMailSpy.mock.calls[0][0];

    expect(callArgs.html).toContain("<h1>Hello,</h1>");
    expect(callArgs.html).not.toContain("Hello null");
    expect(callArgs.text).toMatch(/^Hello,\n\n/);
    expect(callArgs.text).not.toContain("Hello null");
  });

  it("should log target userId instead of recipient email (GDPR compliance)", async () => {
    const logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => {});

    await service.sendMail({
      userId: "user-gdpr-123",
      to: "personal.email@example.com",
      subject: "Test Subject",
      text: "Private body content",
      html: "<p>Private body content</p>"
    });

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining("user user-gdpr-123")
    );
    // Must NOT log recipient email
    for (const call of logSpy.mock.calls) {
      expect(call[0]).not.toContain("personal.email@example.com");
    }

    logSpy.mockRestore();
  });
});
