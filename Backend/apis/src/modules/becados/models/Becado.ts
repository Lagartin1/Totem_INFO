export interface Becado {
  nombre?: string;
  titulo?: string;
  descripcion?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface BecadosSearchResult {
  becados: Becado[];
  total: number;
}
