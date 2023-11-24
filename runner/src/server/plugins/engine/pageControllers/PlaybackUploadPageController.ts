import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { Page } from "@xgovformbuilder/model";
import { FormComponent } from "server/plugins/engine/components";
import { HapiRequest, HapiResponseToolkit } from "server/types";

export class PlaybackUploadPageController extends PageController {
  inputComponent: FormComponent;

  constructor(model: FormModel, pageDef: Page, inputComponent: FormComponent) {
    super(model, pageDef);
    this.inputComponent = inputComponent;
  }

  buildRadioViewModel(error?: string) {
    const standardViewModel = {
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
    if (error) {
      return {
        errorMessage: {
          text: error,
        },
        ...standardViewModel,
      };
    }
    return standardViewModel;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { cacheService } = request.services([]);

      const state = await cacheService.getState(request);
      const { progress = [] } = state;
      let sectionTitle = this.section?.title;
      let pageTitle = `Check your ${this.inputComponent.title} image`;
      return h.view("upload-playback", {
        sectionTitle: sectionTitle,
        showTitle: true,
        pageTitle: pageTitle,
        backLink: progress[progress.length - 1] ?? this.backLinkFallback,
        radios: this.buildRadioViewModel(),
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
        let pageTitle = `Check your ${this.inputComponent.title} image`;
        return h.view("upload-playback", {
          sectionTitle: sectionTitle,
          showTitle: true,
          pageTitle: pageTitle,
          uploadErrors: errors,
          backLink: progress[progress.length - 2] ?? this.backLinkFallback,
          radios: this.buildRadioViewModel(errorText),
          fieldName: this.inputComponent.title,
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
