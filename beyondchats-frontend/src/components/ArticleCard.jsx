export default function ArticleCard({ article, onClick }) {
  return (
    <div
      onClick={onClick}
      className="
        cursor-pointer
        bg-[#1f1f1f]
        border-2 border-gray-700
        rounded-xl text-white
        p-6
        shadow-md
        transition
        transform
        hover:scale-105
        hover:shadow-xl
      "
    >
      <h2 className="text-lg font-semibold text-white mb-3">
        {article.title}
      </h2>

      {/* <span className="inline-block text-xs px-3 py-1 rounded-full bg-blue-600/20 text-blue-400">
        ORIGINAL
      </span> */}
    </div>
  );
}
