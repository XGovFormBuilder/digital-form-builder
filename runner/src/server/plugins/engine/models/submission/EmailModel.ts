import { FormModel } from "server/plugins/engine/models";
import config from "server/config";
const { notifyTemplateId, notifyAPIKey } = config;

/**
 * returns an object used for sending email requests. Used by {@link SummaryViewModel}
 */
export function EmailModel(model: FormModel, outputConfiguration, webhookData) {
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
    apiKey: notifyAPIKey,
    templateId: notifyTemplateId,
    emailAddress: outputConfiguration.emailAddress,
  };
}
