// src/store/index.ts
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

import appReducer from "./appSlice";

// 创建store
const store = configureStore({
  reducer: {
    app: appReducer, // 假设你的app reducer在这里
  },
});

// 导出RootState类型（整个store的状态类型）
export type RootState = ReturnType<typeof store.getState>;
// 导出AppDispatch类型（dispatch的类型）
export type AppDispatch = typeof store.dispatch;

// （可选）创建类型化的useDispatch钩子（避免每次手动指定类型）
export const useAppDispatch = () => useDispatch<AppDispatch>();
// 创建类型化的useSelector钩子（关键：让useSelector感知RootState）
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
