import { Filter } from "./Filter";
import { SortInput } from "./Sort";

export interface PaginationData {
    limit: number;
    offset: number;
}

export interface DbFilterData {
    dbFilter?: Filter[] | undefined;
}

export interface SortData {
    sort?: SortInput | undefined;
}

export interface RequestData extends DbFilterData, SortData {
    pagination: PaginationData
}