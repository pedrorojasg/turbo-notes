export interface Category {
  id: number;
  name: string;
  color: string;
  is_default: boolean;
  note_count: number;
}

export interface Note {
  id: number;
  title: string;
  content: string;
  category_id: number;
  category_name: string;
  category_color: string;
  created_at: string;
  updated_at: string;
}
