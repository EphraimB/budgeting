import request from 'supertest';
import express from 'express';
import accountsRouter from '../routes/accountsRouter';

const app = express();
app.use(express.json());
app.use('/', accountsRouter);

describe('GET /', function () {
    it('responds with json', function (done) {
        request(app)
            .get('/')
            .expect('Content-Type', /json/)
            .expect(200, done);
    });
});
