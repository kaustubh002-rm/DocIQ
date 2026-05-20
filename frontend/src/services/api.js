import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export default API;


// to run backend ==> uvicorn app.main:app --reload --port 8000 or 8001 change according