import { useLocation, useNavigate, useParams } from "react-router-dom";

const Viewer = () => {
  const { state } = useLocation();
  const nav = useNavigate();
  const { id } = useParams();

  let url = state?.url;
  let slug = state?.slug;
  if (!url) {
    try {
      const cached = JSON.parse(sessionStorage.getItem("snap_photos")) || [];
      const found = cached.find((p) => p.id === id);
      if (found) {
        url = found.urls.regular;
        slug = found.slug;
      }
    } catch (err) {
      console.error(err);
    }
  }

  if (!url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-gray-600 mb-4">No image data available.</p>
        <button
          className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          onClick={() => nav(-1)}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 flex flex-col items-center">
      <img
        src={url}
        alt={slug}
        className="max-w-full max-h-[85vh] rounded-lg shadow-lg"
      />
      <button
        className="mt-4 bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
        onClick={() => nav(-1)}
      >
        Close
      </button>
    </div>
  );
}
export default Viewer;