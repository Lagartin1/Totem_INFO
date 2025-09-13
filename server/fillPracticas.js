import { faker } from "@faker-js/faker";
import axios from "axios";

const TOTAL = 50;

async function generarPracticas() {
  for (let i = 0; i < TOTAL; i++) {
    const practica = {
      labores: faker.hacker.phrase(),
      sede_practica: faker.location.city(),
      nombre_contacto: faker.person.fullName(),
      telefono_contacto: faker.phone.number("#########"),
      cargo_contacto: faker.person.jobTitle(),
      email_contacto: faker.internet.email(),
      regimen_trabajo: faker.helpers.arrayElement(["Full-time", "Part-time", "Por proyecto"]),
      requisitos_especiales: faker.hacker.adjective(),
      modalidad: faker.helpers.arrayElement(["Presencial", "Remoto", "Híbrido"]),
      beneficios: faker.company.catchPhrase(), // <- aquí está el cambio
      nombre_empresa: faker.company.name(),
    };

    try {
      await axios.post("http://localhost:4000/api/practicas", practica);
      console.log(`Práctica ${i + 1} creada`);
    } catch (err) {
      console.error("Error al crear práctica", err.message);
    }
  }
}

generarPracticas();
