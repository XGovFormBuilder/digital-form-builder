import { useFeatures } from "./hooks/featureToggling";

const FeatureToggle = ({ feature, children }) => {
  const features = useFeatures();
  return features[feature] ? children : null;
};

export default FeatureToggle;
