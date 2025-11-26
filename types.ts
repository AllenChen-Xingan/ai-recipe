export interface Recipe {
  id: string;
  title: string;
  description: string;
  cookingTimeMinutes: number;
  ingredients: string[];
  steps: string[];
  nutritionalHighlights: string;
  chefTips: string;
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export type ViewState = 'HOME' | 'FAVORITES';