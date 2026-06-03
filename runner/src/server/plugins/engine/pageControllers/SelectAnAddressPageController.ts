import { PageControllerBase } from "./PageControllerBase";
import { FormModel } from "../models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import joi from "joi";

export class SelectAnAddressPageController extends PageControllerBase {
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    const component: any = this.components.items.find((c: any) => c.name === "selectedAddress");
    if (component) {
      component.getDisplayStringFromState = function(state: any) {
        const value = state[this.name];
        const addresses = state.addresses || [];
        const item = addresses.find((addr: any) => String(addr.uprn) === String(value));
        return item ? item.address : (value || "");
      };
    }
  }

  getFormDataFromState(state: any, atIndex?: number) {
    const formData = super.getFormDataFromState(state, atIndex as number) as any;
    formData.addresses = state.addresses || [];
    formData.postcode = state.postcode || "";
    return formData;
  }

  getViewModel(formData: any, iteration?: any, errors?: any) {
    const viewModel = super.getViewModel(formData, iteration, errors);

    const addresses = formData.addresses || [];

    const radiosIndex = this.components.items.findIndex((c: any) => c.name === "selectedAddress");
    if (radiosIndex > -1 && viewModel.components[radiosIndex]) {
      viewModel.components[radiosIndex].model.items = addresses.map((addr: any) => ({
        text: addr.address,
        value: addr.uprn,
        checked: `${addr.uprn}` === `${formData.selectedAddress}`
      }));
    }

    // Also update the heading text dynamically to show number of addresses
    const headingIndex = this.components.items.findIndex((c: any) => c.name === "addressesFoundHeading");
    if (headingIndex > -1 && viewModel.components[headingIndex] && viewModel.components[headingIndex].model) {
      viewModel.components[headingIndex].model.content = `${addresses.length} addresses found for '${formData.postcodeLookup || ""}'`;
    }

    return viewModel;
  }

  async handlePostRequest(request: HapiRequest, h: HapiResponseToolkit, mergeOptions?: any) {
    const { cacheService } = request.services([]);
    const state = await cacheService.getState(request);
    const addresses = state.addresses || [];

    const component: any = this.components.items.find((c: any) => c.name === "selectedAddress");
    if (component) {
      const originalItems = component.list.items;
      const originalFormSchema = component.formSchema;
      const originalStateSchema = component.stateSchema;

      component.list.items = addresses.map((addr: any) => ({
        text: addr.address,
        value: addr.uprn
      }));

      component.formSchema = joi.string().valid(...addresses.map((a: any) => a.uprn)).required().messages({
        "any.only": "Select an address from the list",
        "any.required": "Select an address from the list"
      });
      component.stateSchema = component.formSchema;

      try {
        const response = await super.handlePostRequest(request, h, mergeOptions);
        return response;
      } finally {
        component.list.items = originalItems;
        component.formSchema = originalFormSchema;
        component.stateSchema = originalStateSchema;
      }
    }

    return super.handlePostRequest(request, h, mergeOptions);
  }
}
