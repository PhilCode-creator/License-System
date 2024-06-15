const mysql = require('mysql2');
const dotenv = require('dotenv');
dotenv.config({ path: '../config/.env' });

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    port: process.env.DATABASE_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

/**
 * Creates a new user in the database.
 * @param {string} username - The username of the new user.
 * @param {string} email - The email of the new user.
 * @param {string} password - The hashed password of the new user.
 * @returns {Object} - JSON object containing success message and token.
 */
async function createUser(username, email, password) {
    const token = generateToken(32);
    const [result] = await promisePool.query(
        'INSERT INTO `users`(`username`, `email`, `token`, `password_hash`, `user_type`) VALUES (?,?,?,?,?)',
        [username, email, token, password, 1]
    );
    return {
        success: true,
        message: "Account created",
        token: token
    };
}

/**
 * Retrieves the rank of the user based on the provided token.
 * @param {string} token - The token of the user.
 * @returns {Object} - JSON object containing success message and user rank.
 */
async function getRank(token) {
    const [result] = await promisePool.query(
        'SELECT `user_type` FROM `users` WHERE token=?',
        [token]
    );

    if (result.length === 0) {
        return {
            success: false,
            message: "Invalid token"
        };
    }

    const rank = result[0].user_type;
    return {
        success: true,
        message: "Rank retrieved",
        rank: rank
    };
}

/**
 * Retrieves the number of licenses in the database.
 * @returns {Object} - JSON object containing the number of licenses.
 */
async function getLicensesAmount() {
    const [result] = await promisePool.query(
        'SELECT * FROM `licenses`'
    );
    return {
        success: true,
        licenses: result.length
    };
}

/**
 * Creates a new license if the user has the appropriate rank.
 * @param {string} token - The token of the user.
 * @param {number} duration - The duration of the license.
 * @returns {Object} - JSON object containing success message and license key.
 */
