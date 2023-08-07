import pino from "pino";
import { ApiConditionRawData, ConditionRawData } from "@xgovformbuilder/model";
import hoek from "hoek";
import wreck from "wreck";
import { getSignature } from "server/plugins/engine/models/FormModel.helpers";
const logger = pino().child({ name: "apiCondition" });

export class ApiCondition {
  baseRequest: { [key: string]: any };
  needsStateEntries: [string, string][];
  url: string;

  constructor(conditionData: ApiConditionRawData) {
    const { value } = conditionData;
    const { url, values } = value;
    this.url = url;

    const entries = Object.entries(values) as [string, string][];

    const { baseRequest, needsStateEntries } = entries.reduce(
      (prev, [key, value]) => {
        const needsValueFromState = value.startsWith("$");

        if (needsValueFromState) {
          // @ts-ignore
          prev.needsStateEntries.push([key, value.substring(1)]);
          return prev;
        }

        prev.baseRequest[key] = value;
        return prev;
      },
      { baseRequest: {}, needsStateEntries: [] }
    );

    this.baseRequest = baseRequest;
    this.needsStateEntries = needsStateEntries;
  }

  requestBody(state) {
    const dynamicValues = this.needsStateEntries.reduce<{ [key: string]: any }>(
      (prev, [key, value]) => {
        prev[key] = hoek.reach(state, value);
        return prev;
      },
      {}
    );

    return {
      ...this.baseRequest,
      ...dynamicValues,
    };
  }

  makeFn(): (state: any) => Promise<boolean> {
    return async (state) => {
      const requestBody = this.requestBody(state);
      try {
        const { res } = await wreck.post(this.url, {
          payload: requestBody,
          headers: {
            signature: getSignature(JSON.stringify(requestBody)),
          },
        });

        return res?.statusCode >= 200 && res?.statusCode < 300;
      } catch (e) {
        if (!e.isBoom) {
          logger.error(e);
        }
        if (e.isBoom) {
          logger.info({
            requestBody,
            response: e.output.payload,
          });
        }
      }
      return false;
    };
  }

  static isApiCondition(
    conditionData: ConditionRawData
  ): conditionData is ApiConditionRawData {
    // @ts-ignore
    return !!conditionData.value?.url;
  }
}
