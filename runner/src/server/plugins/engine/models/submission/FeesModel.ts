import { FormModel } from "server/plugins/engine/models";
import { FormSubmissionState } from "server/plugins/engine/types";
import { reach } from "hoek";
import { Fee, AdditionalReportingColumn } from "@xgovformbuilder/model";
import { FeeDetails } from "server/services/payService";

export type FeesModel = {
  details: FeeDetails[];
  total: number;
  prefixes: string[];
  referenceFormat?: string;
  reportingColumns?: {
    [key: string]: any;
  }[];
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

  if (applicableFees.length < 1) {
    return undefined;
  }

  const columnsConfig = model.feeOptions?.additionalReportingColumns;
  const reportingColumns = ReportingColumns(columnsConfig, state);

  const details = feesAsFeeDetails(applicableFees, state);
  return details.reduce(
    (acc: FeesModel, fee: FeeDetails) => {
      const { amount, multiplyBy = 1, prefix = "" } = fee;

      acc.total = acc.total + amount * multiplyBy;
      acc.prefixes = [...acc.prefixes, prefix].filter((p) => p);

      return acc;
    },
    {
      details,
      total: 0,
      prefixes: [],
      referenceFormat:
        model.feeOptions?.paymentReferenceFormat ??
        model.def.paymentReferenceFormat ??
        "",
      ...(reportingColumns && { reportingColumns }),
    }
  );
}

/**
 * Creates a GOV.UK metadata object (reporting columns) to send in the payment creation.
 */
export function ReportingColumns(
  reportingColumns: FormModel["feeOptions"]["additionalReportingColumns"],
  state: FormSubmissionState
): FeesModel["reportingColumns"] {
  if (!reportingColumns) {
    return;
  }

  return reportingColumns.reduce((prev, curr) => {
    if (curr.fieldValue) {
      const stateValue = reach(state, curr.fieldValue);
      if (!stateValue) {
        return prev;
      }
      prev[curr.columnName] = stateValue;
    }
    if (curr.staticValue) {
      prev[curr.columnName] = curr.staticValue;
    }
    return prev;
  }, {});
}
