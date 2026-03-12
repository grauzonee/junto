import { Query } from "mongoose";
import { HydratedRSVP, IRSVP } from "@/models/rsvp/RSVP";
import { STATUS_CONFIRMED, STATUS_CANCELED, STATUS_MAYBE } from "@/models/rsvp/utils";
import { PaginateQueryHelper } from "@/models/plugins/paginate";

export interface RSVPQueryHelpers extends PaginateQueryHelper<IRSVP> {
    confirmed(): Query<HydratedRSVP[], HydratedRSVP>;
    canceled(): Query<HydratedRSVP[], HydratedRSVP>;
    maybe(): Query<HydratedRSVP[], HydratedRSVP>;
}

export function confirmed(this: Query<HydratedRSVP[], HydratedRSVP>) {
    return this.where({ status: STATUS_CONFIRMED });
}

export function canceled(this: Query<HydratedRSVP[], HydratedRSVP>) {
    return this.where({ status: STATUS_CANCELED });
}

export function maybe(this: Query<HydratedRSVP[], HydratedRSVP>) {
    return this.where({ status: STATUS_MAYBE });
}