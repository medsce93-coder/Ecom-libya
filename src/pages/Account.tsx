import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

const ERROR_MAP: Record<string, string> = {
  "Invalid login credentials":        "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "Invalid email or password":        "البريد الإلكتروني أو كلمة المرور غير صحيحة",
  "Email not confirmed":              "يرجى تأكيد بريدك الإلكتروني أولاً",
  "User already registered":          "البريد الإلكتروني مستخدم مسبقاً",
  "Password should be at least 6 characters": "كلمة المرور قصيرة جداً، يجب أن تكون 6 أحرف على الأقل",
  "Signup requires a valid password": "كلمة المرور قصيرة جداً، يجب أن تكون 6 أحرف على الأقل",
  "Unable to validate email address: invalid format": "صيغة البريد الإلكتروني غير صحيحة",
};

function arabicError(msg: string): string {
  for (const [key, ar] of Object.entries(ERROR_MAP)) {
    if (msg.includes(key)) return ar;
  }
  return "حدث خطأ ما، يرجى المحاولة مرة أخرى";
}

export default function Account() {
  const [, setLocation] = useLocation();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName]                   = useState("");
  const [email, setEmail]                 = useState("");
  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("الرجاء إدخال اسمك الكامل"); return; }
    if (!email.trim()) { toast.error("الرجاء إدخال البريد الإلكتروني"); return; }
    if (password.length < 6) { toast.error("كلمة المرور قصيرة جداً، يجب أن تكون 6 أحرف على الأقل"); return; }
    if (password !== confirmPassword) { toast.error("كلمتا المرور غير متطابقتين"); return; }

    setSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { data: { full_name: name.trim() } },
    });
    setSubmitting(false);

    if (error) {
      toast.error(arabicError(error.message));
      return;
    }

    if (data.session) {
      toast.success("تم إنشاء الحساب بنجاح! مرحباً بك");
      setLocation("/");
    } else {
      toast.success("تم إنشاء الحساب! يرجى التحقق من بريدك الإلكتروني لتفعيل الحساب");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) { toast.error("الرجاء إدخال البريد الإلكتروني وكلمة المرور"); return; }

    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setSubmitting(false);

    if (error) {
      toast.error(arabicError(error.message));
      return;
    }

    toast.success("مرحباً بك مجدداً!");
    setLocation("/");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("تم تسجيل الخروج بنجاح");
  };

  const switchMode = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setName(""); setEmail(""); setPassword(""); setConfirmPassword("");
  };

  if (loading) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6 flex items-center justify-center min-h-[40vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-700 rounded-full animate-spin" />
      </section>
    );
  }

  if (user) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
        <div className="mx-auto max-w-xl rounded-[1.6rem] border border-slate-200 bg-white p-8 shadow-sm text-right">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-900">
                {user.user_metadata?.full_name ? `أهلاً، ${user.user_metadata.full_name}` : "أهلاً بك"}
              </h2>
              <p className="text-sm text-slate-500 mt-1">{user.email}</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-400 select-none">
              {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "؟").toUpperCase()}
            </div>
          </div>

          <div className="border-t border-slate-100 pt-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">البريد الإلكتروني</span>
              <span className="font-medium text-slate-800 text-left ltr">{user.email}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">حالة الحساب</span>
              <span className="font-medium text-emerald-600">
                {user.email_confirmed_at ? "مفعّل" : "في انتظار التأكيد"}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-8 w-full rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer min-h-[52px]"
          >
            تسجيل الخروج
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-5xl px-4 py-14 md:px-6">
      <div className="mx-auto max-w-xl rounded-[1.6rem] border border-slate-200 bg-white p-8 shadow-sm text-right">
        <div className="mb-6 flex gap-3">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition cursor-pointer min-h-[52px] ${
              authMode === "login"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => switchMode("signup")}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition cursor-pointer min-h-[52px] ${
              authMode === "signup"
                ? "bg-slate-900 text-white"
                : "border border-slate-300 text-slate-600 hover:bg-slate-50"
            }`}
          >
            إنشاء حساب
          </button>
        </div>

        <h2 className="text-3xl font-bold">
          {authMode === "login" ? "أهلاً بعودتك" : "أنشئ حسابك"}
        </h2>
        <p className="mt-3 text-slate-600">
          {authMode === "login"
            ? "إدارة طلباتك بسهولة"
            : "تابع طلباتك واحصل على العروض"}
        </p>

        <form
          onSubmit={authMode === "login" ? handleLogin : handleSignUp}
          className="mt-6 grid gap-4"
          noValidate
        >
          {authMode === "signup" && (
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              className="rounded-2xl border border-slate-300 px-4 py-3.5 text-right outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-60 min-h-[52px] w-full"
            />
          )}

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={submitting}
            autoComplete="email"
            inputMode="email"
            className="rounded-2xl border border-slate-300 px-4 py-3.5 text-right outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-60 min-h-[52px] w-full"
          />

          <input
            type="password"
            placeholder="كلمة المرور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitting}
            autoComplete={authMode === "login" ? "current-password" : "new-password"}
            className="rounded-2xl border border-slate-300 px-4 py-3.5 text-right outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-60 min-h-[52px] w-full"
          />

          {authMode === "signup" && (
            <input
              type="password"
              placeholder="تأكيد كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={submitting}
              autoComplete="new-password"
              className="rounded-2xl border border-slate-300 px-4 py-3.5 text-right outline-none focus:border-slate-700 focus:ring-2 focus:ring-slate-200 transition disabled:opacity-60 min-h-[52px] w-full"
            />
          )}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-2xl bg-slate-900 px-5 py-3.5 font-semibold text-white hover:bg-slate-700 active:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer transition flex items-center justify-center gap-2 min-h-[52px] w-full"
          >
            {submitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {authMode === "login" ? "جارٍ تسجيل الدخول…" : "جارٍ إنشاء الحساب…"}
              </>
            ) : (
              authMode === "login" ? "تسجيل الدخول" : "إنشاء الحساب"
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
