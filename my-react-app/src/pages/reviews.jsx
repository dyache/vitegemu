import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch("http://127.0.0.1:8000/reviews");
        if (!response.ok) throw new Error("Ошибка загрузки обзоров");

        const data = await response.json();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-purple-400 mb-8 text-center drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
          Все обзоры
        </h1>
  
        {loading && (
          <p className="text-center text-purple-300 animate-pulse">Загрузка обзоров...</p>
        )}
  
        {error && (
          <p className="text-center text-red-500 font-semibold">{error}</p>
        )}
  
        {!loading && reviews.length === 0 ? (
          <p className="text-center text-gray-400">Обзоров пока нет. Будьте первым!</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-gray-800 bg-opacity-80 p-5 rounded-lg border border-purple-700 shadow-lg hover:shadow-purple-500/50 transition duration-300"
              >
                <h2 className="text-xl font-bold text-purple-300 mb-2">{review.title}</h2>
                <p className="text-sm text-gray-300 mb-2">
                  Автор:{" "}
                  <span className="text-purple-400 font-medium">
                    {review.nickname || "Аноним"}
                  </span>
                </p>
                <p className="text-gray-200 mb-4 text-sm">
                  {review.content.length > 120
                    ? review.content.slice(0, 120) + "..."
                    : review.content}
                </p>
                <Link
                  to={`/review/${review.id}`}
                  className="inline-block text-sm text-purple-400 hover:text-white transition"
                >
                  Читать полностью →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}