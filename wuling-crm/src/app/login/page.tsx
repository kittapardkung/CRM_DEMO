"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setBusy(false);
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <form onSubmit={submit} className="card pop" style={{ width: "100%", maxWidth: 380, padding: 26, display: "flex", flexDirection: "column", gap: 16, boxShadow: "0 24px 60px rgba(22,32,43,.10)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: "linear-gradient(145deg, #B36A00, #9A5B00)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--fDisplay)", fontWeight: 700, fontSize: 15 }}>W</span>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, fontFamily: "var(--fDisplay)" }}>Wuling Sales CRM</h1>
            <p style={{ margin: "2px 0 0", fontSize: 11.5, color: "var(--faint)" }}>เข้าสู่ระบบสำหรับทีมขาย</p>
          </div>
        </div>
        <label>
          <span style={{ display: "block", fontSize: 11.5, color: "var(--dim)", marginBottom: 5, fontWeight: 500 }}>อีเมล</span>
          <input className="field" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          <span style={{ display: "block", fontSize: 11.5, color: "var(--dim)", marginBottom: 5, fontWeight: 500 }}>รหัสผ่าน</span>
          <input className="field" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p style={{ margin: 0, fontSize: 12, color: "var(--red)" }}>{error}</p>}
        <button className="btn-primary h-bright" disabled={busy} type="submit">{busy ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
      </form>
    </main>
  );
}
