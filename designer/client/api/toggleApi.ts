export class FeatureToggleApi {
  async fetch() {
    try {
      const response = await window.fetch("/feature-toggles");
      if (response.status == 200) {
        return response.json();
      } else {
        return [];
      }
    } catch (e) {
      console.error(e);
      return [];
    }
  }
}

export default FeatureToggleApi;
