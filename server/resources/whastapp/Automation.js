const { default: axios } = require("axios");

const MediaManager = require('./MediaManager');


class Automation extends MediaManager {
    constructor() {
        super();
    }
    async processToAutomation(content) {
        console.log(content)
        const prompt = `Act as an Agent of an Ecommerce Company. Your task is to extract whastapp message data and decide whether you'll accept the product to list on the site based on product validity, trust worthy and discounts. Our ecommerce is based on a niche to discounts. Like discounts listing. So if it's a suitable discount, JUST return "LGTM" and for rejection just return "LBTM"\n\nMessage: ${content.text}`;
        const result = axios.post('http://localhost:11434/api/generate', {
        model: model, prompt: prompt, stream: false
        }).then(res => res.data)
        .then(res => res.response)
        .then(res => console.log(res))
    }
}

module.exports = Automation;