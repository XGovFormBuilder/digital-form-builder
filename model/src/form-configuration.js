// @flow

export class FormConfiguration {
  Key: string;
  DisplayName: string;
  LastModified: ?string;

  constructor (Key: string, DisplayName: ?string, LastModified: ?string) {
    if (!Key) {
      throw Error('Form configuration must have a key')
    }
    this.Key = Key
    this.DisplayName = DisplayName || Key
    this.LastModified = LastModified
  }
}
