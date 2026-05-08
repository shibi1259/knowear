import { StateContextType } from '@/types/providers/stateProvider.types';
import { createContext } from 'react';

export const StateContext = createContext<StateContextType>({} as StateContextType);

