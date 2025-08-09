import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const Header = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initial = searchParams.get("q") || "";
  const [text, setText] = useState(initial);

  const submit = (e) => {
    e.preventDefault();
    const q = text.trim() || "random";
    navigate(`/?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <h1 className="text-xl font-bold text-pink-600">SnapBoard</h1>
      <form onSubmit={submit} className="flex gap-2 w-full max-w-md">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Search images..."
        />
        <button
          type="submit"
          className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition"
        >
          Search
        </button>
      </form>
      <button
        onClick={() => {
          setText("");
          navigate("/");
        }}
        className="ml-2 text-pink-600 hover:underline"
      >
        Home
      </button>
    </header>
  );
};

export default Header;
