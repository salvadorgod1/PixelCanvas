import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_API_KEY;

const Home = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "random";
  const [query, setQuery] = useState(initialQuery);

  const navigate = useNavigate();

  const fetchPhotos = useCallback(async (searchQuery, pageNum) => {
    if (!searchQuery) return;
    setLoading(true);

    try {
      const res = await axios.get("https://api.unsplash.com/search/photos", {
        params: { query: searchQuery, per_page: 10, page: pageNum },
        headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
      });

      const formatted = res.data.results.map((item) => ({
        id: item.id,
        slug: item.slug || item.id,
        url: item.urls.small,
      }));

      setPhotos((prevPhotos) =>
        pageNum === 1 ? formatted : [...prevPhotos, ...formatted]
      );

      sessionStorage.setItem(
        `photos-${searchQuery}`,
        JSON.stringify({
          page: pageNum,
          data: pageNum === 1 ? formatted : [...photos, ...formatted],
        })
      );
    } catch (err) {
      console.error("Ошибка при загрузке фото:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const saved = sessionStorage.getItem(`photos-${query}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      setPhotos(parsed.data);
      setPage(parsed.page);
    } else {
      fetchPhotos(query, page);
    }
  }, [query, page, fetchPhotos]);

  const handleSearch = () => {
    setPage(1);
    setPhotos([]);
    setSearchParams({ q: query });
    navigate(`/?q=${query}`);
  };

  const handleShowMore = () => {
    if (photos.length < 30) {
      setPage((prev) => prev + 1);
    }
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

      <div className="max-w-7xl mx-auto p-4 columns-2 sm:columns-3 md:columns-4 gap-4">
        {photos.map((photo) => (
          <div key={photo.id} className="mb-4 break-inside-avoid">
            <Link to={`/photo/${photo.id}`}>
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

      {!loading && photos.length > 0 && photos.length < 30 && (
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
}
export default Home;