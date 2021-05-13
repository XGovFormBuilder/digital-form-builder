import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { flatten } from "hoek";

export function NotifyModel(
  model: FormModel,
  outputConfiguration,
  state: FormSubmissionState
) {
  // @ts-ignore - eslint does not report this as an error, only tsc
  const flatState = flatten(state);
  const personalisation = {};
  outputConfiguration.personalisation.forEach((p) => {
    const condition = model.conditions[p];
    personalisation[p] = condition ? condition.fn(state) : flatState[p];
  });
  return {
    templateId: outputConfiguration.templateId,
    personalisation,
    emailAddress: flatState[outputConfiguration.emailField],
    apiKey: outputConfiguration.apiKey,
    addReferencesToPersonalisation:
      outputConfiguration.addReferencesToPersonalisation,
  };
}
