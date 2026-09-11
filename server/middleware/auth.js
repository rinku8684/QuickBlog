import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.json({ success: false, message: "No token provided" });
    }

    try {
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.json({ success: false, message: "Invalid token" });
    }

}

export default auth;