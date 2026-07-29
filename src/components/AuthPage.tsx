import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight,
  Loader2, CheckCircle2,
  AlertCircle, Shield, LogIn, UserPlus, AtSign, FileText,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import LegalModal from "./LegalModal";

// ─── Password strength ───
function getPasswordStrength(pw: string): { score: number; label: string; color: string } {
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const map: { score: number; label: string; color: string }[] = [
    { score: 0, label: "Muito fraca", color: "bg-red-500" },
    { score: 1, label: "Fraca", color: "bg-red-400" },
    { score: 2, label: "Razoável", color: "bg-orange-400" },
    { score: 3, label: "Boa", color: "bg-yellow-400" },
    { score: 4, label: "Forte", color: "bg-lime-400" },
    { score: 5, label: "Muito forte", color: "bg-green-400" },
  ];
  return map[score] || map[0];
}

export default function AuthPage() {
  const { closeAuthPage, login, register } = useAuth();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  // ─── Escape key to go back ───
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAuthPage();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeAuthPage]);

  // ─── Submit handler ───
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (!name.trim()) {
        setError("Nome é obrigatório");
        return;
      }
      if (!username.trim()) {
        setError("Nome de usuário é obrigatório");
        return;
      }
      if (username.trim().length < 3) {
        setError("Usuário deve ter pelo menos 3 caracteres");
        return;
      }
      if (password.length < 6) {
        setError("Senha muito curta (mín. 6 caracteres)");
        return;
      }
      if (password !== confirmPassword) {
        setError("Senhas não conferem");
        return;
      }
      if (!acceptedTerms) {
        setError("Você precisa aceitar os Termos de Uso e a Política de Privacidade");
        return;
      }
    } else {
      if (!username.trim()) {
        setError("Nome de usuário é obrigatório");
        return;
      }
      if (password.length < 6) {
        setError("Senha deve ter pelo menos 6 caracteres");
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login(username, password);
      } else {
        await register(name, username, password);
      }
      setSuccess(true);
      setTimeout(() => closeAuthPage(), 2000);
    } catch (e: any) {
      setError(e?.message || "Erro ao processar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  // ─── Trocar modo diretamente ───
  const switchMode = (newMode: "login" | "register") => {
    setMode(newMode);
    setName("");
    setUsername("");
    setPassword("");
    setConfirmPassword("");
    setError("");
    setSuccess(false);
    setShowPassword(false);
    setShowConfirm(false);
    setAcceptedTerms(false);
  };

  const toggleMode = () => {
    switchMode(mode === "login" ? "register" : "login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] bg-surface/95 overflow-y-auto"
    >
      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <button
            onClick={closeAuthPage}
            className="flex items-center gap-1.5 text-text-secondary hover:text-orange-500 transition-colors touch-target"
          >
            <ArrowLeft size={16} />
            <span className="text-xs font-medium">Voltar</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-500/10 text-orange-500 text-[10px] font-medium">
              <Shield size={12} />
              Satoshi Store
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="relative min-h-[calc(100vh-3rem)] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[380px]">
          <div className="relative overflow-hidden rounded-2xl glass-card-3d border border-border/30 shadow-xl">
            {/* ── Top decorative bar ── */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            {/* ── Content ── */}
            <div className="relative px-5 pt-6 pb-5">
              {/* ── Mode Tabs ── */}
              <div className="flex items-center gap-1 mb-5 p-0.5 rounded-lg bg-surface-3/30 border border-border/20">
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mode === "login"
                      ? "bg-orange-500/15 text-orange-500 shadow-sm shadow-orange-500/10"
                      : "text-text-tertiary hover:text-text-secondary hover:bg-surface-3/20"
                  }`}
                >
                  <LogIn size={14} />
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => switchMode("register")}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                    mode === "register"
                      ? "bg-orange-500/15 text-orange-500 shadow-sm shadow-orange-500/10"
                      : "text-text-tertiary hover:text-text-secondary hover:bg-surface-3/20"
                  }`}
                >
                  <UserPlus size={14} />
                  Cadastrar
                </button>
              </div>

              {/* ── Header ── */}
              <div className="text-center mb-4">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3 shadow-md shadow-orange-500/20">
                  <Shield size={20} className="text-white" />
                </div>
                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  {mode === "login" ? "Bem-vindo de volta" : "Criar sua conta"}
                </h2>
                <p className="text-xs text-text-tertiary mt-0.5">
                  {mode === "login"
                    ? "Entre com seu usuário e senha"
                    : "Preencha os dados para se cadastrar"}
                </p>
              </div>

              {/* ── Error message ── */}
              {error && (
                <div className="mb-3 px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Name field (register only) */}
                {mode === "register" && (
                  <FieldInput
                    icon={User}
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={setName}
                  />
                )}

                {/* Username (both modes) */}
                <FieldInput
                  icon={AtSign}
                  type="text"
                  placeholder="Nome de usuário"
                  value={username}
                  onChange={setUsername}
                  isValid={username.length >= 3}
                />

                {/* Password */}
                <div>
                  <FieldInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Sua senha"
                    value={password}
                    onChange={setPassword}
                    isValid={mode === "register" && password.length >= 6}
                  >
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </FieldInput>

                  {/* Password strength (register only) */}
                  {mode === "register" && password.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                              i < strength.score ? strength.color : "bg-surface-3"
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-[10px] ${strength.score <= 2 ? "text-red-400" : strength.score === 3 ? "text-yellow-400" : "text-green-400"}`}>
                        {strength.label}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Password (register only) */}
                {mode === "register" && (
                  <FieldInput
                    icon={Lock}
                    type={showConfirm ? "text" : "password"}
                    placeholder="Confirmar senha"
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    isValid={confirmPassword.length > 0 && confirmPassword === password}
                  >
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </FieldInput>
                )}

                {/* ── Submit button ── */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs disabled:opacity-50 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                >
                  {loading ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : success ? (
                    <CheckCircle2 size={15} className="text-white" />
                  ) : (
                    <>
                      {mode === "login" ? "Entrar" : "Criar conta"}
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

              {/* ── Toggle mode ── */}
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={toggleMode}
                  className="group w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-3/20 hover:bg-surface-3/40 border border-border/20 hover:border-orange-500/20 transition-all duration-300 cursor-pointer"
                >
                  {mode === "login" ? (
                    <span className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
                      Não tem uma conta?{" "}
                      <span className="text-orange-500 group-hover:text-orange-400 font-bold underline underline-offset-4 decoration-orange-500/40 group-hover:decoration-orange-500/70 transition-all">
                        Cadastre-se grátis
                      </span>
                      <ArrowRight size={12} className="inline ml-1 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </span>
                  ) : (
                    <span className="text-xs text-text-tertiary group-hover:text-text-secondary transition-colors">
                      Já tem uma conta?{" "}
                      <span className="text-orange-500 group-hover:text-orange-400 font-bold underline underline-offset-4 decoration-orange-500/40 group-hover:decoration-orange-500/70 transition-all">
                        Faça login
                      </span>
                      <ArrowRight size={12} className="inline ml-1 text-orange-500 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>

              {/* ── Terms Acceptance (register only) ── */}
              {mode === "register" && (
                <div className="mt-3 space-y-2.5">
                  {/* Checkbox de aceite */}
                  <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-surface-3/15 border border-border/20 hover:border-orange-500/20 transition-colors cursor-pointer group">
                    <div className="relative mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        checked={acceptedTerms}
                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                        className="peer sr-only"
                      />
                      <div
                        className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                          acceptedTerms
                            ? "bg-orange-500 border-orange-500"
                            : "border-text-tertiary/40 group-hover:border-orange-500/60"
                        }`}
                      >
                        {acceptedTerms && (
                          <CheckCircle2 size={12} className="text-white" />
                        )}
                      </div>
                    </div>
                    <span className="text-[10px] text-text-tertiary group-hover:text-text-secondary transition-colors leading-relaxed">
                      Li e aceito os{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModal("terms");
                        }}
                        className="text-orange-500 hover:text-orange-400 font-medium underline underline-offset-2 decoration-orange-500/40 transition-all"
                      >
                        Termos de Uso
                      </button>{" "}
                      e a{" "}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          setLegalModal("privacy");
                        }}
                        className="text-orange-500 hover:text-orange-400 font-medium underline underline-offset-2 decoration-orange-500/40 transition-all"
                      >
                        Política de Privacidade
                      </button>
                    </span>
                  </label>

                  {/* Links rápidos para leitura */}
                  <div className="flex items-center gap-2 justify-center">
                    <button
                      type="button"
                      onClick={() => setLegalModal("terms")}
                      className="flex items-center gap-1 text-[9px] text-text-tertiary hover:text-orange-500 transition-colors underline underline-offset-2 decoration-border/40"
                    >
                      <FileText size={10} />
                      Ler Termos de Uso
                    </button>
                    <span className="text-text-tertiary/30">|</span>
                    <button
                      type="button"
                      onClick={() => setLegalModal("privacy")}
                      className="flex items-center gap-1 text-[9px] text-text-tertiary hover:text-orange-500 transition-colors underline underline-offset-2 decoration-border/40"
                    >
                      <Shield size={10} />
                      Ler Política de Privacidade
                    </button>
                  </div>
                </div>
              )}

              {/* ── Success overlay ── */}
              {success && (
                <div className="absolute inset-0 rounded-2xl bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center">
                  <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center mb-2">
                    <CheckCircle2 size={20} className="text-green-400" />
                  </div>
                  <p className="text-xs font-semibold text-text-primary">
                    {mode === "login" ? "Login feito!" : "Conta criada!"}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">Redirecionando...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Legal Modal ── */}
      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </motion.div>
  );
}

