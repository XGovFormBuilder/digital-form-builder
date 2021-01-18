import React, { ChangeEvent } from "react";
import { Radios } from "@govuk-jsx/radios";
import { Data } from "@xgovformbuilder/model";

type Props = {
  phaseBanner: Data["phaseBanner"];
  handlePhaseBannerSelection: (event: ChangeEvent<HTMLInputElement>) => void;
};

export const FormDetailsPhaseBanner = (props: Props) => {
  return (
    <Radios
      name="phaseBanner"
      value={phaseBanner}
      onChange={handlePhaseBannerSelection}
      required={true}
      fieldset={{
        legend: {
          children: ["Is this a feedback form?"],
        },
      }}
      hint={{
        children: [
          "A feedback form is used to gather feedback from users about another form",
        ],
      }}
      items={[
        {
          children: ["Yes"],
          value: true,
        },
        {
          children: ["No"],
          value: false,
        },
      ]}
    />
  );
};
