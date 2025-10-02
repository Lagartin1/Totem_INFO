export interface Noticia {
  titulo?: string;
  descripcion?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface NoticiasSearchResult {
  noticias: Noticia[];
  total: number;
}
