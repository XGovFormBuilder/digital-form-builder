import Component from "./component";
import { optionalText } from "./constants";
import joi from "joi";

export default class FormComponent extends Component {
  constructor(def, model) {
    super(def, model);
    this.isFormComponent = true;
    this.__lang = "en"; // set default language

    const { schema } = this;

    schema.error = (errors) => {
      errors.forEach((err) => {
        let limit;
        const today = new Date().setUTCHours(0, 0, 0);
        if (err.context?.limit) {
          limit = err.context.limit.setUTCHours(0, 0, 0);
        }

        const limitIsToday = limit === today;

        switch (err.type) {
          case "any.empty":
            err.message = `${err.context.label} is required`;
            break;
          case "any.required":
            err.message = `${err.context.label} is required`;
            break;
          case "number.base":
            err.message = `${err.context.label} must be a number`;
            break;
          case "string.base":
            err.message = `${err.context.label} is required`;
            break;
          case "string.email":
            err.message = `${err.context.label} must be a valid email address`;
            break;
          case "string.regex.base":
            err.message = `Enter a valid ${err.context.label.toLowerCase()}`;
            break;
          case "date.min":
            if (limitIsToday) {
              err.message = `${err.context.label} must be in the future`;
            } else {
              err.message = `${
                err.context.label
              } can be no earlier than ${limit.getDate()}/${
                limit.getMonth() + 1
              }/${limit.getFullYear()}`;
            }
            break;
          case "date.max":
            if (limitIsToday) {
              err.message = `${err.context.label} must be in the past`;
            } else {
              err.message = `${
                err.context.label
              } can be no later than ${limit.getDate()}/${
                limit.getMonth() + 1
              }/${limit.getFullYear()}`;
            }
            break;
          default:
            break;
        }
      });
      return errors;
    };
  }

  get lang() {
    return this.__lang;
  }

  set lang(lang) {
    if (lang) {
      this.__lang = lang;
    }
  }

  getFormDataFromState(state) {
    const name = this.name;

    if (name in state) {
      return {
        [name]: this.getFormValueFromState(state),
      };
    }
  }

  getFormValueFromState(state) {
    const name = this.name;

    if (name in state) {
      return state[name] === null ? "" : state[name].toString();
    }
  }

  getStateFromValidForm(payload) {
    const name = this.name;

    return {
      [name]: this.getStateValueFromValidForm(payload),
    };
  }

  getStateValueFromValidForm(payload) {
    const name = this.name;

    return name in payload && payload[name] !== "" ? payload[name] : null;
  }

  localisedString(description) {
    let string;
    if (!description) {
      string = "";
    } else if (typeof description === "string") {
      string = description;
    } else {
      string = description[this.lang] ? description[this.lang] : description.en;
    }
    return string;
  }

  getViewModel(formData, errors) {
    const options = this.options;
    const isOptional = options.required === false;
    const optionalPostfix =
      isOptional && options.optionalText !== false ? optionalText : "";
    this.lang = formData.lang;
    const label = options.hideTitle
      ? ""
      : `${this.localisedString(this.title)}${optionalPostfix}`;

    const name = this.name;

    const model = {
      label: {
        text: label,
        classes: "govuk-label--s",
      },
      id: name,
      name: name,
      value: formData[name],
    };

    if (this.hint) {
      model.hint = {
        html: this.localisedString(this.hint),
      };
    }

    if (options.classes) {
      model.classes = options.classes;
    }

    if (options.condition) {
      model.condition = options.condition;
    }

    if (errors) {
      errors.errorList.forEach((err) => {
        if (err.name === name) {
          model.errorMessage = {
            text: err.text,
          };
        }
      });
    }

    return model;
  }

  getFormSchemaKeys() {
    return { [this.name]: joi.any() };
  }

  getStateSchemaKeys() {
    return { [this.name]: joi.any() };
  }

  getDisplayStringFromState(state) {
    return state[this.name];
  }

  get dataType() {
    return "text";
  }
}
