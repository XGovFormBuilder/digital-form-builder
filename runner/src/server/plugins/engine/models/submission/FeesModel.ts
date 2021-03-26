import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FeeDetails, Fees } from "server/services/payService";
import { flatten } from "hoek";

export function FeesModel(
  model: FormModel,
  state: FormSubmissionState
): Fees | undefined {
  let applicableFees: FeeDetails[] = [];

  if (model.def.fees) {
    applicableFees = model.def.fees.filter((fee) => {
      return !fee.condition || model.conditions[fee.condition].fn(state);
    });

    const flatState = flatten(state);

    return {
      details: applicableFees,
      total: Object.values(applicableFees)
        .map((fee) => {
          if (fee.multiplier) {
            const multiplyBy = flatState[fee.multiplier];
            fee.multiplyBy = Number(multiplyBy);
            return fee.multiplyBy * fee.amount;
          }
          return fee.amount;
        })
        .reduce((a, b) => a + b, 0),
    };
  }

  return undefined;
}
