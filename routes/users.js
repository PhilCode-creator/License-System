const { createUser, getRank } = require('../modules/database');
const express = require('express');
const router = express.Router();

/**
 * Basic route to check if the server is online.
 */
router.get('/', (req, res) => {
  res.json({ status: "online" });
});

/**
 * Route to create a new user.
 * Requires username, email, and password in the request body.
 */
router.post('/createUser', async (req, res) => {
  const { username, email, password } = req.body;

  // Check if any of the values are undefined
  if (username === undefined || email === undefined || password === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // Call createUser asynchronously
    const newUser = await createUser(username, email, password);
    
    // Send the response with the data returned from createUser
    res.json(newUser);
  } catch (error) {
    console.error(error);
    // If an error occurs, send an error response
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * Route to get the rank of a user.
 * Requires token in the request body.
 */
router.get('/getUserRank', async (req, res) => {
  const { token } = req.body;

  // Check if the token is undefined
  if (token === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  try {
    // Call getRank asynchronously
    const rank = await getRank(token);
    
    // Send the response with the rank data
    res.json(rank);
  } catch (error) {
    console.error(error);
    // If an error occurs, send an error response
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
