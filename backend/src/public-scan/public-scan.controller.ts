import {
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpStatus
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiConsumes, ApiBody, ApiTags } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import {
  PublicScanAllowanceDTO,
  PublicScanEnqueuedDTO,
  PublicScanStatusDTO,
  API_PREFIX
} from "@vigilart/shared";
import { ApiEndpoint } from "../common/decorators/api-endpoint.decorator";
import { PublicThrottlerGuard } from "../common/guards/public-throttler.guard";
import { TurnstileGuard } from "../common/guards/turnstile.guard";
import {
  PUBLIC_SCAN_THROTTLER,
  PUBLIC_POLL_THROTTLER
} from "../common/throttler.constants";
import { PublicScanBudgetGuard } from "./public-scan-budget.guard";
import { PublicScanReservationInterceptor } from "./public-scan-reservation.interceptor";
import { PublicScanService } from "./public-scan.service";
import { PUBLIC_SCAN_MAX_FILE_BYTES } from "./public-scan.constants";

@ApiTags("public-scan")
@Controller("public-scan")
export class PublicScanController {
  constructor(private readonly publicScanService: PublicScanService) {}

  // Guard order is the whole cost story. The bot check runs first and reads its
  // token from a header, so a bot is turned away before multer buffers 5 MB.
  // The per-visitor limit runs next, and only then is budget claimed.
  @Post()
  @UseGuards(TurnstileGuard, PublicThrottlerGuard, PublicScanBudgetGuard)
  // Every configured throttler applies unless it is skipped: @Throttle only
  // overrides a bucket's options, it does not select one. Without the skip, a
  // poll would also spend the visitor's 2-scans-per-week allowance.
  @SkipThrottle({ [PUBLIC_POLL_THROTTLER]: true })
  // Order matters: the reservation interceptor is declared first so it wraps
  // FileInterceptor, and an upload multer rejects still gives its budget back.
  @UseInterceptors(
    PublicScanReservationInterceptor,
    FileInterceptor("file", { limits: { fileSize: PUBLIC_SCAN_MAX_FILE_BYTES } })
  )
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: { file: { type: "string", format: "binary" } }
    }
  })
  @ApiEndpoint({
    summary:
      "Run one free scan on an anonymous upload. The image is deleted as soon as the scan ends.",
    success: { status: HttpStatus.CREATED, type: PublicScanEnqueuedDTO },
    errors: [
      HttpStatus.BAD_REQUEST,
      HttpStatus.FORBIDDEN,
      HttpStatus.INTERNAL_SERVER_ERROR
    ]
  })
  start(@UploadedFile() file?: Express.Multer.File) {
    return this.publicScanService.start(file);
  }

  // Its own loose bucket: a visitor polls every 2 seconds for up to 3 minutes
  // and would otherwise lock themselves out of their own result.
  @Get("allowance")
  @UseGuards(PublicThrottlerGuard)
  @SkipThrottle({ [PUBLIC_SCAN_THROTTLER]: true })
  @ApiEndpoint({
    summary: "Free scans left in today's shared budget.",
    success: { status: HttpStatus.OK, type: PublicScanAllowanceDTO }
  })
  getAllowance() {
    return this.publicScanService.getAllowance();
  }

  @Get(":scanId")
  @UseGuards(PublicThrottlerGuard)
  @SkipThrottle({ [PUBLIC_SCAN_THROTTLER]: true })
  @ApiEndpoint({
    summary: "State of a free scan, with a truncated preview of its matches.",
    success: { status: HttpStatus.OK, type: PublicScanStatusDTO },
    errors: [HttpStatus.NOT_FOUND]
  })
  getStatus(@Param("scanId") scanId: string) {
    return this.publicScanService.getStatus(scanId);
  }
}
