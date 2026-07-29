import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock, User, Eye, EyeOff, ArrowLeft, ArrowRight,
  Loader2, CheckCircle2,
  AlertCircle, Shield, LogIn, UserPlus, AtSign,
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

type AuthStep =
  | "initial"
  | "login-username"
  | "login-password"
  | "register-name"
  | "register-username"
  | "register-password"
  | "register-confirm"
  | "register-terms";

const stepInfo: Record<AuthStep, { question: string; desc: string }> = {
  initial:            { question: "Já tem uma conta?",            desc: "" },
  "login-username":   { question: "Qual seu username?",           desc: "Digite seu nome de usuário" },
  "login-password":   { question: "Qual sua senha?",             desc: "Digite sua senha" },
  "register-name":    { question: "Qual seu nome?",               desc: "Como podemos te chamar?" },
  "register-username":{ question: "Escolha um username",          desc: "Mínimo de 3 caracteres" },
  "register-password":{ question: "Crie uma senha",               desc: "Mínimo de 6 caracteres" },
  "register-confirm": { question: "Confirme a senha",             desc: "Digite a senha novamente" },
  "register-terms":   { question: "Aceitar os termos?",           desc: "Para criar sua conta" },
};

const loginSteps: AuthStep[] = ["login-username", "login-password"];
const registerSteps: AuthStep[] = ["register-name", "register-username", "register-password", "register-confirm", "register-terms"];

