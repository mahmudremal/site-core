const { z } = require("zod");
const axios = require("axios");

class PayPalAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = "paypal";
        this.clientId = process.env.PAYPAL_API_CLIENT_ID;
        this.clientSecret = process.env.PAYPAL_API_CLIENT_SECRET;
        this.sandbox = process.env.PAYPAL_API_CLIENT_SANDBOX;
        this.baseURL = this.sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
        this.accessToken = null;
        this.tokenExpiresAt = null;
    }

    async init() {
        await this._authenticate();
        return true;
    }

    async _authenticate() {
        if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
            return this.accessToken;
        }
        const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString("base64");
        const res = await axios.post(
            `${this.baseURL}/v1/oauth2/token`,
            "grant_type=client_credentials",
            {
                headers: {
                    Authorization: `Basic ${auth}`,
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            }
        );
        this.accessToken = res.data.access_token;
        this.tokenExpiresAt = new Date(Date.now() + res.data.expires_in * 1000 - 60000);
        return this.accessToken;
    }

    async _request(method, endpoint, data = null, params = null) {
        await this._authenticate();
        const config = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
                "Content-Type": "application/json",
            },
            data,
            params,
        };
        const response = await axios.request(config);
        return response.data;
    }

    getTools() {
        return [
            {
                title: "Get Transaction Details",
                name: "paypal_get_transaction",
                description: "Retrieve details of a transaction by transaction ID",
                inputSchema: {
                    transactionId: z.string()
                },
                handler: async ({ transactionId }) => {
                    const data = await this._request(
                        "GET",
                        `/v1/reporting/transactions`,
                        null,
                        { transaction_id: transactionId }
                    );
                    if (data.transaction_details && data.transaction_details.length > 0) {
                        return { transaction: data.transaction_details[0] };
                    }
                    return { error: "Transaction not found" };
                }
            },
            {
                title: "Refund a Transaction",
                name: "paypal_refund_transaction",
                description: "Issue a refund for a captured payment",
                inputSchema: {
                    captureId: z.string(),
                    amount: z.object({
                        value: z.string(),
                        currency_code: z.string()
                    }).optional()
                },
                handler: async ({ captureId, amount }) => {
                    const data = {};
                    if (amount) data.amount = amount;
                    const res = await this._request("POST", `/v2/payments/captures/${captureId}/refund`, data);
                    return res;
                }
            },
            {
                title: "List Transactions",
                name: "paypal_list_transactions",
                description: "List transactions filtered by date/time",
                inputSchema: {
                    startDate: z.string(),
                    endDate: z.string(),
                    transactionType: z.string().optional(),
                    pageSize: z.number().int().min(1).max(100).optional().default(10),
                    page: z.number().int().min(1).optional().default(1),
                },
                handler: async ({ startDate, endDate, transactionType, pageSize, page }) => {
                    const params = {
                        start_date: startDate,
                        end_date: endDate,
                        transaction_type: transactionType,
                        page_size: pageSize,
                        page,
                    };
                    const data = await this._request("GET", "/v1/reporting/transactions", null, params);
                    return { transactions: data.transaction_details || [] };
                }
            },
            {
                title: "Make Payout",
                name: "paypal_make_payout",
                description: "Send a payout to a recipient",
                inputSchema: {
                    senderBatchId: z.string(),
                    recipientEmail: z.string().email(),
                    amount: z.object({
                        value: z.string(),
                        currency: z.string()
                    }),
                    note: z.string().optional(),
                    senderItemId: z.string().optional()
                },
                handler: async ({ senderBatchId, recipientEmail, amount, note, senderItemId }) => {
                    const body = {
                        sender_batch_header: {
                            sender_batch_id: senderBatchId,
                            email_subject: "You have a payout!"
                        },
                        items: [
                            {
                                recipient_type: "EMAIL",
                                amount: {
                                    value: amount.value,
                                    currency: amount.currency
                                },
                                receiver: recipientEmail,
                                note: note || "",
                                sender_item_id: senderItemId || senderBatchId
                            }
                        ]
                    };
                    const data = await this._request("POST", "/v1/payments/payouts", body);
                    return data;
                }
            },
            {
                title: "Custom API Request",
                name: "paypal_custom_api_request",
                description: "Make a custom request to PayPal API",
                inputSchema: {
                    method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
                    endpoint: z.string(),
                    body: z.any().optional()
                },
                handler: async ({ method, endpoint, body }) => {
                    const data = await this._request(method, endpoint, body || null);
                    return data;
                }
            }
        ];
    }

    getResources() {
        return [];
    }

    getPrompts() {
        return [
            {
                title: "PayPal Assistant",
                name: "paypal_assistant",
                description: "Assist with PayPal transaction management and payouts",
                arguments: [
                    {
                        name: "task",
                        description: "Describe your PayPal related request",
                        required: false
                    }
                ],
                handler: async () => ({
                    description: "I can retrieve transactions, process refunds, payouts, and perform custom PayPal API calls.",
                    messages: [
                        {
                            role: "user",
                            content: {
                                type: "text",
                                text: "Ask me to get transaction details, refund payments, or send payouts."
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = PayPalAddon;