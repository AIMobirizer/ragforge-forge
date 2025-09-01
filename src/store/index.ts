import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import appReducer from './slices/appSlice';
import authReducer from './slices/authSlice';
import documentsReducer from './slices/documentsSlice';
import searchReducer from './slices/searchSlice';
import chatReducer from './slices/chatSlice';
import analyticsReducer from './slices/analyticsSlice';
import mcpReducer from './slices/mcpSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    auth: authReducer,
    documents: documentsReducer,
    search: searchReducer,
    chat: chatReducer,
    analytics: analyticsReducer,
    mcp: mcpReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'app/setConnectionManager',
          'chat/streamMessage/pending',
          'chat/streamMessage/fulfilled',
          'chat/streamMessage/rejected',
        ],
        ignoredPaths: [
          'app.connectionManager',
          'chat.streaming',
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;