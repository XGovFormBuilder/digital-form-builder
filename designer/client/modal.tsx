import React from "react";

export const Modal = (props) => {
  if (!props.show) {
    return null;
  }

  return (
    <div className="modal govuk-body">
      <div>
        <a
          title="Close"
          className="close govuk-body govuk-!-font-size-16"
          onClick={(e) => {
            e.preventDefault();
            props.onHide(e);
          }}
        >
          Close
        </a>
        {props.children}
      </div>
    </div>
  );
};
