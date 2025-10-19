import type { AxiosError } from "axios";

export interface PaginatedResponse<T> {
    data: T[];
    pagesCount:number;
    currentPage:number;
    type:string;
}
export interface SingleObjectResponse<T> {
    result:T,
    code: number;
    message?: string;
    error?: null;
}

export type ApiError<T> = AxiosError<PaginatedResponse<T>>
