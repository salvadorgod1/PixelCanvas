import axios from "axios";

const KEY = import.meta.env.VITE_UNSPLASH_API_KEY;
const BASE = import.meta.env.VITE_UNSPLASH_API_URL;

export async function searchPhotos(query, page = 1, per_page = 10) {
  const res = await axios.get(`${BASE}/search/photos`, {
    params: { query, page, per_page },
    headers: { Authorization: `Client-ID ${KEY}` },
  });
  return res.data;
}
