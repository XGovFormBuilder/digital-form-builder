import Wreck from "@hapi/wreck";
import config from "../../config";

export const publish = async function (id, configuration): Promise<any> {
  try {
    return Wreck.post(`${config.publishUrl}/publish`, {
      payload: JSON.stringify({ id, configuration }),
    });
  } catch (error) {
    throw new Error(
      `Error when publishing to endpoint ${config.publishUrl}/publish: message: ${error.message}`
    );
  }
};
