import { launchBrowser } from "../utils/launchBrowser.js";
import { filterUniqueByPrice } from "../utils/filterUniqueByPrice.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeShoppingChina = async (query) => {
  const url = `https://www.shoppingchina.com.py/site/search?query=${encodeURIComponent(query)}&filter=4`;
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  await page.waitForSelector('.product-item', { timeout: 5000 }).catch(() => null);
  const products = await page.$$('.product-item');

  // Extraer logo de la tienda (elige el logo visible en desktop)
  let logoStore = await page.$eval('.d-flex.pt-3.pb-3.m-0 img.d-none.d-sm-block', img => img.getAttribute('src')).catch(() => null);
  if (logoStore && logoStore.startsWith('/')) {
    logoStore = 'https://www.shoppingchina.com.py' + logoStore;
  }

  const result = [];
  for (const product of products) {
    const image = await product.$eval('img.card-img-top', img => img.getAttribute('src')).catch(() => null);
    const name = await product.$eval('span.lightning-prod-desc', el => el.innerText.trim()).catch(() => null);
    let price = await product.$eval('h5.card-title', el => el.innerText.trim()).catch(() => null);
    let link = await product.$eval('a', a => a.getAttribute('href')).catch(() => null);
    if (link && link.startsWith('/')) {
      link = 'https://www.shoppingchina.com.py' + link;
    }
    // Limpiar y convertir el precio usando la función utilitaria
    const priceNumber = cleanPrice(price);
    // Extraer id del producto desde el link (número al final de la URL)
    let id = null;
    if (link) {
      const match = link.match(/-(\d+)$/);
      if (match) id = match[1];
    }
    // Solo productos con precio mayor a 1.000.000 Gs
    if (image && name && priceNumber > 1000000 && link) {
      result.push({ image, name, price: priceNumber, link, logoStore, id });
    }
  }

  // Filtrar productos con precios duplicados usando la función utilitaria
  const uniqueResults = filterUniqueByPrice(result);

  await browser.close();
  return uniqueResults;
}
