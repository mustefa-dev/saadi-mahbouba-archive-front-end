import type { AxiosError } from "axios";

export interface PaginatedResponse<T> {
    data: T[];
    pageNumber:number;
    pageSize:number;
    totalPages:number;
    totalRecords:number;
    isLast:boolean;
}
export interface SingleObjectResponse<T> {
    result:T,
    code: number;
    message?: string;
    error?: null;
}

export type ApiError<T> = AxiosError<PaginatedResponse<T>>
