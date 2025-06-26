import { launchBrowser } from "../utils/launchBrowser.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeTopTechnology = async (query) => {
  const url = `https://toptechnology.com.py/?s=${encodeURIComponent(query)}&post_type=product`;
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const logoStore = "https://toptechnology.com.py/wp-content/uploads/2021/09/logo-top-technology.webp";

  // Esperar a que carguen los productos
  await page.waitForSelector('.product-grid-item', { timeout: 7000 }).catch(() => null);
  const products = await page.$$('.product-grid-item');

  const result = [];
  for (const product of products) {
    const name = await product.$eval('h3.wd-entities-title a', el => el.innerText.trim()).catch(() => null);
    const image = await product.$eval('a.product-image-link img', img => img.getAttribute('src')).catch(() => null);
    let price = await product.$eval('span.price bdi', el => {
      return Array.from(el.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('').trim();
    }).catch(() => null);
    let priceNumber = cleanPrice(price);
    if (!priceNumber) {
      const bdiHtml = await product.$eval('span.price bdi', el => el.innerHTML).catch(() => null);
    }
    // Link
    const link = await product.$eval('h3.wd-entities-title a', a => a.getAttribute('href')).catch(() => null);
    let id = null;
    if (link) {
      const match = link.match(/producto\/([^/]+)/);
      if (match) id = match[1];
    }
    if (name && image && priceNumber && link) {
      result.push({ name, image, price: priceNumber, link, id, logoStore });
    }
  }

  if (result.length === 0) {
    if (products.length > 0) {
      const html = await products[0].evaluate(el => el.outerHTML);
    }
  }

  await browser.close();
  return result;
}; 