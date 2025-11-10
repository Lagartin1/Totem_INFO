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