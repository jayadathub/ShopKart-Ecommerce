import jwt from 'jsonwebtoken';

// Generate a signed JWT token with a 7-day expiration for the user ID
const genToken = (userId) => {
    return jwt.sign({ userId }, process.env.jwt_secret, { expiresIn: '7d' });
};

export default genToken;