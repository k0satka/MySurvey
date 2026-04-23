import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";
import { ApiError } from "../api/client";
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from "../components/icons";
import "./RegisterPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    passwordConfirmation: "",
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleRegister = async () => {
    if (formData.password !== formData.passwordConfirmation) {
      setError("Пароли не совпадают");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Регистрация прошла успешно. Теперь войдите в систему." },
      });
    } catch (requestError) {
      if (requestError instanceof ApiError) {
        setError(requestError.payload?.message || "Не удалось выполнить регистрацию");
      } else {
        setError("Не удалось выполнить регистрацию");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page register-page">
      <div className="frame register-frame">
        <div className="auth-brand">
          <span className="auth-brand-badge">Auth</span>
          <p className="auth-brand-copy">Начинаем с учётных записей и пустого личного кабинета для будущих опросов.</p>
        </div>

        <div className="register-title-group">
          <div className="register-title-label">Регистрация</div>
          <div className="register-title-line" />
        </div>

        {error ? <div className="form-error">{error}</div> : null}

        <div className="register-input-group">
          <div className="register-input-label">Имя пользователя</div>
          <div className="register-input-wrapper">
            <IconUser width={24} height={24} />
            <input
              className="register-input-field"
              name="name"
              type="text"
              placeholder="Как к вам обращаться?"
              value={formData.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </div>
          <div className="register-input-line" />
        </div>

        <div className="register-input-group">
          <div className="register-input-label">Email</div>
          <div className="register-input-wrapper">
            <IconMail width={24} height={24} />
            <input
              className="register-input-field"
              name="email"
              type="email"
              placeholder="Введите ваш email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </div>
          <div className="register-input-line" />
        </div>

        <div className="register-input-group">
          <div className="register-input-label">Пароль</div>
          <div className="register-password-wrapper">
            <div className="register-input-wrapper">
              <IconLock width={24} height={24} />
              <input
                className="register-input-field"
                name="password"
                type={showPassword1 ? "text" : "password"}
                placeholder="Введите ваш пароль"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            <button
              className="register-password-toggle"
              type="button"
              onClick={() => setShowPassword1((current) => !current)}
              aria-label={showPassword1 ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword1 ? <IconEyeOff width={24} height={24} /> : <IconEye width={24} height={24} />}
            </button>
          </div>
          <div className="register-input-line" />
        </div>

        <div className="register-input-group">
          <div className="register-input-label">Подтвердите пароль</div>
          <div className="register-password-wrapper">
            <div className="register-input-wrapper">
              <IconLock width={24} height={24} />
              <input
                className="register-input-field"
                name="passwordConfirmation"
                type={showPassword2 ? "text" : "password"}
                placeholder="Подтвердите ваш пароль"
                value={formData.passwordConfirmation}
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
            <button
              className="register-password-toggle"
              type="button"
              onClick={() => setShowPassword2((current) => !current)}
              aria-label={showPassword2 ? "Скрыть пароль" : "Показать пароль"}
            >
              {showPassword2 ? <IconEyeOff width={24} height={24} /> : <IconEye width={24} height={24} />}
            </button>
          </div>
          <div className="register-input-line" />
        </div>

        <div className="register-button-group">
          <button
            className="button-primary register-button-primary"
            type="button"
            onClick={handleRegister}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
          </button>
          <button className="button-secondary register-button-secondary" type="button" onClick={() => navigate("/login")}>
            Назад
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
