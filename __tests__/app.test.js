const request = require("supertest");
const app = require("../app");

describe('Server', () => {
    let server;

    beforeAll((done) => {
        server = app.listen(done);
    });

    afterAll((done) => {
        server.close(done);
    });

    it('should respond with "Hello, World!" on GET request to root endpoint', async () => {
        const response = await request(server).get('/api');
        expect(response.statusCode).toBe(200);
        expect(response.text).toBe('Hello World!');
    });
});

// describe("Test the root path", () => {
//     test("It should response the GET method", async () => {
//         const response = await request(app).get("/api");
//         expect(response.statusCode).toBe(200);
//         expect(response.text).toEqual("Hello World!");
//     });
// });

// describe("Test the /api/accounts path", () => {
//     beforeAll(async () => {
//         // set up the todo
//         await request(baseURL).post("/todo").send(newTodo);
//     })
//     afterAll(async () => {
//         await request(baseURL).delete(`/todo/${newTodo.id}`)
//     })
//     test("It should response the GET method", async () => {
//         const response = await request(app).get("/api/accounts");
//         expect(response.statusCode).toBe(200);
//         expect(response.body).toEqual([]);
//     });
// });