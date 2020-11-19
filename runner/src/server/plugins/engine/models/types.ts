import type { Fees } from "../../../services/payService";

export type Fields = {
  key: string;
  title: string;
  type: string;
  answer: string | number | boolean;
}[];

export type Questions = {
  category: string | null;
  question: string;
  fields: Fields;
  index?: number;
}[];

export type WebhookData = {
  name: string;
  metadata: any;
  fees?: Fees;
  questions: Questions;
};
