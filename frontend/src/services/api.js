import axios from "axios";

const API = axios.create({
  baseURL:"http://localhost:8000"
});

API.interceptors.request.use(
(config)=>{

 const token =
 localStorage.getItem("token");

 if(token){
   config.headers.Authorization =
   `Bearer ${token}`;
 }

 return config;
});

export default API;
// to run backend ==> uvicorn app.main:app --reload --port 8000 or 8001 change according