export default function AuthPage() {
  const { closeAuthPage, login, register } = useAuth();

  const [step, setStep] = useState<AuthStep>("initial");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [legalModal, setLegalModal] = useState<"terms" | "privacy" | null>(null);

  const info = stepInfo[step];
  const isLogin = step.startsWith("login");
  const isRegister = step.startsWith("register");
  const flow = isLogin ? loginSteps : isRegister ? registerSteps : [];
  const stepIdx = flow.indexOf(step);

  const fieldVal = (() => {
    switch (step) {
      case "login-username": case "register-username": return username;
      case "login-password": case "register-password": return password;
      case "register-name": return name;
      case "register-confirm": return confirmPassword;
      default: return "";
    }
  })();

  const setField = (v: string) => {
    switch (step) {
      case "register-name": setName(v); break;
      case "login-username": case "register-username": setUsername(v); break;
      case "login-password": case "register-password": setPassword(v); break;
      case "register-confirm": setConfirmPassword(v); break;
    }
  };

  const canGo = (): boolean => {
    switch (step) {
      case "initial": return true;
      case "login-username": return username.trim().length >= 3;
      case "login-password": return password.length >= 6;
      case "register-name": return name.trim().length > 0;
      case "register-username": return username.trim().length >= 3;
      case "register-password": return password.length >= 6;
      case "register-confirm": return confirmPassword.length > 0 && confirmPassword === password;
      case "register-terms": return acceptedTerms;
    }
  };

  const next = async () => {
    setError("");

    if (step === "login-username") { setStep("login-password"); return; }
    if (step === "register-name") { setStep("register-username"); return; }
    if (step === "register-username") { setStep("register-password"); return; }
    if (step === "register-password") { setStep("register-confirm"); return; }
    if (step === "register-confirm") { setStep("register-terms"); return; }

    // Submit (login-password or register-terms)
    setLoading(true);
    try {
      if (step === "login-password") {
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

  const back = () => {
    setError("");
    switch (step) {
      case "login-username": setStep("initial"); break;
      case "login-password": setStep("login-username"); break;
      case "register-name": setStep("initial"); break;
      case "register-username": setStep("register-name"); break;
      case "register-password": setStep("register-username"); break;
      case "register-confirm": setStep("register-password"); break;
      case "register-terms": setStep("register-confirm"); break;
    }
  };

  const isPasswordStep = step === "login-password" || step === "register-password" || step === "register-confirm";
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[70] bg-surface/95 overflow-y-auto"
    >
      {/* Top bar */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-12 flex items-center justify-between">
          <button
            onClick={closeAuthPage}
            className="flex items-center gap-1.5 text-text-secondary hover:text-orange-500 transition-colors cursor-pointer"
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

      {/* Main */}
      <div className="relative min-h-[calc(100vh-3rem)] flex items-center justify-center px-4 py-6">
        <div className="w-full max-w-[380px]">
          <div className="relative overflow-hidden rounded-2xl glass-card-3d border border-border/30 shadow-xl">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />

            <div className="relative px-5 pt-6 pb-5">
              {/* Header */}
              <div className="text-center mb-5">
                <div className="w-10 h-10 mx-auto rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-3 shadow-md shadow-orange-500/20">
                  <Shield size={20} className="text-white" />
                </div>

                {/* Progress bar */}
                {flow.length > 0 && (
                  <div className="flex items-center justify-center gap-1 mb-2">
                    {flow.map((s, i) => (
                      <div
                        key={s}
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === stepIdx
                            ? "w-5 bg-orange-500"
                            : i < stepIdx
                            ? "w-1.5 bg-orange-500/40"
                            : "w-1.5 bg-surface-3"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <h2 className="text-base sm:text-lg font-bold text-text-primary">
                  {info.question}
                </h2>
                {info.desc && (
                  <p className="text-xs text-text-tertiary mt-0.5">{info.desc}</p>
                )}
              </div>

              {/* Error */}
              {error && (
                <div className="mb-3 px-3.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Step body */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  {step === "initial" ? (
                    <div className="space-y-3">
                      <button
                        onClick={() => setStep("login-username")}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        <LogIn size={14} />
                        Sim, já tenho conta
                        <ArrowRight size={14} />
                      </button>
                      <button
                        onClick={() => setStep("register-name")}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-surface-3/20 hover:bg-surface-3/40 border border-border/20 hover:border-orange-500/20 text-text-secondary hover:text-text-primary font-semibold text-xs transition-all cursor-pointer"
                      >
                        <UserPlus size={14} />
                        Não, quero cadastrar
                        <ArrowRight size={14} />
                      </button>
                    </div>
                  ) : step === "register-terms" ? (
                    <div className="space-y-4">
                      <label className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-surface-3/15 border border-border/20 hover:border-orange-500/20 transition-colors cursor-pointer group">
                        <div className="relative mt-0.5 shrink-0">
                          <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className={`w-4 h-4 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                            acceptedTerms
                              ? "bg-orange-500 border-orange-500"
                              : "border-text-tertiary/40 group-hover:border-orange-500/60"
                          }`}>
                            {acceptedTerms && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                        </div>
                        <span className="text-[10px] text-text-tertiary group-hover:text-text-secondary transition-colors leading-relaxed">
                          Li e aceito os{" "}
                          <button type="button" onClick={(e) => { e.preventDefault(); setLegalModal("terms"); }} className="text-orange-500 hover:text-orange-400 font-medium underline">
                            Termos de Uso
                          </button>{" "}
                          e a{" "}
                          <button type="button" onClick={(e) => { e.preventDefault(); setLegalModal("privacy"); }} className="text-orange-500 hover:text-orange-400 font-medium underline">
                            Política de Privacidade
                          </button>
                        </span>
                      </label>

                      <button
                        onClick={next}
                        disabled={!canGo() || loading || success}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs disabled:opacity-50 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : success ? (
                          <CheckCircle2 size={15} className="text-white" />
                        ) : (
                          <>
                            Criar conta
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Single input */}
                      {!isPasswordStep ? (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
                          {step === "register-name" ? (
                            <User size={16} className="shrink-0 text-text-tertiary" />
                          ) : (
                            <AtSign size={16} className="shrink-0 text-text-tertiary" />
                          )}
                          <input
                            type="text"
                            value={fieldVal}
                            onChange={(e) => setField(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && canGo()) {
                                e.preventDefault();
                                next();
                              }
                            }}
                            className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary/60 focus:outline-none"
                            placeholder={
                              step === "register-name" ? "Seu nome" :
                              step === "login-username" ? "Seu username" :
                              "Crie um username"
                            }
                            autoFocus
                            autoComplete="off"
                          />
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border/30 bg-surface-2/30 focus-within:border-orange-500/50 transition-all">
                            <Lock size={16} className="shrink-0 text-text-tertiary" />
                            <input
                              type={showPw ? "text" : "password"}
                              value={fieldVal}
                              onChange={(e) => setField(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && canGo()) {
                                  e.preventDefault();
                                  next();
                                }
                              }}
                              className="flex-1 bg-transparent text-sm text-text-primary placeholder-text-tertiary/60 focus:outline-none"
                              placeholder={
                                step === "login-password" ? "Sua senha" :
                                step === "register-password" ? "Crie uma senha" :
                                "Confirme a senha"
                              }
                              autoFocus
                              autoComplete="off"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPw(!showPw)}
                              className="p-1 rounded-md text-text-tertiary hover:text-text-primary hover:bg-surface-3/50 transition-colors cursor-pointer"
                              tabIndex={-1}
                            >
                              {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          </div>

                          {/* Password strength */}
                          {(step === "register-password" || step === "register-confirm") && password.length > 0 && (
                            <div className="mt-2 space-y-1">
                              <div className="flex gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                                    i < strength.score ? strength.color : "bg-surface-3"
                                  }`} />
                                ))}
                              </div>
                              <p className={`text-[10px] ${strength.score <= 2 ? "text-red-400" : strength.score === 3 ? "text-yellow-400" : "text-green-400"}`}>
                                {strength.label}
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next / Submit button */}
                      <button
                        onClick={next}
                        disabled={!canGo() || loading || success}
                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-xs disabled:opacity-50 transition-all shadow-md shadow-orange-500/20 cursor-pointer"
                      >
                        {loading ? (
                          <Loader2 size={15} className="animate-spin" />
                        ) : success ? (
                          <CheckCircle2 size={15} className="text-white" />
                        ) : (
                          <>
                            {step === "login-password" ? "Entrar" : "Próximo"}
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Back button */}
              {step !== "initial" && (
                <div className="mt-4 text-center">
                  <button
                    onClick={back}
                    className="flex items-center justify-center gap-1 text-[10px] text-text-tertiary hover:text-orange-500 transition-colors w-full cursor-pointer"
                  >
                    <ArrowLeft size={12} />
                    Voltar
                  </button>
                </div>
              )}

              {/* Success overlay */}
              {success && (
                <div className="absolute inset-0 rounded-2xl bg-surface/95 backdrop-blur-sm flex flex-col items-center justify-center z-20">
                  <div className="w-10 h-10 rounded-lg bg-green-500/15 flex items-center justify-center mb-2">
                    <CheckCircle2 size={20} className="text-green-400" />
                  </div>
                  <p className="text-xs font-semibold text-text-primary">
                    {isLogin ? "Login feito!" : "Conta criada!"}
                  </p>
                  <p className="text-[10px] text-text-tertiary mt-0.5">Redirecionando...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />
    </motion.div>
  );
}
