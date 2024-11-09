import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  clientEyeTableInfo: [],
};

export const clientEyeTableInfoSlice = createSlice({
  name: "clientEyeTableInfo",
  initialState,
  reducers: {
    setClientEyeTableInfo: (state, action) => {
      const clientEyeTableInfo = action.payload;
      state.clientEyeTableInfo = clientEyeTableInfo;
    },
  },
});

export const { setClientEyeTableInfo } = clientEyeTableInfoSlice.actions;

export default clientEyeTableInfoSlice.reducer;
