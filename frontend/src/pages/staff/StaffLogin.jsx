import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Lock, Loader2, ArrowRight, LayoutGrid } from "lucide-react";

const StaffLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("staff_token", data.token);
        localStorage.setItem("staff_user", JSON.stringify(data.user));
        navigate("/staff/search");
      } else {
        setError(data.error || "Giriş başarısız.");
      }
    } catch (err) {
      console.error("Giriş hatası:", err);
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10 animate-fade-in">
          <div className="bg-indigo-600 w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white mx-auto shadow-xl shadow-indigo-600/30 mb-6">
            <LayoutGrid size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            EasyStaff Girişi
          </h1>
          <p className="text-slate-400 font-bold mt-2">
            Market personeli yönetim portalı
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-indigo-600/5 animate-pop-in">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1">
                Kullanıcı Adı
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800 pl-12"
                  placeholder="Kullanıcı adınız"
                />
                <User
                  className="absolute left-4 top-4 text-slate-400"
                  size={20}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-black text-slate-700 mb-2 ml-1">
                Şifre
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 px-6 py-4 rounded-2xl border-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-bold text-slate-800 pl-12"
                  placeholder="••••••••"
                />
                <Lock
                  className="absolute left-4 top-4 text-slate-400"
                  size={20}
                />
              </div>
            </div>

            {error && (
              <div className="bg-rose-50 text-rose-600 p-4 rounded-xl text-sm font-bold animate-shake text-center border border-rose-100">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-600/20 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={24} />
              ) : (
                <>
                  Giriş Yap
                  <ArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center mt-8 text-slate-400 text-sm font-bold">
          © 2026 EasyData Staff Portal
        </p>
      </div>
    </div>
  );
};

export default StaffLogin;
