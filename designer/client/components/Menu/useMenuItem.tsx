import React, { useState } from "react";

type MenuItemHook = {
  isVisible: boolean;
  show: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  hide: (e?: React.MouseEvent<HTMLButtonElement>) => void;
};

export function useMenuItem(): MenuItemHook {
  const [isVisible, setIsVisible] = useState(false);

  function show(e) {
    e?.preventDefault();
    setIsVisible(true);
  }

  function hide(e) {
    e?.preventDefault();
    setIsVisible(false);
  }

  return {
    isVisible,
    show,
    hide,
  };
}
