import { useContext } from "react";
import {
  FeatureFlagContext,
  FeaturesInterface,
} from "../context/FeatureFlagContext";

export const useFeatures = () => {
  const features: FeaturesInterface = useContext(FeatureFlagContext);
  return features;
};
