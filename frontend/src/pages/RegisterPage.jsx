import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { registerUser } from "../api/auth";
import { getApiErrorMessage } from "../api/errorMessages";
import { IconEye, IconEyeOff, IconLock, IconMail, IconUser } from "../components/icons";
import "./RegisterPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegisterForm(formData) {
  const name = formData.name.trim();
  const email = formData.email.trim().toLowerCase();

  if (!name) {
    return "Укажите имя, чтобы мы могли создать аккаунт.";
  }

  if (name.length < 2) {
    return "Имя должно содержать минимум 2 символа.";
  }

  if (!EMAIL_PATTERN.test(email)) {
    return "Введите корректный email.";
  }

  if (formData.password.length < 8) {
    return "Пароль должен содержать минимум 8 символов.";
  }

  if (formData.password !== formData.passwordConfirmation) {
    return "Пароли не совпадают.";
  }

  return "";
}

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

  const handleRegister = async (event) => {
    event.preventDefault();

    const validationMessage = validateRegisterForm(formData);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await registerUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
      navigate("/login", {
        replace: true,
        state: { message: "Регистрация прошла успешно. Теперь войдите в систему." },
      });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Не удалось выполнить регистрацию."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page auth-page register-page">
      <div className="auth-layout">
        <section className="auth-hero auth-hero-register">
          <div className="auth-eyebrow">Survey Workspace</div>
          <h1>Соберите основу сервиса так, чтобы команде захотелось его развивать.</h1>
          <p className="auth-hero-text">
            Личный кабинет уже подключён к реальному FastAPI API и PostgreSQL. После входа вы
            попадёте в защищённый dashboard, который станет базой для конструктора форм.
          </p>

          <div className="auth-highlight-grid">
            <article className="auth-highlight-card">
              <span>01</span>
              <strong>Живой backend</strong>
              <p>Регистрация и вход проходят через рабочее API, а не мок-данные.</p>
            </article>
            <article className="auth-highlight-card">
              <span>02</span>
              <strong>Чистый старт</strong>
              <p>Новая ветка уже готова для экспериментов с визуалом без риска для production.</p>
            </article>
            <article className="auth-highlight-card">
              <span>03</span>
              <strong>Понятный путь</strong>
              <p>Форма сразу подсказывает правила: имя от 2 символов, пароль от 8.</p>
            </article>
          </div>
        </section>

        <section className="auth-panel register-frame">
          <div className="auth-panel-top">
            <div className="auth-panel-copy">
              <div className="register-title-label dashboard-kicker">Создание аккаунта</div>
              <h2>Регистрация</h2>
              <p>Откройте доступ к личному кабинету и следующему этапу разработки MVP.</p>
            </div>
          </div>

          {error ? <div className="form-error">{error}</div> : null}

          <form className="auth-form" onSubmit={handleRegister} noValidate>
            <label className="auth-field register-input-group">
              <span className="auth-field-label register-input-label">Имя пользователя</span>
              <span className="auth-input-shell register-input-wrapper">
                <IconUser width={20} height={20} />
                <input
                  className="auth-input register-input-field"
                  name="name"
                  type="text"
                  placeholder="Как к вам обращаться?"
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </span>
            </label>

            <label className="auth-field register-input-group">
              <span className="auth-field-label register-input-label">Email</span>
              <span className="auth-input-shell register-input-wrapper">
                <IconMail width={20} height={20} />
                <input
                  className="auth-input register-input-field"
                  name="email"
                  type="email"
                  placeholder="Введите ваш email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </span>
            </label>

            <label className="auth-field register-input-group">
              <span className="auth-field-label register-input-label">Пароль</span>
              <span className="auth-input-shell auth-password-shell register-password-wrapper">
                <span className="register-input-wrapper">
                  <IconLock width={20} height={20} />
                  <input
                    className="auth-input register-input-field"
                    name="password"
                    type={showPassword1 ? "text" : "password"}
                    placeholder="Минимум 8 символов"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </span>
                <button
                  className="auth-password-toggle register-password-toggle"
                  type="button"
                  onClick={() => setShowPassword1((current) => !current)}
                  aria-label={showPassword1 ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword1 ? <IconEyeOff width={20} height={20} /> : <IconEye width={20} height={20} />}
                </button>
              </span>
            </label>

            <label className="auth-field register-input-group">
              <span className="auth-field-label register-input-label">Подтвердите пароль</span>
              <span className="auth-input-shell auth-password-shell register-password-wrapper">
                <span className="register-input-wrapper">
                  <IconLock width={20} height={20} />
                  <input
                    className="auth-input register-input-field"
                    name="passwordConfirmation"
                    type={showPassword2 ? "text" : "password"}
                    placeholder="Повторите пароль"
                    value={formData.passwordConfirmation}
                    onChange={handleChange}
                    autoComplete="new-password"
                  />
                </span>
                <button
                  className="auth-password-toggle register-password-toggle"
                  type="button"
                  onClick={() => setShowPassword2((current) => !current)}
                  aria-label={showPassword2 ? "Скрыть пароль" : "Показать пароль"}
                >
                  {showPassword2 ? <IconEyeOff width={20} height={20} /> : <IconEye width={20} height={20} />}
                </button>
              </span>
            </label>

            <div className="auth-rules">
              <span>Имя от 2 символов</span>
              <span>Email в формате name@example.com</span>
              <span>Пароль от 8 символов</span>
            </div>

            <div className="register-button-group auth-actions">
              <button className="button-primary register-button-primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Создаём аккаунт..." : "Зарегистрироваться"}
              </button>
              <button
                className="button-secondary register-button-secondary"
                type="button"
                onClick={() => navigate("/login")}
              >
                Назад
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

export default RegisterPage;
