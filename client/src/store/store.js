import { configureStore } from "@reduxjs/toolkit";
import uiSlice from "./ui-slice";
import userSlice from "./user-slice";
import postSlice from "./post-slice";




const store = configureStore({reducer: {
    ui: uiSlice.reducer,
    user: userSlice.reducer,
    posts: postSlice.reducer
}});


export default store;