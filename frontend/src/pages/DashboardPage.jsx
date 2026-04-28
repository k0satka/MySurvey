import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ApiError } from "../api/client";
import { getSurveys } from "../api/surveys";
import {
  IconClipboard,
  IconDoorOpen,
  IconFilter,
  IconMoreVertical,
  IconReload,
  IconSearch,
} from "../components/icons";
import { useAuth } from "../providers/useAuth";
import "./DashboardPage.css";

const STATUS_LABELS = {
  published: "Опубликован",
  draft: "Черновик",
  closed: "Закрыт",
};

function DashboardPage() {
  // Dashboard использует внешний layout, но загружает реальные summaries опросов из защищённого API.
  const navigate = useNavigate();
  const { token, signOut } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Загружаем опросы после того, как protected route подтвердил наличие token.
    let active = true;

    const fetchSurveys = async () => {
      try {
        setLoading(true);
        setError("");
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

        setError("Не удалось загрузить опросы");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchSurveys();

    return () => {
      active = false;
    };
  }, [navigate, signOut, token]);

  const filteredSurveys = useMemo(() => {
    // Поиск и фильтр статуса пока клиентские, потому что размер списка в MVP небольшой.
    return surveys
      .filter((survey) => (filter === "all" ? true : survey.status === filter))
      .filter((survey) => survey.title.toLowerCase().includes(searchQuery.trim().toLowerCase()));
  }, [filter, searchQuery, surveys]);

  const handleLogout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const handleFilterClick = () => {
    const nextFilter = filter === "all" ? "published" : filter === "published" ? "draft" : "all";
    setFilter(nextFilter);
  };

  return (
    <div className="page dashboard-page">
      <header className="site-header">
        <button className="header-logo" type="button" onClick={() => navigate("/dashboard")} aria-label="Открыть dashboard">
          <IconClipboard className="icon-primary" />
        </button>
        <h1 className="text-h1 dashboard-title-label">Сервис опросов</h1>
        <button type="button" className="header-button-logout" onClick={handleLogout} aria-label="Выйти">
          <IconDoorOpen className="icon-primary" />
        </button>
      </header>

      <div className="dashboard-controls">
        <button type="button" className="button-primary dashboard-button-create" disabled title="Конструктор появится позже">
          <span className="dashboard-create-full">+Создать</span>
          <span className="dashboard-create-short">+</span>
        </button>
        <div className="frame dashboard-search-wrapper">
          <IconSearch className="icon-primary" />
          <input
            className="text-body dashboard-search-field"
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
        </div>
        <button
          type="button"
          className="button-tertiary dashboard-button-filter"
          onClick={handleFilterClick}
          title={`Фильтр: ${filter === "all" ? "все" : STATUS_LABELS[filter]}`}
        >
          <IconFilter className="icon-primary" />
        </button>
      </div>

      <div className={`dashboard-surveys-group ${loading || error || filteredSurveys.length === 0 ? "centered" : ""}`}>
        {loading ? (
          <div className="frame dashboard-surveys-loading">
            <div className="dashboard-spinner" />
            <p className="text-h2">Загрузка...</p>
          </div>
        ) : error ? (
          <div className="frame dashboard-surveys-error">
            <p className="text-h2">{error}</p>
            <button type="button" className="button-primary dashboard-button-retry" onClick={() => window.location.reload()}>
              <IconReload className="icon-primary" color="#FFFFFF" />
              <span>Повторить</span>
            </button>
          </div>
        ) : filteredSurveys.length === 0 ? (
          <div className="frame dashboard-surveys-empty dashboard-empty">
            <strong className="text-h2">
              {surveys.length === 0 ? "Пока нет ни одного опроса." : "Не найдено соответствующих опросов"}
            </strong>
          </div>
        ) : (
          <div className="dashboard-surveys-grid">
            {filteredSurveys.map((survey) => (
              <div className="frame dashboard-survey-card" key={survey.surveyID}>
                <div className="dashboard-survey-header">
                  <h2 className="text-h2 dashboard-survey-title">{survey.title}</h2>
                  <button type="button" className="dashboard-survey-actions" disabled aria-label="Действия с опросом">
                    <IconMoreVertical className="icon-secondary" />
                  </button>
                </div>
                <span className={`text-small survey-status--${survey.status}`}>
                  {STATUS_LABELS[survey.status] || survey.status}
                </span>
                <div className="dashboard-survey-info">
                  <p className="text-small">Ответов: 0</p>
                  <p className="text-small">
                    {survey.publishedAt ? new Date(survey.publishedAt).toLocaleDateString("ru-RU") : "Не опубликован"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <footer className="site-footer">
        <p className="text-helper">© 2026 Сервис опросов. Все права защищены.</p>
        <p className="text-helper">MVP для создания и прохождения онлайн-опросов</p>
      </footer>
    </div>
  );
}

export default DashboardPage;
