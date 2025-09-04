const { log, PlaywrightCrawler, Sitemap, sleep } = require('crawlee');
const { default: axios, request } = require('axios');
const { chromium } = require('playwright');
const { Ollama } = require('ollama');
const cheerio = require('cheerio');
const Redis = require('ioredis');
const path = require('path');
const fs = require('fs');

class ContentExtractor {
    constructor(schemasPath) {
        this.schemasPath = schemasPath;
        this.schemaCache = new Map();
    }

    loadDomainSchema(domain) {
        if (this.schemaCache.has(domain)) {
            return this.schemaCache.get(domain);
        }

        const schemaPath = path.join(this.schemasPath, `${domain}.json`);
        
        try {
            if (fs.existsSync(schemaPath)) {
                const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                this.schemaCache.set(domain, schema);
                return schema;
            }
        } catch (error) {
            console.warn(`Failed to load schema for domain ${domain}:`, error.message);
        }

        return null;
    }

    async executeSelector(page, selector, type = 'text', attribute = null) {
        if (!selector) return null;

        try {
            if (selector.startsWith('javascript:')) {
                const code = selector.substring(11);
                return await page.evaluate(() => eval(code));
            }

            if (type === 'array') {
                return await page.$$eval(selector, elements =>
                    elements.map(el => el.innerText || el.textContent || '')
                );
            }

            return await page.$$eval(selector, (elements, extractType, attr) => {
                const element = elements[0];
                if (!element) return null;

                switch (extractType) {
                    case 'text':
                        return element.innerText || element.textContent || '';
                    case 'html':
                        return element.innerHTML || '';
                    case 'attribute':
                        return element.getAttribute(attr) || '';
                    default:
                        return element.innerText || element.textContent || '';
                }
            }, type, attribute);
        } catch (error) {
            console.warn(`Selector execution failed: ${selector}`, error.message);
            return null;
        }
    }

    async executeArraySelector(page, selector, mapper) {
        if (!selector) return [];

        try {
            return await page.$$eval(selector, (elements, mapperStr) => {
                const mapperFunc = eval(`(${mapperStr})`);
                return elements.map(mapperFunc).filter(item => item);
            }, mapper.toString());
        } catch (error) {
            console.warn(`Array selector execution failed: ${selector}`, error.message);
            return [];
        }
    }

    async extractMeta(page, metaConfig = {}) {
        const defaultMeta = {
            title: 'title',
            description: 'meta[name="description"]',
            ogTitle: 'meta[property="og:title"]',
            ogDescription: 'meta[property="og:description"]',
            ogImage: 'meta[property="og:image"]',
            ogUrl: 'meta[property="og:url"]',
            keywords: 'meta[name="keywords"]'
        };

        const metaSelectors = { ...defaultMeta, ...metaConfig };
        const meta = {};

        for (const [key, selector] of Object.entries(metaSelectors)) {
            if (key === 'title') {
                meta[key] = await this.executeSelector(page, selector, 'text');
            } else {
                meta[key] = await this.executeSelector(page, selector, 'attribute', 'content');
            }
        }

        if (!meta.ogUrl) {
            try {
                meta.ogUrl = await page.evaluate(() => window.location.href);
            } catch {
                meta.ogUrl = await page.$$eval('meta[property="og:url"]', metas => {
                    if (metas.length === 0) return null;
                    return metas[0].getAttribute('content') || null;
                });
            }
        }

        return meta;
    }

    async extractProduct(page, productConfig) {
        const product = {};

        if (productConfig.content) {
            product.content = await this.executeSelector(page, productConfig.content, 'html');
        }

        if (productConfig.images) {
            product.images = await this.executeArraySelector(
                page, 
                productConfig.images,
                (img) => ({
                    src: img.src || img.getAttribute('data-src') || img.getAttribute('data-lazy'),
                    alt: img.alt || '',
                    title: img.title || ''
                })
            );
        }

        if (productConfig.price) {
            product.price = await this.executeSelector(page, productConfig.price, 'text');
        }

        if (productConfig.availability) {
            product.availability = await this.executeSelector(page, productConfig.availability, 'text');
        }

        if (productConfig.rating) {
            product.rating = await this.executeSelector(page, productConfig.rating, 'text');
        }

        if (productConfig.custom) {
            for (const [key, selector] of Object.entries(productConfig.custom)) {
                product[key] = await this.executeSelector(page, selector, 'text');
            }
        }

        product.meta = await this.extractMeta(page, productConfig.meta);
        return product;
    }

