export type Label = {
  text: string;
  classes: string;
  html?: string;
  isPageHeading?: boolean;
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
  content?: {
    title: string;
    text: string;
    condition?: any; // TODO
  }[];
  rows?: number;
  items?: any;
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
