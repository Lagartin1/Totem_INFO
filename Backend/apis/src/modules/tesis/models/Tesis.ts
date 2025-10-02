export interface Tesis {
  titulo?: string;
  profesor?: string;
  area_desarrollo?: string;
  descripcion?: string;
  autor?: string;
  universidad?: string;
  facultad?: string;
  palabras_clave?: string;
  resumen?: string;
  created_at?: string;
  [key: string]: unknown;
}

export interface TesisSearchResult {
  tesis: Tesis[];
  total: number;
}
