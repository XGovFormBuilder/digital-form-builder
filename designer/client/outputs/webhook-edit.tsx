import React from "react";

const WebhookEdit = ({ url = "" }: { url?: string }) => (
  <div className="govuk-form-group">
    <label className="govuk-label govuk-label--s" htmlFor="webhook-url">
      Webhook url
    </label>
    <input
      className="govuk-input"
      id="webhook-url"
      name="webhook-url"
      defaultValue={url}
      type="text"
      required
      pattern="^\S+"
    />
  </div>
);

export default WebhookEdit;
