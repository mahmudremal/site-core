const { z } = require('zod');
const Stripe = require('stripe');

class StripeAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'stripe';
    }

    async init() {
        this.stripe = new Stripe(process.env.STRIPE_API_KEY, { apiVersion: '2022-11-15' });
        return true;
    }

    getTools() {
        return [
            {
                title: 'List Charges',
                name: 'stripe_list_charges',
                description: 'Retrieve a list of charges',
                inputSchema: {
                    limit: z.number().int().min(1).max(100).optional().default(10),
                    customer: z.string().optional(),
                    starting_after: z.string().optional(),
                    ending_before: z.string().optional()
                },
                handler: async ({ limit, customer, starting_after, ending_before }) => {
                    const params = { limit };
                    if (customer) params.customer = customer;
                    if (starting_after) params.starting_after = starting_after;
                    if (ending_before) params.ending_before = ending_before;
                    const charges = await this.stripe.charges.list(params);
                    return { charges: charges.data, has_more: charges.has_more };
                }
            },
            {
                title: 'Create Payment Intent',
                name: 'stripe_create_payment_intent',
                description: 'Create a new payment intent',
                inputSchema: {
                    amount: z.number().int().min(1),
                    currency: z.string().min(3).max(3),
                    payment_method_types: z.array(z.string()).optional().default(['card']),
                    customer: z.string().optional(),
                    description: z.string().optional(),
                    receipt_email: z.string().email().optional()
                },
                handler: async ({ amount, currency, payment_method_types, customer, description, receipt_email }) => {
                    const params = { amount, currency, payment_method_types };
                    if (customer) params.customer = customer;
                    if (description) params.description = description;
                    if (receipt_email) params.receipt_email = receipt_email;
                    const intent = await this.stripe.paymentIntents.create(params);
                    return { payment_intent: intent };
                }
            },
            {
                title: 'Retrieve Payment Intent',
                name: 'stripe_retrieve_payment_intent',
                description: 'Retrieve a payment intent by ID',
                inputSchema: {
                    id: z.string()
                },
                handler: async ({ id }) => {
                    const intent = await this.stripe.paymentIntents.retrieve(id);
                    return { payment_intent: intent };
                }
            },
            {
                title: 'Cancel Payment Intent',
                name: 'stripe_cancel_payment_intent',
                description: 'Cancel a payment intent by ID',
                inputSchema: {
                    id: z.string()
                },
                handler: async ({ id }) => {
                    const canceled = await this.stripe.paymentIntents.cancel(id);
                    return { payment_intent: canceled };
                }
            },
            {
                title: 'Create Refund',
                name: 'stripe_create_refund',
                description: 'Create a refund for a charge or payment intent',
                inputSchema: {
                    charge: z.string().optional(),
                    payment_intent: z.string().optional(),
                    amount: z.number().int().optional(),
                    reason: z.enum(['duplicate', 'fraudulent', 'requested_by_customer']).optional(),
                    metadata: z.record(z.string()).optional()
                },
                handler: async ({ charge, payment_intent, amount, reason, metadata }) => {
                    const params = {};
                    if (charge) params.charge = charge;
                    if (payment_intent) params.payment_intent = payment_intent;
                    if (amount) params.amount = amount;
                    if (reason) params.reason = reason;
                    if (metadata) params.metadata = metadata;
                    const refund = await this.stripe.refunds.create(params);
                    return { refund };
                }
            },
            {
                title: 'Retrieve Refund',
                name: 'stripe_retrieve_refund',
                description: 'Retrieve a refund by ID',
                inputSchema: {
                    id: z.string()
                },
                handler: async ({ id }) => {
                    const refund = await this.stripe.refunds.retrieve(id);
                    return { refund };
                }
            },
            {
                title: 'List Customers',
                name: 'stripe_list_customers',
                description: 'List customers',
                inputSchema: {
                    limit: z.number().int().min(1).max(100).optional().default(10)
                },
                handler: async ({ limit }) => {
                    const customers = await this.stripe.customers.list({ limit });
                    return { customers: customers.data };
                }
            },
            {
                title: 'Create Customer',
                name: 'stripe_create_customer',
                description: 'Create a new customer',
                inputSchema: {
                    email: z.string().email().optional(),
                    name: z.string().optional(),
                    description: z.string().optional(),
                    metadata: z.record(z.string()).optional()
                },
                handler: async ({ email, name, description, metadata }) => {
                    const params = {};
                    if (email) params.email = email;
                    if (name) params.name = name;
                    if (description) params.description = description;
                    if (metadata) params.metadata = metadata;
                    const customer = await this.stripe.customers.create(params);
                    return { customer };
                }
            },
            {
                title: 'Delete Customer',
                name: 'stripe_delete_customer',
                description: 'Delete a customer by ID',
                inputSchema: {
                    id: z.string()
                },
                handler: async ({ id }) => {
                    const deleted = await this.stripe.customers.del(id);
                    return { deleted };
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
                title: 'Stripe Assistant',
                name: 'stripe_assistant',
                description: 'Assist with payments, refunds, customers, and charges',
                arguments: [
                    {
                        name: 'task',
                        description: 'Description of the payment-related task',
                        required: false
                    }
                ],
                handler: async () => ({
                    description: 'I can help list charges, create payments, handle refunds, and manage customers.',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'Ask me to create payments, refunds, or retrieve customer and charge info.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = StripeAddon;