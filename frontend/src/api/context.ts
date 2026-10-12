import { createContext, useContext } from 'react';
import { createApi, type Api } from './client';

export const ApiContext = createContext<Api>(createApi());

export function useApi(): Api {
  return useContext(ApiContext);
}
