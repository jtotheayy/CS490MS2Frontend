//Jay Santamaria CS 490 02/08/2024
//Inidividual Project
// routes.js
const express = require('express');
const db = require('./db');

const router = express.Router();

//Gets first 20 movies, then updates on user input
router.get('/movies', async (req, res) => {
  try {
    let query = `
      SELECT film.*, 
             actor.first_name AS actor_first_name, 
             actor.last_name AS actor_last_name, 
             category.name AS film_genre 
      FROM film
      JOIN film_actor ON film.film_id = film_actor.film_id
      JOIN actor ON film_actor.actor_id = actor.actor_id
      JOIN film_category ON film.film_id = film_category.film_id
      JOIN category ON film_category.category_id = category.category_id
    `;

    // Check if query parameters for name, actor, or genre are provided
    const { name, actor, genre } = req.query;
    if (name) {
      query += ` WHERE film.title LIKE '%${name}%'`;
    } else if (actor) {
      query += ` WHERE actor.first_name LIKE '%${actor}%' OR actor.last_name LIKE '%${actor}%'`;
    } else if (genre) {
      query += ` WHERE category.name LIKE '%${genre}%'`;
    }
    
    query += ` LIMIT 20`;

    const [rows, fields] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching movies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// Route to get top 5 movies
router.get('/topmovies', async (req, res) => {
  try {
    const query = `SELECT film.film_id, film.title, COUNT(rental_id) AS rental_count
    FROM rental
    JOIN inventory ON rental.inventory_id = inventory.inventory_id
    JOIN film ON inventory.film_id = film.film_id
    JOIN film_actor ON film.film_id = film_actor.film_id
    WHERE film_actor.actor_id = (
        SELECT actor_id
        FROM film_actor
        GROUP BY actor_id
        ORDER BY COUNT(film_id) DESC
        LIMIT 1
    )
    GROUP BY film.film_id, title
    ORDER BY rental_count DESC
    LIMIT 5;`
  
    const [rows, fields] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top movies:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get top 5 actors
router.get('/topactors', async (req, res) => {
  try {
    const query = `
    SELECT actor.actor_id, CONCAT(first_name, ' ', last_name) AS name, COUNT(rental_id) AS rental_count
    FROM rental
    JOIN inventory ON rental.inventory_id = inventory.inventory_id
    JOIN film ON inventory.film_id = film.film_id
    JOIN film_actor ON film.film_id = film_actor.film_id
    JOIN actor ON film_actor.actor_id = actor.actor_id
    GROUP BY actor.actor_id, name
    ORDER BY rental_count DESC
    LIMIT 5;
  `;

    const [rows, fields] = await db.query(query);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching top actors:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to get movie details by ID

router.get('/movies/:id', async (req, res) => {
  const movieId = req.params.id;
  try {
    const query = `SELECT * FROM film WHERE film_id = ?`;
    const [rows, fields] = await db.query(query, [movieId]);
    if (rows.length === 0) {
      res.status(404).json({ error: 'Movie not found' });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    console.error('Error fetching movie details:', err);
  }
});

// Route to get actor details by ID
router.get('/actors/:id', async (req, res) => {
  const actorId = req.params.id;
  try {
    const query = `
      SELECT film.film_id, film.title, category.name AS category, COUNT(rental.rental_id) AS rental_count
      FROM rental
      JOIN inventory ON rental.inventory_id = inventory.inventory_id
      JOIN film ON inventory.film_id = film.film_id
      JOIN film_category ON film.film_id = film_category.film_id
      JOIN category ON film_category.category_id = category.category_id
      JOIN film_actor ON film.film_id = film_actor.film_id
      WHERE film_actor.actor_id = ?
      GROUP BY film.film_id, film.title, category.name
      ORDER BY rental_count DESC
      LIMIT 5;
    `;
    const [rows, fields] = await db.query(query, [actorId]);
    console.log(rows); 

    if (rows.length === 0) {
      res.status(404).json({ error: 'Actor not found' });
    } else {
      res.json(rows); 
    }
  } catch (err) {
    console.error('Error fetching actor details:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
