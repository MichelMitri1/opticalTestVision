import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

export const itemsSlice = createSlice({
  name: "items",
  initialState,
  reducers: {
    setItems: (state, action) => {
      const items = action.payload;
      state.items = items;
    },
  },
});

export const { setItems } = itemsSlice.actions;

export default itemsSlice.reducer;
