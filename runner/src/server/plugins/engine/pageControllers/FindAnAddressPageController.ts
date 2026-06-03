import { PageControllerBase } from "./PageControllerBase";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { AddressLookupService } from "../../../services/addressLookupService";

export class FindAnAddressPageController extends PageControllerBase {
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const response = await this.handlePostRequest(request, h);

      console.log("=== FindAnAddress POST ===");
      console.log("Payload:", request.payload);
      if (response) {
        console.log("Response exists. Status:", response.statusCode);
        if (response.source && response.source.context) {
          console.log("Response errors:", response.source.context.errors);
        }
        return response;
      }

      const model = this.model;
      const config = model?.def?.addressLookupConfig;
      if(typeof config === 'undefined'){
        console.log("No config for address lookup error");
        return response;
      }

      // 2. Only pull cacheService from Hapi request services
      const { cacheService } = request.services(['cacheService']);
      const state = await cacheService.getState(request);
      
      const postcode = state.postcodeLookup || "";
      const building = state.buildingLookup || "";
      const addressLine1 = state.addressLine1Lookup || "";

      // 3. Manually create an instance of AddressService using the hapi server instance
      const addressLookupService = new AddressLookupService({...config});

      // 4. Call the method on your new local instance
      const addressResponse = await addressLookupService.lookupByPostcode(postcode);

      let addresses = addressResponse.addresses;
      const numberOfAddresses = addresses.length;

      let hasMatchedAddress = false;
      let matchedAddress: any = null;
      if(numberOfAddresses > 0) {
        if (building) {
          const houseNumber = building.trim();
          const houseNumberLower = houseNumber.toUpperCase();
          matchedAddress = addresses.find((address: any) => {
            const firstPart = address.address.split(',')[0].trim();

            // 1. Exact match (ignoring spaces/casing)
            if (firstPart.replace(/\s/g, '') === houseNumberLower.replace(/\s/g, '')) {
              return true;
            }

            // 2. First part starts with house name followed by a space (e.g. "Farm Cottage " when houseName is "Farm Cottage")
            if (firstPart.startsWith(houseNumberLower + " ")) {
              return true;
            }

            return false;
          });

          if (matchedAddress) {
            hasMatchedAddress = true;
          }
        }

        // Street number cleanup
        const streetNumberPattern = /(^|, )(\d+[A-Z]?([-\/]\d+)?[A-Z]?),/i;
        addresses = addresses.map((add) => {
          add.address = add.address.replace(streetNumberPattern, '$1$2');
          return add;
        });

        if(addressLine1) {
          const addressLine1Upper = addressLine1.trim().toUpperCase();
          const addressPattern = new RegExp(`^${addressLine1Upper}( |,)`);
          matchedAddress = addresses.find((address: any) => {
            return addressPattern.test(address.address.toUpperCase());
          });

          if (matchedAddress) {
            hasMatchedAddress = true;
          }
        }
      }

      const updateState = {
        addresses,
        hasMatchedAddress,
        numberOfAddresses: numberOfAddresses,
        ...(matchedAddress && { matchedAddress })
      };

      await cacheService.mergeState(request, updateState);

      // Navigate to the next page
      const nextPath = this.getNext({ ...state, hasMatchedAddress });
      return h.redirect(nextPath);
    };
  }
}