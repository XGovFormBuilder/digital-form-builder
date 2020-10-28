type ComponentName = "TextField" | "NumberField";

export type ConditionalComponentType = {
  name: ComponentName;
  title: string;
  subType: "field";
};

const conditionalComponentTypes: ConditionalComponentType[] = [
  {
    name: "TextField",
    title: "Text field",
    subType: "field",
  },
  {
    name: "NumberField",
    title: "Number field",
    subType: "field",
  },
];

export default conditionalComponentTypes;
