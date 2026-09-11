import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

// =====================================================
// BACKEND URL
// =====================================================

const API_URL = import.meta.env.VITE_BASE_URL;

// =====================================================
// AXIOS INSTANCE
// =====================================================

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

// =====================================================
// CONTEXT
// =====================================================

const AppContext = createContext();


// =====================================================
// APP PROVIDER
// =====================================================

export const AppProvider = ({ children }) => {

    const navigate = useNavigate();


    // =================================================
    // ADMIN TOKEN
    // =================================================

    const [token, setToken] = useState(null);


    // =================================================
    // USER TOKEN
    // =================================================

    const [userToken, setUserToken] = useState(null);


    // =================================================
    // USER DATA
    // =================================================

    const [user, setUser] = useState(null);


    // =================================================
    // BLOG DATA
    // =================================================

    const [blogs, setBlogs] = useState([]);

    const [input, setInput] = useState("");


    // =================================================
    // FETCH ALL BLOGS
    // =================================================

    const fetchBlogs = async () => {

        try {

            const { data } = await api.get(
                "/api/blog/all"
            );

            if (data.success) {

                setBlogs(data.blogs || []);

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

            console.error(
                "Backend URL:",
                API_URL
            );

            toast.error(
                "Unable to connect with backend"
            );
        }
    };


    // =================================================
    // LOAD SAVED DATA
    // =================================================

    useEffect(() => {

        // ---------------------------------------------
        // CHECK BACKEND URL
        // ---------------------------------------------

        console.log(
            "Quickblog Backend URL:",
            API_URL
        );


        // ---------------------------------------------
        // FETCH ALL BLOGS
        // ---------------------------------------------

        fetchBlogs();


        // =============================================
        // ADMIN TOKEN
        // =============================================

        const savedAdminToken =
            localStorage.getItem("token");

        if (savedAdminToken) {

            setToken(savedAdminToken);

        }


        // =============================================
        // USER TOKEN
        // =============================================

        const savedUserToken =
            localStorage.getItem("userToken");

        if (savedUserToken) {

            setUserToken(savedUserToken);

        }


        // =============================================
        // USER DATA
        // =============================================

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


    // =================================================
    // USER LOGOUT
    // =================================================

    const logoutUser = () => {

        localStorage.removeItem(
            "userToken"
        );

        localStorage.removeItem(
            "user"
        );

        setUserToken(null);

        setUser(null);

        toast.success(
            "Logged out successfully"
        );

        navigate("/");

    };


    // =================================================
    // CONTEXT VALUE
    // =================================================

    const value = {

        // ---------------------------------------------
        // AXIOS
        // ---------------------------------------------

        axios: api,

        api,

        // ---------------------------------------------
        // NAVIGATION
        // ---------------------------------------------

        navigate,


        // ---------------------------------------------
        // ADMIN
        // ---------------------------------------------

        token,
        setToken,


        // ---------------------------------------------
        // USER
        // ---------------------------------------------

        userToken,
        setUserToken,

        user,
        setUser,

        logoutUser,


        // ---------------------------------------------
        // BLOGS
        // ---------------------------------------------

        blogs,
        setBlogs,

        fetchBlogs,


        // ---------------------------------------------
        // SEARCH
        // ---------------------------------------------

        input,
        setInput

    };


    // =================================================
    // PROVIDER
    // =================================================

    return (

        <AppContext.Provider value={value}>

            {children}

        </AppContext.Provider>

    );

};


// =====================================================
// CUSTOM HOOK
// =====================================================

export const useAppContext = () => {

    return useContext(AppContext);

};