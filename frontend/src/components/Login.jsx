import { useState } from "react";
import API from "../services/api";

export default function Login() {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const login = async () => {

    try {

      const res = await API.post(
        "/login",
        {
          email,
          password
        }
      );

      if(res.data.error){
        alert(res.data.error);
        return;
      }

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "name",
        res.data.name
      );

      window.location.reload();

    } catch(error) {

      alert("Login Failed");

    }
  };

  return (

    <div className="w-[400px] bg-slate-900 p-8 rounded-2xl shadow-xl">

      <h2 className="text-3xl font-bold text-center mb-6">
        Welcome Back
      </h2>

      <div className="space-y-4">

        <input
          placeholder="Email"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-800 border border-slate-700 outline-none"
        />

        <button
          onClick={login}
          className="w-full bg-blue-600 hover:bg-blue-700 p-3 rounded-lg font-semibold"
        >
          Login
        </button>

      </div>

    </div>
  );
}