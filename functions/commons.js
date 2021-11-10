const bcrypt = require('bcrypt');

const encrypt = async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

const comparePasswords = async (password, storedPassword) => {
    return await bcrypt.compare(password, storedPassword);
}

module.exports = { encrypt, comparePasswords }