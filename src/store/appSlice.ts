import { PayloadAction, createSlice } from "@reduxjs/toolkit";

import { AppState, CcState, EdState, PocState, RsState, StState } from "@/types/reduxTypes";

const initialState: AppState = {
  st: JSON.parse(sessionStorage.getItem("st") || "{}"),
  rs: JSON.parse(sessionStorage.getItem("rs") || "{}"),
  cc: JSON.parse(sessionStorage.getItem("cc") || "{}"),
  poc: JSON.parse(sessionStorage.getItem("poc") || "{}"),
  ed: JSON.parse(sessionStorage.getItem("ed") || "{}"),
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSt_state(state, action: PayloadAction<StState>) {
      state.st = action.payload;
      sessionStorage.setItem("st", JSON.stringify(action.payload));
    },
    setRs_state(state, action: PayloadAction<RsState>) {
      state.rs = action.payload;
      sessionStorage.setItem("rs", JSON.stringify(action.payload));
    },
    setCc_state(state, action: PayloadAction<CcState>) {
      state.cc = action.payload;
      sessionStorage.setItem("cc", JSON.stringify(action.payload));
    },
    setPoc_state(state, action: PayloadAction<PocState>) {
      state.poc = action.payload;
      sessionStorage.setItem("poc", JSON.stringify(action.payload));
    },
    setEd_state(state, action: PayloadAction<EdState>) {
      state.ed = action.payload;
      sessionStorage.setItem("ed", JSON.stringify(action.payload));
    },
  },
});

export const { setSt_state, setCc_state, setPoc_state, setEd_state, setRs_state } =
  appSlice.actions;

export default appSlice.reducer;
