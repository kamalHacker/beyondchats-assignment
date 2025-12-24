import { useEffect, useState } from "react";
import { fetchArticles } from "../services/api";
import ArticleCard from "../components/ArticleCard";
import ArticleModal from "../components/ArticleModal";

export default function ArticlesPage() {
  const [articles, setArticles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles()
      .then((data) => {
        setArticles(data);
        setError(null);
      })
      .catch(() => {
        setError("Failed to load articles. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "auto";
  }, [selected]);

  const originals = articles.filter((a) => a.status === "original");

  const updatedArticle = selected
    ? articles.find((a) => a.parent_article_id === selected.id)
    : null;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10 text-white">
      <h1 className="text-4xl font-bold mb-10 text-white text-center">
        BeyondChats Articles
      </h1>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="flex justify-center items-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      )}

      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {originals.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onClick={() => setSelected(article)}
            />
          ))}
        </div>
      )}

      <ArticleModal
        open={!!selected}
        onClose={() => setSelected(null)}
        original={selected}
        updated={updatedArticle}
      />
    </div>
  );
}
