import { useParams, useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import axios from "axios";

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

  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewRes, commentsRes] = await Promise.all([
          fetch(`http://localhost:8000/reviews/${id}`),
          fetch(`http://localhost:8000/reviews/${id}/comments`),
        ]);
        if (!reviewRes.ok || !commentsRes.ok)
          throw new Error("Ошибка загрузки");

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
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser({
          nickname: data.user.nickname,
          is_admin: data.user.is_admin,
        });
      }
    }

    fetchData();
    fetchProfile();
    updateCounts();
  }, [id]);

  const reloadComments = async () => {
    const res = await fetch(`http://localhost:8000/reviews/${id}/comments`);
    if (res.ok) {
      setComments(await res.json());
    }
  };

  const handleDeleteReview = async () => {
    const confirm = window.confirm("Удалить этот обзор?");
    if (!confirm) return;

    const token = localStorage.getItem("token");

    const res = await fetch(`http://localhost:8000/reviews/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content: newComment }),
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
        Authorization: `Bearer ${token}`,
      },
    });
    reloadComments();
  };

  const handleEdit = (commentId, content) => {
    setEditCommentId(commentId);
    setEditedContent(content);
  };

  const handleSaveEdit = async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:8000/reviews/comments/${editCommentId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editedContent }),
      }
    );

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

  const toggleLike = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/likes/toggle",
        { review_id: reviewId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Ошибка лайка:", error);
    }
  };

  const toggleDislike = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8000/dislikes/toggle",
        { review_id: reviewId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (error) {
      console.error("Ошибка дизлайка:", error);
    }
  };

  const getLikeCount = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/likes/${reviewId}/likes/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.count;
    } catch (error) {
      console.error("Ошибка получения лайков:", error);
      return 0;
    }
  };

  const getDislikeCount = async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8000/dislikes/${reviewId}/dislikes/count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return response.data.count;
    } catch (error) {
      console.error("Ошибка получения дизлайков:", error);
      return 0;
    }
  };

  const updateCounts = async () => {
    const likes = await getLikeCount(id);
    const dislikes = await getDislikeCount(id);
    setLikeCount(likes);
    setDislikeCount(dislikes);
  };

  const handleLike = async () => {
    await toggleLike(id);
    updateCounts();
  };

  const handleDislike = async () => {
    await toggleDislike(id);
    updateCounts();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black text-white py-16 px-6"> 
      <div className="max-w-4xl mx-auto bg-gray-900 bg-opacity-80 p-8 rounded-xl shadow-xl border border-purple-800">
        {review && (
          <>
            <h1 className="text-4xl font-bold text-purple-300 drop-shadow mb-4">
              {review.title}
            </h1>
            <p className="text-sm text-purple-400 mb-6">
              Автор:{" "}
              <Link to={`/user/${review.nickname}`}>
                <span className="font-semibold text-purple-500">
                  {review.nickname || "Аноним"}
                </span>{" "}
              </Link>
              | {new Date(review.created_at).toLocaleDateString("ru-RU")}
            </p>
            <p className="text-gray-200 text-lg leading-relaxed mb-6">
              {review.content}
            </p>

            {/* Блок с изображениями */}
            {review.images && review.images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {review.images.map((imgPath, index) => (
                  <div key={index} className="w-full overflow-hidden rounded-lg shadow-md border border-purple-700">
                    <img
                      src={`http://localhost:8000/${imgPath.replace(/\\/g, "/")}`}
                      alt={`Screenshot ${index + 1}`}
                      className="w-full h-64 object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {(currentUser?.nickname === review.nickname ||
              currentUser?.is_admin) && (
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
          <form
            onSubmit={handleReviewEditSubmit}
            className="mb-6 p-4 bg-gray-800 border border-purple-700 rounded-lg space-y-4"
          >
            <h3 className="text-lg font-semibold text-purple-300">
              Редактирование обзора
            </h3>
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
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white"
              >
                💾 Сохранить
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded text-white"
              >
                ✖ Отмена
              </button>
            </div>
          </form>
        )}
</div>
</div>)}
