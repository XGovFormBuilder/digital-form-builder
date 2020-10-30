export class FormConfiguration {
  Key: string;
  DisplayName: string;
  LastModified: string | undefined;
  feedbackForm: boolean | undefined;

  constructor(
    Key: string,
    DisplayName?: string,
    LastModified?: string,
    feedbackForm?: boolean
  ) {
    if (!Key) {
      throw Error("Form configuration must have a key");
    }
    this.Key = Key;
    this.DisplayName = DisplayName || Key;
    this.LastModified = LastModified;
    this.feedbackForm = feedbackForm || false;
  }
}
