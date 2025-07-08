class CalculatorAddon {
    constructor(db, logEvent) {
        this.db = db;
        this.logEvent = logEvent;
        this.name = 'calculator';
    }

    async init() {
        console.log('Calculator addon initialized');
        return true;
    }

    getTools() {
        return [
            {
                title: 'Math calculate',
                name: 'calculate',
                description: 'Perform mathematical calculations',
                inputSchema: {
                    type: 'object',
                    properties: {
                        expression: {
                            type: 'string',
                            description: 'Mathematical expression to calculate'
                        }
                    },
                    required: ['expression']
                },
                handler: async (args) => {
                    const { expression } = args;
                    try {
                        const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
                        const result = Function(`"use strict"; return (${sanitized})`)();
                        return {
                            success: true,
                            expression,
                            result,
                            timestamp: new Date().toISOString()
                        };
                    } catch (error) {
                        return {
                            success: false,
                            expression,
                            error: 'Invalid expression'
                        };
                    }
                }
            },
            {
                title: 'Math Factorial',
                name: 'factorial',
                description: 'Calculate factorial of a number',
                inputSchema: {
                    type: 'object',
                    properties: {
                        number: {
                            type: 'number',
                            description: 'Number to calculate factorial for'
                        }
                    },
                    required: ['number']
                },
                handler: async (args) => {
                    const { number } = args;
                    if (number < 0 || !Number.isInteger(number)) {
                        return { success: false, error: 'Invalid number' };
                    }
                    let result = 1;
                    for (let i = 2; i <= number; i++) {
                        result *= i;
                    }
                    return {
                        success: true,
                        number,
                        result,
                        expression: `${number}!`
                    };
                }
            }
        ];
    }

    getResources() {
        return [
            {
                uri: 'calculator://constants',
                title: 'Math Constants',
                name: 'Math Constants',
                description: 'Mathematical constants',
                mimeType: 'application/json',
                handler: async () => ({
                    content: JSON.stringify({
                        pi: Math.PI,
                        e: Math.E,
                        sqrt2: Math.SQRT2
                    })
                })
            }
        ];
    }

    getPrompts() {
        return [
            {
                title: 'Math Helper',
                name: 'math_helper',
                description: 'Get help with math problems',
                arguments: [
                    {
                        name: 'problem_type',
                        description: 'Type of math problem',
                        required: false
                    }
                ],
                handler: async (args) => ({
                    description: 'Math helper',
                    messages: [
                        {
                            role: 'user',
                            content: {
                                type: 'text',
                                text: 'I can help with calculations and factorials.'
                            }
                        }
                    ]
                })
            }
        ];
    }
}

module.exports = CalculatorAddon;