import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { SummaryUploadPageController } from "server/plugins/engine/pageControllers/SummaryUploadPageController";
import { FormComponent } from "server/plugins/engine/components";

function isUploadField(component: FormComponent) {
  return component.type === "FileUploadField";
}

export class UploadPageController extends PageController {
  summary: SummaryUploadPageController;
  inputComponent: FormComponent;
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    const inputComponent = this.components?.items?.find(isUploadField);
    if (!inputComponent) {
      throw Error(
        "UploadPageController initialisation failed, no file upload component was found"
      );
    }
    this.summary = new SummaryUploadPageController(
      model,
      pageDef,
      inputComponent as FormComponent
    );
    this.inputComponent = inputComponent as FormComponent;
  }

  makeGetRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;
      const { view } = query;

      if (view === "summary") {
        return this.summary.getRouteHandler(request, h);
      }

      return super.makeGetRouteHandler()(request, h);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;

      if (query.view === "summary") {
        return this.summary.postRouteHandler(request, h);
      }
      if (request?.pre?.errors) {
        if (
          request?.pre?.errorCode === "qualityError" &&
          this.inputComponent.options?.imageQualityPlayback
        ) {
          return h.redirect(`?view=summary`);
        }
      }

      return super.makePostRouteHandler()(request, h);
    };
  }
}
