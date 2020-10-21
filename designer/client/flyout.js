import React, { useContext, useEffect, useLayoutEffect, useState } from "react";
import { FlyoutContext } from "./context";
import { withI18n } from "./i18n";

export function useFlyoutEffect(props) {
  const { count, increment, decrement } = useContext(FlyoutContext);
  const [offset, setOffset] = useState(0);
  const [style, setStyle] = useState();

  /**
   * @code on component mount
   */
  useLayoutEffect(() => {
    if (props?.show) {
      increment();
    }
    return () => {
      decrement();
    };
  }, []);

  useLayoutEffect(() => {
    setOffset(count);
  }, []);

  useEffect(() => {
    setStyle({
      paddingLeft: `${offset * 50}px`,
      transform: `translateX(${offset * -50}px)`,
      position: "relative",
    });
  }, [offset]);

  const onHide = () => {
    props.onHide?.();
  };

  return { style, width: props?.width, onHide, offset };
}

function Flyout(props) {
  // TODO:- This should really be handled by the parent to determine whether or not flyout should render.
  if (!props?.show) {
    return null;
  }

  const { style, width = "", onHide } = useFlyoutEffect(props);

  return (
    <div className="flyout-menu show">
      <div className={`flyout-menu-container ${width}`} style={style}>
        <a
          title="Close"
          className="close govuk-body govuk-!-font-size-16"
          onClick={onHide}
        >
          {props.i18n("close")}
        </a>
        <div className="panel">
          <div className="panel-header govuk-!-padding-top-4 govuk-!-padding-left-4">
            {props.title && <h4 className="govuk-heading-m">{props.title}</h4>}
          </div>
          <div className="panel-body">
            <div className="govuk-!-padding-left-4 govuk-!-padding-right-4 govuk-!-padding-bottom-4">
              {props.children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withI18n(Flyout);
