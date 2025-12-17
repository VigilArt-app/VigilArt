import { z } from "zod";
import { SignUpSchema } from "../../schemas/User";

export type SignUpDto = z.infer<typeof SignUpSchema>;
