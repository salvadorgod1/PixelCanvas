import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isSearched, setIsSearched] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "random";
  const [query, setQuery] = useState(initialQuery);

  // Функция для получения текущей даты и времени для ключей
  const getCurrentDateTime = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  };

  const fetchPhotos = useCallback(async (searchQuery, pageNum) => {
    if (!searchQuery || !ACCESS_KEY) {
      setError("API key or search query is missing");
      setLoading(false);
      console.error("Missing ACCESS_KEY or searchQuery:", { ACCESS_KEY, searchQuery });
      return;
    }
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching photos with query:", searchQuery, "page:", pageNum);
      const res = await axios.get("https://api.unsplash.com/search/photos", {
        params: { query: searchQuery, per_page: 10, page: pageNum },
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
      });

      const timestamp = getCurrentDateTime(); // Получаем временную метку
      const formatted = res.data.results.map((item) => ({
        id: `${item.id}-${timestamp}`, // Уникальный ключ
        slug: item.slug || item.id,
        url: item.urls.small,
      }));

      console.log("Fetched photos:", formatted);

      // Удаляем дубликаты по id
      setPhotos((prevPhotos) => {
        const newPhotos = pageNum === 1 ? formatted : [...prevPhotos, ...formatted];
        const uniquePhotos = Array.from(
          new Map(newPhotos.map((photo) => [photo.id, photo])).values()
        );
        console.log("Unique photos:", uniquePhotos);
        return uniquePhotos;
      });

      // Сохраняем в sessionStorage без дубликатов
      const existingData = JSON.parse(sessionStorage.getItem(`photos-${searchQuery}`))?.data || [];
      const newData = pageNum === 1 ? formatted : [...existingData, ...formatted];
      const uniqueData = Array.from(
        new Map(newData.map((photo) => [photo.id, photo])).values()
      );

      sessionStorage.setItem(
        `photos-${searchQuery}`,
        JSON.stringify({
          page: pageNum,
          data: uniqueData,
        })
      );

      if (res.data.results.length === 0) {
        setError("No more photos available.");
      }
    } catch (err) {
      console.error("Ошибка при загрузке фото:", err.response?.status, err.response?.data);
      setError("Failed to load photos. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (page === 1 && !isSearched) {
      const saved = sessionStorage.getItem(`photos-${query}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const uniquePhotos = Array.from(
          new Map(parsed.data.map((photo) => [photo.id, photo])).values()
        );
        console.log("Loaded from sessionStorage:", uniquePhotos);
        setPhotos(uniquePhotos);
        setPage(parsed.page);
      }
    }
  }, [isSearched]);

  const handleSearch = () => {
    if (!query.trim()) {
      setError("Please enter a search query");
      return;
    }
    console.log("Search initiated with query:", query);
    setPage(1);
    setPhotos([]);
    setIsSearched(true);
    setSearchParams({ q: query });
    fetchPhotos(query, 1);
  };

  const handleShowMore = () => {
    if (!isSearched) return;
    setPage((prev) => {
      const newPage = prev + 1;
      console.log("Show more, fetching page:", newPage);
      fetchPhotos(query, newPage);
      return newPage;
    });
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center p-4 bg-gray-100">
        <div className="text-xl font-bold">PixelCanvas</div>
        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border p-2 rounded w-full sm:w-64"
            placeholder="Search photos..."
          />
          <button
            onClick={handleSearch}
            className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-600 transition"
          >
            Search
          </button>
        </div>
      </div>

      {error && (
        <p className="text-center py-4 text-red-500">{error}</p>
      )}

      <div className="max-w-7xl mx-auto p-4 columns-2 sm:columns-3 md:columns-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <Link to={`/photo/${photo.id}`} state={{ url: photo.url, slug: photo.slug }}>
              <img
                src={photo.url}
                alt={photo.slug}
                loading="lazy"
                className="w-full rounded-lg shadow-md hover:scale-105 transition-transform duration-300 cursor-pointer"
              />
            </Link>
          </div>
        ))}
      </div>

      {loading && (
        <p className="text-center py-4 text-gray-500">Loading...</p>
      )}

      {!loading && photos.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            onClick={handleShowMore}
            className="bg-red-700 text-white px-6 py-2 rounded hover:bg-red-600 transition"
          >
            Show more
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;