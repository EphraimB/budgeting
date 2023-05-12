const request = require("supertest");
const { app, bree } = require("../app");
const getJobs = require('../getJobs');

jest.mock('../getJobs', () => jest.fn());

describe('Test Bree', () => {
    test('It should start Bree and log the job count', async () => {
      bree.mockResolvedValue([/* mock job data */]);
  
      const response = await request(app).get('/api/some-route');
  
      // Assertions to verify the expected behavior
      expect(response.statusCode).toBe(200);
      expect(getJobs).toHaveBeenCalled();
    });
  });
  

describe("Test the root path", () => {
    test("It should response the GET method", async () => {
        const response = await request(app).get("/api");
        expect(response.statusCode).toBe(200);
        expect(response.text).toEqual("Hello World!");
    });
});

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