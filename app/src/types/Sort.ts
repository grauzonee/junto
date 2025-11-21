import * as z from "zod"

export const SortSchema = z.object({
    sortByDesc: z.string().optional(),
    sortByAsc: z.string().optional()
}).refine((data) => !(data.sortByAsc && data.sortByDesc),
    {
        message: "You can only specify either sortByAsc or sortByDesc, not both.",
    })

export type SortInput = z.infer<typeof SortSchema>

export interface Sortable {
    getSortableFields(): string[]
}
