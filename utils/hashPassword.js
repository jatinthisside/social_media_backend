var bcrypt = require('bcryptjs');
exports.hashPassword = async (password) => {
    try {
        const hash = await bcrypt.hash(password, 10);
        return hash;
    } catch (err) {
        console.error("Error while hashing password:", err.message);
        return null;
    }
};