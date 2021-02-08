export class FeatureToggleApi {
  async fetch() {
    try {
      const response = await window.fetch("/feature-toggles");
      return response.json();
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

export default FeatureToggleApi;
