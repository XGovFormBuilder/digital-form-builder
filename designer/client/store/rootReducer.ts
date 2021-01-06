import { combineReducers } from "@reduxjs/toolkit";
import dataReducer from "./dataSlice";
import flyoutReducer from "./flyoutSlice";

const rootReducer = combineReducers({
  data: dataReducer,
  flyout: flyoutReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
