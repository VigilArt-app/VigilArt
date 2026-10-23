import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
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

  it("should generate and send report ready email when mailNotificationsEnabled is true", async () => {
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
        to: "artist@example.com",
        subject: "Your artwork scan report is ready - VigilArt",
        text: expect.stringContaining("Potential Matches Found: 3"),
        html: expect.stringContaining("Jane")
      })
    );
  });
});
