import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { FormComponent } from "server/plugins/engine/components";
import { FormPayload } from "../types"
import { AddressLookupService, AddressLookupConfig } from "server/services/addressLookupService"
import { has } from "config";

function isAddressLookupField(component: any ): component is FormComponent {
  return component instanceof FormComponent && component.type === "AddressLookupField";
}

export class AddressLookupPageController extends PageController {
  addressLookupFields: FormComponent[];
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    const addressLookupFields = this.components?.items?.filter(isAddressLookupField);
    if (!addressLookupFields || addressLookupFields.length === 0) {
      throw Error(
        "AddressLookupPageController initialisation failed, no address lookup component was found"
      );
    }
    this.addressLookupFields = addressLookupFields;

    const buildingField = this.addressLookupFields.find(field => field.name === "building") || "";
    this.building = buildingField.name;
  }

  getAddressString(formData: FormPayload) {
    return this.addressLookupFields.map(field => field.getStateFromValidForm(formData)).join(" ");
  }

  getBuilding(formData: FormPayload) {
    return this.addressLookupFields.find(field => field.name === "building")?.getStateFromValidForm(formData) || "";
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);
      const model = this.model;
      const payload = (request.payload || {}) as FormData;
      const formResult: any = this.validateForm(payload);

      const response = await this.handlePostRequest(request, h);
      if (response?.source?.context?.errors) {
        return response;
      }

      const address = this.getAddressString(formResult);
      const addressLookupServiceConfig = model?.def?.addressLookupServiceConfig as AddressLookupConfig;

      const addressLookupService = new AddressLookupService(addressLookupServiceConfig);

      let lookupResponse;
      let addresses: any[] = [];
      let errors = new Set<any>();
      try {
        lookupResponse = await addressLookupService.lookupByPostcode(address);
        addresses = lookupResponse.matchedAddresses || [];

        const building = this.getBuilding(formResult);
        let matchedAddress: any = null;
        let hasMatchedAddress = false;
        if (building != "") {
          const houseNumber = building.trim();
          const houseNumberLower = houseNumber.toLowerCase();
          matchedAddress = addresses.find((address: any) => {
            const addressStr = address.address.toLowerCase();
            const firstPart = addressStr.split(',')[0].trim();

            // 1. Exact match (ignoring spaces/casing)
            if (firstPart.replace(/\s/g, '') === houseNumberLower.replace(/\s/g, '')) {
              return true;
            }

            // 2. First part starts with house number followed by a space (e.g. "1 High Street" when houseNumber is "1")
            if (firstPart.startsWith(houseNumberLower + " ")) {
              return true;
            }

            return false;
          });

          if (matchedAddress) {
            hasMatchedAddress = true;
          }
        }

        const updateState = {
          addresses,
          hasMatchedAddress,
          numberOfAddresses: addresses.length,
          ...(matchedAddress && { matchedAddress })
        };

        await cacheService.mergeState(request, updateState);
      } catch (err) {
        request.server.logger.error(
          { err, address },
          "Error looking up address"
        );
      }
    }
  }
}
