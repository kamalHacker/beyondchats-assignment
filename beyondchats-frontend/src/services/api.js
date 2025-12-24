import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export const fetchArticles = async (status) => {
  const res = await api.get("/articles", {
    params: { status }
  });
  console.log("Fetched articles:", res.data);
  return res.data.data || res.data;
};