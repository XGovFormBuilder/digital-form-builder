import { PageController } from "server/plugins/engine/pageControllers/PageController";
import { FormModel } from "server/plugins/engine/models";
import { HapiRequest, HapiResponseToolkit } from "server/types";
import { PlaybackUploadPageController } from "server/plugins/engine/pageControllers/PlaybackUploadPageController";
import { FormComponent } from "server/plugins/engine/components";

function isUploadField(component: FormComponent) {
  return component.type === "FileUploadField";
}

export class UploadPageController extends PageController {
  playback: PlaybackUploadPageController;
  inputComponent: FormComponent;
  constructor(model: FormModel, pageDef: any) {
    super(model, pageDef);
    const inputComponent = this.components?.items?.find(isUploadField);
    if (!inputComponent) {
      throw Error(
        "UploadPageController initialisation failed, no file upload component was found"
      );
    }
    this.playback = new PlaybackUploadPageController(
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

      if (view === "playback") {
        return this.playback.makeGetRouteHandler()(request, h);
      }

      return super.makeGetRouteHandler()(request, h);
    };
  }

  makePostRouteHandler() {
    return async (request: HapiRequest, h: HapiResponseToolkit) => {
      const { query } = request;

      if (query?.view === "playback") {
        return this.playback.makePostRouteHandler()(request, h);
      }

      const response = await this.handlePostRequest(request, h);
      if (response?.source?.context?.errors) {
        return response;
      }
      if (request?.pre?.warningFromApi === "qualityWarning") {
        return h.redirect(`?view=playback`);
      }

      const { cacheService } = request.services([]);
      const savedState = await cacheService.getState(request);
      //This is required to ensure we don't navigate to an incorrect page based on stale state values
      let relevantState = this.getConditionEvaluationContext(
        this.model,
        savedState
      );

      return this.proceed(request, h, relevantState);
    };
  }
}
