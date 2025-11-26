import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";
import { NotifyOutputConfiguration, List } from "@xgovformbuilder/model";
import { TNotifyModel } from "./types";

const parseListAsNotifyTemplate = (
  list: List,
  model: FormModel,
  state: FormSubmissionState
) => {
  return `${list.items
    .filter((item) => checkItemIsValid(model, state, item.condition))
    .map((item) => `* ${item.value}\n`)
    .join("")}`;
};

const checkItemIsValid = (
  model: FormModel,
  state: FormSubmissionState,
  conditionName
) => model.conditions[conditionName]?.fn?.(state) ?? true;

/**
 * returns an object used for sending GOV.UK notify requests Used by {@link SummaryViewModel} {@link NotifyService}
 */
export function NotifyModel(
  model: FormModel,
  outputConfiguration: NotifyOutputConfiguration,
  state: FormSubmissionState
): TNotifyModel {
  const {
    addReferencesToPersonalisation,
    apiKey,
    emailField,
    personalisation: personalisationConfiguration,
    personalisationFieldCustomisation = {},
    emailReplyToIdConfiguration,
    escapeURLs = false,
  } = outputConfiguration;

  let { templateId } = outputConfiguration;

  // @ts-ignore - eslint does not report this as an error, only tsc
  const personalisation: NotifyModel["personalisation"] = personalisationConfiguration.reduce(
    (acc, curr) => {
      let value, listValue, condition;

      const possibleFields = [
        curr,
        ...(personalisationFieldCustomisation?.[curr] ?? []),
      ];
      //iterate through each field to find the value to use
      possibleFields.forEach((field) => {
        value ??= reach(state, field);
        listValue ??= model.lists.find((list) => list.name === field);
        condition ??= model.conditions[curr];
      });

      let personalisationValue;

      if (condition) {
        personalisationValue ??= condition.fn?.(state);
      }
      if (listValue) {
        personalisationValue ??= parseListAsNotifyTemplate(
          listValue,
          model,
          state
        );
      }
      personalisationValue ??= value;

      return {
        ...acc,
        [curr]: personalisationValue,
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
    escapeURLs,
    ...(emailReplyToId && { emailReplyToId }),
  };
}
