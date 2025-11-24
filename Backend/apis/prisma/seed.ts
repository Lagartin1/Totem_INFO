import { PrismaClient } from '@prisma/client';
import { practicasData } from './data/practicas.ts';
import { noticiasData } from './data/noticias.ts';
import { becadosData } from './data/becados.ts';
import { proyectosData } from './data/proyectos.ts';
import { workshopsData } from './data/workshops.ts';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
//import {girasData} from "./data/giras.ts"; <- por si acaso

const prisma = new PrismaClient();

const __filename = fileURLToPath(import.meta.url);

// 2. Obtén el directorio del archivo
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, "../config/.env");
console.log("Cargando .env desde:", envPath);

// Indica a dotenv que cargue el .env desde esa ruta
dotenv.config({ path: envPath });


async function main() {
  console.log('🌱 Iniciando Seed...');
  console.log('🗑️  Limpiando datos antiguos...');
  
  // El orden importa si tienes relaciones estrictas, pero en Mongo es más flexible.
  await prisma.practica.deleteMany(); 
  await prisma.noticia.deleteMany(); 
  await prisma.becado.deleteMany();
  await prisma.proyecto.deleteMany();
  await prisma.workshop.deleteMany();
  //await prisma.gira.deleteMany();

  // 1. UPSERT DEL ADMIN (La traducción de tu comando docker)
  // Busca un usuario con username 'admin'. Si no existe, lo crea con tus datos exactos.
  // Si ya existe, no hace nada (update: {}) y nos devuelve sus datos.
  const admin = await prisma.usuario.upsert({
    where: { username: 'admin' },
    update: {}, 
    create: {
      nombre: 'Admin',
      apellido: 'Principal',
      email: 'admin@example.com',
      username: 'admin',
      password: '$2b$10$rD9O4AsOI86kzAJNb0sDo.qKkwuyo13N00JSwH8AimBgsZ1SRCZKa', // Tu hash de 'test123'
      isActive: true,
      failedLoginAttempts: 0,
    },
  });
  //PRACTICAS SEED
  console.log(`👤 Admin general detectado/creado con ID: ${admin.id}`);
  const practicasConAutor = practicasData.map((p) => ({
    ...p,
    autorId: admin.id, // <--- Aquí solucionamos el error de tipos
  }));

  console.log(`🚀 Insertando ${practicasConAutor.length} prácticas...`);
  
  const resultadoPracticas = await prisma.practica.createMany({
    data: practicasConAutor
  });

  console.log(`✅ Seed finalizado. Se insertaron ${resultadoPracticas.count} registros de Practicas.`);
  //END PRACTICAS SEED

  // NOTICIAS SEED
  const noticiasConAutor = noticiasData.map((n) => ({
    ...n,
    autorId: admin.id, 
  }));

  console.log(`📰 Insertando ${noticiasConAutor.length} noticias...`);
  const resultadoNoticias = await prisma.noticia.createMany({
    data: noticiasConAutor
  });
  console.log(`✅ Noticias finalizadas. Se insertaron ${resultadoNoticias.count} registros de Noticias.`);
  // END NOTICIAS SEED

  // BECADOS SEED
  const becadoConAutor = becadosData.map((b) => ({
    ...b,
    autorId: admin.id, 
  }));
    console.log(`🎓 Insertando ${becadoConAutor.length} becados...`);
    const resultadoBecados = await prisma.becado.createMany({
      data: becadoConAutor
    });
    console.log(`✅ Becados finalizados. Se insertaron ${resultadoBecados.count} registros de Becados.`);
    // END BECADOS SEED

    // PROYECTOS SEED
    const proyectosConAutor = proyectosData.map((pr) => ({
      ...pr,
      autorId: admin.id, 
    }));
    console.log(`💻 Insertando ${proyectosConAutor.length} proyectos...`);
    const resultadoProyectos = await prisma.proyecto.createMany({
      data: proyectosConAutor
    });
    console.log(`✅ Proyectos finalizados. Se insertaron ${resultadoProyectos.count} registros de Proyectos.`);
    // END PROYECTOS SEED

    // WORKSHOPS SEED
    const workshopsConAutor = workshopsData.map((w) => ({
      ...w,
      autorId: admin.id, 
    }));
    console.log(`🛠️  Insertando ${workshopsConAutor.length} workshops...`);
    const resultadoWorkshops = await prisma.workshop.createMany({
      data: workshopsConAutor
    });
    console.log(`✅ Workshops finalizados. Se insertaron ${resultadoWorkshops.count} registros de Workshops.`);
    // END WORKSHOPS SEED

    //GIRAS SEED <- Descomentar cuando se use
    //const girasConAutor = workshopsData.map((g) => ({
    //  ...g,
    //  autorId: admin.id, 
    //}));
    //console.log(`🛠️  Insertando ${workshopsConAutor.length} workshops...`);
    //const resultadoGiras = await prisma.gira.createMany({
    //  data: workshopsConAutor
    //});
    //console.log(`✅ Giras finalizadas. Se insertaron ${resultadoGiras.count} registros de Giras.`);

}//end main


main()
  .catch((e) => {
    console.error('Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });