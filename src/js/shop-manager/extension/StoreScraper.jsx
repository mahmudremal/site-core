import { useEffect, useState } from "react"
import { Play } from "lucide-react"
import { __, deepMerge } from "@js/utils"

const defaultSchema = {
  product: {
    condition: "window.location.pathname.includes('/product/')",
    extract: {
      title: ['.product-title', 'innerText'],
      price: ['.price', 'innerText'],
      sale_price: ['.sale-price', 'innerText'],
      description: ['.description', 'innerText'],
      short_description: ['.short-desc', 'innerText'],
      gallery: ['.gallery img', 'src'],
      variations: ['.variation', 'innerText']
    }
  },
  store: {
    condition: "document.querySelectorAll('.product-card').length > 0",
    selectors: "[data-qa-locator='general-products'] [data-qa-locator='product-item'] a[title], a.product-item-link, a[href^='https://www.daraz.com.bd/products/']",
    pagination: {
      prev: '.ant-pagination .ant-pagination-item:not(.ant-pagination-item-active) > a',
      next: '.ant-pagination .ant-pagination-next .ant-pagination-item-link'
    }
  }
}

export default function StoreScraper({ schema: schemaStruct = {} }) {
  const [schema, setSchema] = useState(() => deepMerge(defaultSchema, schemaStruct))
  const [status, setStatus] = useState('idle')

  const isScrapeWindow = window.opener == null && window.location.href.includes('product')

  useEffect(() => {
    if (isScrapeWindow) {
      const data = scrapeProduct(document, schema.product.extract)
      chrome.runtime.sendMessage({
        type: 'PRODUCT_SCRAPED',
        url: window.location.href,
        data
      })
      setTimeout(() => window.close(), 500)
    } else {
      chrome.runtime.onMessage.addListener((msg) => {
        if (msg.type === 'TRIGGER_NEXT_PAGE') {
          const nextBtn = document.querySelector(schema.store.pagination.next)
          if (nextBtn) {
            nextBtn.click()
          } else {
            console.log('Scraping complete')
          }
        }

        if (msg.type === 'CHECK_PAGINATION') {
          const nextBtn = document.querySelector(schema.store.pagination.next)
          if (nextBtn) {
            chrome.runtime.sendMessage({ type: 'NEXT_PAGE', schema })
          } else {
            console.log('No more pages.')
          }
        }
      })

      const observer = new MutationObserver(() => {
        const links = Array.from(document.querySelectorAll(schema.store.selectors)).map(el => el.href)
        chrome.runtime.sendMessage({ type: 'PAGE_READY', schema, links })
      })

      observer.observe(document.body, { childList: true, subtree: true })
    }
  }, [])

  const scrapeProduct = (doc, extractSchema) => {
    const result = {}
    for (const [key, [selector, attr]] of Object.entries(extractSchema)) {
      const el = doc.querySelector(selector)
      result[key] = el ? el[attr] || el.getAttribute(attr) : null
    }
    return result
  }

  const start_scraping = (e) => {
    e.preventDefault()
    setStatus('scraping')
    chrome.runtime.sendMessage({ type: 'START_SCRAPE', schema })
  }

  if (isScrapeWindow) return null

  return (
    <>
      <button onClick={start_scraping} className="xpo_btn xpo_px-4 xpo_py-2 xpo_bg-blue-600 xpo_text-white xpo_rounded xpo_fixed xpo_bottom-4 xpo_right-4 xpo_z-50">
        <Play className="xpo_text-green-500" />
        <span className="xpo_text-sm xpo_text-gray-700">{__('Start Listing', 'site-core')}</span>
      </button>
      <div className="xpo_fixed xpo_bottom-4 xpo_left-4 xpo_z-50 xpo_flex xpo_items-center xpo_gap-2">
        <Play className="xpo_text-green-500" />
        <span className="xpo_text-sm xpo_text-gray-700">{status}</span>
      </div>
    </>
  )
}
