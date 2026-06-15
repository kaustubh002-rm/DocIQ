import { useState } from "react";
import API from "../services/api";

export default function Signup({ setShowLogin }) {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signup = async () => {

    try {

      const signupRes = await API.post(
        "/signup",
        {
          name,
          email,
          password
        }
      );

      if (signupRes.data.error) {
        alert(signupRes.data.error);
        return;
      }

      alert("Account created successfully. Please login.");

      setName("");
      setEmail("");
      setPassword("");

      // Open Login Form
      setShowLogin(true);

    } catch (error) {

      alert("Signup Failed");

    }
  };

  return (

    <div className="w-[400px] bg-slate-900 p-8 rounded-2xl shadow-xl">

      <h2 className="text-3xl font-bold text-center mb-6">
        Create Account
      </h2>

      <div className="space-y-4">

        <input
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
        />

        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
        />

        <button
          onClick={signup}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Sign Up
        </button>

      </div>

    </div>
  );
}