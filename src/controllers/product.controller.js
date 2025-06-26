import { scrapeNissei } from "../scrapers/nissei.js";
import { scrapeShoppingChina } from "../scrapers/shopping-china.js";
import { scrapeNisseiDetails } from "../scrapers/nissei-details.js";
import { scrapeShoppingChinaDetails } from "../scrapers/shopping-china-details.js";
import { scrapeTopTechnology } from "../scrapers/toptechnology.js";
import { scrapeTopTechnologyDetails } from "../scrapers/toptechnology-details.js";

export const getProducts = async (req, res) => {
    const query = req.query.q;
    const page = parseInt(req.query.page) || 1;
    const pageSize = 10;
    if (!query) return res.status(400).json({ error: 'Falta el parámetro ?q=' });

    try {
        // Ejecutar todos los scrapers en paralelo
        const [productsNissei, productsShoppingChina, productsTopTechnology] = await Promise.all([
            scrapeNissei(query),
            scrapeShoppingChina(query),
            scrapeTopTechnology(query)
        ]);
        // Mezcla robusta intercalada
        const allStores = [productsNissei, productsShoppingChina, productsTopTechnology];
        const mixedProducts = [];
        let index = 0;
        let added = true;
        while (added) {
            added = false;
            for (const store of allStores) {
                if (store[index]) {
                    mixedProducts.push(store[index]);
                    added = true;
                }
            }
            index++;
        }
        // Paginación
        const start = (page - 1) * pageSize;
        const end = start + pageSize;
        const paginatedProducts = mixedProducts.slice(start, end);
        res.status(200).json({
            page,
            pageSize,
            total: mixedProducts.length,
            totalPages: Math.ceil(mixedProducts.length / pageSize),
            products: paginatedProducts
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}

export const getProductDetails = async (req, res) => {
    const url = req.query.url;
    if (!url) return res.status(400).json({ error: 'Falta el parámetro ?url=' });
    try {
        let details;
        if (url.includes('nissei.com')) {
            details = await scrapeNisseiDetails(url);
        } else if (url.includes('shoppingchina.com.py')) {
            details = await scrapeShoppingChinaDetails(url);
        } else if (url.includes('toptechnology.com.py')) {
            details = await scrapeTopTechnologyDetails(url);
        } else {
            return res.status(400).json({ error: 'Tienda no soportada' });
        }
        res.status(200).json(details);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal server error" });
    }
}
