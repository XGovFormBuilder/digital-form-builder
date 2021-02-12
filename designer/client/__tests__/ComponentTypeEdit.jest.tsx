import React, { useReducer } from "react";
import { render } from "@testing-library/react";
import ComponentTypeEdit from "../ComponentTypeEdit";
import {
  ComponentContext,
  componentReducer,
  initComponentState,
} from "../reducers/component/componentReducer";
import { DataContext } from "../context";
import { initI18n } from "../i18n";
import { Data } from "@xgovformbuilder/model";

initI18n();

describe("ComponentTypeEdit", () => {
  let mockData: Data;

  const RenderWithContext = ({ children, stateProps = {} }) => {
    const [state, dispatch] = useReducer(
      componentReducer,
      initComponentState({
        ...stateProps,
      })
    );

    return (
      <DataContext.Provider value={{ data: mockData, save: jest.fn() }}>
        <ComponentContext.Provider value={{ state, dispatch }}>
          {children}
        </ComponentContext.Provider>
      </DataContext.Provider>
    );
  };

  beforeEach(() => {
    mockData = new Data({
      pages: [
        {
          title: "First page",
          path: "/first-page",
          components: [],
          controller: "./pages/summary.js",
          section: "home",
        },
      ],
      lists: [],
    } as any);
  });

  describe("Checkbox", () => {
    let stateProps;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "CheckboxesField",
          name: "TestCheckbox",
          options: {},
        },
      };
    });

    test("title input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the name to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("help text input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the description to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("hide title checkbox hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Tick this box if you do not want the title to show on the page";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("component name input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces.";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("make checkbox field optional hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const labelText = "Make Checkboxes field optional";
      const hintText =
        "Tick this box if users do not need to complete this field to progress through the form";

      expect(getByText(labelText)).toBeInTheDocument();
      expect(getByText(hintText)).toBeInTheDocument();
    });

    test("select list hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Select a list to use for this field. You can either create a component list which is specific to this component, or a list that is available to other components from the Lists screen. You must save before creating a component list, or you can select an existing list.";
      expect(getByText(text)).toBeInTheDocument();
    });
  });

  describe("Radios", () => {
    let stateProps;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "RadiosField",
          name: "TestRadios",
          options: {},
        },
      };
    });

    test("title input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the name to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("help text input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the description to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("hide title checkbox hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Tick this box if you do not want the title to show on the page";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("component name input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces.";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("make checkbox field optional hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const labelText = "Make Radios field optional";
      const hintText =
        "Tick this box if users do not need to complete this field to progress through the form";

      expect(getByText(labelText)).toBeInTheDocument();
      expect(getByText(hintText)).toBeInTheDocument();
    });

    test("select list hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Select a list to use for this field. You can either create a component list which is specific to this component, or a list that is available to other components from the Lists screen. You must save before creating a component list, or you can select an existing list.";
      expect(getByText(text)).toBeInTheDocument();
    });
  });

  describe("Select", () => {
    let stateProps;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "SelectField",
          name: "TestSelect",
          options: {},
        },
      };
    });

    test("title input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the name to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("help text input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the description to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("hide title checkbox hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Tick this box if you do not want the title to show on the page";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("component name input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces.";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("make checkbox field optional hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const labelText = "Make Select field optional";
      const hintText =
        "Tick this box if users do not need to complete this field to progress through the form";

      expect(getByText(labelText)).toBeInTheDocument();
      expect(getByText(hintText)).toBeInTheDocument();
    });

    test("select list hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Select a list to use for this field. You can either create a component list which is specific to this component, or a list that is available to other components from the Lists screen. You must save before creating a component list, or you can select an existing list.";
      expect(getByText(text)).toBeInTheDocument();
    });
  });

  describe("YesNo", () => {
    let stateProps;

    beforeEach(() => {
      stateProps = {
        component: {
          type: "YesNoField",
          name: "TestYesNo",
          options: {},
        },
      };
    });

    test("title input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the name to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("help text input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text = "Enter the description to show for this component";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("hide title checkbox hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "Tick this box if you do not want the title to show on the page";
      expect(getByText(text)).toBeInTheDocument();
    });

    test("component name input hint text is rendered correctly", () => {
      const { getByText } = render(
        <RenderWithContext stateProps={stateProps}>
          <ComponentTypeEdit page={mockData.pages[0]} />
        </RenderWithContext>
      );

      const text =
        "This is generated automatically and does not show on the page. Only change it if you are using an integration that requires you to, for example GOV.UK Notify. It must not contain spaces.";
      expect(getByText(text)).toBeInTheDocument();
    });
  });
});
