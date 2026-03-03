import { createZodDto } from "nestjs-zod";
import { DmcaNoticeDataSchema } from "../../../generated/zod";

export const DmcaNoticeDataGetSchema = DmcaNoticeDataSchema;
export class DmcaNoticeDataGetDTO extends createZodDto(DmcaNoticeDataGetSchema) {}
