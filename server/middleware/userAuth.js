import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {
    try {

        // ============================================
        // GET AUTHORIZATION HEADER
        // ============================================

        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.json({
                success: false,
                message: "No token provided"
            });
        }


        // ============================================
        // GET ACTUAL TOKEN
        // ============================================

        const token = authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : authHeader;


        if (!token) {
            return res.json({
                success: false,
                message: "Invalid token"
            });
        }


        // ============================================
        // CHECK JWT SECRET
        // ============================================

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in .env");

            return res.json({
                success: false,
                message: "JWT secret is not configured"
            });
        }


        // ============================================
        // VERIFY TOKEN
        // ============================================

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // ============================================
        // CHECK USER TOKEN TYPE
        // ============================================

        if (
            decoded.type &&
            decoded.type !== "user"
        ) {
            return res.json({
                success: false,
                message: "Invalid user token"
            });
        }


        // ============================================
        // CHECK USER ID
        // ============================================

        if (!decoded.userId) {
            return res.json({
                success: false,
                message: "Invalid user token"
            });
        }


        // ============================================
        // SAVE USER ID
        // ============================================

        req.userId = decoded.userId;


        // ============================================
        // CONTINUE REQUEST
        // ============================================

        next();

    } catch (error) {

        console.error(
            "User Auth Error:",
            error.message
        );

        return res.json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default userAuth;