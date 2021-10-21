// connect to right DB --- set before loading db.js
process.env.NODE_ENV = "test";

// npm packages
const request = require("supertest");

// app imports
const app = require("./app");
const db = require("./db");

let testBiztime;


beforeEach(async function() {
  let result = await db.query(
    `INSERT INTO companies(code, name, description) 
     VALUES (001, 'Test', 'TestCompany') 
     RETURNING code, name, description`);
  testBiztime = result.rows[0];
});

afterEach(async function() {
    // delete any data created by test
    await db.query("DELETE FROM companies");
});
  
afterAll(async function() {
    // close db connection
    await db.end();
});

// company tests

describe("GET /companies", function() {
    test("Gets a list of all companies", async function() {
      const response = await request(app).get(`/companies`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        companies: [{code: testBiztime.code, name: testBiztime.name}]
      });
    });
  });

describe("GET /companies/:code", function() {
    test("Gets a single company", async function() {
      const response = await request(app).get(`/companies/${testBiztime.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({company: testBiztime});
    });
  
    test("Responds with 404 if can't find company", async function() {
      const response = await request(app).get(`/companies/0`);
      expect(response.statusCode).toEqual(404);
    });
  });

describe("POST /companies", function() {
    test("Creates a new company", async function() {
      const response = await request(app)
        .post(`/companies`)
        .send({
          name: "Company2",
          description: "a company"
        });
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        company: {code: expect.any(String), name: "Company2", description: "a company"}
      });
    });
  });


describe("PUT /companies/:code", function() {
    test("Updates a single company", async function() {
      const response = await request(app)
        .put(`/companies/${testBiztime.code}`)
        .send({
          name: "newName",
          description: "newDes"
        });
      console.log(`XXXXXXX ${JSON.stringify(response.body)}`)
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        company: {code: testBiztime.code,name:"newName",description: "newDes"}
      });
    });
  
    test("Responds with 404 if can't find company", async function() {
      const response = await request(app).patch(`/companies/0`);
      expect(response.statusCode).toEqual(404);
    });
  });

describe("DELETE /companies/:code", function() {
    test("Deletes a single a company", async function() {
      const response = await request(app)
        .delete(`/companies/${testBiztime.code}`);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({ status: "deleted" });
    });
  });