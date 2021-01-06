import React, { useContext, useLayoutEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getFlyoutCount } from "./store/flyoutSelector";
import { increment, decrement } from "./store/flyoutSlice";

import { withI18n } from "./i18n";

export function useFlyoutEffect(props) {
  const dispatch = useDispatch();
  const flyoutCount = useSelector(getFlyoutCount);
  const [offset, setOffset] = useState(0);
  const [style, setStyle] = useState();
  const { NEVER_UNMOUNTS } = (props = {});

  /**
   * @code on component mount
   */
  useLayoutEffect(() => {
    dispatch(increment());
    return function cleanup() {
      dispatch(decrement());
    };
  }, []);

  useLayoutEffect(() => {
    setOffset(flyoutCount);
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
    console.log("flyout hide called NEVER_UNMOUNTS=" + NEVER_UNMOUNTS);
    if (props.onHide) {
      props.onHide();
      /**
       * FIXME:- onHide should unmount the component. Some components rely on props.show to render, which means they never unmount.
       * It should really be handled by the parent to determine whether or not the flyout should render.
       */
      if (NEVER_UNMOUNTS) {
        dispatch(decrement());
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
        <div className="panel panel--flyout">
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
