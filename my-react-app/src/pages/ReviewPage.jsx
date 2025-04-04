import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";



export function ReviewPage() {
  const { id } = useParams();
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [editCommentId, setEditCommentId] = useState(null);
  const [editedContent, setEditedContent] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8000/reviews/${id}`),
          fetch(`http://localhost:8000/reviews/${id}/comments`)
        ]);
        if (!reviewRes.ok || !commentsRes.ok) throw new Error("Ошибка загрузки");

        setReview(await reviewRes.json());
        setComments(await commentsRes.json());
      } catch (err) {
        console.error(err);
      }
    }

    async function fetchProfile() {
      const token = localStorage.getItem("token");
      if (!token) return;
      const res = await fetch("http://localhost:8000/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({
          nickname: data.user.nickname,
          is_admin: data.user.is_admin
        });
      }
    }

    fetchData();
    fetchProfile();
  }, [id]);

  const reloadComments = async () => {
    const res = await fetch(`http://localhost:8000/reviews/${id}/comments`);
    if (res.ok) {
      setComments(await res.json());
    }
  };


  const navigate = useNavigate();

  const handleDeleteReview = async () => {
  const confirm = window.confirm("Удалить этот обзор?");
  if (!confirm) return;

  const token = localStorage.getItem("token");

  const res = await fetch(`http://localhost:8000/reviews/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (res.ok) {
    alert("Обзор удалён");
    navigate("/");
  } else {
    alert("Ошибка при удалении обзора");
  }
};


  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token || !newComment.trim()) return;

    const res = await fetch(`http://localhost:8000/reviews/${id}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: newComment })
    });

    if (res.ok) {
      setNewComment("");
      reloadComments();
    }
  };

  const handleDelete = async (commentId) => {
    const confirm = window.confirm("Удалить комментарий?");
    if (!confirm) return;
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:8000/reviews/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    reloadComments();
  };

  const handleEdit = (commentId, content) => {
    setEditCommentId(commentId);
    setEditedContent(content);
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/reviews/comments/${editCommentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ content: editedContent })
    });

    if (res.ok) {
      setEditCommentId(null);
      setEditedContent("");
      reloadComments();
    }
  };

  const handleReviewEditSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/reviews/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: editedTitle,
        content: editedContent,
      }),
    });

    if (res.ok) {
      const updated = await res.json();
      setReview(updated);
      setEditMode(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-6">
      <div className="max-w-4xl mx-auto bg-gray-900 bg-opacity-80 p-8 rounded-xl shadow-xl border border-purple-800">
        {review && (
          <>
            <h1 className="text-4xl font-bold text-purple-300 drop-shadow mb-4">{review.title}</h1>
            <p className="text-sm text-purple-400 mb-6">
              Автор: <span className="font-semibold text-purple-500">{review.nickname || "Аноним"}</span> |{" "}
              {new Date(review.created_at).toLocaleDateString("ru-RU")}
            </p>
            <p className="text-gray-200 text-lg leading-relaxed mb-6">{review.content}</p>
  
            {(currentUser?.nickname === review.nickname || currentUser?.is_admin) && (
              <div className="flex gap-4 mb-6">
                {currentUser?.nickname === review.nickname && (
                  <button
                    onClick={() => {
                      setEditedTitle(review.title);
                      setEditedContent(review.content);
                      setEditMode(true);
                    }}
                    className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded shadow transition"
                  >
                    Редактировать
                  </button>
                )}
                <button
                  onClick={handleDeleteReview}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded shadow transition"
                >
                  Удалить
                </button>
              </div>
            )}
          </>
        )}
  
        {editMode && (
          <form onSubmit={handleReviewEditSubmit} className="mb-6 p-4 bg-gray-800 border border-purple-700 rounded-lg space-y-4">
            <h3 className="text-lg font-semibold text-purple-300">Редактирование обзора</h3>
            <input
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-purple-600 rounded text-white"
              placeholder="Название игры"
            />
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-purple-600 rounded text-white"
              rows={5}
              placeholder="Текст обзора"
            />
            <div className="flex gap-3">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white">
                💾 Сохранить
              </button>
              <button type="button" onClick={() => setEditMode(false)} className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white">
                ✖ Отмена
              </button>
            </div>
          </form>
        )}
  
        <hr className="border-purple-600 my-8" />
  
        <h2 className="text-2xl text-purple-300 font-semibold mb-4">Комментарии</h2>
  
        {comments.length === 0 ? (
          <p className="text-gray-400 italic">Пока нет комментариев...</p>
        ) : (
          <ul className="space-y-4">
            {comments.map((c) => (
              <li key={c.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow">
                {editCommentId === c.id ? (
                  <>
                    <textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full p-2 bg-gray-900 border border-purple-500 rounded text-white"
                      rows={2}
                    />
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleSaveEdit}
                        className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm"
                      >
                        💾 Сохранить
                      </button>
                      <button
                        onClick={() => setEditCommentId(null)}
                        className="px-3 py-1 bg-gray-500 hover:bg-gray-600 text-white rounded text-sm"
                      >
                        ✖ Отмена
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-200">{c.content}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      — {c.author_nickname}, {new Date(c.created_at).toLocaleString("ru-RU")}
                    </p>
                    {currentUser && (currentUser.nickname === c.author_nickname || currentUser.is_admin) && (
                      <div className="flex gap-2 mt-2">
                        {currentUser.nickname === c.author_nickname && (
                          <button
                            onClick={() => handleEdit(c.id, c.content)}
                            className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm"
                          >
                            ✏
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
                        >
                          🗑
                        </button>
                      </div>
                    )}
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
  
        <form onSubmit={handleCommentSubmit} className="mt-6 space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows="3"
            className="w-full p-3 bg-gray-900 border border-purple-600 rounded text-white"
            placeholder="Напишите свой комментарий..."
          />
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-lg transition"
          >
            Отправить комментарий
          </button>
        </form>
      </div>
    </div>
  );
}