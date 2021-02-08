import React, { useState } from "react";

function useMenuItem() {
  const [isVisible, setIsVisible] = useState(false);
  function show() {
    setIsVisible(true);
  }
  function hide() {
    setIsVisible(false);
  }

  return {
    isVisible,
    show,
    hide,
  };
}

function MenuItem() {
  <button onClick={() => this.setState({ showFormConfig: true })}>
    Form Details
  </button>;
}
