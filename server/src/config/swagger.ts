import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'Budgeting',
        description:
            'A budgeting app that generates future transactions based on expenses, loans, current balance, and income',
        version: '0.2.0',
    },
    host: 'localhost:5001',
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
