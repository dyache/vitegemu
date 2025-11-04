import { useState } from "react";

export function CreateReview() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title || !content) {
      setMessage("Заполните все поля!");
      return;
    }

    const newReview = { title, content };
    const token = localStorage.getItem("token");

    if (!token) {
      setMessage("Вы не авторизованы. Пожалуйста, войдите.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // 👈 ВАЖНО!
        },
        body: JSON.stringify(newReview),
      });

      if (!response.ok) throw new Error("Ошибка при создании обзора");

      setMessage("Обзор успешно опубликован!");
      setTitle("");
      setContent("");
    } catch (error) {
      setMessage("Ошибка: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-4">
      <div className="max-w-3xl mx-auto bg-gray-800 bg-opacity-90 p-8 rounded-lg shadow-lg border border-purple-700">
        <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]">
          Создать обзор
        </h2>

        {message && (
          <p className="text-center mb-4 text-sm font-medium text-red-400">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Название игры"
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            placeholder="Описание обзора..."
            className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-600 placeholder-gray-400"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          ></textarea>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg shadow-md hover:shadow-purple-500/50 transition"
          >
            Опубликовать
          </button>
        </form>
      </div>
    </div>
  );
}
