import { launchBrowser } from "../utils/launchBrowser.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeNisseiDetails = async (url) => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 1. Nombre de la tienda
  const store = "Nissei";

  // 2. Nombre del producto
  let name = await page.$eval('.product-info-main h1, .product-info-main span', el => el.innerText.trim()).catch(() => null);
  if (!name) {
    name = await page.title();
  }

  // 3. Omitir imágenes
  const images = [];

  // 4. Precio
  let price = await page.$eval('.price-box .price, .price-container .price', el => el.innerText.trim()).catch(() => null);
  // Limpiar precio a número
  let priceNumber = null;
  if (price) {
    priceNumber = cleanPrice(price);
  }

  // 5. Características
  let features = await page.$$eval('.product.attribute.overview .value li', lis => lis.map(li => li.innerText.trim())).catch(() => []);

  // 6. Descripción
  let description = await page.$eval('.product.attribute.overview .value', el => el.innerText.trim()).catch(() => null);

  // 7. Calificación (no visible en HTML, devolver null)
  const rating = null;

  // 8. Disponibilidad
  let availability = await page.$eval('.stock.available span', el => el.innerText.trim()).catch(() => null);
  if (availability && availability.toLowerCase().includes('en stock')) {
    availability = 'En stock';
  } else if (availability) {
    availability = 'Sin stock';
  } else {
    availability = null;
  }

  // 9. Enlace del producto
  const link = url;

  await browser.close();
  return {
    store,
    name,
    images,
    price: priceNumber,
    features,
    description,
    rating,
    availability,
    link
  };
}; 