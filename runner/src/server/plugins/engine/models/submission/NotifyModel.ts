import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";
import { NotifyOutputConfiguration, List } from "@xgovformbuilder/model";
import { ExecutableCondition } from "server/plugins/engine/models/types";

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

const parseListAsNotifyTemplate = (
  list: List,
  model: FormModel,
  state: FormSubmissionState
) => {
  return list.items
    .filter((item) => checkItemIsValid(model, state, item.condition))
    .map((item) => `* ${item.value}\n`)
    .join("");
};

const checkItemIsValid = (
  model: FormModel,
  state: FormSubmissionState,
  conditionName = ""
) => conditionName === "" || model.conditions[conditionName]?.fn?.(state);

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
    personalisationFieldCustomisation = {},
    emailReplyToIdConfiguration,
    templateId,
  } = outputConfiguration;

  const getPersonalisationValue = (
    condition?: ExecutableCondition,
    listValue?: List,
    value?: string
  ) => {
    if (condition) {
      return condition.fn?.(state);
    } else if (listValue) {
      return parseListAsNotifyTemplate(listValue, model, state);
    }
    return value;
  };

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

      return {
        ...acc,
        [curr]: getPersonalisationValue(condition, listValue, value),
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
