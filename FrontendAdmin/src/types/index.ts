export interface Proyecto {
  id: string;
  titulo: string;
  descripcion: string;
  autores: string[] | string;
  fecha_publicacion: string;
  telefono_contacto: string;
  correo_contacto: string;
  area_desarrollo: string;
  videos: string[];
}

export interface Noticia {
  id: string;
  titulo: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}

export interface Becado {
  id: string;
  nombre: string;
  titulo: string;
  descripcion: string;
  fecha_publicacion: string;
  videos: string[];
}

export interface Gira {
  id: string;
  titulo: string;
  descripcion: string;
  anio: string;
  lugares: string[];
  videos: string[];
}

export interface Tesis {
  id: string;
  
  // Campos principales
  titulo: string; // 'title' en tu modelo
  autor: string | string[]; // 'autor' en tu modelo, asumo que puede ser múltiple
  
  // Campos descriptivos
  descripcion?: string;
  resumen?: string;
  palabras_clave?: string; // Podría ser string[] si lo parseas
  
  // Información académica
  profesor?: string;
  area_desarrollo?: string;
  universidad?: string;
  facultad?: string;
  
  // Metadatos
  fecha_publicacion?: string; // O 'created_at'
  visitas?: number; // Para las estadísticas
  
  // Para permitir cualquier otro campo que venga de Elasticsearch
  [key: string]: any;
}