    async extractCategory(page, categoryConfig) {
        const category = {};

        if (categoryConfig.products) {
            category.products = await this.executeArraySelector(
                page,
                categoryConfig.products,
                (el) => ({
                    title: el.querySelector(categoryConfig.productTitle || 'h3, .title, [data-title]')?.innerText || '',
                    url: el.querySelector('a')?.href || '',
                    image: el.querySelector('img')?.src || '',
                    price: el.querySelector(categoryConfig.productPrice || '.price, [data-price]')?.innerText || ''
                })
            );
        }

        if (categoryConfig.pagination) {
            category.pagination = await this.executeArraySelector(
                page,
                categoryConfig.pagination,
                (el) => el.href
            );
        }

        category.meta = await this.extractMeta(page, categoryConfig.meta);
        return category;
    }

    async removeElements(page, removals) {
        const selectors = Object.values(removals).filter(Boolean).join(',');
        if (selectors) {
            await page.$$eval(selectors, elements => 
                elements.forEach(el => el.remove())
            );
        }
    }

    async fallbackExtraction(page, url) {
        return {
            domain: new URL(url).hostname,
            url,
            timestamp: new Date().toISOString(),
            type: 'general',
            content: {
                meta: await this.extractMeta(page),
                content: await page.$$eval('body', bodies => {
                    if (bodies.length === 0) return '';
                    const body = bodies[0];
                    body.querySelectorAll('script, style, nav, footer, header').forEach(el => el.remove());
                    return body.innerText || '';
                }),
                links: await this.executeArraySelector(page, 'a[href]', (el) => el.href)
            }
        };
    }

    async waitForElement(page, selector) {
        try {
            await page.waitForSelector(selector, { timeout: 10000 });
        } catch (error) {}
        const html = await page.content();
        return await cheerio.load(html);
    }

    async extractContent({ page, $, url, request }) {
        const domain = new URL(url).hostname;let html;
        const schema = this.loadDomainSchema(domain);

        if (!schema) {
            // console.log(`No schema found for domain: ${domain}, using fallback extraction`);
            return null;
        }

        try {
            if (schema?.wait4selection?.length) {
                for (const selector of schema?.wait4selection) {
                    $ = await this.waitForElement(page, selector);
                }
            }
            
            if (schema.removals) {
                Object.values(schema.removals).forEach(selector => {
                    $(selector).remove();
                });
            }

            const extractedData = {url, domain, extract: {}, timestamp: Date.now()};

            // --- Recursive extractor ---
            const ObjectWalkerExtractor = async (schemaNode) => {
                if (!schemaNode) return null;

                // Case 1: [selector, operation]
                if (Array.isArray(schemaNode) && schemaNode.length === 2) {
                    const [selector, operation] = schemaNode;
                    const results = [];

                    $(selector).each((i, el) => {
                        const element = $(el);

                        if (operation === 'innerText') {
                            results.push(element.text().trim());
                        } else if (operation === 'html') {
                            results.push(element.html()?.trim());
                        } else {
                            results.push(element.attr(operation) || null);
                        }
                    });

                    return results.length === 1 ? results[0] : results;
                }

                // Case 2: object → recurse
                if (typeof schemaNode === 'object' && !Array.isArray(schemaNode)) {
                    const result = {};
                    for (const key of Object.keys(schemaNode)) {
                        if (key === 'wait4selection' && schemaNode?.wait4selection?.length) {
                            for (const selector of schemaNode?.wait4selection) {
                                $ = await this.waitForElement(page, selector);
                            }
                        }
                        result[key] = await ObjectWalkerExtractor(schemaNode[key]);
                    }
                    return result;
                }

                // Case 3: plain string/other
                return schemaNode;
            };

            
            // --- Product Extraction ---
            if (schema.extract.isProduct) {
                const isProduct = $(schema.extract.isProduct).length > 0;
                if (isProduct && schema.extract.product) {
                    extractedData.extract.isProduct = true;
                    extractedData.extract.product = await ObjectWalkerExtractor(schema.extract.product);
                    // console.log("extractedData.extract.product", extractedData.extract.product)
                }
            }

            // --- Category Extraction ---
            if (schema.extract.isCategory) {
                const isCategory = $(schema.extract.isCategory).length > 0;
                // console.log('Begin Scraping Category', isCategory)
                if (isCategory && schema.extract.category) {
                    extractedData.extract.isCategory = true;
                    extractedData.extract.category = await ObjectWalkerExtractor(schema.extract.category);
                }
            }

            // --- Links Extraction ---
            if (schema.extract.links) {
                extractedData.links = [];
                const [ linkSelector, linkAttr, regix = null ] = schema.extract.links;
                $(linkSelector).each((i, el) => {
                    const href = $(el).attr(linkAttr || 'href');
                    
                    if (href) {
                        const link = this.sortURL(href, regix);
                        link && extractedData.links.push(link);
                    }
                });

                if (this.crawler && extractedData.links.length > 0) {
                    const newRequests = [];
                    for (const link of extractedData.links) {
                        const exists = await this.dbManager.isLinkExists(link);
                        if (!exists) {
                            newRequests.push({ url: link, userData: { link_id: request?.userData?.id } });
                        }
                    }
                    if (newRequests.length > 0) {
                        for await (const { link } of newRequests) {
                            await this.dbManager.updateURL(0, link)
                        }
                        // await this.crawler.addRequests(newRequests);
                    }
                }

            }

            return extractedData;
        } catch (error) {
            console.error(`Error extracting content for ${domain}:`, error);
            return null;
        }
    }

