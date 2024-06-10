import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import {
  EmailModel,
  FeesModel,
  WebhookModel,
  NotifyModel,
} from "server/plugins/engine/models/submission";
import { WebhookData } from "server/plugins/engine/models/types";
import {
  EmailOutputConfiguration,
  NotifyOutputConfiguration,
  OutputType,
  WebhookOutputConfiguration,
} from "@xgovformbuilder/model";
import { OutputData } from "server/plugins/engine/models/submission/types";

export class Outputs {
  fees: FeesModel | undefined;
  webhookData: WebhookData;
  outputs: (OutputData | unknown)[];

  constructor(model: FormModel, state: FormSubmissionState) {
    this.fees = FeesModel(model, state);
    this.webhookData = WebhookModel(model, state);

    const outputDefs = model.def.outputs;
    this.outputs = outputDefs.map((output) => {
      switch (output.type) {
        case "notify":
          /**
           * Typescript does not support nested type discrimination {@link https://github.com/microsoft/TypeScript/issues/18758}
           */
          const notifyOutputConfiguration = output.outputConfiguration as NotifyOutputConfiguration;
          return {
            type: OutputType.Notify,
            outputData: NotifyModel(model, notifyOutputConfiguration, state),
          };
        case "email":
          const emailOutputConfiguration = output.outputConfiguration as EmailOutputConfiguration;
          return {
            type: OutputType.Email,
            outputData: EmailModel(
              model,
              emailOutputConfiguration,
              this.webhookData
            ),
          };
        case "webhook":
          const webhookOutputConfiguration = output.outputConfiguration as WebhookOutputConfiguration;
          return {
            type: OutputType.Webhook,
            outputData: {
              url: webhookOutputConfiguration.url,
              sendAdditionalPayMetadata:
                webhookOutputConfiguration.sendAdditionalPayMetadata,
              allowRetry: webhookOutputConfiguration.allowRetry,
            },
          };
        default:
          return {} as unknown;
      }
    });
  }
}
