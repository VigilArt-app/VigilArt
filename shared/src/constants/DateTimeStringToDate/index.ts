import { z } from "zod";

export const dateTimeStringToDate = z.codec(
    z.iso.datetime(),
    z.date(), {
        decode: (isoString) => new Date(isoString),
        encode: (date) => date.toISOString()
    }
);
