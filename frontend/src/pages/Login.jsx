import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Lock,
  User,
  Loader2,
  ArrowRight,
  LayoutGrid,
  ShieldCheck,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const UnifiedLogin = () => {
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
        // Rolüne göre verileri kaydet ve yönlendir
        if (data.role === "admin") {
          localStorage.setItem("admin_token", data.token);
          navigate("/admin/dashboard");
        } else {
          localStorage.setItem("staff_token", data.token);
          localStorage.setItem("staff_user", JSON.stringify(data.user));
          navigate("/staff/search");
        }
      } else {
        setError(data.error || "Hatalı kullanıcı adı veya şifre.");
      }
    } catch (err) {
      console.error(err);
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Dekoratif Arka Plan Elementleri */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-6xl relative z-10 flex flex-col lg:flex-row items-center justify-center gap-16">
        {/* Sol Taraf: Oturum Açma Formu */}
        <div className="w-full max-w-md">
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex justify-center gap-3 mb-6">
              <div className="bg-indigo-600 w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-600/30">
                <LayoutGrid size={28} />
              </div>
              <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center text-slate-800 shadow-xl shadow-slate-200 border border-slate-100">
                <ShieldCheck size={28} />
              </div>
            </div>
            <h1 className="text-4xl font-black text-slate-800 tracking-tight">
              EasyGate
            </h1>
            <p className="text-slate-400 font-bold mt-2">
              Sisteme erişmek için kimliğinizi doğrulayın
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] shadow-2xl shadow-indigo-600/10 border border-white animate-pop-in">
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">
                  Kullanıcı Adı
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-100/50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-800 pl-14"
                    placeholder="Kullanıcı adınız"
                  />
                  <User
                    className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={20}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black text-slate-700 ml-1">
                  Şifre
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-100/50 px-6 py-4 rounded-2xl border-2 border-transparent focus:border-indigo-500/20 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-800 pl-14"
                    placeholder="••••••••"
                  />
                  <Lock
                    className="absolute left-5 top-4.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"
                    size={20}
                  />
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 text-rose-600 p-4 rounded-2xl text-sm font-bold animate-shake text-center border border-rose-100 italic">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-black text-white py-4.5 rounded-2xl font-black text-lg transition-all shadow-xl shadow-slate-900/20 flex items-center justify-center gap-3 group active:scale-[0.98]"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>
                    Giriş Yap
                    <ArrowRight
                      size={22}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="flex justify-center gap-8 mt-10 opacity-40 grayscale group hover:grayscale-0 transition-all duration-700">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              Secure Access
            </p>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              EasyData v2.0
            </p>
          </div>
        </div>

        {/* Sağ Taraf: QR Kod Tanıma Alanı */}
        <div className="hidden lg:flex flex-col items-center justify-center animate-fade-in group w-full max-w-sm">
          <div className="bg-white/80 backdrop-blur-xl p-10 rounded-[3rem] shadow-2xl shadow-indigo-600/5 border border-white flex flex-col items-center hover:shadow-2xl hover:shadow-indigo-600/10 transition-all duration-500">
            <div className="bg-white p-4 rounded-[2rem] border-[3px] border-slate-100 group-hover:border-indigo-500/20 transition-colors shadow-sm relative overflow-hidden">
              {/* Animasyonlu tarayıcı çizgisi (kozmetik) */}
              <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500/50 shadow-[0_0_20px_5px_rgba(99,102,241,0.5)] animate-scan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <QRCodeCanvas
                value={`${window.location.origin}`}
                size={220}
                fgColor="#000000"
                bgColor="#ffffff"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="text-center mt-8">
              <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">
                Mobil Giriş
              </h3>
              <p className="text-sm font-bold text-slate-500 leading-relaxed px-4">
                Telefonunuzun kamerasını açın ve QR kodunu okutarak hiçbir şifre
                girmeden projenize doğrudan devam edin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnifiedLogin;
