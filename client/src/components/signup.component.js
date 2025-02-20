import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";

export default function Signup() {
    const [signupSuccess, setSignupSuccess] = useState(false);

    const navigate = useNavigate();

    const handleSignup = async () => {
        const headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        };

        const email = document.getElementById('emailValue').value;
        const password = document.getElementById('passwordValue').value;

        if (!email || !password) return;

        const body = {
            email: email,
            password: password,
        };

        await fetch('/signup', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        }).then(resp => {
            if (resp.ok) {
                setSignupSuccess(true);
            }
        })
    }

    useEffect(() => {
        if (signupSuccess) {
            let interval = setInterval(() => { 
                navigate('/home');
                clearInterval(interval);
            }, 2000)
        }
    }, [signupSuccess])

    return (
        <div>
            {signupSuccess ? <p>Signup was successful, redirecting to login...</p> : 
            <div>
                <h1>Sign Up</h1>
                <p>Please fill in this form to create an account.</p>

                <label htmlFor="email"><b>Email</b></label>
                <input id="emailValue" type="text" placeholder="Enter Email" name="email" required></input>

                <label htmlFor="psw"><b>Password</b></label>
                <input id="passwordValue" type="password" placeholder="Enter Password" name="psw" required></input>

                <button type="submit" onClick={handleSignup}>Sign Up</button> 
            </div>}
        </div>
    )
}