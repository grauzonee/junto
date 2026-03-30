import messages from "@/constants/errorMessages";
import { User } from "@/models/user/User";
import { ConflictError } from "@/types/errors/InputError";

export async function assertInterestCanDelete(interestId: unknown) {
    const referencingUser = await User.exists({ interests: interestId });
    if (referencingUser) {
        throw new ConflictError(messages.response.IN_USE("interest"));
    }
}
