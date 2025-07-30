// authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  accessToken: null,
  expiresAt: null,
  user: null,
  reportSetting: null,
  subscription:'Free Trial'
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action) {
      console.log(action.payload)
      const { user, token, reportSetting } = action.payload;
      state.accessToken = token;
    //  state.expiresAt = expiresAt;
      state.user = user;
      state.reportSetting = reportSetting;
    },
    updateCredentials(state, action) {
      const { user,token, reportSetting } = action.payload;
      if (token !== undefined) state.accessToken = token;
    
      if (user !== undefined) state.user = { ...state.user, ...user };
      if (reportSetting !== undefined) {
        state.reportSetting = { ...state.reportSetting, ...reportSetting };
      }
    },
    logout(state) {
      state.accessToken = null;
      state.expiresAt = null;
      state.user = null;
      state.reportSetting = null;
    },
    updateSubscription(state,action){
     //  const{subscriptionPlan} =action.payload;
       state.subscription = action.payload;
    }
  },
});

export const { setCredentials, updateCredentials, logout,updateSubscription } = authSlice.actions;
export default authSlice.reducer;
