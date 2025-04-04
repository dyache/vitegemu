import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

export function Home() {
  const [reviews, setReviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetch("http://localhost:8000/reviews")
      .then((res) => res.json())
      .then(setReviews)
      .catch(() => {});
  }, []);

  const filteredReviews = reviews.filter((review) =>
    review.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white font-sans">
  <section className="py-20">
    <div className="max-w-5xl mx-auto px-6 text-center">
      <h1 className="text-5xl font-extrabold text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]">
        Gemu
      </h1>
      <p className="mt-4 text-lg text-gray-300">
        Делитесь мнениями, обсуждайте и критикуйте любые видеоигры.
      </p>
      <div className="mt-8 flex justify-center space-x-4">
        <Link
          to="/create"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:shadow-purple-500/50 transition"
        >
          Написать обзор
        </Link>
        <Link
          to="/profile"
          className="border border-purple-500 text-purple-400 hover:bg-purple-900 hover:text-white px-6 py-3 rounded-lg transition"
        >
          Профиль
        </Link>
      </div>
    </div>
  </section>

  <div className="max-w-4xl mx-auto px-6 mb-8">
    <input
      type="text"
      placeholder="Поиск обзора по названию..."
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-gray-800 text-purple-300 border border-purple-600 placeholder-purple-400 focus:ring-2 focus:ring-purple-500 outline-none"
    />
  </div>

  <section className="max-w-6xl mx-auto px-6 pb-16">
    <h2 className="text-2xl font-bold text-purple-300 mb-6">Последние обзоры</h2>

    {filteredReviews.length === 0 ? (
      <p className="text-gray-400">Обзоров не найдено.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredReviews.map((review) => (
          <Link
            to={`/review/${review.id}`}
            key={review.id}
            className="bg-gray-800 bg-opacity-70 p-5 rounded-xl shadow-lg hover:shadow-purple-600/40 transition duration-300"
          >
            <h3 className="text-xl font-semibold text-purple-300 mb-2">{review.title}</h3>
            <p className="text-sm text-gray-400 mb-1">
              Автор: <span className="text-purple-500">{review.nickname || "Аноним"}</span> —{" "}
              {new Date(review.created_at).toLocaleDateString()}
            </p>
            <p className="text-gray-300 line-clamp-3">{review.content}</p>
          </Link>
        ))}
      </div>
    )}
  </section>
</div>
  );
}
