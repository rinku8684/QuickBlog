import jwt from "jsonwebtoken";

const aiAuth = (req, res, next) => {
    try {
        const token = req.headers.authorization;

        if (!token) {
            return res.json({
                success: false,
                message: "Please login first"
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!decoded) {
            return res.json({
                success: false,
                message: "Invalid token"
            });
        }

        // Token valid hai to admin/user dono ko allow karo
        req.authUser = decoded;

        next();

    } catch (error) {
        console.error("AI Auth Error:", error);

        return res.json({
            success: false,
            message: "Invalid or expired session"
        });
    }
};

export default aiAuth;