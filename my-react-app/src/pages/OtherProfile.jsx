import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const OtherProfile = () => {
  const { nick } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [likesMap, setLikesMap] = useState({});
  const [dislikesMap, setDislikesMap] = useState({});

  const fetchProfileAndReviews = async () => {
    try {
      const profileRes = await axios.get(
        `http://localhost:8000/users/profile/${nick}`,
      );
      setProfile(profileRes.data);

      const reviewsRes = await axios.get(
        `http://localhost:8000/reviews/by-nickname/${nick}`,
      );

      setReviews(reviewsRes.data);
    } catch (error) {
      console.error("Ошибка при получении данных профиля или обзоров:", error);
    }
  };

  const fetchLikesAndDislikes = async (reviewIds) => {
    const newLikesMap = {};
    const newDislikesMap = {};

    await Promise.all(
      reviewIds.map(async (id) => {
        try {
          const [likesRes, dislikesRes] = await Promise.all([
            axios.get(`http://localhost:8000/likes/${id}/likes/count`),
            axios.get(`http://localhost:8000/dislikes/${id}/dislikes/count`),
          ]);

          newLikesMap[id] = likesRes.data.count;
          newDislikesMap[id] = dislikesRes.data.count;
        } catch (err) {
          console.error(
            `Ошибка при загрузке лайков/дизлайков для обзора ${id}`,
            err,
          );
          newLikesMap[id] = 0;
          newDislikesMap[id] = 0;
        }
      }),
    );

    setLikesMap(newLikesMap);
    setDislikesMap(newDislikesMap);
  };

  useEffect(() => {
    fetchProfileAndReviews();
  }, [nick]);

  useEffect(() => {
    if (reviews.length > 0) {
      const ids = reviews.map((r) => r.id);
      fetchLikesAndDislikes(ids);
    }
  }, [reviews]);

  return (
    <main className="container mx-auto p-4 mt-8">
      <div className="w-full max-w-4xl mx-auto bg-[#141b2d] border-purple-500 border rounded-xl overflow-hidden">
        <div className="p-6">
          <div className="flex items-center">
            <h1 className="text-4xl mx-auto text-purple-300 mb-4">
              Профиль пользователя
            </h1>
          </div>
          {profile && (
            <>
              <h1 className="text-2xl font-bold">{profile.nickname}</h1>
              {profile.bio && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold text-purple-400">
                    О себе
                  </h2>
                  <p className="mt-2 text-gray-300">{profile.bio}</p>
                </div>
              )}
            </>
          )}

          {/* Reviews Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">
              Reviews
            </h2>

            <div className="space-y-4">
              {reviews.length === 0 && (
                <p className="text-gray-400">Нет обзоров</p>
              )}
              {reviews.map((review) => (
                <Link to={`/review/${review.id}`}>
                  <div
                    key={review.id}
                    className="bg-[#1a2235] border-purple-800 border rounded-md"
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold">{review.title}</h3>
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-green-500" />
                              <span className="text-sm text-green-500">
                                {likesMap[review.id] ?? 0}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="h-4 w-4 text-red-500" />
                              <span className="text-sm text-red-500">
                                {dislikesMap[review.id] ?? 0}
                              </span>
                            </div>
                          </div>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {new Date(review.created_at).toLocaleDateString(
                            "en-US",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )}
                        </span>
                      </div>
                      <p className="mt-3 text-gray-300">{review.content}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default OtherProfile;