// ─── Animated Field Input Component ───
// Cada caractere digitado aparece com animação "pop" individual!
function FieldInput({
  icon: Icon,
  type,
  placeholder,
  value,
  onChange,
  isValid,
  children,
}: {
  icon: any;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  isValid?: boolean;
  children?: React.ReactNode;
}) {
  const [focused, setFocused] = useState(false);
  const [typingPulse, setTypingPulse] = useState(0);
  const prevLengthRef = useRef(0);

  // Track when characters are added to trigger pulse
  useEffect(() => {
    if (value.length !== prevLengthRef.current) {
      setTypingPulse((p) => p + 1);
      prevLengthRef.current = value.length;
    }
  }, [value]);

  // Split value into characters for individual animation
  const chars = value.split("");

  return (
    <div className="relative">
      <div
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-300 ${
          value
            ? isValid
              ? "border-green-500/30 bg-surface-2/40"
              : "border-border/30 bg-surface-2/30"
            : "border-border/30 bg-surface-2/30 hover:border-border/60"
        }`}
      >
        <Icon
          size={13}
          className={`shrink-0 transition-colors duration-300 ${
            value && isValid ? "text-green-400" : focused ? "text-orange-500" : "text-text-tertiary"
          }`}
        />

        {/* ── Animated characters overlay ── */}
        <div className="relative flex-1 h-4 overflow-hidden">
          {/* Actual input (invisible text) */}
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            className="absolute inset-0 w-full bg-transparent text-transparent caret-orange-500 focus:outline-none text-xs z-10"
            placeholder={placeholder}
            autoComplete="off"
          />            {/* ── Animated character display ── */}
          <div className="flex items-center h-full pointer-events-none">
            {value.length > 0 ? (
              <AnimatePresence mode="popLayout">
                {chars.map((char, i) => {
                  const key = `${i}-${char}`;
                  // For password fields, show bullet instead of actual character
                  const displayChar = type === "password" ? "•" : char;
                  return (
                    <motion.span
                      key={key}
                      layout
                      initial={{ opacity: 0, y: 12, scale: 0.5, filter: "blur(4px)" }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        scale: 1,
                        filter: "blur(0px)",
                        color: isValid ? "rgb(34, 197, 94)" : "rgb(241, 245, 249)",
                      }}
                      exit={{
                        opacity: 0,
                        y: -12,
                        scale: 0.5,
                        filter: "blur(4px)",
                        transition: { duration: 0.12 },
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 28,
                        mass: 0.5,
                        delay: i * 0.02,
                      }}
                      className="inline-block text-xs font-medium"
                      style={{
                        fontFamily: "inherit",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {displayChar === " " ? "\u00A0" : displayChar}
                    </motion.span>
                  );
                })}
              </AnimatePresence>
            ) : (
              /* Placeholder text (shown when empty) */
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: focused ? 0.4 : 0.5 }}
                className="text-xs text-text-tertiary/60 pointer-events-none"
              >
                {placeholder}
              </motion.span>
            )}

            {/* ── Blinking cursor (CSS animation) ── */}
            {focused && (
              <span
                className="inline-block w-[1.5px] h-3.5 bg-orange-500 ml-0.5 rounded-full animate-cursor-blink"
              />
            )}
          </div>
        </div>

        {/* ── Check icon ── */}
        {value && isValid && (
          <motion.div
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CheckCircle2 size={11} className="text-green-400 shrink-0" />
          </motion.div>
        )}

        {children}
      </div>

      {/* ── Bottom typing indicator bar ── */}
      {value.length > 0 && (
        <motion.div
          key={typingPulse}
          initial={{ scaleX: 0, opacity: 1 }}
          animate={{
            scaleX: 1,
            opacity: focused ? 1 : 0.5,
            transition: { duration: 0.3, ease: "easeOut" },
          }}
          className="absolute -bottom-[1px] left-1 right-1 h-[2px] rounded-full bg-gradient-to-r from-orange-500/60 via-orange-400/80 to-orange-500/60 origin-left"
          style={{ transformOrigin: "left center" }}
        />
      )}

      {/* ── Character count (only shows when typing) ── */}
      {value.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 0.5, y: 0 }}
          className="absolute -top-2.5 right-1.5 text-[7px] text-text-tertiary font-mono"
        >
          {value.length}
        </motion.div>
      )}
    </div>
  );
}
