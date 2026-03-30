import { Category } from "@/models/category/Category";
import { Event } from "@/models/event/Event";
import { EventType } from "@/models/EventType";
import { Interest } from "@/models/Interest";
import { RSVP } from "@/models/rsvp/RSVP";
import { STATUS_CANCELED } from "@/models/rsvp/utils";
import { User } from "@/models/user/User";

export interface IntegrityAuditReport {
    invalidRsvpEvents: string[];
    invalidRsvpUsers: string[];
    invalidEventAuthors: string[];
    danglingCategoryParents: string[];
    eventsWithMissingCategories: { eventId: string; missingCategoryIds: string[] }[];
    eventsWithMissingType: string[];
    usersWithMissingInterests: { userId: string; missingInterestIds: string[] }[];
    fixed: boolean;
}

interface AuditOptions {
    fix?: boolean;
}

function toIdSet(values: { _id: unknown }[]) {
    return new Set(values.map(value => String(value._id)));
}

export async function auditIntegrity({ fix = false }: AuditOptions = {}): Promise<IntegrityAuditReport> {
    const [activeUsers, existingUsers, categories, eventTypes, events, rsvps, interests] = await Promise.all([
        User.find({ active: true }).select("_id").lean(),
        User.find().select("_id interests active").lean(),
        Category.find().select("_id parent").lean(),
        EventType.find().select("_id").lean(),
        Event.find().select("_id author categories type active").lean(),
        RSVP.find().select("_id event user").lean(),
        Interest.find().select("_id").lean()
    ]);

    const activeUserIds = toIdSet(activeUsers);
    const categoryIds = toIdSet(categories);
    const eventTypeIds = toIdSet(eventTypes);
    const eventIds = toIdSet(events);
    const interestIds = toIdSet(interests);

    const invalidRsvpEventIds = rsvps
        .filter(rsvp => !eventIds.has(String(rsvp.event)))
        .map(rsvp => String(rsvp._id));
    const invalidRsvpUserIds = rsvps
        .filter(rsvp => !activeUserIds.has(String(rsvp.user)))
        .map(rsvp => String(rsvp._id));
    const invalidEventAuthors = events
        .filter(event => event.active && !activeUserIds.has(String(event.author)))
        .map(event => String(event._id));
    const danglingCategoryParents = categories
        .filter(category => category.parent && !categoryIds.has(String(category.parent)))
        .map(category => String(category._id));
    const eventsWithMissingCategories = events
        .map(event => {
            const missingCategoryIds = (event.categories ?? [])
                .map(categoryId => String(categoryId))
                .filter(categoryId => !categoryIds.has(categoryId));

            return {
                eventId: String(event._id),
                missingCategoryIds
            };
        })
        .filter(event => event.missingCategoryIds.length > 0);
    const eventsWithMissingType = events
        .filter(event => event.type && !eventTypeIds.has(String(event.type)))
        .map(event => String(event._id));
    const usersWithMissingInterests = existingUsers
        .map(user => {
            const missingInterestIds = (user.interests ?? [])
                .map(interestId => String(interestId))
                .filter(interestId => !interestIds.has(interestId));

            return {
                userId: String(user._id),
                missingInterestIds
            };
        })
        .filter(user => user.missingInterestIds.length > 0);

    if (fix) {
        const rsvpIdsToDelete = [...new Set([...invalidRsvpEventIds, ...invalidRsvpUserIds])];
        if (rsvpIdsToDelete.length > 0) {
            await RSVP.deleteMany({ _id: { $in: rsvpIdsToDelete } });
        }

        const eventIdsToSoftDelete = [...new Set([...invalidEventAuthors, ...eventsWithMissingType])];
        for (const eventId of eventIdsToSoftDelete) {
            await Event.updateOne({ _id: eventId }, { active: false, deletedAt: new Date() });
            await RSVP.updateMany({ event: eventId }, { status: STATUS_CANCELED });
        }

        for (const { eventId, missingCategoryIds } of eventsWithMissingCategories) {
            await Event.updateOne({ _id: eventId }, { $pull: { categories: { $in: missingCategoryIds } } });
        }

        for (const categoryId of danglingCategoryParents) {
            await Category.updateOne({ _id: categoryId }, { parent: null });
        }

        for (const { userId, missingInterestIds } of usersWithMissingInterests) {
            await User.updateOne({ _id: userId }, { $pull: { interests: { $in: missingInterestIds } } });
        }
    }

    return {
        invalidRsvpEvents: invalidRsvpEventIds,
        invalidRsvpUsers: invalidRsvpUserIds,
        invalidEventAuthors,
        danglingCategoryParents,
        eventsWithMissingCategories,
        eventsWithMissingType,
        usersWithMissingInterests,
        fixed: fix
    };
}
