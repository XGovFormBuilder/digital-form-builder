import { HapiRequest } from "../types";

interface GetRequestInfo {
  host: string;
  href: string;
  id: string;
  method: string;
  pathname: string;
  protocol: string;
  referrer: string;
}

/**
 * Returns key information about a request
 *
 * @param request - HAPI request object
 * @returns Request information
 */
const getRequestInfo = (request: HapiRequest): GetRequestInfo => {
  const { headers, info, method, url } = request;
  const { host, id, referrer } = info;
  const { href, pathname } = url;
  const { protocol } = request.server.info;
  const proto = (
    headers["x-forwarded-proto"] ||
    headers["X-Forwarded-Proto"] ||
    protocol
  ).split(",")[0];

  return {
    host,
    href,
    id,
    method,
    pathname,
    protocol: proto.trim(),
    referrer,
  };
};

export default getRequestInfo;
