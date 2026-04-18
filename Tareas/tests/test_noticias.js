const { Builder, By, until } = require("selenium-webdriver");

const UI_BASE_URL = process.env.UI_BASE_URL || "http://localhost:5173";
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const UI_NOTICIAS_URL = `${UI_BASE_URL}/`;
const API_NOTICIAS_URL = `${API_BASE_URL}/api/noticias?indice=0`;

async function obtenerNoticiasDesdeApi() {
    const response = await fetch(API_NOTICIAS_URL);

    if (!response.ok) {
        throw new Error(`No se pudo consultar la API de noticias: ${response.status}`);
    }

    const data = await response.json();
    const noticias = data.noticias || data.data || [];

    if (!Array.isArray(noticias) || noticias.length === 0) {
        throw new Error("La API no devolvio noticias para validar.");
    }

    return noticias;
}

function extraerResumenPlano(contenido) {
    if (!contenido || typeof contenido !== "string") return "";

    try {
        const parsed = JSON.parse(contenido);
        if (!Array.isArray(parsed?.blocks)) return "";

        return parsed.blocks
            .map((b) => b?.data?.text || b?.data?.content || "")
            .join(" ")
            .replace(/<[^>]+>/g, " ")
            .replace(/\s+/g, " ")
            .trim();
    } catch {
        return contenido.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }
}

async function clickSeguro(driver, element) {
    try {
        await element.click();
    } catch {
        await driver.executeScript("arguments[0].click();", element);
    }
}

async function testNoticias() {
    const driver = await new Builder().forBrowser("chrome").build();

    try {
        const noticias = await obtenerNoticiasDesdeApi();
        const cantidadAValidar = 3;

        if (noticias.length < cantidadAValidar) {
            throw new Error(`Se requieren al menos ${cantidadAValidar} noticias en API y solo hay ${noticias.length}.`);
        }

        await driver.get(UI_NOTICIAS_URL);

        for (let i = 0; i < cantidadAValidar; i += 1) {
            const noticia = noticias[i];
            const tituloEsperado = (noticia.titulo || "").trim();
            const fechaEsperada = new Date(noticia.fecha_publicacion).toLocaleDateString();
            const resumenEsperado = extraerResumenPlano(noticia.contenido || "");
            const resumenFragmento = resumenEsperado.slice(0, 30);

            if (!tituloEsperado || !fechaEsperada || !resumenFragmento) {
                throw new Error(`La noticia ${i + 1} no tiene titulo, fecha o resumen validos.`);
            }

            const indicador = `button[aria-label='Ir a la noticia ${i + 1}']`;
            await driver.wait(until.elementLocated(By.css(indicador)), 15000);
            await clickSeguro(driver, await driver.findElement(By.css(indicador)));

            await driver.wait(
                until.elementLocated(By.xpath("//div[contains(@class,'w-[900px]') and contains(@class,'cursor-pointer')]")),
                15000
            );
            await clickSeguro(
                driver,
                await driver.findElement(By.xpath("//div[contains(@class,'w-[900px]') and contains(@class,'cursor-pointer')]"))
            );

            const tituloModal = await driver.wait(until.elementLocated(By.css("h1")), 10000);
            const tituloUi = (await tituloModal.getText()).trim();

            if (tituloUi !== tituloEsperado) {
                throw new Error(`Titulo incorrecto en noticia ${i + 1}. UI='${tituloUi}' API='${tituloEsperado}'`);
            }

            const lineaInfo = await driver.findElement(By.css("p.text-sm"));
            const infoTexto = await lineaInfo.getText();
            if (!infoTexto.includes(fechaEsperada)) {
                throw new Error(`Fecha no visible en noticia ${i + 1}. Esperada='${fechaEsperada}' Texto='${infoTexto}'`);
            }

            const contenido = await driver.findElement(By.css("div.mt-2.text-lg"));
            const contenidoTexto = await contenido.getText();
            if (!contenidoTexto.includes(resumenFragmento)) {
                throw new Error(`Resumen no visible en noticia ${i + 1}.`);
            }

            await clickSeguro(driver, await driver.findElement(By.xpath("//button[normalize-space()='Volver']")));
            await driver.wait(async () => (await driver.findElements(By.css("h1"))).length === 0, 10000);

            console.log(`OK -> ${tituloEsperado} | ${fechaEsperada}`);
        }

        console.log("Prueba finalizada: nombre, fecha y resumen visibles en al menos 3 noticias.");
    } catch (error) {
        console.error("Fallo la prueba de noticias:", error);
        process.exitCode = 1;
    } finally {
        await driver.quit();
    }
}

testNoticias();
