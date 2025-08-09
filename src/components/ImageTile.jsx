import { Link } from "react-router-dom"

const ImageTile = ({item}) => {
  return (
    <article className="break-inside-avoid mb-4 rounded-lg overflow-hidden shadow hover:shadow-lg transition">
      <Link
        to={`/photo/${item.id}`}
        state={{ url: item.urls.regular, slug: item.slug }}
      >
        <img
          src={item.urls.small}
          alt={item.alt_description || item.slug}
          loading="lazy"
          className="w-full h-auto"
        />
      </Link>
      <div className="p-2 text-sm text-gray-600">
        <div className="font-medium">{item.user?.name || "Author"}</div>
        <div className="text-xs text-gray-400">
          {new Date(item.created_at).toLocaleDateString()}
        </div>
      </div>
    </article>
  )
}

export default ImageTile
