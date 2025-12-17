import { z } from "zod";
import { SignUpSchema } from "../../schemas/User";

export type SignUp = z.infer<typeof SignUpSchema>;
