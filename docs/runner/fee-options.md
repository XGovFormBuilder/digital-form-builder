# Fee options and Payment skipped warning page

## Fee options

`feeOptions` is a top level property in a form json. Fee options are used to configure API keys for GOV.UK Pay, and the behaviour of retrying payments.

```json5
{
  // pages, sections, conditions etc ..
  feeOptions: {
    /**
     * If a payment is required, but the user fails, allow the user to skip payment
     * and submit the form. this is the default behaviour.
     *
     * Any versions AFTER (and not including) v3.25.68-rc.927 allows this behaviour
     * to be configurable. If you do not want payment to be skippable, set
     * `allowSubmissionWithoutPayment: false`
     */
    allowSubmissionWithoutPayment: true,

    /**
     * The maximum number of times a user can attempt to pay before the form is auto submitted.
     * There is no limit when allowSubmissionWithoutPayment is false. (The user can retry as many times as they like).
     */
    maxAttempts: 3,

    /**
     * A supplementary error message (`customPayErrorMessage`)
     */
    customPayErrorMessage: "Custom error message",

    /**
     * Shows a link (button) below the "Submit and pay" button on the summary page. Clicking this will take the user to a page
     * that provides additional messaging, you can warn the user that this may delay their application for example.
     * allowSubmissionWithoutPayment must be true for this to be shown.
     */
    showPaymentSkippedWarningPage: false,

    /**
     * Adds metadata to the GOV.UK Pay request. You may add static values, or values based on the user's answer.
     */
    additionalReportingColumns: [
      {
        columnName: "country",
        fieldPath: "beforeYouStart.country", // the path in the state object to retrieve the value from. If the value is in a section, use the format {sectionName}.{fieldName}.
      },
      {
        columnName: "post",
        fieldPath: "post",
      },
      {
        columnName: "service",
        staticValue: "fee 11",
      },
    ],
  },
}
```

As a failsafe, if a user was not able to pay, we will allow them to try up to 3 times (`maxAttempts`), then auto submit (`"allowSubmissionWithoutPayment": true`).
This is the default behaviour. Makes sure you check your organisations policy or legislative requirements. You must ensure there is a process to remediate payment failures.

When a user fails a payment, they will see the page [pay-error](./../../runner/src/server/views/pay-error.html).

When `allowSubmissionWithoutPayment` is true, the user will also see a link which allows them to skip payment.

### Recommendations

If your service does not allow submission without payment, set
`allowSubmissionWithoutPayment: false`. `maxAttempts` will have no effect. The user will be able to retry as many times as they like.
You can provide them with `customPayErrorMessage` to provide them with another route to payment.

## paymentSkippedWarningPage

`paymentSkippedWarningPage` can be found on the `specialPages` top level property.

If `feeOptions.showPaymentSkippedWarningPage` (and `feeOptions.allowSubmissionWithoutPayment`) is true,
another page ([payment-skip-warning](./../../runner/src/server/views/payment-skip-warning.html)) will be presented to the user.
Additional messaging can be provided to the user for alternative routes to payment, or may result in application delays.
The can choose to continue or try online payment. This page will be shown only once.

```json5
{
  // pages, sections, conditions etc ..
  paymentSkippedWarningPage: {
    customText: {
      caption: "Payment",
      title: "Pay at appointment",
      body: '<p class="govuk-body">You have chosen to skip payment. You will not be able to submit your application until you have paid.</p><p class="govuk-body">If you are unable to pay online, you\'ll need to bring the equivalent of £50 in cash in the local currency to your appointment. You wil not be given any change. <a href="">Check current consular exchange rates</a></p>',
    },
  },
}
```

## Reporting columns

[GOV.UK Pay allows additional reporting columns to be configured](https://docs.payments.service.gov.uk/api_reference/create_a_payment_reference/#json-body-parameters-for-39-create-a-payment-39).
This is useful if you wish to filter payments in GOV.UK Pay. In FCDO's case, it is useful to filter by country selected by the user.

You may add static values, or values based on the user's answer. You may only configure 10 reporting columns as per
GOV.UK Pay's limits, and ensure that each columnName is <30 characters. The values may be 100 characters.

```json5
{
  //..
  additionalReportingColumns: [
    {
      columnName: "country",
      fieldPath: "beforeYouStart.country", // the path in the state object to retrieve the value from. If the value is in a section, use the format {sectionName}.{fieldName}.
    },
    {
      columnName: "post",
      fieldPath: "post",
    },
    {
      columnName: "service",
      staticValue: "fee 11",
    },
  ],
}
```

If the value at the fieldPath cannot be found, the column will not be added to the metadata.

Given the user state looks like

```.ts
const state = {
  beforeYouStart: {
    country: "United Kingdom",
  }
}
```

This will be parsed and sent to GOV.UK Pay as:

```.ts
 const requestOptions = {
  //.. GOV.UK Pay request
  metadata: {
    country: "United Kingdom",
    // no post key since it's not present in the user's state,
    service: "fee 11"
  }
 }
```

When viewing this payment in GOV.UK Pay, you can sort by these columns, and will appear as "metadata" in their interface.

## Additional payment metadata

With fee options, there is the possibility to send through more payment metadata to your webhook outputs. This metadata will tell your webhook about the status of the payment, the payment id, and the payment reference.

If you require this metadata, add the `sendAdditionaPayMetadata` option to your webhook output configuration as below:

```json5
{
  name: "outputName",
  title: "Webhook output",
  type: "webhook",
  outputConfiguration: {
    url: "https://some-url.com",
    sendAdditionalPayMetadata: true,
  },
}
```

## Other - Reference numbers

Reference numbers are generated with the alphabet "1234567890ABCDEFGHIJKLMNPQRSTUVWXYZ-\_". Note that the letter O is omitted.

You may configure the length of the reference number by setting the environment variable `PAY_REFERENCE_LENGTH`. The default is 10 characters.
Use [Nano ID Collision Calculator](https://zelark.github.io/nano-id-cc/) to determine the right length for your service.
Since each user will "keep" their own reference number for multiple attempts, calculate the speed at unique users per hour.

e.g. If your service expects 100,000 users per annum, you should expect ~274 users per day, and 11 users per hour.
Using nano-id-cc, and a reference length of 10 characters it will take 102 years, or 9 million IDs generated for a 1% chance of collision.
