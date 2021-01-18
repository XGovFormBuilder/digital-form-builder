import React, { ChangeEvent } from "react";
import { Radios } from "@govuk-jsx/radios";
import { Label } from "@govuk-jsx/label";
import { Data } from "@xgovformbuilder/model";

import { i18n } from "../../i18n";

type Props = {
  phaseBanner: Data["phaseBanner"];
  handlePhaseBannerChange: (event: ChangeEvent<HTMLSelectElement>) => void;
};

export const FormDetailsPhaseBanner = (props: Props) => {
  const { phaseBanner, handlePhaseBannerChange } = props;

  return (
    <div className="govuk-form-group">
      <Radios
        id="field-form-phase-banner"
        name="phaseBanner"
        value={phaseBanner?.phase}
        onChange={handlePhaseBannerChange}
        required={false}
        fieldset={{
          legend: {
            children: (
              <Label
                className="govuk-label--s"
                htmlFor="#field-form-phase-banner"
              >
                {i18n("formDetails.phaseBanner.fieldTitle")}
              </Label>
            ),
          },
        }}
        hint={{
          children: [i18n("formDetails.phaseBanner.hint")],
        }}
        items={[
          {
            children: [i18n("formDetails.alpha")],
            value: "alpha",
          },
          {
            children: [i18n("formDetails.beta")],
            value: "beta",
          },
          {
            children: [i18n("formDetails.none")],
            value: undefined,
          },
        ]}
      />
    </div>
  );
};
