import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";

/**
 * returns an object used for sending GOV.UK notify requests Used by {@link SummaryViewModel} {@link NotifyService}
 */
export function NotifyModel(
  model: FormModel,
  outputConfiguration,
  state: FormSubmissionState
) {
  // @ts-ignore - eslint does not report this as an error, only tsc
  const personalisation = outputConfiguration.personalisation.reduce(
    (acc, curr) => {
      const condition = model.conditions[curr];
      return {
        ...acc,
        [curr]:
          (condition ? condition.fn(state) : reach(state, curr)) ?? "test",
      };
    },
    {}
  );

  return {
    templateId: outputConfiguration.templateId,
    personalisation,
    emailAddress: reach(state, outputConfiguration.emailField),
    apiKey: outputConfiguration.apiKey,
    addReferencesToPersonalisation:
      outputConfiguration.addReferencesToPersonalisation,
  };
}
