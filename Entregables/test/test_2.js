const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");

async function testNavegacionPracticas() {
  const options = new chrome.Options();
  // options.addArguments("--headless"); //

  const driver = await new Builder()
    .forBrowser("chrome")
    .setChromeOptions(options)
    .build();

  try {
    console.log("Iniciando prueba de navegación de usuario...");

    // 1. Abrir la página principal
    await driver.get("http://localhost:5173/");
    
    await driver.manage().window().maximize();
    await driver.sleep(1000); 

    // 2. Hacer clic en "Prácticas"
    const btnPracticas = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Prácticas')]")), 
      5000
    );
    await btnPracticas.click();
    console.log("Menú Prácticas abierto.");

    const btnProfesionales = await driver.wait(
      until.elementLocated(By.xpath("//*[contains(text(), 'Prácticas Profesionales')]")),
      5000
    );
    await btnProfesionales.click();

    await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Ver Más')]")),
      10000 
    );
    console.log("Lista de prácticas cargada.");

    const botonesVerMas = await driver.findElements(By.xpath("//button[contains(text(), 'Ver Más')]"));
    
    const limite = Math.min(3, botonesVerMas.length);
    console.log(`Se encontraron prácticas. Revisando ${limite} de ellas...`);

    for (let i = 0; i < limite; i++) {
      const botonesActualizados = await driver.findElements(By.xpath("//button[contains(text(), 'Ver Más')]"));
      
      await driver.executeScript("arguments[0].click();", botonesActualizados[i]);
      console.log(`Abriendo detalles de práctica #${i + 1}`);

      const botonCerrarModal = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Cerrar')]")),
        5000
      );

      await driver.sleep(2000); 

      await driver.executeScript("arguments[0].click();", botonCerrarModal);
      
      await driver.sleep(1000); 
    }

    const btnInicio = await driver.findElement(By.xpath("//*[contains(text(), 'Inicio')]"));
    await driver.executeScript("arguments[0].click();", btnInicio);
    
    console.log("Prueba exitosa: Volvió a la pantalla de inicio.");

  } catch (error) {
    console.error("La prueba falló:", error);
  } finally {
    await driver.sleep(1000);
    await driver.quit();
  }
}

testNavegacionPracticas();