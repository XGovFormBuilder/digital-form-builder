import React, { useContext, useLayoutEffect, useState } from "react";
import FocusTrap from "focus-trap-react";
import { FlyoutContext } from "./context";
import { i18n } from "./i18n";

export function useFlyoutEffect(props = {}) {
  const flyoutContext = useContext(FlyoutContext);
  const [offset, setOffset] = useState(0);
  const [style, setStyle] = useState();

  /**
   * @code on component mount
   */
  useLayoutEffect(() => {
    flyoutContext.increment();
    return function cleanup() {
      flyoutContext.decrement();
    };
  }, []);

  useLayoutEffect(() => {
    setOffset(flyoutContext.flyoutCount);
  }, []);

  useLayoutEffect(() => {
    if (offset > 0) {
      setStyle({
        paddingLeft: `${offset * 50}px`,
        transform: `translateX(${offset * -50}px)`,
        position: "relative",
      });
    }
  }, [offset]);

  const onHide = (e) => {
    e?.preventDefault();

    if (props.onHide) {
      props.onHide();

      if (props.NEVER_UNMOUNTS) {
        flyoutContext.decrement();
      }
    }
  };

  return { style, width: props?.width, onHide, offset };
}

function Flyout(props) {
  if (!props?.show) {
    return null;
  }

  const { style, width = "", onHide } = useFlyoutEffect(props);

  const closeOnEnter = (e) => {
    if (e.key === "Enter") {
      onHide(e);
    }
  };

  return (
    <FocusTrap>
      <div className="flyout-menu show">
        <div className={`flyout-menu-container ${width}`} style={style}>
          <a
            tabIndex="0"
            title="Close"
            className="close govuk-body govuk-!-font-size-16 govuk-link"
            onClick={onHide}
            onKeyPress={closeOnEnter}
          >
            {i18n("close")}
          </a>
          <div className="panel panel--flyout">
            <div className="panel-header govuk-!-padding-top-4 govuk-!-padding-left-4">
              {props.title && (
                <h4 className="govuk-heading-m">{props.title}</h4>
              )}
            </div>
            <div className="panel-body">
              <div className="govuk-!-padding-left-4 govuk-!-padding-right-4 govuk-!-padding-bottom-4">
                {props.children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FocusTrap>
  );
}

export default Flyout;
