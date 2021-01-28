export class ToggleApi {
  async fetchToggles() {
    try {
      const response = await window.fetch("/feature-toggles");
      return response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}
