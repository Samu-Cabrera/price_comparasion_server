import { launchBrowser } from "../utils/launchBrowser.js";
import { cleanPrice } from "../utils/cleanPrice.js";

export const scrapeTopTechnologyDetails = async (url) => {
  const browser = await launchBrowser();
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: 'domcontentloaded' });

  const store = "Top Technology";
  const name = await page.$eval('h1.product_title', el => el.innerText.trim()).catch(() => null);
  let images = await page.$$eval('.woocommerce-product-gallery__wrapper img', imgs => imgs.map(img => img.getAttribute('src')).filter(Boolean)).catch(() => []);
  images = Array.from(new Set(images));

  let priceWeb = await page.$$eval('.elementor-widget-button .woocommerce-Price-amount.amount', els => els.map(el => el.innerText.trim())).catch(() => []);
  let price = null;
  if (priceWeb.length > 0) price = cleanPrice(priceWeb[0]);
  let priceTransfer = null;
  if (priceWeb.length > 1) priceTransfer = cleanPrice(priceWeb[1]);

  let features = await page.$$eval('.table-striped tr', trs => trs.map(tr => {
    const tds = tr.querySelectorAll('td');
    if (tds.length === 2) {
      return tds[0].innerText.replace(/\s+/g, ' ').trim() + ': ' + tds[1].innerText.replace(/\s+/g, ' ').trim();
    }
    return null;
  }).filter(Boolean)).catch(() => []);

  let description = await page.$eval('.woocommerce-product-details__short-description', el => el.innerText.trim()).catch(() => null);

  const rating = null;

  // 8. Disponibilidad (si el botón Añadir al carrito está habilitado)
  let availability = await page.$('button.single_add_to_cart_button:not([disabled])') ? 'En stock' : 'Sin stock';

  const link = url;

  await browser.close();
  return {
    store,
    name,
    images,
    price,
    priceTransfer,
    features,
    description,
    rating,
    availability,
    link
  };
}; 