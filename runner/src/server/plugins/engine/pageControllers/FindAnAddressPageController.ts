import { PageControllerBase } from "./PageControllerBase";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { AddressLookupService } from "../../../services/addressLookupService";
import Joi from "joi";
import {
  addressTypeSchema,
  addressesToList,
  AddressType,
  deriveSelectedFieldName,
  findMatchingAddress,
  cleanAddresses,
} from "../utils/addressUtils";
import { ControllerError } from "../errors";

const formSchema = Joi.object({
  addressType: addressTypeSchema,
}).unknown(true);

type FormSubmission = {
  addressType: AddressType;
  [x: string]: string;
};

const extractInputFromSubmission = (data: FormSubmission) => {
  const { addressType, ...rest } = data;

  return {
    addressType,
    postcodeLookup: rest[`${addressType}_postcodeLookup`],
    addressLine1Lookup: rest[`${addressType}_addressLine1Lookup`],
    addressLine2Lookup: rest[`${addressType}_addressLine2Lookup`],
    townLookup: rest[`${addressType}_townLookup`],
    countyLookup: rest[`${addressType}_countyLookup`],
    buildingLookup: rest[`${addressType}_buildingLookup`],
  };
};

export class FindAnAddressPageController extends PageControllerBase {
  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const response = await this.handlePostRequest(request, h);

      const payload = (request.payload || {}) as FormData;

      const formResult = this.validateForm(payload);

      if (formResult.errors) {
        return response;
      }

      const validation = this.validate<FormSubmission>(payload, formSchema);

      if (validation.errors) {
        return response;
      }

      const {
        addressType,
        postcodeLookup,
        addressLine1Lookup,
        addressLine2Lookup,
        townLookup,
        countyLookup,
        buildingLookup,
      } = extractInputFromSubmission(validation.value);

      const { cacheService, ...rest } = request.services([]);

      const addressLookupInstanceName = request.service.getName(
        "addressLookupService"
      );

      const addressLookupService = rest[
        addressLookupInstanceName
      ] as AddressLookupService;

      if (!addressLookupService) {
        throw new ControllerError("cannot find address lookup service", {
          code: 500,
        });
      }

      try {
        const addressResponse = await addressLookupService.lookupByPostcode(
          postcodeLookup
        );

        const addresses = cleanAddresses(addressResponse.addresses);

        // TODO:- "Fuzzy check full address" integration point
        const matchedAddress = findMatchingAddress(
          addresses,
          buildingLookup,
          addressLine1Lookup,
          addressLine2Lookup,
          townLookup,
          countyLookup
        );

        const list = this.model.lists.find(
          (list) => list.name === "addressesList"
        );

        if (list) {
          list.items = addressesToList(addresses);
        }

        const savedState = await cacheService.mergeState(request, {
          // save inputs
          [`${addressType}_postcodeLookup`]: postcodeLookup,
          [`${addressType}_buildingLookup`]: buildingLookup,
          [`${addressType}_addressLine1Lookup`]: addressLine1Lookup,
          // save data
          [`${addressType}_addresses`]: addresses,
          [`${addressType}_numberOfAddresses`]: addresses.length,
          [`${addressType}_hasMatchedAddress`]: matchedAddress !== undefined,
          [`${addressType}_matchedAddress`]: matchedAddress,
          [`${addressType}_isCorrectAddress`]: null,
          // clear any selection made against a previous search's results
          [`${addressType}_selectedAddress`]: null,
          [deriveSelectedFieldName(addressType)]: null,
        });

        // This is always an intermediate step of the address-lookup
        // sub-journey, never a completion, so it must never short-circuit
        // straight to a Change link's returnUrl so honourReturnUrl is false.
        return this.proceed(request, h, { ...savedState }, false);
      } catch (error) {
        throw new ControllerError(
          `Error in FindAnAddressPageController: ${
            error instanceof Error ? error.message : JSON.stringify(error)
          }`,
          {
            code: 500,
            page: "500-address-service-error",
          }
        );
      }
    };
  }
}
