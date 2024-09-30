import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        version: '0.2.0',
        title: 'Budgeting',
        description:
            'A budgeting app that generates future transactions based on your daily habits',
    },
    servers: [
        {
            url: 'http://localhost:5001',
            description: 'Development server',
        },
    ],
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    components: {
        schemas: {
            accounts: {
                id: 1,
                $name: 'Personal',
                balance: 50,
                dateCreated: '2020-01-01',
                dateModified: '2020-01-01',
            },
        },
    },
    examples: {
        accounts: {
            value: {
                id: 2,
                $name: 'Savings',
                balance: 100,
                dateCreated: '2020-01-01',
                dateModified: '2020-01-01',
            },
            summary: 'Example accounts',
        },
    },
};

const outputFile = './swagger-output.json';
const routes = ['./src/app.js'];

swaggerAutogen({ openapi: '3.0.0' })(outputFile, routes, doc);
