import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { runAudit } from '../services/api';
import MapPicker from '../components/MapPicker';

const EXP_DESCRIPTIONS = {
  1: { label: 'Новичок', text: 'Без опыта в горах. Подходят только маркированные тропы до 5 км без крутых наборов.' },
  2: { label: 'Начальный', text: '1 простой поход в сухую погоду. Базовые навыки темпа и питьевого режима.' },
  3: { label: 'Начинающий турист', text: '1–2 простых однодневных похода, владение палками, нет опыта ночёвок при минусе.' },
  4: { label: 'Любитель', text: 'До 5 однодневных выходов до 15 км, понимание смены погодных условий на перевалах.' },
  5: { label: 'Уверенный турист', text: 'Опыт радиалок с набором +1000 м, использование навигаторов и трекеров.' },
  6: { label: 'Подготовленный', text: 'Опыт автономных походов 2–3 дня, прохождение сыпух и курумника.' },
  7: { label: 'Опытный походник', text: 'Маршруты 1–2 категории сложности, преодоление снежников и бродов.' },
  8: { label: 'Продвинутый', text: 'Опыт связок, ледников, знание страховочных станций и спасательных протоколов.' },
  9: { label: 'Горный гид', text: 'Регулярные категорийные восхождения, спасработы, навигация вслепую.' },
  10: { label: 'Эксперт-альпинист', text: 'Высотный опыт 5000м+, соло-восхождения, сертификация UIAA/ФАР.' },
};

const ConfiguratorPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Map
  const [route, setRoute] = useState([]);
  const [distance, setDistance] = useState(0);
  const [elevationGain, setElevationGain] = useState(0);

  // Form
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const [date, setDate] = useState(tomorrow);
  const [startTime, setStartTime] = useState('08:00');
  const [expLevel, setExpLevel] = useState(3);
  const [groupSize, setGroupSize] = useState(2);

  // Gear (by category)
  const [gear, setGear] = useState({
    flashlight: false,
    gpxPhone: true,
    powerbank: false,
    membrane: false,
    fleece: true,
    thermals: false,
    boots: true,
    firstAid: false,
    whistle: false,
    water: true,
  });

  const toggleGear = (key) => setGear(prev => ({ ...prev, [key]: !prev[key] }));

  const expMap = { 1: 'beginner', 2: 'beginner', 3: 'beginner', 4: 'medium', 5: 'medium', 6: 'medium', 7: 'expert', 8: 'expert', 9: 'expert', 10: 'expert' };

  const handleSubmit = async () => {
    if (route.length < 2) {
      alert('Отметьте минимум 2 точки на карте для создания маршрута.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        route,
        distanceKm: distance,
        elevationGainM: elevationGain,
        date,
        startTime,
        experience: expMap[expLevel] || 'medium',
        groupSize: parseInt(groupSize, 10),
        gear: {
          firstAid: gear.firstAid,
          powerbank: gear.powerbank,
          membrane: gear.membrane,
          flashlight: gear.flashlight,
          water: gear.water,
          warmClothing: gear.fleece || gear.thermals,
        },
      };
      const response = await runAudit(payload);
      navigate(`/audit/${response.data.tripId}`);
    } catch (error) {
      console.error(error);
      alert('Ошибка подключения к серверу. Убедитесь, что бэкенд запущен на порту 5000.');
      setLoading(false);
    }
  };

  const exp = EXP_DESCRIPTIONS[expLevel];

  return (
    <>
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="page-header">
        <div className="page-header-left">
          <span className="step-badge">Step 01 / 03</span>
          <span className="font-headline-sm">Интерактивный планировщик экспедиции</span>
          <span className="synced-badge"><span className="dot"></span> WGS84 GEOID SYNCED</span>
        </div>
        <div className="page-header-meta">
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--primary)', fontSize: '16px' }}>wb_sunny</span>
            РАССВЕТ 06:15
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--secondary)', fontSize: '16px' }}>nightlight</span>
            ЗАКАТ 17:30
          </span>
          <span style={{ color: 'var(--outline)' }}>|</span>
          <span>СВЕТОВОЕ ОКНО: 11 Ч 15 МИН</span>
        </div>
      </div>

      {/* ── Main Grid ─────────────────────────────────────── */}
      <div className="page-grid">
        {/* LEFT: Map + Stats */}
        <div>
          <MapPicker
            route={route} setRoute={setRoute}
            distance={distance} setDistance={setDistance}
            elevationGain={elevationGain} setElevationGain={setElevationGain}
          />

          {/* Stats cards below map */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-icon orange"><span className="material-symbols-outlined">terrain</span></div>
              <div>
                <div className="stat-label">Макс. крутизна</div>
                <div className="stat-value">32° <span>(Курумник)</span></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon green"><span className="material-symbols-outlined">water_drop</span></div>
              <div>
                <div className="stat-label">Точки воды GPX</div>
                <div className="stat-value">4 источника <span>(Все активны)</span></div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon orange"><span className="material-symbols-outlined">network_check</span></div>
              <div>
                <div className="stat-label">GSM / LTE Зона</div>
                <div className="stat-value">22% <span style={{ color: 'var(--error)' }}>(Потеря с км 3.5)</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Parameters Card */}
        <div className="card">
          <div className="card-header-row">
            <div>
              <div className="card-overline">Параметры маршрута</div>
              <div className="card-title">Вводные данные выхода</div>
            </div>
            <span className="card-step-badge">Step 1 of 3</span>
          </div>

          {/* Date + Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Дата выхода</label>
              <input type="date" className="form-input" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Время старта</label>
              <input type="time" className="form-input" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
          </div>

          {/* Experience Slider */}
          <div className="exp-box">
            <div className="exp-header">
              <label className="form-label" style={{ marginBottom: 0 }}>Ваш опыт в горах</label>
              <span className="exp-badge">{expLevel} / 10 БАЛЛОВ</span>
            </div>
            <input
              type="range" min="1" max="10"
              className="exp-slider"
              value={expLevel}
              onChange={e => setExpLevel(Number(e.target.value))}
            />
            <p className="exp-description">
              <strong>{exp.label}:</strong> {exp.text}
            </p>
          </div>

          {/* Gear Checklist */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span className="form-label" style={{ marginBottom: 0, fontWeight: 600 }}>Чек-лист снаряжения группы</span>
              <span className="font-label-mono" style={{ color: 'var(--secondary)' }}>ОБЯЗАТЕЛЬНО ДЛЯ AI-ОЦЕНКИ</span>
            </div>

            {/* Category: Освещение и питание */}
            <div className="gear-section">
              <div className="gear-section-header">
                <span className="material-symbols-outlined">flashlight_on</span> Освещение и питание
              </div>
              <label className="gear-item"><input type="checkbox" checked={gear.flashlight} onChange={() => toggleGear('flashlight')} /> Налобный фонарь (аккум. 300+ лм + запас)</label>
              <label className="gear-item"><input type="checkbox" checked={gear.gpxPhone} onChange={() => toggleGear('gpxPhone')} /> Смартфон с офлайн GPX-картами</label>
              <label className="gear-item"><input type="checkbox" checked={gear.powerbank} onChange={() => toggleGear('powerbank')} /> Пауэрбанк 10 000+ мА·ч (утепленный)</label>
            </div>

            {/* Category: Одежда и защита */}
            <div className="gear-section">
              <div className="gear-section-header">
                <span className="material-symbols-outlined">apparel</span> Одежда и защита
              </div>
              <label className="gear-item"><input type="checkbox" checked={gear.membrane} onChange={() => toggleGear('membrane')} /> Мембранная куртка (ветро/влагозащита 20k)</label>
              <label className="gear-item"><input type="checkbox" checked={gear.fleece} onChange={() => toggleGear('fleece')} /> Флисовая кофта / утепляющий слой</label>
              <label className="gear-item"><input type="checkbox" checked={gear.thermals} onChange={() => toggleGear('thermals')} /> Термобельё активное (синтетика / меринос)</label>
              <label className="gear-item"><input type="checkbox" checked={gear.boots} onChange={() => toggleGear('boots')} /> Треккинговые ботинки с жестким рантом</label>
            </div>

            {/* Category: Безопасность и здоровье */}
            <div className="gear-section">
              <div className="gear-section-header">
                <span className="material-symbols-outlined">medical_services</span> Безопасность и здоровье
              </div>
              <label className="gear-item"><input type="checkbox" checked={gear.firstAid} onChange={() => toggleGear('firstAid')} /> Аптечка горная (эластичный бинт, антисептик)</label>
              <label className="gear-item"><input type="checkbox" checked={gear.whistle} onChange={() => toggleGear('whistle')} /> Свисток сигнальный + термоодеяло</label>
              <label className="gear-item"><input type="checkbox" checked={gear.water} onChange={() => toggleGear('water')} /> Запас питьевой воды не менее 1.5 л</label>
            </div>
          </div>

          {/* AI Info Box */}
          <div className="ai-info-box">
            <span className="material-symbols-outlined">smart_toy</span>
            <p>
              Нейросеть проанализирует погодное окно на высотах <strong>1 380 – 2 320 м</strong>,
              сопоставит перепад высот с вашим темпом и проверит полноту снаряжения.
            </p>
          </div>

          {/* Submit */}
          <button className="btn-calculate" onClick={handleSubmit}>
            <span>Рассчитать безопасность (Safety Readiness Score)</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>

          <div className="btn-footer">
            <span className="btn-footer-item">
              <span className="material-symbols-outlined">lock</span> ШИФРОВАНИЕ ДАННЫХ SSL
            </span>
            <span>МЧС РОССИИ РЕКОМЕНДУЕТ</span>
          </div>
        </div>
      </div>

      {/* Loader */}
      {loading && (
        <div className="loader-overlay">
          <div className="spinner"></div>
          <span className="loader-text">AI анализирует маршрут и погодные условия...</span>
        </div>
      )}
    </>
  );
};

export default ConfiguratorPage;
