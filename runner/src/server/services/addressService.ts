import { getJson } from "server/services/httpService";

/**
 * Uses the ordnance survey API to find an address by postcode
 *
 * @deprecated This has not been used by FCDO or HO, so there is no verification if this works.
 */

export class AddressService {
  logger: any;
  constructor(server) {
    this.logger = server.logger;
  }
  async findByPostcode(key, postcode) {
    const findByPostcodeUrl = `https://api.ordnancesurvey.co.uk/places/v1/addresses/postcode?lr=EN&fq=logical_status_code:1&dataset=DPA&postcode=${postcode}&key=${key}`;

    const { payload, error } = await getJson(findByPostcodeUrl);

    if (error) {
      this.logger.error("AddressService", error);
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
      this.logger.error("AddressService", error);
      return [];
    }
  }
}
