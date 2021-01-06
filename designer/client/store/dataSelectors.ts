import { RootState } from "./rootReducer";
import { customAlphabet } from "nanoid";
import { createSelector } from "@reduxjs/toolkit";

/**
 * Custom alphabet is required because '-' is used as a symbol in
 * expr-eval (condition logic) so components which include a '-' in the name
 * result in broken conditions
 */
const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz",
  10
);

export const getId = () => {
  return nanoid();
};

export const getData = (state: RootState) => state.data;

const dataSelector = (state) => state.data.data;

export const getDataAsObject = createSelector(dataSelector, (data) => {
  return data;
});
