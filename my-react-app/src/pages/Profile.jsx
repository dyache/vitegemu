import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

export function Profile() {
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [nickname, setNickname] = useState("");
  const [bio, setBio] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");

    fetch("http://localhost:8000/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Не авторизован");
        return res.json();
      })
      .then((data) => {
        setUser(data.user);
        setReviews(data.reviews);
        setNickname(data.user.nickname || "");
        setBio(data.user.bio || "");
      })
      .catch(() => navigate("/auth"));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    const res = await fetch("http://127.0.0.1:8000/profile", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ nickname, bio }),
    });

    if (res.ok) {
      setMessage("Профиль обновлён!");
    } else {
      setMessage("Ошибка при обновлении профиля.");
    }
  };

  const handleDeleteReview = async (reviewId) => {
    const confirmDelete = window.confirm("Вы уверены, что хотите удалить обзор?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/reviews/${reviewId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) throw new Error("Ошибка удаления");

      setReviews(reviews.filter((r) => r.id !== reviewId));
      setMessage("Обзор удалён");
    } catch (err) {
      setMessage("Ошибка "+ err.message);
    }
  };

  if (!user) return <p className="text-center mt-6">Загрузка профиля...</p>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-3xl mx-auto bg-gray-900 bg-opacity-80 p-8 rounded-xl shadow-xl border border-purple-700">
        <form onSubmit={handleUpdateProfile} className="space-y-6 mb-8">
          <div>
            <label className="block text-purple-400 font-semibold mb-1">Email:</label>
            <input
              value={user.email}
              disabled
              className="w-full p-3 bg-gray-800 text-gray-400 border border-purple-700 rounded"
            />
          </div>
  
          <div>
          <label htmlFor="nickname" className="block text-purple-400 font-semibold mb-1">Никнейм:</label>
            <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="w-full p-3 bg-gray-800 text-white border border-purple-700 rounded"
            required/>
          </div>
  
          <div>
            <label className="block text-purple-400 font-semibold mb-1"> О себе:</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 bg-gray-800 text-white border border-purple-700 rounded"
              rows="3"
            />
          </div>
  
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg shadow transition"
          >
          Сохранить изменения
          </button>
  
          {message && (
            <p className="text-green-400 mt-2 text-sm text-center">{message}</p>
          )}
        </form>
  
        <div className="mb-8 text-center">
          <button
            onClick={handleLogout}
            className="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
          Выйти из аккаунта
          </button>
        </div>
  
        <h3 className="text-2xl font-bold text-purple-300 mb-4">Мои обзоры</h3>
  
        {reviews.length === 0 ? (
          <div className="text-center mt-4">
            <p className="text-gray-400 mb-4">У вас ещё нет обзоров.</p>
            <button
              onClick={() => navigate("/create")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Написать первый обзор
            </button>
          </div>
        ) : (
          <ul className="space-y-4">
            {reviews.map((r) => (
              <li
                key={r.id}
                className="p-4 bg-gray-800 border border-purple-700 rounded-lg shadow hover:shadow-purple-600/50 transition"
              >
                <h4 className="text-xl font-semibold text-purple-200">{r.title}</h4>
                <p className="text-gray-300 mb-2">{r.content.slice(0, 100)}...</p>
                <div className="flex space-x-2">
                  <Link
                    to={`/review/${r.id}`}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Посмотреть
                  </Link>
                  <button
                    onClick={() => handleDeleteReview(r.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Удалить
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}