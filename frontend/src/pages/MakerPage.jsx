import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';
import { getSurvey, createSurvey, updateSurvey } from '../api/surveys';
import { getErrorMessage } from '../api/errorHandler';
import { logoutUser } from '../api/auth';
import { generateId } from '../components/utils/generateId';
import { validateSurveyForm } from '../components/utils/validators';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import './MakerPage.scss';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import MakerQuestionCard from '../components/layout/MakerQuestionCard';
import { IconArrowLeft, IconReload } from '../components/icons';

function AutoResizeTextarea({ value, onChange, placeholder, rows = 1, ...props }) {
    const textareaRef = useRef(null);

    const resize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${textarea.scrollHeight}px`;
        }
    };

    useEffect(() => {
        resize();
    }, [value]);

    const handleChange = (e) => {
        onChange(e);
        resize();
    };

    return (
        <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        {...props}
        />
    );
}

function MakerPage() {
    {/* --- Функции-помощники --- */}
    const createNewQuestion = (nextPriority) => ({
        id: `q_${generateId()}`,
        questionID: null,
        content: 'Новый вопрос',
        type: 'single',
        isRequired: false,
        orderPriority: nextPriority,
        options: [
            {
                id: `opt_${generateId()}`,
                optionID: null,
                text: 'Новый вариант',
                order: 1
            }
        ]
    });

    const createNewOption = (nextOrder) => ({
        id: `opt_${generateId()}`,
        optionID: null,
        text: 'Новый вариант',
        order: nextOrder
    });

    const prepareForAPI = (data) => {
        const questionsArray = data.questions.map((q, idx) => {
            const optionsArr = (q.options || []).map((opt, optIdx) => ({
                optionID: opt.optionID || undefined,
                text: opt.text,
                order: opt.order ?? optIdx + 1,
            }));
            return {
                questionID: q.questionID || undefined,
                content: q.content,
                type: q.type,
                isRequired: q.isRequired,
                orderPriority: idx + 1,
                options: optionsArr,
            };
        });
        
        return {
            title: data.title,
            description: data.description,
            status: data.status,
            openedAt: data.openedAt,
            closedAt: data.closedAt,
            questions: questionsArray
        };
    };

    {/* --- Состояния компонента --- */}
    const navigate = useNavigate();
    const { token, signOut } = useAuth();
    const { id } = useParams();
    // Данные опроса
    const [surveyData, setSurveyData] = useState({
        surveyId: id || null,
        title: 'Новый опрос',
        description: '',
        closedAt: '',
        questions: [createNewQuestion(1)],
    });
    // Служебные флаги
    const [isEditable, setIsEditable] = useState(true);
    const [fetchLoading, setFetchLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [fetchError, setFetchError] = useState('');
    const [saveError, setSaveError] = useState('');
    const [success, setSuccess] = useState('');
    const [validationErrors, setValidationErrors] = useState({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    {/* --- Функции для отслеживания изменений --- */}
    const markAsChanged = useCallback(() => {
        setHasUnsavedChanges(true);
        setSaveError('');
    }, []);

    const markAsSaved = useCallback(() => {
        setHasUnsavedChanges(false);
    }, []);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges]);

    useEffect(() => {
        if (!isEditable) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasUnsavedChanges(false);
        }
    }, [isEditable]);

    {/* --- Загрузка данных опроса при монтировании --- */}
    const convertApiQuestionsToState = (apiQuestions) => {
        const questionsArray = Array.isArray(apiQuestions) ? apiQuestions : Object.values(apiQuestions);
        return questionsArray.map((q, idx) => ({
            id: q.questionID ? `q_${q.questionID}` : `q_${generateId()}`,
            questionID: q.questionID || null,
            content: q.content,
            type: q.type === 'single' ? 'single' : (q.type === 'multiple' ? 'multiple' : 'text'),
            isRequired: q.isRequired,
            orderPriority: idx + 1,
            options: (q.options || []).map((opt, optIdx) => ({
                id: opt.optionID ? `opt_${opt.optionID}` : `opt_${generateId()}`,
                optionID: opt.optionID || null,
                text: opt.text,
                order: optIdx + 1,
            })),
        }));
    };
    
    const fetchSurvey = useCallback(async () => {
        if (!token) {
            navigate('/login');
            return;
        }

        if (!surveyData.surveyId) {
            return;
        }

        setFetchLoading(true);
        setFetchError('');

        try {
            const data = await getSurvey(token, surveyData.surveyId);
            setSurveyData(prev => ({
                ...prev,
                surveyId: data.surveyID,
                title: data.title || '',
                description: data.description || '',
                closedAt: data.closedAt ? data.closedAt.split('T')[0] : '',
                questions: convertApiQuestionsToState(data.questions)
            }));
            setIsEditable(data.status !== 'published');
            markAsSaved();
        } catch (err) {
            console.error('Fetch survey error:', err);
            setFetchError(getErrorMessage(err, 'Не удалось загрузить опрос.'));
        } finally {
            setFetchLoading(false);
        }
    }, [surveyData.surveyId, token, navigate]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        fetchSurvey();
    }, [fetchSurvey]);

    {/* --- Валидация формы --- */}
    const validateForm = useCallback(() => {
        const { errors, isValid } = validateSurveyForm(surveyData);
        setValidationErrors(errors);
        return isValid;
    }, [surveyData]);

    {/* --- Обработчики действий пользователя --- */}
    const handleLogout = useCallback(async () => {
        try {
            await logoutUser(token);
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            signOut();
            navigate('/login');
        }
    }, [token, navigate, signOut]);

    const handleGoBack = useCallback(() => {
        if (hasUnsavedChanges) {
            const confirmed = window.confirm('У вас есть несохранённые изменения. Вы уверены, что хотите уйти?');
            if (confirmed) {
                navigate('/dashboard');
            }
        } else {
            navigate('/dashboard');
        }
    }, [hasUnsavedChanges, navigate]);

    const handleAddQuestion = useCallback(() => {
        const nextPriority = surveyData.questions.length + 1;
        const newQuestion = createNewQuestion(nextPriority);
        setSurveyData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
        markAsChanged();
        // Очистить ошибку количества вопросов
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.questions;
            return newErrors;
        });
    }, [surveyData.questions, markAsChanged]);

    const handleUpdateQuestion = useCallback((questionId, updates) => {
        setSurveyData(prev => ({
            ...prev,
            questions: prev.questions.map(q =>
                (q.id === questionId || q.questionID === questionId)
                    ? { ...q, ...updates }
                : q
            )
        }));
        markAsChanged();
        // Очистить ошибки вопроса при редактировании
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors[questionId]) {
                delete newErrors[questionId];
            }
            return newErrors;
        });
    }, [surveyData.questions, markAsChanged]);

    const handleDeleteQuestion = useCallback((questionId) => {
        setSurveyData(prev => ({
            ...prev,
            questions: prev.questions.filter(q =>
                q.id !== questionId && q.questionID !== questionId
            )
        }));
        markAsChanged();
        // Очистить ошибки удалённого вопроса
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            if (newErrors[questionId]) {
                delete newErrors[questionId];
            }
            return newErrors;
        });
    }, [surveyData.questions, markAsChanged]);

    const handleSave = useCallback(async (publish = false) => {
        if (!validateForm()) {
            return;
        }

        setSaveLoading(true);
        setSaveError('');
        setSuccess('');

        try {
            if (!token) {
                navigate('/login');
                return;
            }

            const payload = prepareForAPI({
                ...surveyData,
                status: publish ? 'published' : 'draft',
                openedAt: publish ? null : new Date().toISOString(),
            });

            let data;
            if (surveyData.surveyId) {
                data = await updateSurvey(token, surveyData.surveyId, payload);
            } else {
                data = await createSurvey(token, payload);
            }

            // Если это новый опрос, сохраняем ID
            if (!surveyData.surveyId && data.surveyID) {
                setSurveyData(prev => ({ ...prev, surveyId: data.surveyID }));
                navigate(`/maker/${data.surveyID}`, { replace: true });
            }

            // Если опрос опубликован, блокируем редактирование
            if (publish) {
                setIsEditable(false);
            }

            setValidationErrors({});
            markAsSaved();
            setSuccess(publish ? 'Опрос опубликован' : 'Опрос сохранён');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            console.error('Save error:', err);
            setSaveError(getErrorMessage(err, 'Не удалось сохранить опрос'));
        } finally {
            setSaveLoading(false);
        }
    }, [surveyData, navigate, token, validateForm, markAsSaved]);

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (active.id !== over.id) {
            const oldIndex = surveyData.questions.findIndex(q => (q.id === active.id || q.questionID === active.id));
            const newIndex = surveyData.questions.findIndex(q => (q.id === over.id || q.questionID === over.id));
            const newQuestions = arrayMove(surveyData.questions, oldIndex, newIndex);
            // Обновляем orderPriority на основе новой позиции
            const updatedQuestions = newQuestions.map((q, idx) => ({
            ...q,
            orderPriority: idx + 1
            }));
            setSurveyData(prev => ({ ...prev, questions: updatedQuestions }));
            markAsChanged();
        }
    };

    {/* --- Разметка --- */}
    let content;
    if (fetchError) {
        content = (
            <div className='content-group'>
                <div className='frame fetch-error'>
                    <p className='text-h2'>{fetchError}</p>
                    <button type='button'
                    className='button-primary button-retry'
                    onClick={() => {
                    setFetchError('');
                    fetchSurvey();
                    }}>
                        <IconReload className='icon-primary' color='#FFFFFF' />
                        <span>Повторить</span>
                    </button>
                </div>
            </div>
        );
    } else if (fetchLoading) {
        content = (
            <div className='content-group'>
                <div className='loading-frame'>
                    <div className='spinner'></div>
                    <p className='text-h2'>Загрузка...</p>
                </div>
            </div>
        );
    } else {
        content = (
            <div className='content-group'>
                {/* --- Заголовок и описание --- */}
                <div className='frame title-group'>
                    <div className='input-group'>
                        <input
                            className={'text-h2 input-field'}
                            id="surveyTitle"
                            name="surveyTitle"
                            type="text"
                            value={surveyData.title}
                            onChange={(e) => {
                                setSurveyData(prev => ({ ...prev, title: e.target.value }));
                                markAsChanged();
                                if (validationErrors.title) {
                                    setValidationErrors(prev => ({ ...prev, title: '' }));
                                }
                            }}
                            disabled={!isEditable}
                            placeholder="Название опроса"
                            aria-invalid={!!validationErrors.title}
                            aria-describedby={validationErrors.title ? 'title-error' : undefined}
                        />
                        <div className='input-line' />
                        {validationErrors.title &&
                            <p id='title-error' className='input-error' role='alert'>
                                {validationErrors.title}
                            </p>
                        }
                    </div>
                    <div className='input-group'>
                        <AutoResizeTextarea
                            className='text-h3 input-field title-description'
                            value={surveyData.description}
                            onChange={(e) => {
                                setSurveyData(prev => ({ ...prev, description: e.target.value }));
                                markAsChanged();
                            }}
                            placeholder='Описание'
                            rows={1}
                            id="surveyDescription"
                            name="surveyDescription"
                            disabled={!isEditable}
                        />
                        <div className='input-line' />
                    </div>
                </div>

                {/* --- Настройки опроса --- */}
                <div className='frame settings-group'>
                    <div className='input-group'>
                        <label className='text-h3'>Дата закрытия опроса</label>
                        <span className='text-helper'>Когда опрос перестанет принимать ответы</span>
                        <input
                            className='text-body input-field'
                            id='closedAt'
                            type='date' 
                            value={surveyData.closedAt}
                            onChange={(e) => {
                                setSurveyData(prev => ({ ...prev, closedAt: e.target.value }));
                                markAsChanged();
                                if (validationErrors.closedAt) {
                                    setValidationErrors(prev => ({ ...prev, closedAt: '' }));
                                }
                            }}
                            disabled={!isEditable}
                            aria-invalid={!!validationErrors.closedAt}
                            aria-describedby={validationErrors.closedAt ? 'closedAt-error' : undefined}
                        />
                        <div className='input-line' />
                        {validationErrors.closedAt && <p id='closedAt-error' className='input-error' role='alert'>{validationErrors.closedAt}</p>}
                    </div>
                </div>

                {/* --- Вопросы --- */}
                <div className='questions-group'>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis]}
                    >
                        <SortableContext
                            items={surveyData.questions.map(q => q.id || q.questionID)}
                            strategy={verticalListSortingStrategy}
                        >
                            {surveyData.questions.map(question => (
                                <MakerQuestionCard
                                    key={question.id}
                                    question={question}
                                    error={validationErrors[question.id || question.questionID]}
                                    onUpdate={handleUpdateQuestion}
                                    onDelete={handleDeleteQuestion}
                                    createNewOption={createNewOption}
                                    isEditable={isEditable}
                                    id={question.id || question.questionID}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                    <div className='create-group'>                
                        {isEditable && (
                            <button 
                                type='button' 
                                className='button-primary button-create'
                                onClick={handleAddQuestion}
                            >
                                + Добавить вопрос
                            </button>
                        )}
                        {validationErrors.questions && 
                            <p className='error-frame' role='alert'>{validationErrors.questions}</p>
                        }
                    </div>
                </div>
            </div>
        );
    }

    return(
        <div className='page maker-page'>
            {/* --- Header --- */}
            <Header content='Конструктор опросов' onLogout={handleLogout} />

            {/* --- Управление --- */}
            <div className='controls-group'>
                <button type="button" className="button-tertiary button-back" onClick={handleGoBack}>
                    <IconArrowLeft className='icon-primary'/>
                </button>
                <button 
                    type='button' 
                    className='button-primary button-save'
                    onClick={() => {handleSave()}}
                    disabled={fetchLoading || saveLoading || !isEditable || fetchError}
                >
                    {saveLoading ? 'Сохранение...' : 'Сохранить'}
                </button>
                <button
                    type='button'
                    className='button-primary button-publish'
                    onClick={() => {handleSave(true)}}
                    disabled={fetchLoading || saveLoading || !isEditable || fetchError}
                >
                    {saveLoading ? 'Публикация...' : 'Опубликовать'}
                </button>

                {success &&
                    <div className='success-frame' role='status'>
                        {success}
                    </div>
                }

                {saveError &&
                    <div className='error-frame' role='alert'>
                        {saveError}
                    </div>
                }
            </div>

            {/* --- Основной контент --- */}
            {content}

            {/* --- Footer --- */}
            <Footer />
        </div>
    );
}

export default MakerPage;