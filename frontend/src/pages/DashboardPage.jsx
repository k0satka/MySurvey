import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { getSurveys } from "../api/surveys";
import { useAuth } from "../providers/useAuth";
import "./DashboardPage.css";

function DashboardPage() {
  const navigate = useNavigate();
  const { token, user, signOut } = useAuth();
  const [surveys, setSurveys] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    const loadSurveys = async () => {
      try {
        const response = await getSurveys(token);
        if (active) {
          setSurveys(response);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (requestError instanceof ApiError && requestError.status === 401) {
          signOut();
          navigate("/login", { replace: true });
          return;
        }

        setError("Не удалось загрузить список опросов");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadSurveys();

    return () => {
      active = false;
    };
  }, [navigate, signOut, token]);

  return (
    <div className="dashboard-shell">
      <header className="dashboard-hero">
        <div>
          <span className="dashboard-badge">Dashboard</span>
          <h1>Здравствуйте, {user.name}</h1>
          <p>
            Это ваш стартовый кабинет. Здесь уже работает авторизация, а следующим шагом команда сможет
            подключить конструктор опросов, публикацию и статистику.
          </p>
        </div>
        <button className="button-secondary dashboard-logout" type="button" onClick={signOut}>
          Выйти
        </button>
      </header>

      <section className="dashboard-grid">
        <article className="dashboard-card">
          <h2>Аккаунт</h2>
          <dl className="dashboard-metadata">
            <div>
              <dt>Имя</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>ID</dt>
              <dd>{user.userID}</dd>
            </div>
            <div>
              <dt>Роль</dt>
              <dd>{user.isAdmin ? "Администратор" : "Пользователь"}</dd>
            </div>
          </dl>
        </article>

        <article className="dashboard-card dashboard-card-wide">
          <div className="dashboard-card-heading">
            <div>
              <h2>Мои опросы</h2>
              <p>Пока список пустой, но база данных и защищённый API уже готовы к следующему этапу.</p>
            </div>
          </div>

          {isLoading ? <div className="dashboard-empty">Загружаем данные...</div> : null}
          {!isLoading && error ? <div className="form-error">{error}</div> : null}
          {!isLoading && !error && surveys.length === 0 ? (
            <div className="dashboard-empty">
              <strong>Пока нет ни одного опроса.</strong>
              <span>На следующем этапе здесь появится конструктор и карточки ваших форм.</span>
            </div>
          ) : null}

          {!isLoading && !error && surveys.length > 0 ? (
            <ul className="dashboard-survey-list">
              {surveys.map((survey) => (
                <li key={survey.surveyID} className="dashboard-survey-item">
                  <div>
                    <strong>{survey.title}</strong>
                    <span>Статус: {survey.status}</span>
                  </div>
                  <span>{survey.publishedAt ? new Date(survey.publishedAt).toLocaleString("ru-RU") : "Не опубликован"}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </article>
      </section>
    </div>
  );
}

export default DashboardPage;
