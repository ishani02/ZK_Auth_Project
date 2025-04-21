/* global BigInt */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { buildPoseidon } from "circomlibjs";
import { groth16 } from "snarkjs";
import { Buffer } from "buffer";
import './login.scss';

window.Buffer = Buffer;

function Login({ setIsAuth }) {
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const validate = () => {
        const { email, password } = form;
        if (!email || !password) return "All fields are required";
        if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        const validationError = validate();
        if (validationError) return setError(validationError);

        try {
            // 1. Get stored passwordHash
            const userRes = await axios.post("http://localhost:3001/get-user", { email: form.email });
            const { passwordHash, firstName, lastName } = userRes.data;

            // 2. Poseidon hash of entered password
            const poseidon = await buildPoseidon();
            const F = poseidon.F;
            const passwordBigInt = BigInt("0x" + Buffer.from(form.password).toString("hex"));
            const hash = poseidon([passwordBigInt]);
            const calculatedHash = F.toObject(hash).toString();

            // 3. ZK Proof
            const input = {
                password: passwordBigInt.toString(),
                passwordHash: passwordHash
            };

            const { proof, publicSignals } = await groth16.fullProve(
                input,
                "/password_auth.wasm",
                "/password_auth_final.zkey"
            );

            const verifyRes = await axios.post("http://localhost:3001/verify", {
                proof,
                publicSignals
            });

            if (verifyRes.data.success && publicSignals[0] === passwordHash) {
                localStorage.setItem("user", JSON.stringify({ email: form.email, firstName, lastName }));
                setIsAuth(true);
                navigate("/dashboard");
            } else {
                setError("Invalid credentials.");
            }
        } catch (err) {
            console.error(err);
            setError("Login failed. Please check your credentials.");
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2 className="login-title">ZK Auth Login</h2>
                {error && <p className="error-text">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <input
                        className="login-input"
                        name="email"
                        placeholder="Enter your email"
                        value={form.email}
                        onChange={handleChange}
                    />
                    <input
                        className="login-input"
                        type="password"
                        name="password"
                        placeholder="Enter your password"
                        value={form.password}
                        onChange={handleChange}
                    />
                    <button className="login-button" type="submit">Sign In</button>
                </form>
                <p className="login-footer">
                    Don’t have an account? <a href="/register">Register here</a>
                </p>
            </div>
        </div>


    );
}

export default Login;