export class DesignerApi {
  async save(id, updatedData) {
    try {
      const response = await window.fetch(`${id}/api/data`, {
        method: "put",
        // dodgy hack to ensure get methods are called
        body: updatedData.toJSON(),
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

  async fetchData(id) {
    try {
      const response = await window.fetch(`${id}/api/data`);
      return response.json();
    } catch (e) {
      console.error(e);
    }
  }
}
