import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  users: [],
};

export const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      const users = action.payload;
      state.users = users;
    },
  },
});

export const { setUsers } = usersSlice.actions;

export default usersSlice.reducer;
