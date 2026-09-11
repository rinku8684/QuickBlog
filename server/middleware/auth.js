import jwt from "jsonwebtoken";

const auth = (req, res, next) => {
    try {

        const token = req.headers.authorization;

        if (!token) {
            return res.json({
                success: false,
                message: "No token provided"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        // IMPORTANT
        // JWT ke andar userId save hai
        req.userId = decoded.userId;

        next();

    } catch (error) {

        console.error("Auth Error:", error.message);

        return res.json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default auth;