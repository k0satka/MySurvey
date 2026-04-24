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

        setError("Не удалось загрузить список опросов.");
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
    <div className="page dashboard-page">
      <div className="dashboard-shell">
        <header className="dashboard-hero frame dashboard-frame">
          <div className="dashboard-hero-copy">
            <div className="dashboard-kicker">Workspace</div>
            <div className="dashboard-title-label">Личный кабинет</div>
            <p className="dashboard-hero-text">
              Здесь уже работает защищённый контур пользователя. Следующим этапом в этот экран
              встанут карточки опросов, конструктор и базовая статистика.
            </p>
          </div>

          <div className="dashboard-hero-actions">
            <div className="dashboard-mini-stat">
              <span>Аккаунт</span>
              <strong>{user.name}</strong>
            </div>
            <button className="button-secondary dashboard-logout" type="button" onClick={signOut}>
              Выйти
            </button>
          </div>
        </header>

        <section className="dashboard-summary-grid">
          <article className="dashboard-summary-card frame">
            <span>Пользователь</span>
            <strong>{user.name}</strong>
            <p>ID #{user.userID}</p>
          </article>
          <article className="dashboard-summary-card frame">
            <span>Роль</span>
            <strong>{user.isAdmin ? "Администратор" : "Пользователь"}</strong>
            <p>Доступ к защищённому API подтверждён.</p>
          </article>
          <article className="dashboard-summary-card frame">
            <span>Опросы</span>
            <strong>{isLoading ? "..." : surveys.length}</strong>
            <p>Пока список пуст, но контур данных уже подключён.</p>
          </article>
        </section>

        <section className="dashboard-section">
          <article className="dashboard-card dashboard-account-card frame">
            <div className="dashboard-card-header">
              <h2>Профиль</h2>
              <p>Базовая информация для будущей работы с формами и публикациями.</p>
            </div>

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

          <article className="dashboard-card dashboard-surveys-card frame">
            <div className="dashboard-card-header">
              <h2>Мои опросы</h2>
              <p>
                Экран уже разговаривает с backend и готов к тому, чтобы сюда пришли формы,
                статусы публикации и базовая аналитика.
              </p>
            </div>

            {isLoading ? <div className="dashboard-empty">Загружаем данные...</div> : null}
            {!isLoading && error ? <div className="form-error">{error}</div> : null}
            {!isLoading && !error && surveys.length === 0 ? (
              <div className="dashboard-empty">
                <strong>Пока нет ни одного опроса.</strong>
                <span>
                  На следующем этапе здесь появятся карточки форм, конструктор вопросов и базовая
                  статистика.
                </span>
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
                    <span>
                      {survey.publishedAt
                        ? new Date(survey.publishedAt).toLocaleString("ru-RU")
                        : "Не опубликован"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        </section>
      </div>
    </div>
  );
}

export default DashboardPage;
