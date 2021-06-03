import { getJson } from "server/services/httpService";
import logger from "../../../plugins/logger";

export async function findByPostcode(key, postcode) {
  const findByPostcodeUrl = `https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?lr=EN&fq=logical_status_code:1&dataset=DPA&postcode=${postcode}&key=${key}`;

  const { payload, error } = await getJson(findByPostcodeUrl);

  if (error) {
    logger.error(error);
    return [];
  }

  try {
    const results = payload.results.map((item) => item.DPA);

    const addresses = results;

    return addresses.map((item) => {
      return {
        uprn: item.UPRN,
        postcode: item.POSTCODE,
        address: item.ADDRESS,
        item: item,
      };
    });
  } catch (error) {
    logger.error(error);
    return [];
  }
}
