const express = require('express')
const pg = require('pg')

const app = express()
app.use(express.json())
app.use(require('morgan')('dev'))

app.get('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
          SELECT * from flavors ORDER BY created_at DESC;
        `
        const response = await client.query(SQL)
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }
});
app.get('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
          SELECT * from flavors 
          WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.send(response.rows)
    } catch (ex) {
        next(ex)
    }
});
app.post('/api/flavors', async (req, res, next) => {
    try {
        const SQL = `
          INSERT INTO flavors(name)
          VALUES($1)
          RETURNING *
        `
        const response = await client.query(SQL, [req.body.name])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
});
app.delete('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
          DELETE from flavors
          WHERE id = $1
        `
        const response = await client.query(SQL, [req.params.id])
        res.sendStatus(204)
    } catch (ex) {
        next(ex)
    }
});
app.put('/api/flavors/:id', async (req, res, next) => {
    try {
        const SQL = `
          UPDATE flavors
          SET name = $1, updated_at = now()
          WHERE id = $2 
          RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.params.id])
        res.send(response.rows[0])
    } catch (ex) {
        next(ex)
    }
});


const { Client } = pg
const client = new Client(process.env.DATABASE_URL || 'postgres://localhost/acme_ice_cream_shop_db')

const init = async () => {
    await client.connect()
    console.log('connected to database')

    let SQL = `
    DROP TABLE IF EXISTS flavors;
    CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE
    );
    `
    await client.query(SQL)
    console.log('tables created')

    SQL = `
    INSERT INTO flavors(name, is_favorite) VALUES('Chocolate', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Vanilla', true);
    INSERT INTO flavors(name, is_favorite) VALUES('Strawberry', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Pistachio', false);
    INSERT INTO flavors(name, is_favorite) VALUES('Rocky Road', false);
    `
    await client.query(SQL)
    console.log('data seeded')

    const port = process.env.PORT || 3000
    app.listen(port, () => console.log(`listening on port ${port}`))
}

init()