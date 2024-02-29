import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Budgeting',
        description:
            'A budgeting app that generates future transactions based on expenses, loans, current balance, and income',
        version: '0.2.0',
    },
    host: 'localhost:5001',
    components: {
        schemas: {
            Accounts: {
                $name: 'Accounts',
            },
        },
        responses: {
            SuccessResponse: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        account_id: {
                            type: 'integer',
                            format: 'int64',
                            minimium: 1,
                        },
                        account_name: {
                            type: 'string',
                            example: 'Checking',
                        },
                        account_balance: {
                            type: 'number',
                            format: 'double',
                            example: 1000.0,
                        },
                        date_created: {
                            type: 'string',
                            format: 'date-time',
                        },
                        date_modified: {
                            type: 'string',
                            format: 'date-time',
                        },
                    },
                },
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                    },
                    code: {
                        type: 'integer',
                        format: 'int32',
                    },
                },
            },
        },
    },
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
