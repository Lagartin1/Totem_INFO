const { Builder, By, until } = require("selenium-webdriver");
const fs = require("fs");
const path = require("path");

// URLs
const ADMIN_BASE_URL = process.env.ADMIN_BASE_URL || "http://localhost:5174/admin";
const FRONTEND_BASE_URL = process.env.FRONTEND_BASE_URL || "http://localhost:5173";
const ADMIN_BECADOS_URL = `${ADMIN_BASE_URL}/becados`;
const FRONTEND_BECADOS_URL = `${FRONTEND_BASE_URL}/becados`;

// Credenciales
const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin";

function generarNombreBecado() {
  const ahora = new Date();
  const stamp = [
    ahora.getFullYear(),
    String(ahora.getMonth() + 1).padStart(2, "0"),
    String(ahora.getDate()).padStart(2, "0"),
    String(ahora.getHours()).padStart(2, "0"),
    String(ahora.getMinutes()).padStart(2, "0"),
    String(ahora.getSeconds()).padStart(2, "0"),
  ].join("");
  return `Becado QA ${stamp}`;
}

function crearImagenPNG() {
  // Crear una imagen PNG simple 1x1 px en memoria
  const buffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0x99, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x3b, 0xb6, 0xee, 0x56, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const tempPath = path.join(__dirname, "temp_imagen.png");
  fs.writeFileSync(tempPath, buffer);
  return tempPath;
}

async function intentarLoginSiHaceFalta(driver) {
  const loginButton = await driver.findElements(By.css("#login-button"));
  if (loginButton.length === 0) {
    console.log("[INFO] Ya está autenticado.");
    return;
  }

  console.log("[INFO] Pantalla de login detectada. Autenticando...");

  if (!ADMIN_USER || !ADMIN_PASSWORD) {
    throw new Error(
      "Se detectó login pero faltan ADMIN_USER y ADMIN_PASSWORD."
    );
  }

  const inputUser = await driver.findElement(By.css("input[name='username'][type='text']"));
  const inputPassword = await driver.findElement(By.css("input[name='password'][type='password']"));

  await inputUser.clear();
  await inputUser.sendKeys(ADMIN_USER);
  await inputPassword.clear();
  await inputPassword.sendKeys(ADMIN_PASSWORD);

  await driver.findElement(By.css("#login-button")).click();

  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return !currentUrl.endsWith("/admin/") && !currentUrl.endsWith("/admin");
  }, 15000);
  
  console.log("[✓] Autenticación completada.");
}

async function asegurarLoginLimpio(driver) {
  console.log("[INFO] Preparando sesión limpia de autenticación...");

  await driver.get(`${ADMIN_BASE_URL}/`);
  await driver.manage().deleteAllCookies();
  await driver.executeScript("window.localStorage.removeItem('session');");
  await driver.executeScript("window.sessionStorage.clear();");

  await driver.get(`${ADMIN_BASE_URL}/`);

  const loginButton = await driver.wait(
    until.elementLocated(By.css("#login-button")),
    10000
  );
  await driver.wait(until.elementIsVisible(loginButton), 5000);

  const inputUser = await driver.findElement(By.css("input[name='username'][type='text']"));
  const inputPassword = await driver.findElement(By.css("input[name='password'][type='password']"));

  await inputUser.clear();
  await inputUser.sendKeys(ADMIN_USER);
  await inputPassword.clear();
  await inputPassword.sendKeys(ADMIN_PASSWORD);
  await loginButton.click();

  await driver.wait(async () => {
    const currentUrl = await driver.getCurrentUrl();
    return currentUrl.includes("/dashboard");
  }, 15000);

  console.log("[✓] Login limpio realizado correctamente.");
}

