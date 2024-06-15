const axios = require('axios');

class Auth {
    constructor(endpointURL) {
        this.endpointURL = endpointURL;
        this.ssl = true;
    }

    enableSSL(enableSSL) {
        this.ssl = enableSSL;
    }

    async authenticateLicense(license) {
        const ipAddress = await this.getIPv4Address();
        const url = this.buildEndpointUrl("/licenses/auth");
        const data = { ip: ipAddress, license: license };

        try {
            const response = await axios.post(url, data);
            return response.data.valid;
        } catch (error) {
            throw new Error(`Error authenticating license: ${error.message}`);
        }
    }

    async getIPv4Address() {
        return new Promise((resolve, reject) => {
            axios.get('https://api.ipify.org?format=json')
                .then(response => {
                    resolve(response.data.ip);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }

    buildEndpointUrl(endpoint) {
        const protocol = this.ssl ? 'https' : 'http';
        return `${protocol}://${this.endpointURL}${endpoint}`;
    }
}

// Example usage:
const auth = new Auth('your_endpoint_url_here');

auth.authenticateLicense('your_license_key_here')
    .then(valid => {
        console.log(`License validity: ${valid}`);
    })
    .catch(error => {
        console.error(`Error: ${error.message}`);
    });