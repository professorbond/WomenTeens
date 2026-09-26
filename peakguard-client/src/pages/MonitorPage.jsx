import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { checkin } from '../services/api';
import confetti from 'canvas-confetti';
import { ShieldCheck, Clock } from 'lucide-react';

const MonitorPage = () => {
  const { tripId } = useParams();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 23, seconds: 59 });

  useEffect(() => {
    if (isCheckedIn) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) { seconds--; }
        else { seconds = 59; if (minutes > 0) { minutes--; } else { minutes = 59; hours = Math.max(0, hours - 1); } }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCheckedIn]);

  const handleCheckin = async () => {
    setLoading(true);
    try {
      await checkin(tripId);
      setIsCheckedIn(true);

      const end = Date.now() + 3000;
      const frame = () => {
        confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 }, colors: ['#006947', '#CC4900'] });
        confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 }, colors: ['#006947', '#CC4900'] });
        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();
    } catch (error) {
      alert('Ошибка чек-ина. Попробуйте снова.');
    } finally {
      setLoading(false);
    }
  };

  const pad = (v) => v.toString().padStart(2, '0');

  return (
    <div className="monitor-center">
      {isCheckedIn ? (
        <div className="card checkin-done">
          <ShieldCheck size={80} color="var(--tertiary)" />
          <h1>Безопасность подтверждена</h1>
          <p>С возвращением! Ваш чек-ин прошёл успешно. Dead-man switch деактивирован — доверенное лицо не будет уведомлено.</p>
        </div>
      ) : (
        <div className="card" style={{ textAlign: 'center', maxWidth: '600px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div>
            <div className="page-header-left" style={{ justifyContent: 'center', marginBottom: '0.5rem' }}>
              <span className="step-badge">Step 03 / 03</span>
            </div>
            <h2 className="font-headline-md" style={{ margin: '0 0 0.5rem' }}>Активный мониторинг похода</h2>
            <p style={{ color: 'var(--on-surface-variant)', margin: 0, fontSize: '14px' }}>Отметьтесь до дедлайна, чтобы отменить SOS-оповещение.</p>
          </div>

          <div className="countdown-box">
            <div className="countdown-label">
              <Clock size={20} /> ОСТАВШЕЕСЯ ВРЕМЯ
            </div>
            <div className="countdown">
              {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
            </div>
          </div>

          <button className="btn-checkin" onClick={handleCheckin} disabled={loading}>
            {loading ? 'Обработка...' : '✅ Я вернулся! Маршрут завершён'}
          </button>
        </div>
      )}
    </div>
  );
};

export default MonitorPage;
