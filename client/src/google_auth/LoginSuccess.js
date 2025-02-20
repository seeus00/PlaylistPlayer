import React from "react";
import { useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { setIsAuthenticated, setUserInfo } from "../redux/authSlice";

export default function LoginSuccess() {
    const { isAuthenticated } = useSelector(state => state.auth);

    useEffect(() => {
        setTimeout(() => {
            window.close();
        }, 1000)
    }, [])

    return (<div>
        <p>Logged in.</p>
    </div>)
}