import { z } from "zod";
import countries from "i18n-iso-countries";

// Ensure country data is loaded (important!)
countries.registerLocale(require("i18n-iso-countries/langs/en.json"));

export const companyProfileSchema = z.object({
  id: z.string().uuid().optional(),

  userId: z.string().uuid(),
  organizationId: z.string().uuid(),

  logoUrl: z.string().url().max(512).optional(),

  brandName: z.string().min(1).max(255),
  registeredName: z.string().min(1).max(255),
  registrationNumber: z.string().min(1).max(255),

  country: z.string().min(1).max(255),

  size: z.string().max(100).optional(),
  vatNumber: z.string().max(255).optional(),
  website: z.string().url().max(512).optional(),

  address: z.string().min(1).max(500),
  altAddress: z.string().max(500).optional(),

  city: z.string().min(1).max(255),
  region: z.string().max(255).optional(),
  postalCode: z.string().max(50).optional(),

  billingAddress: z.string().max(500).optional(),
  billingAltAddress: z.string().max(500).optional(),
  billingCity: z.string().max(255).optional(),
  billingRegion: z.string().max(255).optional(),

  billingCountry: z
    .string()
    .length(2, "Must be a valid ISO alpha-2 country code")
    .transform((val) => val.toUpperCase())
    .refine((value) => countries.isValid(value), {
      message: "Invalid ISO 3166-1 alpha-2 country code",
    }),

  billingPostalCode: z.string().max(50).optional(),

  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});