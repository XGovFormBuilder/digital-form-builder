import { MouseEvent, useState } from "react";

export enum Tabs {
  model,
  json,
  summary,
}

export function useTabs() {
  const [selectedTab, setSelectedTab] = useState(Tabs.model);
  function handleTabChange(event: MouseEvent<HTMLButtonElement>, tab: Tabs) {
    event.preventDefault();
    setSelectedTab(tab);
  }

  return { selectedTab, handleTabChange };
}
