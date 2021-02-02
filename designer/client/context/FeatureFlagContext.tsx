import React, { createContext, useState, useEffect } from "react";
import { FeatureToggleApi } from "../api/toggleApi";

export const FEATURE_EDIT_PAGE_DUPLICATE_BUTTON =
  "featureEditPageDuplicateButton";

export interface FeaturesInterface {
  [FEATURE_EDIT_PAGE_DUPLICATE_BUTTON]?: boolean;
}

const initialState: FeaturesInterface = {};
export const FeatureFlagContext = createContext(initialState);

export const FeatureFlagProvider = ({ children }) => {
  const [features, setFeatures] = useState(initialState);
  useEffect(() => {
    new FeatureToggleApi()
      .fetch()
      .then((data) => {
        setFeatures(data);
      })
      .catch(() => {
        setFeatures(initialState);
      });
  }, []);
  return (
    <FeatureFlagContext.Provider value={features}>
      {children}
    </FeatureFlagContext.Provider>
  );
};

export default FeatureFlagProvider;
