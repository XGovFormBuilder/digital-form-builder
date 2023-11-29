import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { Page } from "@xgovformbuilder/model";
import {
  ComponentCollection,
  FormComponent,
} from "server/plugins/engine/components";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import joi from "joi";
import { FormSubmissionErrors } from "../types";
export class PlaybackUploadPageController extends PageController {
  inputComponent: FormComponent;
  retryUploadViewModel = {
    name: "retryUpload",
    type: "RadiosField",
    options: {},
    schema: {},
    fieldset: {
      legend: {
        text: "Would you like to upload a new image?",
        isPageHeading: false,
        classes: "govuk-fieldset__legend--s",
      },
    },
    items: [
      {
        value: true,
        text: "Yes - I would like to upload a new image",
      },
      {
        value: false,
        text: "No - I am happy with the image",
      },
    ],
  };

  constructor(model: FormModel, pageDef: Page, inputComponent: FormComponent) {
    super(model, pageDef);
    this.inputComponent = inputComponent;
    this.formSchema = joi.object({
      crumb: joi.string(),
      retryUpload: joi
        .string()
        .required()
        .allow("true", "false")
        .label("if you would like to upload a new image"),
    });
    this.stateSchema = joi.object();
    this.components = new ComponentCollection([], this.model);
  }

  /**
   * Gets the radio button view model for the "Would you like to upload a new image?" question
   * @param error - if the user hasn't chosen an option and tries to continue, add the required field error to the field
   * @returns the view model for the radio button component
   * */
  getRetryUploadViewModel(errors?: FormSubmissionErrors) {
    let viewModel = { ...this.retryUploadViewModel };
    errors?.errorList?.forEach((err) => {
      if (err.name === viewModel.name) {
        viewModel.errorMessage = {
          text: err.text,
        };
      }
    });
    return viewModel;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);

      const state = await cacheService.getState(request);
      const { progress = [] } = state;
      let sectionTitle = this.section?.title;
      return h.view("upload-playback", {
        sectionTitle: sectionTitle,
        showTitle: true,
        pageTitle: "Check your image",
        backLink: progress[progress.length - 1] ?? this.backLinkFallback,
        radios: this.getRetryUploadViewModel(),
      });
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);

      const state = await cacheService.getState(request);
      const { progress = [] } = state;
      const { payload } = request;
      const result = this.formSchema.validate(payload, this.validationOptions);
      if (result.error) {
        const errors = this.getErrors(result);
        let sectionTitle = this.section?.title;
        return h.view("upload-playback", {
          sectionTitle: sectionTitle,
          showTitle: true,
          pageTitle: "Check your image",
          uploadErrors: errors,
          backLink: progress[progress.length - 2] ?? this.backLinkFallback,
          radios: this.getRetryUploadViewModel(errors),
        });
      }

      if (payload.retryUpload === "true") {
        return h.redirect(`/${this.model.basePath}${this.path}`);
      }

      return super.makePostRouteHandler()(request, h);
    };
  }
}