async function createLicense(token, duration) {
    try {
        const rankResponse = await getRank(token);
        if (!rankResponse.success || rankResponse.rank != 3) {
            return {
                success: false,
                message: "Unauthorized"
            };
        }

        const key = await generateLicense();

        const [sqlresult] = await promisePool.query(
            'INSERT INTO `licenses`(`license`, `created`, `duration`, `suspended`) VALUES (?,?,?,?)',
            [key, Date.now(), duration, "false"]
        );

        if (sqlresult.affectedRows > 0) {
            return {
                success: true,
                message: "License created",
                license: key
            };
        }
        return {
            success: false,
            message: "Internal Server Error"
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Checks if a license is active.
 * @param {string} license - The license key.
 * @returns {Object} - JSON object containing success message and license status.
 */
async function isLicenseActive(license) {
    try {
        if (!await doesLicenseExits(license)) {
            return {
                success: false,
                message: "Invalid license"
            };
        }
        const infos = await getLicenseInfo(license);
        const active = infos.expiry >= Date.now() && infos.suspended !== "true";
        return {
            success: true,
            active: active
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Retrieves information about a specific license.
 * @param {string} license - The license key.
 * @returns {Object} - JSON object containing license information.
 */
async function getLicenseInfo(license) {
    try {
        const [result] = await promisePool.query(
            'SELECT * FROM `licenses` WHERE license=?',
            [license]
        );
        if (result.length < 1) {
            return {
                success: false,
                message: "Invalid License"
            };
        }
        return {
            success: true,
            license: result[0].license,
            owner: result[0].userid,
            created: result[0].created,
            expiry: result[0].expiry,
            duration: result[0].duration,
            ip: result[0].ip,
            suspended: result[0].suspended
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Activates a license by setting its expiry date and IP address.
 * @param {string} license - The license key.
 * @param {string} ip - The IP address to associate with the license.
 * @returns {Object} - JSON object containing success message.
 */
async function activateLicense(license, ip) {
    try {
        const info = await getLicenseInfo(license);
        const [sqlresult] = await promisePool.query(
            'UPDATE licenses SET `expiry` = ?, `ip`=? WHERE `license` = ?',
            [Date.now() + (86400000 * info.duration), ip, license]
        );
        return {
            success: true,
        };
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Claims a license by setting its owner.
 * @param {string} license - The license key.
 * @param {string} owner - The user ID of the owner.
 * @returns {Object} - JSON object containing success message.
 */
async function claimLicense(license, owner) {
    try {
        const info = await getLicenseInfo(license);
        if (info.owner != null) {
            return {
                success: false,
                message: "License already claimed"
            };
        }
        const [query] = await promisePool.query(
            'UPDATE licenses SET `userid` = ? WHERE `license` = ?',
            [owner, license]
        );
        if (query.affectedRows > 0) {
            return {
                success: true,
                message: "License claimed"
            };
        }
    } catch (error) {
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
    return {
        success: false,
        message: "Internal Server Error"
    };
}

/**
 * Authenticates a license based on its key and IP address.
 * @param {string} license - The license key.
 * @param {string} ip - The IP address to verify.
 * @returns {Object} - JSON object containing success message and validity status.
 */
async function authenticateLicense(license, ip) {
    try {
        let info = await getLicenseInfo(license);

        if (!info.success) {
            return {
                success: false,
                valid: false,
            };
        }

        if (info.owner == null) {
            return {
                success: true,
                valid: false,
                message: "Unclaimed License"
            };
        }

        if (info.expiry == null) {
            const result = await activateLicense(license, ip);
            if (!result.success) {
                return {
                    success: false,
                    valid: false,
                };
            }
            info = await getLicenseInfo(license);
        }

        const valid = info.ip === ip && info.expiry >= Date.now() && info.suspended !== "true";
        return {
            success: true,
            valid: valid
        };
    } catch (error) {
        return {
            success: false,
            valid: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Deletes a license if the user has the appropriate rank.
 * @param {string} license - The license key.
 * @param {string} token - The token of the user.
 * @returns {Object} - JSON object containing success message.
 */
async function deleteLicense(license, token) {
    try {
        const rankResponse = await getRank(token);
        if (!rankResponse.success || rankResponse.rank != 3) {
            return {
                success: false,
                message: "Unauthorized"
            };
        }
        if (!await doesLicenseExits(license)) {
            return {
                success: false,
                message: "Invalid license"
            };
        }
        const [query] = await promisePool.query(
            'DELETE FROM `licenses` WHERE license=?',
            [license]
        );
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

/**
 * Suspends a license if the user has the appropriate rank.
 * @param {string} license - The license key.
 * @param {string} token - The token of the user.
 * @returns {Object} - JSON object containing success message.
 */
async function suspendLicense(license, token) {
    try {
        const rankResponse = await getRank(token);
        if (!rankResponse.success || rankResponse.rank != 3) {
            return {
                success: false,
                message: "Unauthorized"
            };
        }
        if (!await doesLicenseExits(license)) {
            return {
                success: false,
                message: "Invalid license"
            };
        }
        const [query] = await promisePool.query(
            'UPDATE licenses SET `suspended` = ? WHERE `license` = ?',
            ["true", license]
        );
        return {
            success: true,
        };
    } catch (error) {
        return {
            success: false,
            message: "Internal Server Error"
        };
    }
}

// Utility functions

/**
 * Checks if a license exists in the database.
 * @param {string} license - The license key.
 * @returns {boolean} - True if the license exists, false otherwise.
 */
async function doesLicenseExits(license) {
    const [query] = await promisePool.query(
        'SELECT license FROM `licenses` WHERE license=?',
        [license]
    );
    return query.length > 0;
}

/**
 * Generates a unique license key.
 * @returns {string} - The generated license key.
 */
async function generateLicense() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < process.env.LICENSE_LENGTH) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    if (await doesLicenseExits(result)) {
        return generateLicense();
    }
    return result;
}

/**
 * Generates a random token of the specified length.
 * @param {number} length - The length of the token.
 * @returns {string} - The generated token.
 */
function generateToken(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

// Export the functions
module.exports = {
    createUser,
    getRank,
    getLicensesAmount,
    createLicense,
    authenticateLicense,
    claimLicense,
    suspendLicense,
    isLicenseActive,
    getLicenseInfo,
    deleteLicense
};
