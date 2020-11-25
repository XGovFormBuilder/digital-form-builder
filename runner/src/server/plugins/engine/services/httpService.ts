import wreck from "wreck";

type Method = "get" | "post" | "path" | "put" | "delete";
type WreckParameters = Parameters<typeof wreck.get>;
type Options = WreckParameters[1];
type Get = typeof wreck.get;
type Post = typeof wreck.post;

type Request = (
  method: Method,
  url: string,
  options: Options
) => ReturnType<typeof wreck.get>;

export const request: Request = (method, url, options) => {
  return wreck[method](url, options).then((response) => {
    const res = response.res;
    const payload = response.payload;

    if (res.statusCode !== 200) {
      const err = payload || new Error("Unknown error");
      throw err;
    }

    return payload;
  });
};

export const get: Get = (url, options) => {
  return request("get", url, options);
};

export const post: Post = (url, options) => {
  return request("post", url, options);
};

export const postJson: Post = (url, options) => {
  options = options || {};
  options.json = true;
  return post(url, options);
};

export const getJson = (url: string): ReturnType<Get> => {
  return get(url, { json: true });
};
