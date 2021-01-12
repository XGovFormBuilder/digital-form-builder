import React from "react";
import ReactDOM from "react-dom";

export class RenderInPortal extends React.Component {
  wrapper = document.createElement("div");
  portalRoot = document.getElementById("portal-root")!;

  componentDidMount() {
    this.portalRoot.appendChild(this.wrapper);
  }

  componentWillUnmount() {
    this.portalRoot.removeChild(this.wrapper);
  }

  render() {
    return ReactDOM.createPortal(this.props.children, this.wrapper);
  }
}
