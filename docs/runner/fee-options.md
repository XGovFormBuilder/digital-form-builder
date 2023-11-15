# Fee options

`feeOptions` is a top level property in a form json. Fee options are used to configure API keys for GOV.UK Pay, and the behaviour of retrying payments. 


```.json5
{
  // pages, sections, conditions etc ..
  "feeOptions": {
  /**
   * If a payment is required, but the user fails, allow the user to skip payment
   * and submit the form. this is the default behaviour.
   *
   * Any versions AFTER (and not including) v3.25.68-rc.927 allows this behaviour
   * to be configurable. If you do not want payment to be skippable, set
   * `allowSubmissionWithoutPayment: false`
   */
  "allowSubmissionWithoutPayment": true,

  /**
   * The maximum number of times a user can attempt to pay before the form is auto submitted.
   * There is no limit when allowSubmissionWithoutPayment is false. (The user can retry as many times as they like).
   */
  "maxAttempts": 3,

  /**
   * A supplementary error message (`customPayErrorMessage`)
   */
  "customPayErrorMessage": "Custom error message",
  }
}
```

As a failsafe, if a user was not able to pay, we will allow them to try up to 3 times (`maxRetries`), then auto submit (`"allowSubmissionWithoutPayment": true`).
This is the default behaviour. Makes sure you check your organisations policy or legislative requirements. You must ensure there is a process to remediate payment failures.

When a user fails a payment, they will see the page [pay-error](./../../runner/src/server/views/pay-error.html).

When `allowSubmissionsWithoutPayment` is true, the user will also see a link which allows them to skip payment. 


## Recommendations 

If your service does not allow submission without payment, set 
`allowSubmissionWithoutPayment: false`. `maxAttempts` will have no effect. The user will be able to retry as many times as they like.
You can provide them with `customPayErrorMessage` to provide them with another route to payment.  

