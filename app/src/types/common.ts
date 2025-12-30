import { Filter } from "./Filter";
import { SortInput } from "./Sort";

export type PaginationData = {
    limit: number;
    offset: number;
}

export type DbFilterData = {
    dbFilter?: Filter[] | undefined;
}

export type SortData = {
    sort?: SortInput | undefined;
}

export type RequestData = DbFilterData & SortData & {
    pagination: PaginationData
}