// Global type definitions
import { RootState } from '../store';

declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION__: any;
  }
}

declare module '@reduxjs/toolkit' {
  // Định nghĩa lại RootState để có thể truy cập các thuộc tính
  interface DefaultRootState extends RootState {}
}

export {};
