import messages from "@/constants/errorMessages";
import { Category } from "@/models/category/Category";
import { Event } from "@/models/event/Event";
import { ConflictError } from "@/types/errors/InputError";

export async function assertCategoryCanDelete(categoryId: unknown) {
    const [referencingEvent, childCategory] = await Promise.all([
        Event.exists({ categories: categoryId }),
        Category.exists({ parent: categoryId })
    ]);

    if (referencingEvent) {
        throw new ConflictError(messages.response.IN_USE("category"));
    }

    if (childCategory) {
        throw new ConflictError(messages.validation.CANNOT_MODIFY("Category tree"));
    }
}
