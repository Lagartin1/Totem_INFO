export interface Practica {
  tipo_practica?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface PracticasSearchResult {
  practicas: Practica[];
  total: number;
}
