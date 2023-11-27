import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { Page } from "@xgovformbuilder/model";
import { FormComponent } from "server/plugins/engine/components";
import { HapiRequest, HapiResponseToolkit } from "server/types";
export class PlaybackUploadPageController extends PageController {
  inputComponent: FormComponent;
  standardViewModel = {
    name: "retryUpload",
    fieldset: {
      legend: {
        text: "Would you like to upload a new image?",
        isPageHeading: false,
        classes: "govuk-fieldset__legend--s",
      },
    },
    items: [
      {
        value: "true",
        text: "Yes - I would like to upload a new image",
      },
      {
        value: "false",
        text: "No - I am happy with the image",
      },
    ],
  };

  constructor(model: FormModel, pageDef: Page, inputComponent: FormComponent) {
    super(model, pageDef);
    this.inputComponent = inputComponent;
  }

  /**
   * Gets the radio button view model for the "Would you like to upload a new image?" question
   * @param error - if the user hasn't chosen an option and tries to continue, add the required field error to the field
   * @returns the view model for the radio button component
   * */
  getRetryUploadViewModel(error?: string) {
    if (error) {
      return {
        errorMessage: {
          text: error,
        },
        ...this.standardViewModel,
      };
    }
    return this.standardViewModel;
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
      const payload = request.payload;
      if (!payload.retryUpload) {
        const errorText = "Select if you would like to continue";
        const errors = {
          titleText: "Fix the following errors",
          errorList: [
            {
              text: errorText,
              href: "#retry-upload",
            },
          ],
        };
        let sectionTitle = this.section?.title;
        return h.view("upload-playback", {
          sectionTitle: sectionTitle,
          showTitle: true,
          pageTitle: "Check your image",
          uploadErrors: errors,
          backLink: progress[progress.length - 2] ?? this.backLinkFallback,
          radios: this.getRetryUploadViewModel(errorText),
        });
      }

      if (payload.retryUpload === "true") {
        return h.redirect(`/${this.model.basePath}${this.path}`);
      }

      delete payload.retryUpload;

      return super.makePostRouteHandler()(request, h);
    };
  }
}
