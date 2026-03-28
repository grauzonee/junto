import { Filter } from "./Filter";
import { SortInput } from "./Sort";

export interface PaginationData {
    limit: number;
    offset: number;
}

export interface DbFilterData {
    dbFilter?: Filter[];
}

export interface SortData {
    sort?: SortInput;
}

export interface SearchData {
    search?: string;
}

export interface RequestData extends DbFilterData, SortData, SearchData {
    pagination: PaginationData
}
