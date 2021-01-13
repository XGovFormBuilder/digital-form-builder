export type ListItemHook = {
  handleTitleChange: (e) => void;
  handleConditionChange: (e) => void;
  handleValueChange: (e) => void;
  handleHintChange: (e) => void;
  prepareForDelete: <T>(data: T, index?: number) => T;
  prepareForSubmit: <T>(data: T) => T;
  validate: (i18n: any) => boolean;
  value: any;
  condition: any;
  title: string;
  hint: string;
  isStaticList: boolean;
};
