import { FormModel } from "server/plugins/engine/models";
import { TEmailModel } from "./types";
import { EmailOutputConfiguration } from "@xgovformbuilder/model";
import { WebhookData } from "server/plugins/engine/models/types";

/**
 * returns an object used for sending email requests. Used by {@link SummaryViewModel}
 */
export function EmailModel(
  model: FormModel,
  outputConfiguration: EmailOutputConfiguration,
  webhookData: WebhookData
): TEmailModel {
  const data: string[] = [];

  webhookData?.questions?.forEach((question) => {
    data.push("---");
    data.push(`Page: ${question.question}\n`);
    question.fields.forEach((field) =>
      data.push(`*${field.title.replace("?", "")}: ${field.answer}\n`)
    );
  });
  data.push("---");

  const formName = model.name || `Form ${model.basePath}`;

  return {
    personalisation: {
      formName,
      formPayload: data.join("\r\n"),
    },
    apiKey: outputConfiguration.apiKey,
    templateId: outputConfiguration.notifyTemplateId,
    emailAddress: outputConfiguration.emailAddress,
  };
}
