import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

const Viewer = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [imageData, setImageData] = useState({ url: null, slug: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImageData = async () => {
      let url = state?.url;
      let slug = state?.slug;

      // Проверяем state
      if (url && slug) {
        setImageData({ url, slug });
        return;
      }

      // Проверяем sessionStorage
      try {
        const query = new URLSearchParams(window.location.search).get("q") || "random";
        const cached = JSON.parse(sessionStorage.getItem(`photos-${query}`));
        if (cached?.data) {
          const found = cached.data.find((p) => p.id === id);
          if (found) {
            setImageData({ url: found.url, slug: found.slug });
            return;
          }
        }
      } catch (err) {
        console.error("Ошибка при чтении sessionStorage:", err);
      }

      // Если данных нет, запрашиваем API
      if (!ACCESS_KEY) {
        setError("API key is missing");
        return;
      }

      setLoading(true);
      try {
        const res = await axios.get(`https://api.unsplash.com/photos/${id}`, {
          headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
        });
        setImageData({
          url: res.data.urls.regular, // Используем regular для Viewer
          slug: res.data.slug || res.data.id,
        });
      } catch (err) {
        console.error("Ошибка при загрузке фото:", err);
        setError("Failed to load image. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchImageData();
  }, [id, state]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">Loading...</p>
      </div>
    );
  }

  if (error || !imageData.url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">{error || "No image data available."}</p>
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <img
        src={imageData.url}
        alt={imageData.slug}
        className="max-w-full max-h-[85vh] rounded-lg shadow-lg"
      />
      <button
        className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        onClick={() => navigate(-1)}
      >
        Close
      </button>
    </div>
  );
};

export default Viewer;