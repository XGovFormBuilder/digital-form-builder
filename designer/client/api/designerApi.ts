import { FormDefinition } from "@xgovformbuilder/model";
const pino = require("pino")();

export class DesignerApi {
  async save(id: string, updatedData: FormDefinition): Promise<Response | any> {
    const response = await window.fetch(`/api/${id}/data`, {
      method: "put",
      body: JSON.stringify(updatedData),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response;
  }

  async fetchData(id: string) {
    try {
      const response = await window.fetch(`/api/${id}/data`);
      return response.json();
    } catch (e) {
      pino.error(e);
    }
  }
}