async function abrirModalAgregarBecado(driver) {
  const botonAgregar = await driver.wait(
    until.elementLocated(
      By.xpath("//button[.//h3[contains(normalize-space(),'Agregar Becado')]]")
    ),
    20000
  );

  await driver.wait(until.elementIsVisible(botonAgregar), 5000);
  await driver.executeScript(
    "arguments[0].scrollIntoView({block: 'center', inline: 'center'});",
    botonAgregar
  );
  await driver.sleep(250);

  try {
    await botonAgregar.click();
  } catch (error) {
    const msg = String(error && error.message ? error.message : error);
    if (!msg.toLowerCase().includes("intercept")) {
      throw error;
    }

    // Fallback cuando algún elemento del carrusel queda por encima del botón.
    await driver.executeScript("arguments[0].click();", botonAgregar);
  }
  console.log("[INFO] Botón 'Agregar Becado' clickeado.");

  await driver.wait(
    until.elementLocated(
      By.xpath("//h3[contains(normalize-space(),'Agregar Nuevo Becado')]")
    ),
    10000
  );
  
  await driver.sleep(800);
  console.log("[✓] Modal abierto y listo.");
}

async function completarFormularioBecado(driver, nombreBecado, imagenPath) {
  console.log("[INFO] Rellenando formulario de becado...");
  
  // Nombre
  const inputNombre = await driver.wait(
    until.elementLocated(By.css("input[name='nombre']")),
    15000
  );
  await driver.wait(until.elementIsVisible(inputNombre), 8000);
  await driver.sleep(300);
  await inputNombre.click();
  await inputNombre.clear();
  await driver.sleep(100);
  await inputNombre.sendKeys(nombreBecado);
  console.log(`[✓] Nombre: "${nombreBecado}"`);
  await driver.sleep(300);

  // Título
  const inputTitulo = await driver.wait(
    until.elementLocated(By.css("input[name='titulo']")),
    15000
  );
  await driver.wait(until.elementIsVisible(inputTitulo), 8000);
  await driver.sleep(300);
  await inputTitulo.click();
  await inputTitulo.clear();
  await driver.sleep(100);
  const tituloUnico = `Perfil ${nombreBecado}`;
  await inputTitulo.sendKeys(tituloUnico);
  console.log(`[✓] Título ingresado: "${tituloUnico}"`);
  await driver.sleep(300);

  // Descripción
  const inputDescripcion = await driver.wait(
    until.elementLocated(By.css("textarea[name='descripcion']")),
    15000
  );
  await driver.wait(until.elementIsVisible(inputDescripcion), 8000);
  await driver.sleep(300);
  await inputDescripcion.click();
  await inputDescripcion.clear();
  await driver.sleep(100);
  await inputDescripcion.sendKeys("Becado de excelencia académica.");
  console.log("[✓] Descripción ingresada.");
  await driver.sleep(300);

  // Fecha de publicación
  const inputFecha = await driver.wait(
    until.elementLocated(By.css("input[name='fecha_publicacion']")),
    15000
  );
  await driver.wait(until.elementIsVisible(inputFecha), 8000);
  await driver.sleep(300);
  await inputFecha.click();
  await inputFecha.clear();
  await driver.sleep(100);
  
  const fechaHoy = new Date();
  const fechaFormato = fechaHoy.toISOString().split('T')[0];
  await inputFecha.sendKeys(fechaFormato);
  console.log(`[✓] Fecha: ${fechaFormato}`);
  await driver.sleep(300);

  // Imagen de portada (REQUERIDA)
  const inputPortada = await driver.wait(
    until.elementLocated(By.css("input[name='portada']")),
    15000
  );
  await driver.wait(until.elementIsVisible(inputPortada), 8000);
  await driver.sleep(300);
  await inputPortada.sendKeys(imagenPath);
  console.log("[✓] Imagen de portada subida.");
  await driver.sleep(500);

  console.log("[✓] Formulario completado.");

  return { tituloUnico };
}

