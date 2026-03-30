import { User } from "@/models/user/User";
import { NotFoundError } from "@/types/errors/InputError";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED } from "@/models/rsvp/utils";
import { deleteEventsByAuthor } from "@/services/eventService";

export async function deleteUser(userId: string) {
    const user = await User.findOne({ _id: userId, active: true });
    if (!user) {
        throw new NotFoundError("user");
    }

    user.active = false;
    user.deletedAt = new Date();
    await user.save();

    await RSVP.updateMany({ user: user._id }, { status: STATUS_CANCELED });
    await deleteEventsByAuthor(user._id.toString());

    return user;
}
