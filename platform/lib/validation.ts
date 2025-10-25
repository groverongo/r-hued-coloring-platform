import { z } from "zod";

export const ColoringAssigmentResponseSchema = z.record(z.string(), z.number());

export type ColoringAssigmentResponse = z.infer<typeof ColoringAssigmentResponseSchema>;

export const GraphsResponseSchema = 
  z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
  });

export type GraphsResponse = z.infer<typeof GraphsResponseSchema>;
