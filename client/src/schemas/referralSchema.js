import { z } from "zod";

export const referralSchema = z.object({
  FirstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name too long"),
  LastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name too long"),
  Phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^[+]?[\s\-()0-9]{10,}$/, "Invalid phone number format"),
  Email: z.string().email("Invalid email format"),
  Message: z.string().max(1000, "Message too long").optional(),
});
