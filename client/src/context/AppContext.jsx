import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";


// ============================================
// AXIOS BASE URL
// ============================================

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;


// ============================================
// CONTEXT
// ============================================

const AppContext = createContext();


export const AppProvider = ({ children }) => {

    const navigate = useNavigate();


    // ============================================
    // ADMIN TOKEN
    // ============================================

    const [token, setToken] = useState(null);


    // ============================================
    // USER TOKEN
    // ============================================

    const [userToken, setUserToken] = useState(null);


    // ============================================
    // USER DATA
    // ============================================

    const [user, setUser] = useState(null);


    // ============================================
    // BLOG DATA
    // ============================================

    const [blogs, setBlogs] = useState([]);

    const [input, setInput] = useState("");


    // ============================================
    // FETCH BLOGS
    // ============================================

    const fetchBlogs = async () => {

        try {

            const { data } =
                await axios.get("/api/blog/all");

            if (data.success) {

                setBlogs(data.blogs);

            } else {

                toast.error(
                    data.message || "Unable to load blogs"
                );

            }

        } catch (error) {

            console.error(
                "Fetch Blogs Error:",
                error
            );

            toast.error(
                error.response?.data?.message ||
                error.message ||
                "Unable to load blogs"
            );

        }

    };


    // ============================================
    // LOAD SAVED DATA WHEN APP STARTS
    // ============================================

    useEffect(() => {

        // ----------------------------------------
        // FETCH BLOGS
        // ----------------------------------------

        fetchBlogs();


        // ========================================
        // ADMIN TOKEN
        // ========================================

        const adminToken =
            localStorage.getItem("token");

        if (adminToken) {

            setToken(adminToken);

            /*
             * IMPORTANT:
             * Admin middleware expects the token
             * directly in Authorization header.
             */

            axios.defaults.headers.common[
                "Authorization"
            ] = adminToken;

        }


        // ========================================
        // USER TOKEN
        // ========================================

        const savedUserToken =
            localStorage.getItem("userToken");

        if (savedUserToken) {

            setUserToken(savedUserToken);

            /*
             * DO NOT overwrite the global
             * Authorization header here.
             *
             * Otherwise admin token gets replaced
             * by Bearer user token after refresh.
             */

        }


        // ========================================
        // USER DATA
        // ========================================

        const savedUser =
            localStorage.getItem("user");

        if (savedUser) {

            try {

                setUser(
                    JSON.parse(savedUser)
                );

            } catch (error) {

                console.error(
                    "User data error:",
                    error
                );

                localStorage.removeItem("user");

            }

        }

    }, []);


    // ============================================
    // USER LOGOUT
    // ============================================

    const logoutUser = () => {

        // Remove only USER information

        localStorage.removeItem(
            "userToken"
        );

        localStorage.removeItem(
            "user"
        );


        // Reset USER state

        setUserToken(null);

        setUser(null);


        /*
         * IMPORTANT:
         * Do NOT delete Axios Authorization here.
         *
         * Because the Authorization header may
         * contain the ADMIN token.
         */


        toast.success(
            "Logged out successfully"
        );


        navigate("/");

    };


    // ============================================
    // CONTEXT VALUE
    // ============================================

    const value = {

        axios,

        navigate,


        // ----------------------------------------
        // ADMIN
        // ----------------------------------------

        token,
        setToken,


        // ----------------------------------------
        // USER
        // ----------------------------------------

        userToken,
        setUserToken,

        user,
        setUser,

        logoutUser,


        // ----------------------------------------
        // BLOGS
        // ----------------------------------------

        blogs,
        setBlogs,

        input,
        setInput

    };


    // ============================================
    // PROVIDER
    // ============================================

    return (

        <AppContext.Provider value={value}>

            {children}

        </AppContext.Provider>

    );

};


// ============================================
// CUSTOM HOOK
// ============================================

export const useAppContext = () => {

    return useContext(AppContext);

};