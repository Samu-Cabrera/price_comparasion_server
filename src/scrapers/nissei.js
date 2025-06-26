import { launchBrowser } from "../utils/launchBrowser.js";
import { filterUniqueByPrice } from "../utils/filterUniqueByPrice.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeNissei = async (query) => {
  const url = `https://nissei.com/py/catalogsearch/result/index/?q=${encodeURIComponent(query)}`;
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('li.product-item', { timeout: 5000 }).catch(() => null);
  const products = await page.$$('li.product-item');

  // Extraer logo de la tienda (solo una vez por página)
  const logoStore = await page.$eval('.menu-logo .logo-top img', img => img.getAttribute('src')).catch(() => null);

  const result = [];
  for (const product of products) {
    const image = await product.$eval('a.product-item-photo img', img => img.getAttribute('data-src') || img.getAttribute('src')).catch(() => null);
    const name = await product.$eval('h2.product-item-name a', a => a.innerText.trim()).catch(() => null);
    let price = await product.$eval('.price-container .price', el => el.innerText.trim()).catch(() => null);
    const link = await product.$eval('h2.product-item-name a', a => a.getAttribute('href')).catch(() => null);
    // Limpiar y convertir el precio usando la función utilitaria
    const priceNumber = cleanPrice(price);
    // Extraer id del producto desde el link (última parte después del último guion bajo o slash)
    let id = null;
    if (link) {
      const match = link.match(/([\w-]+)$/);
      if (match) id = match[1];
    }
    if (image && name && price && link) {
      result.push({ image, name, price: priceNumber, link, logoStore, id });
    }
  }

  // Filtrar productos con precios duplicados usando la función utilitaria
  const uniqueResults = filterUniqueByPrice(result);

  await browser.close();
  return uniqueResults;
}
