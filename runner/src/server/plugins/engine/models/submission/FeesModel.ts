import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { FeeDetails, Fees } from "server/services/payService";
import { reach } from "hoek";

/**
 * returns an object used for sending GOV.UK Pay requests Used by {@link SummaryViewModel}, {@link PayService}
 */
export function FeesModel(
  model: FormModel,
  state: FormSubmissionState
): Fees | undefined {
  if (model.def.fees) {
    const applicableFees: FeeDetails[] = model.def.fees.filter((fee) => {
      return !fee.condition || model.conditions[fee.condition].fn(state);
    });

    if (applicableFees.length > 0) {
      return {
        details: applicableFees,
        total: Object.values(applicableFees)
          .map((fee) => {
            if (fee.multiplier) {
              const multiplyBy = reach(state, fee.multiplier);
              fee.multiplyBy = Number(multiplyBy);
              return fee.multiplyBy * fee.amount;
            }
            return fee.amount;
          })
          .reduce((a, b) => a + b, 0),
      };
    }
  }

  return undefined;
}
