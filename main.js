const express = require('express');
const app = express();
const dotenv = require('dotenv');
const bodyParser = require('body-parser');

// Specify the path to the .env file
dotenv.config({ path: './config/.env' });

// Import routers
const licensesRouter = require('./routes/licenses');
const usersRouter = require('./routes/users');

// Use body-parser middleware to parse JSON bodies
app.use(bodyParser.json());

// Routes
app.use('/licenses', licensesRouter);
app.use('/users', usersRouter);

// Start the server
app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.PORT}`);
});
