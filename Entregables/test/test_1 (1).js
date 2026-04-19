const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function aceptarAlertaSiExiste(driver, timeout = 5000) {
  try {
    await driver.wait(until.alertIsPresent(), timeout);
    const alert = await driver.switchTo().alert();
    const text = await alert.getText();
    await alert.accept();
    return text;
  } catch {
    return null;
  }
}

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

async function retryAction(actionFn, retries = 3, delay = 300) {
  let lastErr;
  for (let i = 0; i < retries; i++) {
    try {
      return await actionFn();
    } catch (e) {
      lastErr = e;
      const isStale = (e && (e.name === 'StaleElementReferenceError' || (e.message && e.message.toLowerCase().includes('stale element'))));
      if (!isStale) throw e;
      if (i < retries - 1) await sleep(delay);
    }
  }
  throw lastErr;
}

async function testLoginYNoticias() {
  const options = new chrome.Options();
  // options.addArguments("--headless"); // descomenta si quieres ejecutarlo sin abrir ventana

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    // 1. Abrir login admin
    await driver.get("http://localhost:5173/admin/");

    // 2. Esperar campos del formulario
    const usernameInput = await driver.wait(
      until.elementLocated(By.name("username")),
      10000
    );
    const passwordInput = await driver.wait(
      until.elementLocated(By.name("password")),
      10000
    );

    // 3. Completar credenciales
    await usernameInput.sendKeys("admin");
    await passwordInput.sendKeys("admin");

    // 4. Click en login (con reintento por si el elemento se vuelve stale)
    await retryAction(async () => {
      const loginButton = await driver.wait(until.elementLocated(By.id("login-button")), 5000);
      await driver.executeScript("arguments[0].scrollIntoView(true);", loginButton);
      return loginButton.click();
    });

    // 5. Esperar dashboard
    await driver.wait(until.urlContains("/dashboard"), 10000);

    const tituloDashboard = await driver.wait(
      until.elementLocated(
        By.xpath("//*[contains(text(),'Panel de Administración')]")
      ),
      10000
    );

    const textoDashboard = await tituloDashboard.getText();
    console.log("Dashboard cargado:", textoDashboard);

    // 6. Ir al módulo Noticias
    // 6. Ir al módulo Noticias (click robusto)
    await retryAction(async () => {
      const botonNoticias = await driver.wait(
        until.elementLocated(
          By.xpath("//button[.//h3[contains(.,'Administrar Noticias')]]")
        ),
        10000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", botonNoticias);
      return botonNoticias.click();
    });

    // 7. Verificar navegación a Noticias
    await driver.wait(until.urlContains("/noticias"), 10000);

    const tituloNoticias = await driver.wait(
      until.elementLocated(By.xpath("//*[text()='Noticias']")),
      10000
    );

    console.log(
      "Entró al módulo Noticias:",
      await tituloNoticias.getText()
    );

    // 8. Abrir modal para agregar noticia
    // 8. Abrir modal para agregar noticia (click robusto)
    await retryAction(async () => {
      const botonAgregarNoticia = await driver.wait(
        until.elementLocated(
          By.xpath("//button[.//h3[normalize-space()='Agregar Noticia']]")
        ),
        10000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", botonAgregarNoticia);
      return botonAgregarNoticia.click();
    });

    const tituloModal = await driver.wait(
      until.elementLocated(
        By.xpath("//*[normalize-space()='Agregar Nueva Noticia']")
      ),
      10000
    );
    console.log("Modal visible:", await tituloModal.getText());

    // 9. Completar formulario
    const noticiaId = Date.now();
    const tituloNoticia = `Noticia Selenium ${noticiaId}`;
    const autorNoticia = "QA Selenium";
    const contenidoNoticia = `Contenido de prueba generado ${noticiaId}`;

    // 9. Completar formulario (re-localizar elementos y reintentar si se vuelven stale)
    await retryAction(async () => {
      const inputTitulo = await driver.wait(until.elementLocated(By.name("titulo")), 5000);
      await driver.wait(until.elementIsVisible(inputTitulo), 5000).catch(()=>{});
      return inputTitulo.sendKeys(tituloNoticia);
    });

    await retryAction(async () => {
      const inputAutor = await driver.wait(until.elementLocated(By.name("autor")), 5000);
      await driver.wait(until.elementIsVisible(inputAutor), 5000).catch(()=>{});
      return inputAutor.sendKeys(autorNoticia);
    });

    await retryAction(async () => {
      const editor = await driver.wait(
        until.elementLocated(
          By.css(".codex-editor [contenteditable='true'], .ce-paragraph")
        ),
        10000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", editor);
      await editor.click();
      return editor.sendKeys(contenidoNoticia);
    });

    // 10. Guardar noticia
    // 10. Guardar noticia (click robusto)
    await retryAction(async () => {
      const botonGuardar = await driver.wait(
        until.elementLocated(By.xpath("//button[@type='submit' and normalize-space()='Guardar']")),
        5000
      );
      await driver.executeScript("arguments[0].scrollIntoView(true);", botonGuardar);
      return botonGuardar.click();
    });

    const textoAlerta = await aceptarAlertaSiExiste(driver);
    if (textoAlerta) {
      console.log("Alerta recibida:", textoAlerta);
    }

    // 11. Verificar que la noticia fue creada
    await driver.wait(
      until.elementLocated(
        By.xpath(`//h3[normalize-space()='${tituloNoticia}']`)
      ),
      15000
    );

    console.log("Prueba exitosa. Se agregó la noticia:", tituloNoticia);
  } catch (error) {
    console.error("La prueba falló:", error);
  } finally {
    await driver.quit();
  }
}

testLoginYNoticias();
