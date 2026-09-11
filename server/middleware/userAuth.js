import jwt from "jsonwebtoken";

const userAuth = (req, res, next) => {

    try {

        const token =
            req.headers.authorization;


        if (!token) {
            return res.json({
                success: false,
                message: "Please login first"
            });
        }


        const decoded =
            jwt.verify(
                token,
                process.env.JWT_SECRET
            );


        if (
            !decoded ||
            decoded.type !== "user"
        ) {
            return res.json({
                success: false,
                message: "Invalid user token"
            });
        }


        req.userId =
            decoded.userId;


        next();

    } catch (error) {

        console.error(
            "User Auth Error:",
            error
        );

        return res.json({
            success: false,
            message: "Invalid or expired user session"
        });
    }
};

export default userAuth;