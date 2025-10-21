import {
    QueryClient,
} from '@tanstack/react-query'

export const queryClient = new QueryClient()

export const R_HUED_COLORING_API = process.env.NEXT_PUBLIC_R_HUED_COLORING_API!