    sortURL(link, regix = null) {
        if (regix === null) {
            const host = new URL(link).hostname;
            const schema = this.loadDomainSchema(host);
            regix = schema.extract.links?.[2];
        }

        if (link && regix) {
            const regex = typeof regix === 'string' ? new RegExp(regix.replace(/^\/|\/$/g, '')) : regix;
            
            if (regex.test(link)) {
                const [ newLink = null ] = link.match(regex);
                return newLink;
            }
        }
        return null;
    }
}

class DatabaseManager {
    constructor(db, tables) {
        this.db = db;
        this.tables = tables;
    }

    async getPendingUrls({ limit = 50 }) {
        return new Promise((resolve, reject) => {
            this.db.query(
                `SELECT id AS i, _source_url AS u FROM ${this.tables.links} WHERE _status = ? LIMIT 0, ?`, 
                ['pending', limit], 
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching pending URLs:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    async getTotalPendingUrls() {
        return new Promise((resolve, reject) => {
            this.db.query(
                `SELECT COUNT(*) AS total FROM ${this.tables.links} WHERE _status = 'pending'`, 
                [], 
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching pending URLs:', err);
                        reject(err);
                    } else {
                        resolve(rows[0].total);
                    }
                }
            );
        });
    }

    async updateContent(id, sourceId, content) {
        return new Promise((resolve, reject) => {
            let contentData = content.data;
            
            if (typeof contentData === 'object') {
                if (contentData?.url) delete contentData.url;
                contentData = JSON.stringify(contentData);
            }

            const isInsert = id === 0;
            const query = isInsert
                ? `INSERT INTO ${this.tables.content} (source_id, content, content_url) VALUES (?, ?, ?)`
                : `UPDATE ${this.tables.content} SET content = ?, _updated_at = CURRENT_TIMESTAMP WHERE source_id = ?`;
            
            const params = isInsert 
                ? [Number(sourceId), contentData, content.url] 
                : [contentData, Number(sourceId)];

            this.db.query(query, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    async updateURL(id = 0, url) {
        return new Promise((resolve, reject) => {
            const isInsert = id === 0;
            const query = isInsert
                ? `INSERT INTO ${this.tables.links} (_source_url, _status) VALUES (?, 'pending') ON DUPLICATE KEY UPDATE _status = 'pending'`
                : `UPDATE ${this.tables.links} SET _source_url = ?, _status = 'pending' WHERE id = ?`;
            
            const params = isInsert ? [url] : [url, id];

            this.db.query(query, params, (err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    updateVisitedAt(id, success = true) {
        const status = success ? 'completed' : 'failed';
        this.db.query(
            `UPDATE ${this.tables.links} SET _visited_at = CURRENT_TIMESTAMP, _status = ? WHERE id = ?`,
            [status, id],
            (err) => {
                if (err) console.error('Error executing sql:', err);
            }
        );
    }

    async isLinkExists(link) {
        const [rows] = await this.db.promise().query(
            `SELECT COUNT(*) AS total FROM ${this.tables.links} WHERE _source_url = ?`,
            [link]
        );
        return rows[0].total > 0;
    }

    async getPendingContents({ limit = 50 }) {
        return new Promise((resolve, reject) => {
            this.db.query(
                `SELECT * FROM ${this.tables.content} WHERE _status = ? LIMIT 0, ?;`, 
                ['pending', limit], 
                (err, rows) => {
                    if (err) {
                        console.error('Error fetching pending Imports:', err);
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
    }

    updatePendingContentStatus(id, status = 'failed') {
        this.db.query(
            `UPDATE ${this.tables.content} SET _status = ? WHERE id = ?`,
            [status, id],
            (err) => {
                if (err) console.error('Error executing sql:', err);
            }
        );
    }

    
}

class Importer {
    constructor() {
        this.importing = false;
        this.ollama = new Ollama({ host: 'http://localhost:11434' });
    }

    rest_url(url) {
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        return `https://core.agency.local/wp-json/${url}`;
    }

    llm_generate(args, options = {}) {
        return new Promise(async (resolve, reject) => {
            const { streamToClient = false, chatId = null, io = null } = options;
            let fullResponse = '';
            try {
                const payload = { model: 'gemma3:1b', prompt: '', stream: true, ...args };
                // console.log('Payload:', payload);

                const stream = await this.ollama.generate(payload);

                if (payload.stream) {
                    // Streamed response
                    for await (const chunk of stream) {
                        fullResponse += chunk.response;
                        if (streamToClient && chatId && io) {
                            io.emit('ai-response-chunk', { chatId, chunk: chunk.response });
                        }
                    }
                    if (streamToClient && chatId && io) {
                        io.emit('ai-response-end', { chatId });
                    }
                } else {
                    // Non-streamed response (assuming stream is a Promise or similar)
                    const response = await stream;
                    fullResponse = response.response || response;
                }

                resolve(fullResponse);

            } catch (err) {
                console.error('Error generating AI response:', err?.message || err);
                reject(err);
            }
        });
    }


    get_product_schema() {
        return {
            sku: 'string',
            price: 'string',
            images: ['url'],
            sale_price: 'string',
            description: 'string',
            short_description: 'string',
            product_type: 'simple | variable',
            title: 'string',
            keywords: ['string'],
            og_title: 'string',
            og_description: 'string',
            og_image: 'string',
            shipping_vendors: [
                {
                    title: 'string',
                    url: 'url',
                }
            ],
            shipping_warehouses: [],
            variations: [
                {
                    key: 'string',
                    title: 'string',
                    sku: 'string',
                    description: 'string',
                    price: 'float',
                    onsale_price: 'float | null',
                    gallery: ['url']
                }
            ],
            categories: ['text']
        };
    }

    prepare_prompt(schema) {
        // const system = `You are a data processing assistant specialized in preparing e-commerce product data for import.\n\nYour task is to parse scraped product data JSON and transform it into a structured product object matching the exact schema:\n\n${JSON.stringify(this.get_product_schema(), null, 2)}\n\nFollow these instructions strictly:\n- Extract or generate SKU.\n- Normalize prices.\n- Collect images URLs.\n- Use description fields appropriately.\n- Determine product_type.\n- Extract keywords from categories, brand, specifications.\n- Map meta tags.\n- Extract shipping vendor info.\n- Leave shipping_warehouses empty if no data.\n- Populate variations if present.\n- Clean and trim all text.\n- Output only valid JSON matching the schema, no extra text.\n`;
        const system = `You are an ecommerce store manager responsible for creating accurate product data in JSON format.`;

        // const prompt = `Input JSON:\n${JSON.stringify(schema, null, 2)}\n\nOutput the structured product JSON only.\n`;
        const prompt = `You're a brilliant ecommerce store manager. Your task is to analyze the entire product details from the user's data, and based on this, you'll prepare a comprehensive product information object for a WooCommerce store. Your response MUST be a valid JSON object, and you must not include any text outside of the user input. Do not invent or hallucinate product data; only use information directly present in the provided text.\n\nProduct details: ${JSON.stringify(schema?.extract??schema, null, 2)}\n\nPlease provide the JSON object following this structure: ${JSON.stringify(this.get_product_schema(), null, 2)}`;

        const template = `{{ .Prompt }}`;

        return {
            prompt,
            system,
            template,
            stream: false,
            options: {
                temperature: 0.2,
                top_p: 0.9,
                top_k: 40,
                repeat_penalty: 1.1,
                num_ctx: 4096,
                seed: 42,
            }
        };
    }

    prepare_product(product) {
        return new Promise((resolve, reject) => {
            const args = {format: 'json', ...this.prepare_prompt(product.content)};
            this.llm_generate(args).then(content => {
                content = JSON.parse(content);
                // console.log('Generated Content:', content);
                resolve(content);
            })
            .catch(err => reject(err));
        })
    }

    teleport_product(product) {
        const product_id = product?.id??0;
        axios.post(this.rest_url(`/sitecore/v1/ecommerce/product/${product_id}`), {data: {...product}})
        .then(res => res.data)
        .then(({ product_id }) => {
            axios.post(this.rest_url(`/sitecore/v1/ecommerce/product/${product_id}/metabox`), { meta })
            .then(res => res.data)
            .then(res => {
                this.emitToSockets('imported', [{...product, ssr: res}]);
            })
        })
        .catch(err => console.log('Failed to save', err?.message));
    }

    emmit_imports_status() {
        this.emitToSockets('import-status', { importing: this.importing });
    }
    
    start_import() {
        this.importing = true;
        this.start_import_process();
        this.emmit_imports_status();
    }
    stop_import() {
        this.importing = false;
        this.emmit_imports_status();
    }

    async start_import_process() {
        while (this.importing) {
            try {
                const [ product = null ] = await this.dbManager.getPendingContents({ limit: 1 });
                if (product === null) throw new Error('No more pending products to import. Kills process...');
                product.content = JSON.parse(product.content);let generated;
                if (!(product.content?.extract?.product || product.content?.extract?.category)) {
                    await this.dbManager.updatePendingContentStatus(product.id, 'failed');
                } else {
                    if (true) {
                        try {
                            generated = await this.prepare_product(product);
                        } catch (err) {}
                    }
                    this.teleport_product(generated || product);
                    // 
                    // console.log(product, generated);
                }
            } catch (err) {
                console.log(err?.message);
                this.stop_import();
            }
        }
    }


}


class Crawler extends Importer {
    constructor() {
        super();
        this.sockets = [];
        this.isRunning = false;
        this.schemasPath = path.join(__dirname, '..', 'storage', 'schemas');
        this.extractor = new ContentExtractor(this.schemasPath);
        this.pagination = { total: 0, page: 1, perpage: 10 };
        this.initializeCrawler();
    }

    initializeCrawler() { 
        log.setLevel(log.LEVELS.OFF);
        // log.setLevel(log.LEVELS.ERROR);
        this.crawler = new PlaywrightCrawler({
            // maxRequestRetries: 1,
            // maxRequestsPerCrawl: 10,
            // requestHandlerTimeoutSecs: 30,
            maxConcurrency: 2,
            launchContext: {
                launcher: chromium,
                launchOptions: {headless: true},
            },
            requestHandler: this.handleRequest.bind(this),
            failedRequestHandler: this.handleFailedRequest.bind(this)
        });
    }

    async handleRequest({ pushData, request, page, log, enqueueLinks }) {
        const pageUrl = request.loadedUrl;
        // console.log("Waiting for scraping data", pageUrl)

        // Let Playwright fully render SPA content
        // await page.waitForLoadState('domcontentloaded');
        // await page.waitForLoadState('networkidle').catch(() => {}); // wait until no network for SPA
        // await page.waitForSelector('.collection-block-item'); // Wait for the actor cards to render.

        const title = await page.title();
        // console.log(`URL: ${pageUrl} | Page title: ${title}`, request.userData);

        // Emit event for live monitoring
        this.emitToSockets('crawling', { url: pageUrl, title, id: request.userData.link_id });

        // await sleep(1500);
        
        // Get full rendered HTML and pass into Cheerio
        const html = await page.content();
        const $ = cheerio.load(html);

        // Process content with your existing extractor
        const content = await this.processPageContent({page, request, $, log});

        // console.log(content);

        const success = content && !content.failed;

        if (success) {
            if (content?.links) delete content.links;
            if (content?.content?.links) delete content.content.links;
            // console.log('Content: ', JSON.stringify(content, null, 2));
            // pushData(content)
            await this.dbManager.updateContent(
                request.userData?.id ?? 0,
                request.userData.link_id,
                { url: content?.url || url, data: content }
            );
        }

        this.updateVisitedAt(request.userData.link_id, success);
        this.emitToSockets('crawled', { success, url, content, id: request.userData.link_id });
        
        // this.isRunning && await this.getPendingOne();

        // await enqueueLinks({ strategy: 'same-domain' });
    }

    handleFailedRequest({ request, log }) {
        log.info(`Request ${request.url} failed too many times.`);
    }

    async processPageContent({page, request, $, log}) {
        try {
            return await this.extractor.extractContent({ page, $, url: request.url, request, userData: request.userData });
        } catch (error) {
            if (error.message.includes('Execution context was destroyed')) {
                log.error(`Navigation occurred while trying to extract content from ${request.url}. Skipping.`);
                return { failed: true, url: request.url, error: 'Navigation during extraction' };
            }
            log.error(`Error in processPageContent for ${request.url}: ${error.message}`);
            return { failed: true, url: request.url, error: error.message };
        }
    }

    async retryResolveUrl(page, request) {
        try {
            const response = await axios.get(page.url());
            const $ = cheerio.load(response.data);
            const ogUrl = $('meta[property="og:url"]').attr('content');
            
            if (!ogUrl) {
                throw new Error('Pure permalink not found.');
            }
            
            await this.crawler.addRequests([{
                url: ogUrl, 
                userData: { ...request?.userData ?? {} }
            }]);
        } catch (error) {
            console.error(`Error fetching or parsing the URL: ${error.message}`);
            throw error;
        }
    }

    async getPendingOne(limit = 1) {
        const [single = null] = await this.dbManager.getPendingUrls({ limit });
        if (!single && this.isRunning) await this.stopCrawl();
        const { u: url, i: link_id } = single;
        if (url) await this.crawler.addRequests([{url: url, userData: {link_id}}]);
        return Promise.resolve(url);
        // 
        // let urlMapped = urls.map(({u, i}) => ({url: u, userData: {link_id: i}}));
        // urlMapped = await Promise.all(urlMapped.map(async row => {
        //     if (this.isSitemap(row.url)) {
        //         const { urls } = await Sitemap.load(row.url);
        //         return urls.map(i => ({ ...row, url: i }));
        //     }
        //     return [row];
        // })).then(arr => arr.flat());
    }

    async crawl() {
        this.isRunning = true;
        // while (this.isRunning) {
            // console.log('Crawler about to run')
            await this.getPendingOne(500);
            await this.crawler.run();
        // }
        await this.stopCrawl();
    }

    async stopCrawl() {
        await this.crawler.stop('Paused');
        this.isRunning = false;
        this.emitToSockets('crawl-status', { isRunning: this.isRunning });
    }

    isCrawlerRunning() {
        return this.isRunning;
    }

    isValidLink(link) {
        const urlPattern = /^(https?:\/\/)?(www\.)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/;
        return urlPattern.test(link);
    }

    emitToSockets(event, data) {
        this.sockets
        .filter(s => s.connected)
        .forEach(socket => socket.emit(event, data));
    }

    isSitemap(url) {
        const sitemapRegex = /\/(sitemap(?:_index)?|\d+)\.xml(\.gz)?$/i;
        return sitemapRegex.test(url);
    }
}

class SocketHandler {
    constructor(crawler, dbManager) {
        this.crawler = crawler;
        this.dbManager = dbManager;
    }

    async handleConnection(socket) {
        socket.emit('crawl-status', { isRunning: this.crawler.isRunning });
        socket.emit('import-status', { importing: this.crawler?.importing });
        this.crawler.sockets.push(socket);

        this.setupSocketEvents(socket);
    }

    setupSocketEvents(socket) {
        socket.on('start-crawl', () => {
            if (!this.crawler.isRunning) {
                this.crawler.crawl();
            }
        });

        socket.on('stop-crawl', () => {
            this.crawler.stopCrawl();
        });

        socket.on('update-links', async ({ links }) => {
            try {
                const linkList = links.split(',').map(link => link.trim());

                const processedLinks = await Promise.all(
                    linkList.map(async link => {
                        try {
                            const url = await this.crawler.extractor.sortURL(link);
                            // console.log(regix, url);
                            return url || link;
                        } catch (e) {
                            // If URL parsing fails or any error occurs, fallback to original link
                            return link;
                        }
                    })
                );

                const insertPromises = processedLinks.map(link => this.dbManager.updateURL(0, link));
                await Promise.all(insertPromises);

                
                if (!this.crawler.isRunning) {
                    this.crawler.crawl();
                }
                
                socket.emit('links-updated', { status: 'success' });
            } catch (error) {
                console.error('Error updating links:', error);
                socket.emit('links-updated', { 
                    status: 'error', 
                    message: error.message 
                });
            }
        });


        socket.on('start-imports', () => {
            this.crawler.start_import();
        });
        socket.on('stop-imports', () => {
            this.crawler.stop_import();
        });

        this.setupExtensionEvents(socket);
    }

    setupExtensionEvents(socket) {
        socket.on('extension_site_opened', ({ host }) => {
            const schemas = this.crawler.extractor.loadDomainSchema(host);
            if (schemas) {
                socket.emit('extension_site_schema', schemas);
            }
        });

        socket.on('extension_site_schema_update', ({ host, schema }) => {
            try {
                const schemaPath = path.join(this.crawler.schemasPath, `${host}.json`);
                fs.writeFileSync(schemaPath, JSON.stringify(schema, null, 2));
                // console.log(`Schema for ${host} written to ${schemaPath}`, schema);
            } catch (error) {
                console.error(`Error writing schema for ${host}:`, error);
            }
        });
    }
    
}

class CrawlerBot extends Crawler {
    constructor(app, dbConnection) {
        super();
        this.app = app;
        this.db = dbConnection;
        this.tables = {
            links: `${this.db.prefix}crawler_bot_links`,
            content: `${this.db.prefix}crawler_bot_content`,
            configs: `${this.db.prefix}crawler_bot_channel_configs`,
        };
        
        const server = this.app.get('server');
        this.schemasPath = path.join(server.__root, '..', 'storage', 'schemas');
        this.extractor = new ContentExtractor(this.schemasPath);
        
        this.dbManager = new DatabaseManager(this.db, this.tables);
        this.socketHandler = new SocketHandler(this, this.dbManager);
        
        this.io = null;
        this.redis = new Redis();
        this.cachedIndex = null;
    }

    init() {
        this.setupSocketIO();
    }

    setupSocketIO() {
        this.io = this.app.get('ws').of("/bot");
        this.io.on('connection', this.socketHandler.handleConnection.bind(this.socketHandler));
    }

    register(router) {
        router.post('/crawler/update-links', async (req, res) => {
            try {
                const { links = null } = req.body;
                
                if (!links) {
                    return res.status(400).send('Invalid links provided');
                }

                if (true) {
                    const linkArray = links.split(',').map(link => link.trim());
                    const insertPromises = linkArray.map(link => this.dbManager.updateURL(0, link));
                    
                    await Promise.all(insertPromises);
                    
                    if (!this.isRunning) {
                        this.crawl();
                    }
                }
                
                res.send('success');
            } catch (error) {
                console.error('Error in update-links endpoint:', error);
                res.status(500).send('Internal server error');
            }
        });
    }

    async updateContent(id, linkId, content) {
        return this.dbManager.updateContent(id, linkId, content);
    }

    updateVisitedAt(linkId, success) {
        this.dbManager.updateVisitedAt(linkId, success);
    }

    get_tables_schemas() {
        return {
            configs: `CREATE TABLE IF NOT EXISTS ${this.tables.configs} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                _type TEXT,
                channel_id TEXT,
                channel_type TEXT,
                _prompt TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )`,
            links: `CREATE TABLE IF NOT EXISTS ${this.tables.links} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                _source_url VARCHAR(768) UNIQUE,
                _created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                _visited_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                _status ENUM('pending', 'completed', 'failed', 'banned') DEFAULT 'pending'
            )`,
            content: `CREATE TABLE IF NOT EXISTS ${this.tables.content} (
                id INT AUTO_INCREMENT PRIMARY KEY,
                source_id INT,
                content TEXT,
                content_url TEXT,
                _created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                _updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                _status ENUM('pending', 'completed', 'failed', 'trashed') DEFAULT 'pending'
            )`,
        };
    }
}

module.exports = CrawlerBot;