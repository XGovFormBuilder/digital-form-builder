import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";
import { Fee } from "@xgovformbuilder/model";
import { FeeDetails } from "server/services/payService";

export type FeesModel = {
  details: FeeDetails[];
  total: number;
  prefix: string[];
  referenceFormat?: string;
};

function feesAsFeeDetails(
  fees: Fee[],
  state: FormSubmissionState
): FeeDetails[] {
  return fees.map((fee) => {
    const { multiplier } = fee;
    let multiplyBy;

    if (multiplier) {
      multiplyBy = Number(reach(state, multiplier));
    }

    return {
      ...fee,
      ...(multiplyBy && { multiplyBy }),
    };
  });
}

/**
 * returns an object used for sending GOV.UK Pay requests Used by {@link SummaryViewModel}, {@link PayService}
 */
export function FeesModel(
  model: FormModel,
  state: FormSubmissionState
): FeesModel | undefined {
  const applicableFees: Fee[] =
    model.def.fees?.filter((fee) => {
      return !fee.condition || model.conditions[fee.condition].fn(state);
    }) ?? [];

  if (applicableFees.length < 0) {
    return undefined;
  }

  const details = feesAsFeeDetails(applicableFees, state);

  return details.reduce(
    (previous: FeesModel, fee: FeeDetails) => {
      const { amount, multiplyBy = 1, prefix = "" } = fee;
      return {
        ...previous,
        total: previous.total + amount * multiplyBy,
        prefix: [...previous.prefix, prefix],
      };
    },
    {
      details,
      total: 0,
      prefix: [],
      referenceFormat: model.def.paymentReferenceFormat ?? "",
    }
  );
}
