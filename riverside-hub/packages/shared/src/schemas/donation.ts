import { z } from "zod";

export const donationTypeSchema = z.enum(["monetary", "food_parcel"]);
export const donationStatusSchema = z.enum([
  "pending",
  "received",
  "allocated",
]);

// Public donation form — works for both logged-in members and
// anonymous/guest donors. donorName/donorContact are required only
// when there's no authenticated member making the request (enforced
// in the API handler, since it depends on request context, not just shape).
export const createDonationSchema = z
  .object({
    donorName: z.string().max(120).optional(),
    donorContact: z.string().max(120).optional(),
    type: donationTypeSchema,
    amount: z.number().positive().optional(),
    itemDescription: z.string().max(300).optional(),
  })
  .refine(
    (data) =>
      (data.type === "monetary" && data.amount !== undefined) ||
      (data.type === "food_parcel" && data.itemDescription !== undefined),
    {
      message:
        "amount is required for monetary donations, itemDescription for food_parcel donations",
    }
  );

export const updateDonationStatusSchema = z.object({
  status: donationStatusSchema,
});

export const donationSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid().nullable(),
  donorName: z.string().nullable(),
  donorContact: z.string().nullable(),
  type: donationTypeSchema,
  amount: z.number().nullable(),
  itemDescription: z.string().nullable(),
  status: donationStatusSchema,
  receivedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type DonationType = z.infer<typeof donationTypeSchema>;
export type DonationStatus = z.infer<typeof donationStatusSchema>;
export type CreateDonationInput = z.infer<typeof createDonationSchema>;
export type Donation = z.infer<typeof donationSchema>;
