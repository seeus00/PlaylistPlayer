import React, { useEffect, useState }  from 'react';
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async () => {
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

        await fetch('/login', {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        }).then(resp => {
            if (resp.ok) {
                setLoginSuccess(true);
            }
        })
    }

    useEffect(() => {
        if (loginSuccess) {
            let interval = setInterval(() => { 
                navigate('/home');
                clearInterval(interval);
            }, 2000)
        }
    }, [loginSuccess])

    return (
        <div>
            <div>
                {loginSuccess ? <p>Login was successful</p> : 
                <div>
                    <h1>Log in</h1>

                    <label htmlFor="email"><b>Email</b></label>
                    <input id="emailValue" type="text" placeholder="Enter Email" name="email" required></input>

                    <label htmlFor="psw"><b>Password</b></label>
                    <input id="passwordValue" type="password" placeholder="Enter Password" name="psw" required></input>

                    <button type="submit" onClick={handleLogin}>Log in</button> 
                    
                </div>
            }
            </div>
        </div>
    )
}