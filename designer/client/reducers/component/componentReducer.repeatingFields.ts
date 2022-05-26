import { RepeatingFields} from "./types";

export function repeatingFieldsReducer(
  state,
  action: {
    type: RepeatingFields;
    payload: any;
  }
) {
  const { type, payload } = action;
  const { selectedComponent } = state;

  switch (type) {
     case RepeatingFields.ADD_ROW:
      console.log('called not?')
      return {
        
        selectedComponent: 
            { ...selectedComponent, items: payload}
      };

     case RepeatingFields.EDIT_ROW:
        return {
          selectedComponent: { ...selectedComponent, items: payload },
        };

     case RepeatingFields.DELETE_ROW:
        return {
          selectedComponent: { ...selectedComponent, items: payload },
        };
  }

}