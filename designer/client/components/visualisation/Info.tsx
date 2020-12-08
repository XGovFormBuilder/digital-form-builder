import React from "react";

type Props = {
  updatedAt: string;
  downloadedAt: string;
};

export const Info = ({ updatedAt, downloadedAt }: Props) => (
  <div className="notification">
    <p className="govuk-body">last downloaded at {downloadedAt}</p>
    <p className="govuk-body">last updated at {updatedAt}</p>
  </div>
);
