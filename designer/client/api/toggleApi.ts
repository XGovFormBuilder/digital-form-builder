import logger from "../plugins/logger";
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
      logger.error("toggleApi", e);
      return [];
    }
  }
}

export default FeatureToggleApi;
