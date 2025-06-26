import { chromium } from "playwright";

/**
 * Lanza una instancia de Chromium preparada para entornos sin sandbox (Railway, Docker, etc.)
 * @returns {Promise<import('playwright').Browser>}
 */
export const launchBrowser = () => {
  return chromium.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage'
    ]
  });
}; 