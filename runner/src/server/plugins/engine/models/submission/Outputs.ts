import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import {
  EmailModel,
  WebhookModel,
  NotifyModel,
} from "server/plugins/engine/models/submission";
import { WebhookData } from "server/plugins/engine/models/types";
import { OutputData } from "server/plugins/engine/models/submission/types";

export class Outputs {
  webhookData: WebhookData;
  outputs: OutputData[];

  constructor(model: FormModel, state: FormSubmissionState) {
    this.webhookData = WebhookModel(model, state);

    const outputDefs = model.def.outputs;
    this.outputs = outputDefs.map((output) => {
      switch (output.type) {
        case "notify":
          /**
           * Typescript does not support nested type discrimination {@link https://github.com/microsoft/TypeScript/issues/18758}
           */
          const notifyOutputConfiguration = output.outputConfiguration;
          return {
            type: output.type,
            outputData: NotifyModel(model, notifyOutputConfiguration, state),
          };
        case "email":
          const emailOutputConfiguration = output.outputConfiguration;
          return {
            type: output.type,
            outputData: EmailModel(
              model,
              emailOutputConfiguration,
              this.webhookData
            ),
          };
        case "webhook":
          const webhookOutputConfiguration = output.outputConfiguration;
          return {
            type: output.type,
            outputData: {
              url: webhookOutputConfiguration.url,
              sendAdditionalPayMetadata:
                webhookOutputConfiguration.sendAdditionalPayMetadata,
              allowRetry: webhookOutputConfiguration.allowRetry,
            },
          };
        default:
          return {} as OutputData;
      }
    });
  }
}
