import { ConditionRawData } from ".";
import { ComponentDef } from "../components/types";

export interface Next {
  path: string;
  condition?: string;
}
export type Link = Next;

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

export interface Item {
  text: string;
  value: string | number | boolean;
  description?: string;
  condition?: string;
}

export interface List {
  name: string;
  title: string;
  type: "string" | "number" | "boolean";
  items: Item[];
}

export interface Feedback {
  feedbackForm?: boolean;
  url?: string;
}

export type PhaseBanner = {
  phase?: "alpha" | "beta";
  feedbackUrl?: string;
};

export type FormDefinition = {
  pages: Page[];
  conditions: ConditionRawData[];
  lists: List[];
  sections: Section[];
  startPage?: Page["path"] | undefined;
  name?: string | undefined;
  feedback?: Feedback;
  phaseBanner?: PhaseBanner;
  fees: any[];
  skipSummary?: boolean | undefined;
  outputs: any[];
  declaration?: string | undefined;
  metadata?: Record<string, any>;
  payApiKey?: string | undefined;
};
