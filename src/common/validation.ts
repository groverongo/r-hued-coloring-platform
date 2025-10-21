import { z } from "zod";

export const ColoringAssigmentResponseSchema = z.record(z.number(), z.number());

export type ColoringAssigmentResponse = z.infer<typeof ColoringAssigmentResponseSchema>;
