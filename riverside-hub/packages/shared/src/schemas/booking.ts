import { z } from "zod";

export const bookingStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "cancelled",
]);

// A member creates a booking request — member_id comes from the
// authenticated session server-side, never from client input.
export const createBookingSchema = z
  .object({
    resourceId: z.string().uuid(),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    notes: z.string().max(500).optional(),
  })
  .refine((data) => new Date(data.endTime) > new Date(data.startTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

// Staff/admin action on a booking.
export const reviewBookingSchema = z.object({
  status: z.enum(["approved", "rejected"]),
  notes: z.string().max(500).optional(),
});

// A member cancelling their own booking — the only transition a
// non-staff user is allowed to make once a booking exists.
export const cancelBookingSchema = z.object({
  bookingId: z.string().uuid(),
});

export const bookingSchema = z.object({
  id: z.string().uuid(),
  memberId: z.string().uuid(),
  resourceId: z.string().uuid(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  status: bookingStatusSchema,
  notes: z.string().nullable(),
  reviewedBy: z.string().uuid().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type BookingStatus = z.infer<typeof bookingStatusSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ReviewBookingInput = z.infer<typeof reviewBookingSchema>;
export type Booking = z.infer<typeof bookingSchema>;
