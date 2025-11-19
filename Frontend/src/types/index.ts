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