import type { AxiosResponse } from "axios";
import axios from "./axios"
import type { PaginatedResponse} from "~/utils/types/ApiResponses";
import type { ParamsType } from "~/utils/types/filters";

interface IAppClient<T> {
  get: (url: string, params?: ParamsType) => Promise<AxiosResponse<PaginatedResponse<T>|T>>;
  post: (url: string, data: T) => Promise<AxiosResponse<T>>;
  put: (url: string, data: T) => Promise<AxiosResponse<T>>;
  delete: (url: string, id: string) => Promise<AxiosResponse<T>>;
}

export class AppClient<T> implements IAppClient<T> {
  get(url: string,params?: Record<string, any>): Promise<AxiosResponse<PaginatedResponse<T>|T>> {
   return axios.get<PaginatedResponse<T> | T>(url, { params }) as Promise<AxiosResponse<PaginatedResponse<T> |T>>
  }

  post(url: string, data: T): Promise<AxiosResponse<T>> {
    return axios.post<T>(url, data)
  }

  put(url: string, data: T): Promise<AxiosResponse<T>> {
    return axios.put(url, data)
  }

  delete(url: string, id: string): Promise<AxiosResponse<any>> {
    return axios.delete(`${url}/${id}`)
  }
}
