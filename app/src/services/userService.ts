import { User } from "@/models/user/User";
import { Event } from "@/models/event/Event";
import { NotFoundError } from "@/types/errors/InputError";
import { RSVP } from "@/models/rsvp/RSVP";

export async function deleteUser(userId: string) {
    const user = await User.findOne({ _id: userId, active: true });
    if (!user) {
        throw new NotFoundError("user");
    }

    user.active = false;
    user.deletedAt = new Date();
    await user.save();

    await RSVP.cancelForUser(user._id);
    await Event.softDeleteByAuthor(user._id);

    return user;
}
