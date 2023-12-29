import { configureStore } from '@reduxjs/toolkit';
import userReducer from './reducers/userReducer';

const store = configureStore({
  reducer: {
    user: userReducer,
  },
  // 여기에 필요한 다른 옵션을 추가할 수 있습니다.
});

export default store;