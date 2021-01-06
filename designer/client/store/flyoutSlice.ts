import { createSlice } from "@reduxjs/toolkit";

export const flyoutSlice = createSlice({
  name: "flyoutCount",
  initialState: 0,
  reducers: {
    increment: (state) => state + 1,
    decrement: (state) => state - 1,
  },
});

export const { increment, decrement } = flyoutSlice.actions;

export default flyoutSlice.reducer;
