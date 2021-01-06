import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";

export const fetchDataById = createAsyncThunk(
  "data/fetchByIdStatus",
  async (id, thunkAPI) => {
    const response = await window.fetch(`/api/${id}/data`);
    const data = await response.json();
    return data;
  }
);

export const saveData = createAsyncThunk(
  "data/saveDataStatus",
  async (data, thunkAPI) => {
    const { id } = thunkAPI.getState().data;
    const response = await window.fetch(`${id}/api/data`, {
      method: "put",
      // dodgy hack to ensure get methods are called
      body: JSON.stringify(data),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    return response;
  }
);

const initialState = {
  id: "",
  previewUrl: "",
  loaded: false,
  data: {},
  downloadedAt: "",
  updatedAt: "",
};

export const dataSlice = createSlice({
  name: "data",
  initialState,
  reducers: {
    initDesigner(state, action) {
      state.id = action.payload.id;
      state.previewUrl = action.payload.previewUrl;
    },
    updateDownloadedAt(state, action) {
      state.downloadedAt = action.payload;
    },
  },
  extraReducers: {
    [fetchDataById.fulfilled]: (state, action) => {
      state.loaded = true;
      state.data = action.payload;
    },
    [saveData.fulfilled]: (state, action) => {
      state.data = action.payload;
      state.updatedAt = new Date().toLocaleTimeString();
    },
  },
});

export const { initDesigner, updateDownloadedAt } = dataSlice.actions;

export default dataSlice.reducer;
