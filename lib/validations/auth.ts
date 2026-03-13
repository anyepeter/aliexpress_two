import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const passwordSchema = z
  .string()
  .min(8, "Min 8 characters")
  .regex(/[A-Z]/, "Must contain an uppercase letter")
  .regex(/[0-9]/, "Must contain a number")
  .regex(/[^A-Za-z0-9]/, "Must contain a special character");

export const buyerRegisterSchema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters").max(50),
    lastName: z.string().min(2, "Min 2 characters").max(50),
    email: z.string().email("Invalid email"),
    password: passwordSchema,
    confirmPassword: z.string(),
    phone: z.string().optional(),
    agreeToTerms: z
      .boolean()
      .refine((v) => v === true, "Must agree to terms"),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const sellerStep1Schema = z
  .object({
    firstName: z.string().min(2, "Min 2 characters").max(50),
    lastName: z.string().min(2, "Min 2 characters").max(50),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(8, "Valid phone number required"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const sellerStep2Schema = z.object({
  storeName: z.string().min(3, "Store name must be at least 3 characters").max(60),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(500, "Max 500 characters"),
  businessRegNo: z.string().optional(),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
});

export const sellerStep3Schema = z.object({
  country: z.string().min(2, "Country is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  street: z.string().min(5, "Street address required"),
});

export const sellerStep4Schema = z.object({
  idDocumentUrl: z.string().min(1, "ID document is required"),
  taxDocumentUrl: z.string().optional(),
  agreeToTerms: z
    .boolean()
    .refine((v) => v === true, "Must agree to terms"),
  agreeToSellerPolicy: z
    .boolean()
    .refine((v) => v === true, "Must agree to seller policy"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type BuyerRegisterInput = z.infer<typeof buyerRegisterSchema>;
export type SellerStep1Input = z.infer<typeof sellerStep1Schema>;
export type SellerStep2Input = z.infer<typeof sellerStep2Schema>;
export type SellerStep3Input = z.infer<typeof sellerStep3Schema>;
export type SellerStep4Input = z.infer<typeof sellerStep4Schema>;
