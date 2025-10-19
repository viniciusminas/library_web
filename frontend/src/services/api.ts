/*import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.0.110:8080", // <<< API do Spring
  headers: { "Content-Type": "application/json" },
});

export default api;*/

import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "",
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

export default api;        // <-- default


