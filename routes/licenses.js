const express = require('express');
const { getLicensesAmount, authenticateLicense, createLicense, claimLicense, suspendLicense, deleteLicense } = require('../modules/database');

const router = express.Router();

/**
 * Basic route to check if the server is online.
 */
router.get('/', (req, res) => {
  res.json({ status: "online" });
});

/**
 * Route to get the total number of licenses.
 */
router.get('/amount', async (req, res) => {
  try {
    const result = await getLicensesAmount();
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * Route to create a new license.
 * Requires authToken and duration in the request body.
 */
router.post('/createLicense', async (req, res) => {
  const { authToken, duration } = req.body;
  if (authToken === undefined || duration === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const result = await createLicense(authToken, duration);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * Route to suspend a license.
 * Requires authToken and license in the request body.
 */
router.post('/suspend', async (req, res) => {
  const { authToken, license } = req.body;
  if (authToken === undefined || license === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const result = await suspendLicense(license, authToken);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * Route to delete a license.
 * Requires authToken and license in the request body.
 */
router.delete('/delete', async (req, res) => {
  const { authToken, license } = req.body;
  if (authToken === undefined || license === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const result = await deleteLicense(license, authToken);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});


/**
 * Route to authenticate a license.
 * Requires IP and license in the request body.
 */
router.get('/auth', async (req, res) => {
  const { ip, license } = req.body;
  if (ip === undefined || license === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const result = await authenticateLicense(license, ip);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

/**
 * Route to claim a license.
 * Requires license and owner in the request body.
 */
router.post('/claim', async (req, res) => {
  const { license, owner } = req.body;
  if (owner === undefined || license === undefined) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }
  try {
    const result = await claimLicense(license, owner);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