async function guardarBecado(driver) {
  const botonGuardar = await driver.wait(
    until.elementLocated(
      By.xpath("//button[@type='submit' and contains(normalize-space(),'Guardar')]")
    ),
    15000
  );
  await driver.wait(until.elementIsVisible(botonGuardar), 8000);
  await driver.sleep(300);
  await botonGuardar.click();
  console.log("[INFO] Botón Guardar presionado...");

  // Espera alert
  await driver.wait(until.alertIsPresent(), 15000);
  const alerta = await driver.switchTo().alert();
  const textoAlerta = await alerta.getText();
  await alerta.accept();

  if (!textoAlerta.toLowerCase().includes("agregado")) {
    throw new Error(`Alert inesperado: "${textoAlerta}"`);
  }
  console.log("[✓] Becado guardado exitosamente.");
}

async function verificarBecadoEnFrontend(driver, tituloBecado) {
  console.log(`[INFO] Navegando a Frontend para verificar becado: "${tituloBecado}"`);
  
  await driver.get(FRONTEND_BECADOS_URL);
  console.log("[INFO] Página de Becados en Frontend cargada.");
  
  // Espera a que cargue el contenido
  await driver.sleep(2000);

  // Busca por título porque la card pública renderiza itemInfo.titulo en el card.
  const tituloCard = await driver.wait(
    until.elementLocated(
      By.xpath(`//h1[contains(normalize-space(),'${tituloBecado}')]`)
    ),
    25000
  );

  await driver.wait(until.elementIsVisible(tituloCard), 10000);
  const textoCard = (await tituloCard.getText()).trim();

  if (!textoCard.includes(tituloBecado)) {
    throw new Error(`Becado no visible en tótem. Esperado título: "${tituloBecado}"`);
  }

  console.log(`[✓] Becado verificado en Frontend por título: "${textoCard}"`);
}

async function testRegistrarBecado() {
  const driver = await new Builder().forBrowser("chrome").build();
  let imagenPath = null;

  try {
    const nombreBecado = generarNombreBecado();
    imagenPath = crearImagenPNG();

    console.log(`\n=== TEST: Registrar Becado e Integración al Tótem ===`);
    console.log(`Becado: "${nombreBecado}"\n`);

    // ============ ADMIN: Crear becado ============
    console.log("[PASO 1] Abriendo FrontendAdmin...");
    await driver.get(ADMIN_BECADOS_URL);
    console.log("[INFO] Página cargada.");

    await asegurarLoginLimpio(driver);

    await driver.get(ADMIN_BECADOS_URL);
    await driver.wait(
      until.elementLocated(By.xpath("//h2[contains(normalize-space(),'Becados')]")),
      20000
    );
    console.log("[✓] Página de Becados en Admin lista.\n");

    console.log("[PASO 2] Abriendo modal para agregar becado...");
    await abrirModalAgregarBecado(driver);
    console.log("");
    
    console.log("[PASO 3] Llenando formulario...");
    const { tituloUnico } = await completarFormularioBecado(driver, nombreBecado, imagenPath);
    console.log("");
    
    console.log("[PASO 4] Guardando becado...");
    await guardarBecado(driver);
    console.log("");
    
    // Pequeña pausa para que el backend procese
    await driver.sleep(2000);

    // ============ FRONTEND: Verificar becado ============
    console.log("[PASO 5] Verificando integración en el Tótem (Frontend)...");
    await verificarBecadoEnFrontend(driver, tituloUnico);
    console.log("");

    console.log(`\n[✓ ÉXITO] Test completado - Becado registrado e integrado correctamente.\n`);
  } catch (error) {
    console.error(`\n[✗ FALLO] ${error.message}\n`);
    
    try {
      const screenshot = await driver.takeScreenshot();
      const timestamp = Date.now();
      const screenshotPath = `tests/error_screenshot_${timestamp}.png`;
      fs.writeFileSync(screenshotPath, screenshot, "base64");
      console.error(`📸 Screenshot: ${screenshotPath}`);
    } catch (e) {
      // silent
    }

    process.exitCode = 1;
  } finally {
    // Limpiar archivo temporal de imagen
    if (imagenPath && fs.existsSync(imagenPath)) {
      try {
        fs.unlinkSync(imagenPath);
      } catch (e) {
        // silent
      }
    }
    await driver.quit();
  }
}

testRegistrarBecado();

