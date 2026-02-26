import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PackageSearch } from "lucide-react";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const API_BASE_URL =
        window.location.hostname === "localhost"
          ? "http://localhost:8080"
          : `http://${window.location.hostname}:8080`;
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      // Gelen yanıtın JSON olup olmadığını kontrol et (Sunucu kapalı veya hata veriyorsa JSON dönmeyebilir)
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Sunucudan geçersiz bir yanıt geldi (JSON değil).");
      }

      const result = await response.json();

      if (response.ok && result.success) {
        // Gerçekte burada token'ı localStorage'a kaydedebilirsiniz
        localStorage.setItem("admin_token", result.token);
        navigate("/admin/dashboard");
      } else {
        setError(result.error || "Giriş başarısız.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-primary text-white p-4 rounded-2xl mb-4 shadow-lg">
            <PackageSearch size={40} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">EasyData Yönetim</h1>
          <p className="text-gray-500 text-sm mt-1">
            Admin paneline erişmek için giriş yapın
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4 text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kullanıcı Adı
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="admin"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-blue-600 disabled:bg-blue-300 text-white font-medium py-3 rounded-xl transition-colors shadow-md mt-2"
          >
            {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
