import { Data } from "@xgovformbuilder/model";

export class DesignerApi {
  async save(id: string, updatedData: Data): Promise<Response | any> {
    try {
      const response = await window.fetch(`${id}/api/data`, {
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
    } catch {
      // Not connected to preview environment
    }
  }

  async fetchData(id: string) {
    try {
      const response = await window.fetch(`${id}/api/data`);
      return response.json();
    } catch (e) {
      console.error(e);
    }
  }
}
