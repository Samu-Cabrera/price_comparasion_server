import { launchBrowser } from "../utils/launchBrowser.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeShoppingChinaDetails = async (url) => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  // 1. Nombre de la tienda
  const store = "Shopping China";

  // 2. Nombre del producto
  const name = await page.$eval('h3.text-uppercase', el => el.innerText.trim()).catch(() => null);

  // 3. Imágenes (todas las del carousel)
  let images = await page.$$eval('#prodCarousel .carousel-inner img', imgs => imgs.map(img => img.src)).catch(() => []);
  images = Array.from(new Set(images.filter(Boolean)));

  // 4. Precio
  let price = await page.$eval('h2.sc-text-primary', el => el.innerText.trim()).catch(() => null);
  let priceNumber = null;
  if (price) {
    priceNumber = cleanPrice(price);
  }

  // 5. Características (no hay tabla, dejar vacío)
  const features = [];

  // 6. Descripción (unir todos los trix-content)
  let description = await page.$$eval('.trix-content', els => els.map(el => el.innerText.trim()).join(' ')).catch(() => null);

  // 7. Calificación
  let rating = await page.$eval('.rateit', el => el.getAttribute('data-rateit-value')).catch(() => null);
  if (rating) rating = Number(rating);

  // 8. Disponibilidad (si el botón Agregar está habilitado)
  let availability = await page.$('button#buy-now:not([disabled])') ? 'En stock' : 'Sin stock';

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