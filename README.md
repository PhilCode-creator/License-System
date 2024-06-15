# License and User Management API

This repository contains a Node.js and Express.js backend application designed for managing licenses and user operations through a RESTful API. It provides endpoints for creating users, handling license management tasks such as creation, suspension, deletion, and claiming, as well as retrieving user ranks and license statistics.

## Features

- **User Management**
  - Create new users with username, email, and password.
  - Retrieve user ranks based on authentication token.

- **License Management**
  - Create new licenses with specified durations.
  - Suspend, delete, and claim licenses.
  - Authenticate licenses based on IP and license key.
  - Retrieve total license count.

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Additional Libraries**: dotenv for environment configuration, body-parser for JSON parsing

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/your-username/your-repo.git
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Configure environment variables:
   - Create a `.env` file in the `config` directory.
   - Define necessary variables (e.g., database connection string).

4. Start the server:
   ```
   npm start
   ```

## API Documentation

### Create User

- **Endpoint**: `POST /users/createUser`
- **Body**:
  ```json
  {
    "username": "example",
    "email": "example@example.com",
    "password": "password"
  }
  ```

### Authenticate License

- **Endpoint**: `POST /licenses/auth`
- **Body**:
  ```json
  {
    "ip": "127.0.0.1",
    "license": "license-key"
  }
  ```

### Get License Amount

- **Endpoint**: `GET /licenses/amount`


## Contributing

Feel free to contribute by forking the repository and submitting pull requests for new features or bug fixes.

## License

This project is licensed under the MIT License.
```
