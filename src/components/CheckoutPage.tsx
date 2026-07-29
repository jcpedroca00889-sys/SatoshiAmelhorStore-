import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, X, ArrowLeft, ArrowRight, Check,
  Shield, Clock, MessageCircle, Lock,
  Loader2, Smartphone, QrCode, Copy,
  CheckCircle2, Mail, User, Package, Send,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

// ─── Helpers ───
const formatPrice = (value: number) =>
  "R$ " + value.toFixed(2).replace(".", ",").replace(/\B(?=(?:\d{3})+(?!\d))/g, ".");

const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ─── Step definitions ───
const steps = [
  { id: "identificacao", label: "Identificação", icon: User },
  { id: "pagamento", label: "Pagamento", icon: QrCode },
  { id: "sucesso", label: "Confirmação", icon: CheckCircle2 },
] as const;

type StepId = (typeof steps)[number]["id"];

// ─── Floating particles for success ───
const confettiParticles = Array.from({ length: 24 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  delay: Math.random() * 0.8,
  dur: 1 + Math.random() * 1.5,
  color: ["bg-orange-500", "bg-orange-400", "bg-yellow-500", "bg-green-400", "bg-blue-400", "bg-pink-400"][i % 6],
  size: 4 + Math.random() * 8,
  rotation: Math.random() * 360,
}));

