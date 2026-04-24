import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";
import { getApiErrorMessage } from "../api/errorMessages";
import { IconEye, IconEyeOff, IconLock, IconMail } from "../components/icons";
import { useAuth } from "../providers/useAuth";
import "./LoginPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateLoginForm(formData) {
  const email = formData.email.trim().toLowerCase();

  if (!EMAIL_PATTERN.test(email)) {
    return "Введите корректный email.";
  }

  if (formData.password.length < 8) {
    return "Пароль должен содержать минимум 8 символов.";
  }

  return "";
}

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const successMessage = location.state?.message || "";
  const redirectPath = location.state?.from || "/dashboard";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    const validationMessage = validateLoginForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      signIn({ token: response.token, user: response.user });
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Не удалось выполнить вход."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page auth-page login-page">
      <div className="auth-layout auth-layout-login">
        <section className="auth-hero auth-hero-login">
          <div className="auth-eyebrow">Auth Gateway</div>
          <h1>У вас уже есть рабочий контур сервиса. Теперь он должен выглядеть уверенно.</h1>
          <p className="auth-hero-text">
            Этот вариант собран как демонстрационный интерфейс для команды: с живым auth-flow,
            ясной структурой и визуалом, который не стыдно показать на обсуждении.
          </p>

          <div className="auth-metric-strip">
            <article>
              <strong>JWT</strong>
              <span>Авторизация через защищённый backend</span>
            </article>
            <article>
              <strong>API</strong>
              <span>FastAPI и PostgreSQL уже в контуре</span>
            </article>
            <article>
              <strong>VPS</strong>
              <span>Staging живёт рядом с production</span>
            </article>
          </div>
        </section>

        <section className="auth-panel login-frame">
          <div className="auth-panel-top">
            <div className="auth-panel-copy">
              <div className="login-title-label dashboard-kicker">Вход в систему</div>
              <h2>Авторизация</h2>
              <p>Войдите, чтобы открыть защищённый dashboard и продолжить работу над MVP.</p>
            </div>
          </div>

          {successMessage ? <div className="form-success">{successMessage}</div> : null}
          {error ? <div className="form-error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleLogin} noValidate>
            <label className="auth-field login-input-group">
              <span className="auth-field-label login-input-label">Email</span>
              <span className="auth-input-shell login-input-wrapper">
                <IconMail width={20} height={20} />
                <input
                  className="auth-input login-input-field"
                  name="email"
                  type="email"
                  placeholder="Введите ваш email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="auth-field login-input-group">
              <span className="auth-field-label login-input-label">Пароль</span>
              <span className="auth-input-shell auth-password-shell login-password-wrapper">
                <span className="login-input-wrapper">
                  <IconLock width={20} height={20} />
                  <input
                    className="auth-input login-input-field"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите ваш пароль"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                </span>
                <button
                  className="auth-password-toggle login-password-toggle"
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword ? <IconEyeOff width={20} height={20} /> : <IconEye width={20} height={20} />}
                </button>
              </span>
            </label>

            <button className="button-primary login-button-primary" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Входим..." : "Войти"}
            </button>
          </form>

          <div className="login-register-group">
            <div className="login-register-text">Ещё нет аккаунта?</div>
            <button className="login-register-link" type="button" onClick={() => navigate("/register")}>
              Создать его в этой же ветке эксперимента
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default LoginPage;
