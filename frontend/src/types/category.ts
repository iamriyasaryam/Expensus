export interface Category {
  id: number;
  name: string;
  icon?: string;
  color?: string;
  created_at?: string;
}

export interface CategoryInput {
  name: string;
  icon?: string;
  color?: string;
}
