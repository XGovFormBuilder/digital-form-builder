import { FormModel } from "./FormModel";
import { FormSubmissionState } from "../types";
import {
  FeesModel,
  WebhookModel,
} from "server/plugins/engine/models/submission";
import { HapiRequest } from "src/server/types";
import { ViewModel } from "server/plugins/engine/models/viewModel";

export class SaveViewModel extends ViewModel {
  /**
   * Responsible for parsing state values to the govuk-frontend summary list template and parsing data for outputs
   * The plain object is also used to generate data for outputs
   */

  constructor(
    pageTitle: string,
    model: FormModel,
    state: FormSubmissionState,
    request: HapiRequest
  ) {
    super(pageTitle, model, state, request);

    const { relevantPages } = SaveViewModel.getRelevantPages(model, state);
    const details = this.summaryDetails(request, model, state, relevantPages);

    this.fees = FeesModel(model, state);
    this._webhookData = WebhookModel(relevantPages, details, model, this.fees);
    this._webhookData = this.addFeedbackSourceDataToWebhook(
      this._webhookData,
      model,
      request
    );
  }
}
