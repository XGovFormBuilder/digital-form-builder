export type Label = {
  text: string;
  classes: string;
  html?: string;
  isPageHeading?: boolean;
};

export type Content = {
  title?: string;
  text: string;
  condition?: any; // TODO
};

export type ListItemLabel = Omit<Label, "text" | "isPageHeading">;

export type ListItem = {
  text?: string;
  value: string | boolean | number;
  hint?: {
    html: string;
  };
  checked?: boolean;
  selected?: boolean;
  label?: ListItemLabel;
};

// TODO: Break this down for each component (Same as model/Component).
export type ViewModel = {
  label?: Label;
  type?: string;
  id?: string;
  name?: string;
  value?: any; // TODO
  hint?: {
    html: string;
  };
  classes?: string;
  condition?: any; // TODO
  errorMessage?: {
    text: string;
  };
  summaryHtml?: string;
  html?: any; // TODO
  attributes: {
    maxlength?: number;
    multiple?: string;
    accept?: string;
    step?: string;
  };
  content?: Content | Content[] | string;
  rows?: number;
  items?: ListItem[];
  disableLookup?: boolean;
  fieldset?: {
    legend?: Label;
  };
  children?: ComponentCollectionViewModel;
};

export type ComponentCollectionViewModel = {
  type: string;
  isFormComponent: boolean;
  model: ViewModel;
}[];
