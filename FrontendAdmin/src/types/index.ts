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
  descripcion: string;
  contenido: string;
  autor: string;
  fecha_publicacion: string;
  imagen?: string;
}