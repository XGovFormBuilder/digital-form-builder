import React, { ReactNode, MouseEvent } from "react";

import "./BackLink.scss";

type Props = {
  children: ReactNode;
  href?: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

export const BackLink = ({ children, ...otherProps }: Props) => (
  <a className="back-link govuk-back-link" {...otherProps}>
    {children}
  </a>
);
