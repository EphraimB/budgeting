import swaggerJsdoc from 'swagger-jsdoc';

const options = {
    swaggerDefinition: {
        openapi: '3.0.0', // Specify the OpenAPI version
        info: {
            title: 'Budgeting',
            version: '0.2.0',
            description:
                'A budgeting app that generates future transactions based on expenses, loans, current balance, and income',
        },
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
