import React, { useState } from 'react';
import './PasswordResetForm.css';

function PasswordResetForm() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');

    // const [resetPassword, setResetPassword] = useState(false);

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("Please Wait...");

        // Define the request payload
        const requestBody = {
            email: email,
            // protocol: window.location.protocol,
            // host: window.location.host,
        };

        // Make a POST request to the backend endpoint
        try {
            // const response = await fetch('http://localhost:5000/user/forgot-password', {
            const response = await fetch('https://stackoverflow-balajirai.onrender.com/user/forgot-password', {
            // const response = await fetch('https://stackoverflow-balajirai.vercel.app/user/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                // Request was successful, so parse the response JSON
                const data = await response.json();

                // Check the message from the backend
                if (data.message === 'User exists') {
                    setMessage(`A password reset link has been sent to ${email}`);
                } 
                else if(data.message === 'Email not sent'){
                    setMessage("Error occured while sending password reset link")
                }
                else {
                    setMessage('User does not exists.');
                }
            } else {
                // Request failed, display an error message
                setMessage('Password reset request failed. Please try again later.');
            }
        } catch (error) {
            // Handle any network or other errors here
            setMessage('An error occurred. Please try again later.');
        }
    };

    return (
        <div className="center-container-pass">
            <div className="container-pass"> 
                <h2>Password Reset</h2>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                        />
                    </div>
                    <div>
                        <button type="submit">Reset Password</button>
                    </div>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default PasswordResetForm;
