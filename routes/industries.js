
const express = require("express");
const ExpressError = require("../expressError")
const db = require("../db");

let router = new express.Router();


router.get("/", async function (req, res, next) {
    try {
        const results = await db.query(
                `SELECT i.name,
                    FROM industries AS i
                        LEFT JOIN company_industries AS ci
                            ON i.id = ci.industry_id
                        LEFT JOIN companies AS c on ci.company_code = c.code`);

        return res.json({"industries": results.rows});
      }
      catch (err) {
        return next(err);
      }
  });


router.post("/", async function (req, res, next) {
    try {
        let {name} = req.body;

        const result = await db.query(
              `INSERT INTO industries (name) 
               VALUES ($1) 
               RETURNING name`, [name]);
    
        return res.status(201).json({"industry": result.rows[0]});
      }
    
      catch (err) {
        return next(err);
      }
});

router.post("/:company_code/:industry_id", async function (req, res, next) {
    try{
        let {company_code, industry_id} = req.body;

        const result = await db.query(
            `INSERT INTO company_industries (company_code, industry_id
             VALUES ($1, $2)
             RETURNING company_code, industry_code`, [company_code, industry_id]);
        
        return res.status(201).json({"industry": result.rows[0]});

    }
    catch (err) {
        return next(err);
      }
})