import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getTrip, saveMonitor } from '../services/api';
import SafetyGauge from '../components/SafetyGauge';
import IssueCard from '../components/IssueCard';
import OfflineKitButton from '../components/OfflineKitButton';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

const AuditPage = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('21:00');
  const [monitorSaved, setMonitorSaved] = useState(false);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const response = await getTrip(tripId);
        setTrip(response.data);
        if (response.data.hasMonitor) setMonitorSaved(true);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrip();
  }, [tripId]);

  const handleMonitorSubmit = async (e) => {
    e.preventDefault();
    try {
      const deadlineDate = new Date().toISOString().split('T')[0];
      await saveMonitor({ tripId, contactName, contactPhone, contactEmail, deadlineDate, deadlineTime });
      setMonitorSaved(true);
    } catch (error) {
      alert('Ошибка сохранения мониторинга');
    }
  };

  if (loading) return (
    <div className="loader-overlay">
      <div className="spinner"></div>
      <span className="loader-text">Загрузка результатов аудита...</span>
    </div>
  );
  if (!trip) return <div style={{ padding: '2rem', textAlign: 'center' }}>Поход не найден</div>;

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <span className="step-badge">Step 02 / 03</span>
          <span className="font-headline-sm">Оценка рисков (AI Safety Score)</span>
        </div>
      </div>

      <div className="audit-grid">
        {/* LEFT: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <SafetyGauge score={trip.safetyScore || 0} />
            <p className="gauge-summary" style={{ textAlign: 'center', margin: '0 auto' }}>
              {trip.auditSummary}
            </p>
          </div>

          <div>
            <h2 className="font-headline-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={22} color="var(--primary)" /> Выявленные риски
            </h2>
            <div className="issues-grid">
              {trip.issues && trip.issues.length > 0 ? (
                trip.issues.map((issue, idx) => <IssueCard key={idx} issue={issue} />)
              ) : (
                <p style={{ color: 'var(--on-surface-variant)' }}>Существенных рисков не выявлено.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h2 className="font-headline-sm" style={{ marginBottom: '0.75rem' }}>Рекомендации AI</h2>
            <ul className="recs-list">
              {trip.recommendations && trip.recommendations.map((rec, idx) => (
                <li key={idx}>
                  <CheckCircle2 size={18} />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT: Monitor + PDF */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <div className="card-header-row">
              <div>
                <div className="card-overline">Dead-Man Switch</div>
                <div className="card-title">Контроль возвращения</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '1.25rem' }}>
              Оставьте контакт доверенного лица. Если вы не отметитесь до дедлайна, ему будут отправлены ваш маршрут и координаты.
            </p>

            {monitorSaved ? (
              <div className="monitor-success">
                <ShieldCheck size={40} color="var(--tertiary)" />
                <h3>Мониторинг активен</h3>
                <p style={{ fontSize: '13px', margin: '0.5rem 0 1rem' }}>Ваша персональная ссылка для чек-ина готова.</p>
                <Link to={`/monitor/${tripId}`} className="btn-outline">
                  Перейти к чек-ину →
                </Link>
              </div>
            ) : (
              <form className="monitor-form" onSubmit={handleMonitorSubmit}>
                <div className="form-group">
                  <label className="form-label">Имя доверенного лица</label>
                  <input required type="text" className="form-input" placeholder="Мария Иванова" value={contactName} onChange={e => setContactName(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Телефон</label>
                  <input required type="tel" className="form-input" placeholder="+7 (___) ___-__-__" value={contactPhone} onChange={e => setContactPhone(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input required type="email" className="form-input" placeholder="email@example.com" value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Контрольное время возврата</label>
                  <input required type="time" className="form-input" value={deadlineTime} onChange={e => setDeadlineTime(e.target.value)} />
                </div>
                <button type="submit" className="btn-activate">Поставить на контроль</button>
              </form>
            )}
          </div>

          <div className="card">
            <div className="card-header-row">
              <div>
                <div className="card-overline">Офлайн-пакет</div>
                <div className="card-title">Скачать PDF</div>
              </div>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--on-surface-variant)', marginBottom: '1rem' }}>
              PDF-файл со сводкой маршрута, списком снаряжения и протоколом SOS для хранения на телефоне без интернета.
            </p>
            <OfflineKitButton trip={trip} />
          </div>
        </div>
      </div>
    </>
  );
};

export default AuditPage;
