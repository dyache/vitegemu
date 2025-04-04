import { useState } from "react";
import { useNavigate } from "react-router-dom";

export function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = isRegister
      ? "http://localhost:8000/auth/register"
      : "http://localhost:8000/auth/json-login";

    const body = isRegister
      ? { email, password, nickname }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Ошибка авторизации");
      }

      const data = await response.json();
      localStorage.setItem("token", data.access_token);
      navigate("/profile");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white px-4">
      <div className="w-full max-w-md bg-gray-900 bg-opacity-90 p-8 rounded-xl shadow-lg border border-purple-700">
        <h1 className="text-3xl font-extrabold text-center text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)] mb-6">
          {isRegister ? "Регистрация" : "Вход"}
        </h1>
  
        {error && (
          <p className="text-center text-red-400 mb-4 text-sm">{error}</p>
        )}
  
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-purple-300 mb-1">Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            />
          </div>
  
          <div>
            <label className="block text-purple-300 mb-1">Пароль:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 rounded bg-gray-800 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
            />
          </div>
  
          {isRegister && (
            <div>
              <label className="block text-purple-300 mb-1">Никнейм:</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                required
                className="w-full px-4 py-2 rounded bg-gray-800 border border-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder-gray-400"
              />
            </div>
          )}
  
          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded transition font-semibold shadow-md hover:shadow-purple-500/40"
          >
            {isRegister ? "Зарегистрироваться" : "Войти"}
          </button>
        </form>
  
        <button
          onClick={() => {
            setIsRegister(!isRegister);
            setError("");
          }}
          className="mt-4 w-full text-purple-400 hover:underline text-sm text-center"
        >
          {isRegister
            ? "Уже есть аккаунт? Войти"
            : "Нет аккаунта? Зарегистрироваться"}
        </button>
      </div>
    </div>
  );
}  