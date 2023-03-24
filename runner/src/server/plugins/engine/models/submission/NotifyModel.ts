import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";
import { NotifyOutputConfiguration } from "@xgovformbuilder/model";

export type NotifyModel = Omit<
  NotifyOutputConfiguration,
  "emailField" | "replyToConfiguration" | "personalisation"
> & {
  emailAddress: string;
  emailReplyToId?: string;
  personalisation: {
    [key: string]: string | boolean;
  };
};

/**
 * returns an object used for sending GOV.UK notify requests Used by {@link SummaryViewModel} {@link NotifyService}
 */
export function NotifyModel(
  model: FormModel,
  outputConfiguration: NotifyOutputConfiguration,
  state: FormSubmissionState
): NotifyModel {
  const {
    addReferencesToPersonalisation,
    apiKey,
    emailField,
    personalisation: personalisationConfiguration,
    possiblePersonalisationFields = {},
    emailReplyToIdConfiguration,
    templateId,
  } = outputConfiguration;

  // @ts-ignore - eslint does not report this as an error, only tsc
  const personalisation: NotifyModel["personalisation"] = personalisationConfiguration.reduce(
    (acc, curr) => {
      let value, condition;

      const possibleFields = [
        curr,
        ...(possiblePersonalisationFields?.[curr] ?? []),
      ];
      //iterate through each field to find the value to use
      possibleFields.forEach((field) => {
        value ??= reach(state, field);
        condition ??= model.conditions[curr];
      });

      return {
        ...acc,
        [curr]: condition ? condition.fn(state) : value,
      };
    },
    {}
  );

  const defaultReplyToId = emailReplyToIdConfiguration?.find(
    ({ condition }) => !condition
  )?.emailReplyToId;

  const conditionalReplyTos = emailReplyToIdConfiguration?.filter(
    ({ condition }) => !!condition
  );

  const emailReplyToId =
    conditionalReplyTos?.find(({ condition }) => {
      return model.conditions[condition!]?.fn?.(state);
    })?.emailReplyToId ?? defaultReplyToId;

  return {
    templateId: templateId,
    personalisation,
    emailAddress: reach(state, emailField) as string,
    apiKey: apiKey,
    addReferencesToPersonalisation,
    ...(emailReplyToId && { emailReplyToId }),
  };
}
