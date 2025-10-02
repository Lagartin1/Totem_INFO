export interface Proyecto {
  titulo?: string;
  profesores?: string;
  area_desarrollo?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface ProyectosSearchResult {
  proyectos: Proyecto[];
  total: number;
}
