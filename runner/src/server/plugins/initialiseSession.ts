import { Plugin, RouteOptionsResponseSchema } from "@hapi/hapi";
import joi, { Schema } from "joi";
import {
  Field,
  WebhookSchema,
  webhookSchema,
} from "server/schemas/webhookSchema";
import { merge } from "@hapi/hoek";

type InitialiseSession = {
  whitelist: string[];
};

function fieldToValue(field: Field) {
  const { key, answer } = field;
  return { [key]: answer };
}

function webhookToSessionData(webhook: WebhookSchema & InitialiseSession) {
  const { questions } = webhook;
  return questions.reduce((session, currentQuestion, index) => {
    const { fields, category } = currentQuestion;

    const values = fields
      .map(fieldToValue)
      .reduce((prev, curr) => merge(prev, curr), {});

    if (!category) {
      return { ...session, ...values };
    }

    const existingCategoryInSession = session[category] ?? {};

    return {
      ...session,
      [category]: { ...existingCategoryInSession, ...values },
    };
  }, {});
}

export const initialiseSession: Plugin<InitialiseSession> = {
  name: "initialiseSession",
  register: async function (server, options) {
    const schema = webhookSchema.append({
      callback: joi
        .string()
        .hostname()
        .allow(options.whitelist ?? ""),
    });
    server.route({
      method: "GET",
      path: "/session",
      handler: function (request, h) {
        return h.response(webhookToSessionData(test));
      },
    });
    server.route({
      method: "POST",
      path: "/session/{form}",
      handler: function (request, h) {
        const { payload, params } = request;
        const { cacheService } = request.services([]);
        const state = {
          form: params.form,
        };
      },
      options: {
        validate: {
          payload: schema as RouteOptionsResponseSchema,
        },
      },
    });
  },
};

const test = {
  name: "undefined lawyers-mod",
  questions: [
    {
      question: "Which list of lawyers do you want to be added to?",
      fields: [
        {
          key: "country",
          title: "Country list",
          type: "list",
          answer: "Italy",
        },
      ],
    },
    {
      question: "What size is your company or firm?",
      fields: [
        {
          key: "size",
          title: "Company size",
          type: "list",
          answer: "Large firm (350+ legal professionals)",
        },
      ],
    },
    {
      question:
        "Can you provide legal services and support to customers in English?",
      fields: [
        {
          key: "speakEnglish",
          title: "English language service",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question:
        "Which legal regulator or local bar associations are you registered with?",
      fields: [
        {
          key: "regulators",
          title: "Regulator(s)",
          type: "text",
          answer: "test",
        },
      ],
    },
    {
      question: "Your name ",
      fields: [
        {
          key: "firstAndMiddleNames",
          title: "First and middle names",
          type: "text",
          answer: "a",
        },
        {
          key: "familyName",
          title: "Last name",
          type: "text",
          answer: "b",
        },
      ],
    },
    {
      question: "Company name and address",
      category: "company details",
      fields: [
        {
          key: "organisationName",
          title: "Company name",
          type: "text",
          answer: "a",
        },
        {
          key: "addressLine1",
          title: "Address line 1",
          type: "text",
          answer: "b",
        },
        {
          key: "addressLine2",
          title: "Address line 2",
          type: "text",
          answer: "c",
        },
        {
          key: "city",
          title: "Town or city ",
          type: "text",
          answer: "d",
        },
        {
          key: "postcode",
          title: "Post code / area code",
          type: "text",
          answer: "e",
        },
        {
          key: "addressCountry",
          title: "Country",
          type: "list",
          answer: "United Kingdom",
        },
      ],
    },
    {
      question: "Email address",
      fields: [
        {
          key: "emailAddress",
          title: "Email address",
          type: "text",
          answer: "Jennifer.Duong@digital.fco.gov.uk",
        },
        {
          key: "publishEmail",
          title: "Can we publish this email address on GOV.UK?",
          type: "list",
          answer: "Yes",
        },
      ],
    },
    {
      question: "Phone number",
      fields: [
        {
          key: "phoneNumber",
          title: "Phone number",
          type: "text",
          answer: "07927178683",
        },
        {
          key: "emergencyPhoneNumber",
          title: "Emergency / out of hours number",
          type: "text",
          answer: "1111",
        },
      ],
    },
    {
      question: "Full website address (Optional)",
      fields: [
        {
          key: "websiteAddress",
          title: "Website",
          type: "text",
          answer: null,
        },
      ],
    },
    {
      question: "Which regions do you serve?",
      fields: [
        {
          key: "regions",
          title: "Regions covered",
          type: "text",
          answer: "a",
        },
      ],
    },
    {
      question: "In what areas of law are you qualified to practise? ",
      fields: [
        {
          key: "areasOfLaw",
          title: "Areas of law practised",
          type: "list",
          answer: ["Bankruptcy", "Corporate", "Criminal"],
        },
      ],
    },
    {
      question: "Can you provide legal aid to British nationals?",
      fields: [
        {
          key: "legalAid",
          title: "Can you provide legal aid to British nationals?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Can you offer pro bono service to British nationals?",
      fields: [
        {
          key: "proBono",
          title: "Can you offer pro bono service to British nationals?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Have you represented British nationals before?",
      fields: [
        {
          key: "representedBritishNationals",
          title: "Have you represented British nationals before?",
          type: "list",
          answer: true,
        },
      ],
    },
    {
      question: "Declaration",
      fields: [
        {
          key: "declaration",
          title: "Declaration",
          type: "list",
          answer: ["confirm"],
        },
      ],
    },
  ],
  metadata: {
    paymentSkipped: false,
  },
};
