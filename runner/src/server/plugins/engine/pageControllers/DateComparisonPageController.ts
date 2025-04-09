import joi from "joi";
import { PageController } from "./PageController";
import { format, parseISO } from "date-fns";
import { FormSubmissionErrors } from "../types";
import { subMonths } from "date-fns";

/**
 * DateComparisonPageController validates that:
 * 1. Dates are not in the future
 * 2. Most recent case onset date is not before the first case onset date
 */

export class DateComparisonPageController extends PageController {
  firstDateComponent: any;
  secondDateComponent: any;
  firstDateName: string;
  secondDateName: string;

  constructor(model: any = {}, pageDef: any = {}) {
    super(model, pageDef);

    this.firstDateName = pageDef?.options?.firstDateComponent || "";
    this.secondDateName = pageDef?.options?.secondDateComponent || "";

    this.firstDateComponent =
      pageDef?.components?.find(
        (component) => component.name === this.firstDateName
      ) || null;

    this.secondDateComponent =
      pageDef?.components?.find(
        (component) => component.name === this.secondDateName
      ) || null;

    this.stateSchema = this.stateSchema.append({
      [this.firstDateName]: joi
        .date()
        .required()
        .max("now") // Prevents dates in the future
        .min(subMonths(new Date(), 2)) // Prevents dates more than 2 months in the past
        .messages({
          ...this.firstDateComponent?.options?.customValidationMessages,
        }),
    });

    if (this.secondDateComponent) {
      this.stateSchema = this.stateSchema.append({
        [this.secondDateName]: joi
          .date()
          .required()
          .min(joi.ref(this.firstDateName)) // Ensures most recent date is not before first date
          .max("now") // Prevents dates in the future
          .messages({
            ...this.secondDateComponent?.options?.customValidationMessages,
          }),
      });
    }
  }

  getErrors(validationResult): FormSubmissionErrors | undefined {
    if (!validationResult?.error) {
      return undefined;
    }
    const errors = validationResult.error.details;
    const formItems = this.components.formItems;

    const formatDateMessage = (message: string) => {
      return message.replace(isoRegex, (text) =>
        format(parseISO(text), "d MMMM yyyy")
      );
    };

    const findTitle = (fieldName: string) => {
      return (
        formItems.find((item) => item.name === fieldName)?.title ||
        "Title not found"
      );
    };
    const isoRegex = /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/;

    const errorList = errors.map((err) => {
      let name = err.path.join("__");
      let title = findTitle(name.split("__")[0]);
      let text = formatDateMessage(err.message);

      return {
        path: err.path.join("."),
        href: `#${name}`,
        name: name,
        title: title,
        text: text,
        type: err.type,
        value: err.context.value,
      };
    });

    const addCustomErrors = (errorList) => {
      const errorMap = {};

      // Populate the errorMap with the base name and suffix
      errorList.forEach((err) => {
        const baseName = err.name.split("__")[0];
        const suffix = err.name.match(/__(day|month|year)$/)?.[0];

        if (!errorMap[baseName]) {
          errorMap[baseName] = {
            baseName: baseName,
            day: false,
            month: false,
            year: false,
            errors: [],
            name: err.name,
          };
        }

        if (suffix === "__day") errorMap[baseName].day = true;
        if (suffix === "__month") errorMap[baseName].month = true;
        if (suffix === "__year") errorMap[baseName].year = true;

        errorMap[baseName].errors.push(err);
      });

      // Process the errorMap to set text based on combinations and add to finalErrors
      const finalErrors: any = [];
      Object.values(errorMap).forEach((e: any) => {
        if (e.day && e.year && e.month) {
          e.errors.forEach((err) => {
            if (e.name.includes(this.firstDateName)) {
              err.text = this.firstDateComponent?.options?.customValidationMessages?.dayMonthYear;
            }
            if (this.secondDateComponent) {
              if (e.name.includes(this.secondDateName)) {
                err.text = this.secondDateComponent?.options?.customValidationMessages?.dayMonthYear;
              }
            }
          });
        }

        // New condition to handle number.base errors
        const numberBaseErrors = e.errors.filter(
          (err) =>
            err.type === "number.base" &&
            err.value !== undefined &&
            err.value !== ""
        );

        if (numberBaseErrors.length > 0) {
          numberBaseErrors.forEach((err) => {
            if (e.name.includes(this.firstDateName)) {
              err.text = this.firstDateComponent?.options?.customValidationMessages?.nonNumeric;
            }
            if (e.name.includes(this.secondDateName)) {
              err.text = this.secondDateComponent?.options?.customValidationMessages?.nonNumeric;
            }
            err.type = "custom.numberBase";
          });
        }

        finalErrors.push(...e.errors);
      });

      return finalErrors;
    };

    const processedErrorList = addCustomErrors(errorList);

    return {
      titleText: this.errorSummaryTitle,
      errorList: processedErrorList.filter(
        ({ text }, index) =>
          index === errorList.findIndex((err) => err.text === text)
      ),
    };
  }
}
