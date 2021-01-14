import { ComponentDef } from "../components/types";

export interface Page {
  title: string;
  path: string;
  controller: string;
  components?: ComponentDef[];
  section: string; // the section ID
  next?: { path: string; condition?: string }[];
}

export interface Section {
  name: string;
  title: string;
}

export interface List {
  name: string;
  title: string;
  type: "string" | "number";
  items: {
    text: string;
    value: string;
    description: string;
    condition: string; // the ID of the condition stored in dataModel.conditions
  }[];
}

export interface Feedback {
  feedbackForm?: boolean;
  url?: string;
}

export type PhaseBanner = {
  phase?: "alpha" | "beta";
  feedbackUrl?: string;
};
