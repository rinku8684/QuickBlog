import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {

    try {

        // ============================================
        // GET TOKEN
        // ============================================

        const token = req.headers.authorization;

        if (!token) {
            return res.json({
                success: false,
                message: "No token provided"
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
        // CHECK USER TOKEN
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
        // SAVE USER ID
        // ============================================

        req.userId = decoded.userId;


        // ============================================
        // CONTINUE
        // ============================================

        next();

    } catch (error) {

        console.error(
            "User Auth Error:",
            error
        );

        return res.json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};

export default userAuth;