export default function CheckoutPage() {
  const { items, totalItems, totalPrice, closeCheckout, clearCart } = useCart();
  const { user } = useAuth();

  // ─── Step state ───
  const isLoggedIn = !!user;
  const [step, setStep] = useState<StepId>(isLoggedIn ? "pagamento" : "identificacao");
  const [stepIndex, setStepIndex] = useState(isLoggedIn ? 1 : 0);

  // ─── Step 1: Identificação ───
  const [email, setEmail] = useState("");
  const [guestName, setGuestName] = useState(user?.name || "");
  const [acceptedTerms, setAcceptedTerms] = useState(isLoggedIn);

  // ─── Step 2: Pagamento (PIX) ───
  const [pixCopied, setPixCopied] = useState(false);

  // ─── Step 3: Sucesso ───
  const [processing, setProcessing] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderId, setOrderId] = useState("");

  // ─── Validation errors ───
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ─── Advance step ───
  const goToStep = useCallback((next: StepId) => {
    setStep(next);
    setStepIndex(steps.findIndex((s) => s.id === next));
    setErrors({});
  }, []);

  // ─── Validate step 1 ───
  const validateStep1 = useCallback(() => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !isValidEmail(email)) errs.email = "Email inválido";
    if (!guestName.trim()) errs.name = "Nome obrigatório";
    if (!acceptedTerms) errs.terms = "Aceite os termos";
    if (user) return true;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }, [email, guestName, acceptedTerms, user]);

  // ─── Handle continue to payment ───
  const handleContinueToPayment = useCallback(() => {
    if (validateStep1()) goToStep("pagamento");
  }, [validateStep1, goToStep]);

  // ─── Process payment ───
  const handleProcessPayment = useCallback(async () => {
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 2500));
    setOrderId("SS-" + Date.now().toString(36).toUpperCase());
    setOrderDone(true);
    setProcessing(false);
    goToStep("sucesso");
    clearCart();
  }, [goToStep, clearCart]);

  // ─── PIX copy ───
  const handleCopyPix = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `00020126580014BR.GOV.BCB.PIX0136+5543999999995204000053039865406${totalPrice.toFixed(0).padStart(2, "0")}5802BR5913Satoshi Store6008BRASILIA62070503***6304ABCD`
      );
    } catch {
      // fallback
    }
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 2000);
  }, [totalPrice]);

  // ─── Escape key ───
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCheckout();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [closeCheckout]);

  // ─── Mask body scroll ───
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-[70] bg-surface overflow-y-auto"
    >
      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-xl border-b border-border/30">
        <div className="max-w-3xl mx-auto px-4 h-14 sm:h-16 flex items-center justify-between">
          <button
            onClick={stepIndex > 0 && !orderDone ? () => goToStep(steps[stepIndex - 1].id) : closeCheckout}
            className="flex items-center gap-2 text-text-secondary hover:text-orange-500 glass-card-3d card-shine transition-colors touch-target"
          >
            {stepIndex > 0 && !orderDone ? <ArrowLeft size={18} /> : <X size={18} />}
            <span className="text-sm font-medium">
              {stepIndex > 0 && !orderDone ? "Voltar" : "Fechar"}
            </span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <ShoppingBag size={16} className="text-orange-500" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Checkout</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 sm:py-10">
        {/* ─── Step Progress ─── */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-center gap-0">
            {steps.map((s, i) => {
              const isActive = stepIndex >= i;
              const isCurrent = step === s.id;
              const Icon = s.icon;
              return (
                <div key={s.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <motion.div
                      initial={false}
                      animate={{
                        scale: isCurrent ? 1.15 : 1,
                        backgroundColor: isActive ? "rgb(249, 115, 22)" : "rgb(51, 65, 85)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center relative ${
                        isActive ? "shadow-lg shadow-orange-500/20" : ""
                      }`}
                    >
                      {isActive && stepIndex > i ? (
                        <Check size={16} className="text-white" />
                      ) : (
                        <Icon size={16} className={isActive ? "text-white" : "text-text-tertiary"} />
                      )}
                      {isCurrent && (
                        <motion.div
                          layoutId="step-pulse"
                          className="absolute inset-0 rounded-full border-2 border-orange-500/40"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        />
                      )}
                    </motion.div>
                    <span className={`text-[9px] sm:text-[10px] font-medium mt-1.5 transition-colors ${
                      isCurrent ? "text-orange-500" : isActive ? "text-text-secondary" : "text-text-tertiary"
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className="w-16 sm:w-24 h-[2px] mx-2 sm:mx-3 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 bg-surface-3" />
                      <motion.div
                        initial={false}
                        animate={{ x: isActive ? "0%" : "-100%" }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        className="absolute inset-0 bg-orange-500"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Content Area ─── */}
        <AnimatePresence mode="wait">
          {!orderDone && step === "identificacao" && (
            <StepIdentificacao
              key="ident"
              email={email} setEmail={setEmail}
              guestName={guestName} setGuestName={setGuestName}
              acceptedTerms={acceptedTerms} setAcceptedTerms={setAcceptedTerms}
              errors={errors}
              onContinue={handleContinueToPayment}
            />
          )}

          {!orderDone && step === "pagamento" && !processing && (
            <StepPixPagamento
              key="pag"
              pixCopied={pixCopied} onCopyPix={handleCopyPix}
              totalPrice={totalPrice}
              totalItems={totalItems}
              onBack={() => goToStep("identificacao")}
              onProcess={handleProcessPayment}
            />
          )}

          {orderDone && step === "sucesso" && (
            <StepSucesso
              key="sucesso"
              orderId={orderId}
              guestName={guestName}
              email={email}
              totalPrice={totalPrice}
              totalItems={totalItems}
              onClose={closeCheckout}
            />
          )}

          {processing && !orderDone && (
            <StepProcessing key="processing" />
          )}
        </AnimatePresence>

        {/* ─── Review Sidebar ─── */}
        {!orderDone && step !== "sucesso" && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 sm:mt-12 glass rounded-2xl border border-border/30 p-4 sm:p-5"
          >
            <h4 className="text-xs font-semibold text-text-primary mb-3 flex items-center gap-2">
              <Package size={14} className="text-orange-500" />
              Resumo do Pedido ({totalItems} item{totalItems !== 1 ? "s" : ""})
            </h4>
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center gap-3 py-1.5 border-b border-border/10 last:border-0">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                    style={{ backgroundColor: item.product.color + "20" }}
                  >{item.product.image}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-text-primary truncate">{item.product.name}</p>
                    <p className="text-[9px] text-text-tertiary">{item.product.category}</p>
                  </div>
                  <span className="text-[10px] text-text-tertiary">x{item.quantity}</span>
                  <span className="text-[10px] font-semibold text-text-primary">{formatPrice(item.product.priceNumber * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between pt-3 mt-1 border-t border-border/20">
              <span className="text-xs font-medium text-text-primary">Total</span>
              <span className="text-sm font-bold text-orange-500">{formatPrice(totalPrice)}</span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 1 - IDENTIFICAÇÃO
// ════════════════════════════════════════════════════════════

function StepIdentificacao({
  email, setEmail,
  guestName, setGuestName,
  acceptedTerms, setAcceptedTerms,
  errors, onContinue,
}: {
  email: string; setEmail: (v: string) => void;
  guestName: string; setGuestName: (v: string) => void;
  acceptedTerms: boolean; setAcceptedTerms: (v: boolean) => void;
  errors: Record<string, string>;
  onContinue: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20"
        >
          <User size={24} className="text-white" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Quem está comprando?</h2>
        <p className="text-sm text-text-tertiary mt-1">Preencha seus dados para continuar</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl border border-border/30 p-5 sm:p-6 space-y-5 max-w-lg mx-auto"
      >
        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Nome completo</label>
          <div className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 ${
            errors.name ? "border-red-500/50 bg-red-500/5" : email ? "border-orange-500/30 bg-surface-2/40" : "border-border/30 bg-surface-2/30 hover:border-border/60"
          }`}>
            <User size={15} className={`shrink-0 ${errors.name ? "text-red-400" : "text-text-tertiary"}`} />
            <input
              type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-tertiary/60 focus:outline-none"
            />
            {guestName.length > 0 && <Check size={14} className="text-green-400 shrink-0" />}
          </div>
          {errors.name && <p className="text-[10px] text-red-400 mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="text-xs font-medium text-text-secondary mb-1.5 block">Email</label>
          <div className={`relative flex items-center gap-2.5 px-4 py-3 rounded-xl border transition-all duration-300 ${
            errors.email ? "border-red-500/50 bg-red-500/5" : email && isValidEmail(email) ? "border-green-500/30 bg-surface-2/40" : "border-border/30 bg-surface-2/30 hover:border-border/60"
          }`}>
            <Mail size={15} className={`shrink-0 ${errors.email ? "text-red-400" : "text-text-tertiary"}`} />
            <input
              type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="w-full bg-transparent text-text-primary text-sm placeholder:text-text-tertiary/60 focus:outline-none"
            />
            {email.length > 0 && isValidEmail(email) && <Check size={14} className="text-green-400 shrink-0" />}
          </div>
          {errors.email && <p className="text-[10px] text-red-400 mt-1">{errors.email}</p>}
          <p className="text-[9px] text-text-tertiary mt-1.5 flex items-center gap-1">
            <Shield size={10} className="text-green-400" /> Seus dados estão seguros e não serão compartilhados
          </p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <div className={`relative w-5 h-5 rounded-md border-2 shrink-0 mt-0.5 transition-all duration-200 flex items-center justify-center ${
            acceptedTerms ? "bg-orange-500 border-orange-500" : "border-border group-hover:border-orange-500/50"
          }`}>
            {acceptedTerms && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
              >
                <Check size={12} className="text-white" />
              </motion.div>
            )}
            <input type="checkbox" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="absolute inset-0 opacity-0 cursor-pointer" />
          </div>
          <span className="text-xs text-text-secondary leading-relaxed">
            Aceito os{" "}
            <button className="text-orange-500 hover:text-orange-400 underline underline-offset-2">Termos de Uso</button>{" "}
            e{" "}
            <button className="text-orange-500 hover:text-orange-400 underline underline-offset-2">Política de Privacidade</button>
          </span>
        </label>
        {errors.terms && <p className="text-[10px] text-red-400 mt-1">{errors.terms}</p>}

        <motion.button
          onClick={onContinue}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm transition-all relative overflow-hidden group"
          whileHover={{ scale: 1.01, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          Continuar para Pagamento
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 2 - PAGAMENTO (PIX)
// ════════════════════════════════════════════════════════════

function StepPixPagamento({
  pixCopied, onCopyPix,
  totalPrice, totalItems,
  onBack, onProcess,
}: {
  pixCopied: boolean; onCopyPix: () => void;
  totalPrice: number; totalItems: number;
  onBack: () => void;
  onProcess: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
          className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-orange-500/20"
        >
          <QrCode size={24} className="text-white" />
        </motion.div>
        <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Pagamento via PIX</h2>
        <p className="text-sm text-text-tertiary mt-1">
          Total: <span className="text-orange-500 font-semibold">{formatPrice(totalPrice)}</span> &bull; {totalItems} item{totalItems !== 1 ? "s" : ""}
        </p>
      </div>

      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-border/30 p-6 sm:p-8 text-center"
        >
          {/* QR Code */}
          <motion.div
            initial={{ scale: 0, rotateZ: -10 }}
            animate={{ scale: 1, rotateZ: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
            className="w-36 h-36 sm:w-40 sm:h-40 mx-auto rounded-2xl bg-white border border-border/20 flex items-center justify-center mb-5 shadow-xl"
          >
            <QrCode size={80} className="text-orange-500" />
          </motion.div>

          <h3 className="text-base font-semibold text-text-primary mb-1">Pague com PIX</h3>
          <p className="text-xs text-text-tertiary mb-5">
            Escaneie o QR Code com o app do seu banco
          </p>

          {/* PIX Code */}
          <div className="flex items-center gap-2 bg-surface-3/30 rounded-xl px-4 py-3 mb-3 border border-border/20">
            <code className="flex-1 text-[9px] text-text-tertiary font-mono truncate text-left">
              00020126580014BR.GOV.BCB.PIX0136+5543999999995204000053039865406
              {totalPrice.toFixed(0).padStart(2, "0")}5802BR5913Satoshi Store6008BRASILIA62070503***6304ABCD
            </code>
            <motion.button
              onClick={onCopyPix}
              whileTap={{ scale: 0.9 }}
              className={`p-2.5 rounded-lg shrink-0 glass-card-3d card-shine transition-colors ${
                pixCopied
                  ? "text-green-400"
                  : "text-text-tertiary hover:text-orange-500"
              }`}
              aria-label="Copiar código PIX"
            >
              {pixCopied ? <Check size={15} /> : <Copy size={15} />}
            </motion.button>
          </div>
          {pixCopied && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-green-400 font-medium"
            >
              Código PIX copiado!
            </motion.p>
          )}

          <p className="text-[10px] text-text-tertiary mt-4 flex items-center justify-center gap-1.5">
            <Smartphone size={12} /> Abra o app do seu banco, pague via PIX e volte aqui
          </p>

          <p className="text-[9px] text-text-tertiary/60 mt-2 flex items-center justify-center gap-1">
            <Shield size={10} /> Pagamento processado automaticamente após confirmação
          </p>
        </motion.div>

        {/* ── Action Buttons ── */}
        <div className="flex gap-3 mt-5">
          <motion.button
            onClick={onBack}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3.5 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-text-primary text-sm font-medium transition-all"
          >
            Voltar
          </motion.button>
          <motion.button
            onClick={onProcess}
            className="flex-[2] flex items-center justify-center gap-2 py-3.5 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm transition-all relative overflow-hidden group"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <Lock size={15} />
            Confirmar Pedido
          </motion.button>
        </div>

        {/* Secure badge */}
        <div className="flex items-center justify-center gap-4 text-[9px] text-text-tertiary pt-4">
          <span className="flex items-center gap-1"><Lock size={10} className="text-green-400" /> Pagamento Seguro</span>
          <span className="flex items-center gap-1"><Shield size={10} className="text-green-400" /> Dados Criptografados</span>
        </div>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  PROCESSING
// ════════════════════════════════════════════════════════════

function StepProcessing() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-6 py-12"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        className="w-20 h-20 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          <Loader2 size={32} className="text-orange-500" />
        </motion.div>
      </motion.div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-text-primary">Aguardando pagamento</h3>
        <p className="text-sm text-text-tertiary mt-1">
          Confirme o PIX no seu banco para finalizar
        </p>
      </div>
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            className="w-2 h-2 rounded-full bg-orange-500"
          />
        ))}
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════
//  STEP 3 - SUCCESS
// ════════════════════════════════════════════════════════════

function StepSucesso({
  orderId, guestName, email, totalPrice, totalItems, onClose,
}: {
  orderId: string; guestName: string; email: string;
  totalPrice: number; totalItems: number; onClose: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="text-center max-w-lg mx-auto"
    >
      {/* Confetti particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confettiParticles.map((p) => (
          <motion.div
            key={p.id}
            className={`absolute ${p.color} rounded-sm`}
            style={{ left: `${p.x}%`, width: p.size, height: p.size * 0.6, rotate: p.rotation }}
            initial={{ top: -20, opacity: 1 }}
            animate={{ top: "100%", opacity: 0, rotate: p.rotation + 360 }}
            transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.1 }}
        className="w-20 h-20 mx-auto rounded-3xl bg-green-500/15 border border-green-500/20 flex items-center justify-center mb-6 shadow-lg shadow-green-500/10"
      >
        <motion.div
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <CheckCircle2 size={40} className="text-green-400" />
        </motion.div>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-text-primary"
      >
        Pedido Confirmado!
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-text-tertiary mt-2"
      >
        Seu pedido foi processado com sucesso
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass rounded-2xl border border-border/30 p-5 sm:p-6 mt-8 text-left space-y-4"
      >
        <div className="flex items-center gap-3 pb-3 border-b border-border/20">
          <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
            <Package size={18} className="text-orange-500" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-primary">Pedido #{orderId}</p>
            <p className="text-[9px] text-text-tertiary">
              {totalItems} item{totalItems !== 1 ? "s" : ""} &bull; {formatPrice(totalPrice)}
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          <div className="flex items-start gap-2.5">
            <User size={13} className="text-text-tertiary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-text-tertiary">Cliente</p>
              <p className="text-xs font-medium text-text-primary">{guestName}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Mail size={13} className="text-text-tertiary mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-text-tertiary">Email de entrega</p>
              <p className="text-xs font-medium text-text-primary">{email}</p>
            </div>
          </div>
          <div className="flex items-start gap-2.5">
            <Send size={13} className="text-orange-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-[10px] text-text-tertiary">Entrega Digital</p>
              <p className="text-xs font-medium text-green-400">Liberado &mdash; acesse já!</p>
            </div>
          </div>
        </div>

        <div className="border-t border-border/20 pt-3 space-y-2">
          <p className="text-[9px] text-text-tertiary flex items-center gap-1">
            <Clock size={10} className="text-orange-400" /> Os códigos e acessos serão enviados para {email}
          </p>
          <p className="text-[9px] text-text-tertiary flex items-center gap-1">
            <MessageCircle size={10} className="text-orange-500" /> Precisa de ajuda? Fale com nosso suporte via chat
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mt-8 flex flex-col sm:flex-row gap-3"
      >
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-1 py-3 rounded-xl glass-card-3d card-shine text-white font-semibold text-sm relative overflow-hidden group"
        >
          <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          Continuar Comprando
        </motion.button>
        <button           className="flex-1 py-3 rounded-xl glass-card-3d card-shine text-text-secondary hover:text-text-primary text-sm font-medium transition-all">
          Ver Meus Pedidos
        </button>
      </motion.div>
    </motion.div>
  );
}
