import http from "http";
import wreck from "@hapi/wreck";

type Method = "get" | "post" | "path" | "put" | "delete";

export interface Response<T> {
  res: http.IncomingMessage;
  payload?: T | any;
  error?: Error;
}

export type Request = <T>(
  method: Method,
  url: string,
  options?: object
) => Promise<Response<T>>;

export const request: Request = async (method, url, options = {}) => {
  const { res, payload } = await wreck[method](url, options);

  try {
    return { res, payload } as Response<any>;
  } catch (error) {
    return { res, error } as Response<any>;
  }
};

export const get = <T = any>(url: string, options?: object) => {
  return request<T>("get", url, options);
};

export const getJson = <T = any>(url: string) => {
  return get<T>(url, { json: true });
};

export const post = <T = any>(url: string, options: object) => {
  return request<T>("post", url, options);
};

export const postJson = <T = any>(url: string, options: object) => {
  return post<T>(url, {
    ...options,
    json: true,
  });
};

export const put = <T = any>(url: string, options: object) => {
  return request<T>("put", url, options);
};
