import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Navigate } from "react-router-dom";
import gsap from "gsap";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiShield, FiArrowLeft, FiRefreshCw } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";
import { useToast, errMsg } from "../../context/ToastContext";
import "../../styles/admx-core.css";
import "./AdminLogin.css";

export default function AdminLogin() {
  const { login, verifyOtp, resendOtp, isAuthenticated, loading: sessionLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // step: "credentials" -> "otp"
  const [step, setStep] = useState("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // OTP step state
  const [otpToken, setOtpToken] = useState("");
  const [otp, setOtp] = useState("");
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const cardRef = useRef(null);

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { opacity: 0, y: 24, scale: 0.98 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }
    );
  }, [step]);

  // Countdown for OTP expiry, shown to the user.
  useEffect(() => {
    if (step !== "otp" || otpExpiresIn <= 0) return;
    const t = setInterval(() => setOtpExpiresIn((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [step, otpExpiresIn]);

  // Cooldown before "Resend code" is clickable again.
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((s) => Math.max(s - 1, 0)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  if (!sessionLoading && isAuthenticated) {
    const redirectTo = location.state?.from?.pathname || "/admin/dashboard";
    return <Navigate to={redirectTo} replace />;
  }

  const formatTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await login({ email, password });
      setOtpToken(result.otpToken);
      setOtpExpiresIn(result.expiresIn || 300);
      setCooldown(30);
      setOtp("");
      setStep("otp");
      toast.info(`We've emailed a verification code to ${result.email}.`);
    } catch (err) {
      setError(errMsg(err, "Invalid email or password."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.length !== 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setSubmitting(true);
    try {
      await verifyOtp({ otpToken, otp, rememberMe });
      toast.success("Welcome back!");
      navigate(location.state?.from?.pathname || "/admin/dashboard", { replace: true });
    } catch (err) {
      setError(errMsg(err, "Incorrect or expired code."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0) return;
    setError("");
    setResending(true);
    try {
      const result = await resendOtp({ otpToken });
      setOtpToken(result.otpToken);
      setOtpExpiresIn(result.expiresIn || 300);
      setCooldown(30);
      setOtp("");
      toast.success("A new code has been sent.");
    } catch (err) {
      setError(errMsg(err, "Could not resend code. Please try again."));
    } finally {
      setResending(false);
    }
  };

  const backToCredentials = () => {
    setStep("credentials");
    setError("");
    setOtp("");
  };

  return (
    <div className="admx-root admx-login-root">
      <div className="admx-bg-glow" />
      <div className="admx-login-wrap">
        <div className="admx-login-card admx-glass" ref={cardRef}>
          {step === "credentials" ? (
            <>
              <div className="admx-login-brand">
                <span className="admx-brand-mark admx-login-mark">V</span>
                <h1>Admin Panel</h1>
                <p>Sign in to manage your portfolio</p>
              </div>

              <form onSubmit={handleCredentialsSubmit} className="admx-login-form">
                <div className="admx-field">
                  <label className="admx-label" htmlFor="email">Email address</label>
                  <div className="admx-input-icon-wrap">
                    <FiMail />
                    <input
                      id="email"
                      type="email"
                      className="admx-input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="admx-field">
                  <label className="admx-label" htmlFor="password">Password</label>
                  <div className="admx-input-icon-wrap">
                    <FiLock />
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="admx-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="admx-input-eye"
                      onClick={() => setShowPassword((s) => !s)}
                      tabIndex={-1}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                <div className="admx-login-row">
                  <label className="admx-checkbox-row">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                    />
                    Remember me
                  </label>
                </div>

                {error && <div className="admx-error admx-login-error">{error}</div>}

                <button type="submit" className="admx-btn admx-btn-primary admx-login-submit" disabled={submitting}>
                  {submitting ? <span className="admx-spinner" /> : (<><FiLogIn /> Sign In</>)}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="admx-login-brand">
                <span className="admx-brand-mark admx-login-mark admx-otp-mark"><FiShield /></span>
                <h1>Verify it's you</h1>
                <p>Enter the 6-digit code we emailed to<br /><strong>{email}</strong></p>
              </div>

              <form onSubmit={handleOtpSubmit} className="admx-login-form">
                <div className="admx-field">
                  <label className="admx-label" htmlFor="otp">Verification code</label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    className="admx-input admx-otp-input"
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    autoFocus
                  />
                </div>

                <div className="admx-otp-meta">
                  {otpExpiresIn > 0 ? (
                    <span>Code expires in {formatTime(otpExpiresIn)}</span>
                  ) : (
                    <span className="admx-otp-expired">Code expired — request a new one.</span>
                  )}
                  <button
                    type="button"
                    className="admx-link-btn admx-otp-resend"
                    onClick={handleResend}
                    disabled={cooldown > 0 || resending}
                  >
                    <FiRefreshCw className={resending ? "admx-spin" : ""} />
                    {cooldown > 0 ? `Resend in ${cooldown}s` : resending ? "Sending…" : "Resend code"}
                  </button>
                </div>

                {error && <div className="admx-error admx-login-error">{error}</div>}

                <button
                  type="submit"
                  className="admx-btn admx-btn-primary admx-login-submit"
                  disabled={submitting || otp.length !== 6}
                >
                  {submitting ? <span className="admx-spinner" /> : (<><FiShield /> Verify & Sign In</>)}
                </button>

                <button type="button" className="admx-link-btn admx-otp-back" onClick={backToCredentials}>
                  <FiArrowLeft /> Back to email &amp; password
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
