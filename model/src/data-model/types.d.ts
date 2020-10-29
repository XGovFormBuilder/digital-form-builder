import { Component } from "../components/types";

export interface Page {
  title: string;
  path: string;
  controller: string;
  components?: Component[];
  section: string; // the section ID
  next?: { path: string }[];
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
