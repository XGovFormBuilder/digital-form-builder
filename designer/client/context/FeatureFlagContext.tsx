import React, { createContext, useState, useEffect } from "react";
import { FeatureToggleApi } from "../api/toggleApi";

export enum FeatureFlags {
  FEATURE_EDIT_PAGE_DUPLICATE_BUTTON = "featureEditPageDuplicateButton",
}

export interface FlagState {
  [FeatureFlags.FEATURE_EDIT_PAGE_DUPLICATE_BUTTON]?: string;
}

const initialState: FlagState = {};
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
