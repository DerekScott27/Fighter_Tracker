require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3002;

//Middleware

app.use(cors());
app.use(express.json());

//Database pools
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

//Server Side Validation:

function validateFighter(body) {
  const errors = [];

  if (!body.name || body.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (!body.discipline || body.discipline.trim().length === 0) {
    errors.push('Discipline is required');
  }

  if (!body.record || body.record.trim().length === 0) {
    errors.push('Record is required');
  }

  //Add max length validation
  if (body.name && body.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (body.discipline && body.discipline.length > 50) {
    errors.push('Discipline must be less than 50 characters');
  }

  return errors;
}




//Test Route:

app.get('/', (req, res)=>{
    res.json({ message: 'Fighter Tracker App is running'});
});





// Post, to create the fighter table in the database:

app.post('/fighters', async (req, res)=>{
    const {name, discipline, record, analysis, attributes } = req.body;


const errors = validateFighter({name, discipline, record, analysis});

    if(errors.length > 0){
        return res.status(400).json({ errors });
    }

    const client = await pool.connect();

try {
    await client.query('BEGIN');

    // 1) Insert fighter
    const fighterResult = await client.query(
      `INSERT INTO fighters (name, discipline, record, analysis)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, discipline, record, analysis || null]
    );

    const fighter = fighterResult.rows[0];

    // 2) Handle attributes sent as an array of names, e.g. ["Fast", "Technical"]
    if (Array.isArray(attributes) && attributes.length > 0) {
      for (const attrName of attributes) {
        // Ensure attribute exists (insert if missing), and get its id
        const attrResult = await client.query(
          `INSERT INTO attributes (name)
           VALUES ($1)
           ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [attrName]
        );

        const attributeId = attrResult.rows[0].id;

        // Link fighter to attribute
        await client.query(
          `INSERT INTO fighter_attributes (fighters_id, attributes_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [fighter.id, attributeId]
        );
      }
    }

    await client.query('COMMIT');

    // 3) Respond with the created fighter
    res.status(201).json(fighter);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error inserting fighter:', err);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});


// ADD THE GET FROM THE DB:

app.get('/fighters', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         f.id,
         f.name,
         f.discipline,
         f.record,
         f.analysis,
         f.created_at,
         COALESCE(
           json_agg(a.name) FILTER (WHERE a.name IS NOT NULL),
           '[]'
         ) AS attributes
       FROM fighters f
       LEFT JOIN fighter_attributes fa ON fa.fighters_id = f.id
       LEFT JOIN attributes a ON a.id = fa.attributes_id
       GROUP BY
         f.id,
         f.name,
         f.discipline,
         f.record,
         f.analysis,
         f.created_at
       ORDER BY f.id`
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching fighters:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(PORT, () =>{
    console.log(`Server listening on port ${PORT}`)
});