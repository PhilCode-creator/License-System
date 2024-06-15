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
  - Retrieve total license count.\n\n
  -

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Additional Libraries**: dotenv for environment configuration, body-parser for JSON parsing

## Setup Instructions
1. Clone the repository:
  ```git clone https://github.com/PhilCode-creator/License-System/.git```

3. Install dependencies:
  ```npm i```

4. Configure environment variables:
   - Create a `.env` file in the `config` directory.
   - Define necessary variables.
    
5. Start the server:
   ```node .```

## API Documentation\n\n### Create User\n\n- **Endpoint**: `POST /users/createUser`\n- **Body**: ```json\n  {\n    "username": "example",\n    "email": "example@example.com",\n    "password": "password"\n  }\n  ```\n\n### Authenticate License\n\n- **Endpoint**: `POST /licenses/auth`\n- **Body**: ```json\n  {\n    "ip": "127.0.0.1",\n    "license": "license-key"\n  }\n  ```\n\n### Get License Amount\n\n- **Endpoint**: `GET /licenses/amount`\n\n## Usage\n\nDescribe any specific usage instructions or deployment considerations here.\n\n## Contributing\n\nFeel free to contribute by forking the repository and submitting pull requests for new features or bug fixes.\n\n## License\n\nThis project is licensed under the MIT License.
