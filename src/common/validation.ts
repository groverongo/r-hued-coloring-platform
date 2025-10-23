import { z } from "zod";

export const ColoringAssigmentResponseSchema = z.record(z.string(), z.number());

export type ColoringAssigmentResponse = z.infer<typeof ColoringAssigmentResponseSchema>;
