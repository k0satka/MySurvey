import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { loginUser } from "../api/auth";
import { ApiError } from "../api/client";
import { IconEye, IconEyeOff, IconLock, IconMail } from "../components/icons";
import { useAuth } from "../providers/useAuth";
import "./LoginPage.css";

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

  const handleLogin = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      const response = await loginUser(formData);
      signIn({ token: response.token, user: response.user });
      navigate(redirectPath, { replace: true });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.payload?.message || "Не удалось выполнить вход");
      } else {
        setError("Не удалось выполнить вход");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page login-page">
      <div className="frame login-frame">
        <div className="login-title-group">
          <div className="login-title-label">Авторизация</div>
          <div className="login-title-line" />
        </div>

        {successMessage ? <div className="form-success">{successMessage}</div> : null}
        {error ? <div className="form-error">{error}</div> : null}

        <div className="login-input-group">
          <div className="login-input-label">Email</div>
          <div className="login-input-wrapper">
            <IconMail width={24} height={24} />
            <input
              className="login-input-field"
              name="email"
              type="email"
              placeholder="Введите ваш email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="login-input-line" />
        </div>

        <div className="login-input-group">
          <div className="login-input-label">Пароль</div>
          <div className="login-password-wrapper">
            <div className="login-input-wrapper">
              <IconLock width={24} height={24} />
              <input
                className="login-input-field"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Введите ваш пароль"
                value={formData.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
            <button
              className="login-password-toggle"
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword ? <IconEyeOff width={24} height={24} /> : <IconEye width={24} height={24} />}
            </button>
          </div>
          <div className="login-input-line" />
        </div>

        <button
          className="button-primary login-button-primary"
          type="button"
          onClick={handleLogin}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Входим..." : "Войти"}
        </button>

        <div className="login-register-group">
          <div className="login-register-text">Если у вас нет аккаунта</div>
          <button className="login-register-link" type="button" onClick={() => navigate("/register")}>
            Вы можете зарегистрироваться здесь!
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
