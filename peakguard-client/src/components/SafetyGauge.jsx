import { useEffect, useState } from 'react';

const SafetyGauge = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 100);
    return () => clearTimeout(timer);
  }, [score]);

  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedScore / 100) * circumference;

  let color = 'var(--error)';
  let text = 'Высокий риск';
  if (score >= 50) { color = '#B45309'; text = 'Умеренный риск'; }
  if (score >= 80) { color = 'var(--tertiary)'; text = 'Безопасно'; }

  return (
    <div className="gauge-container">
      <svg className="gauge-svg" viewBox="0 0 200 200">
        <circle className="gauge-bg" cx="100" cy="100" r={radius} />
        <circle
          className="gauge-progress"
          cx="100" cy="100" r={radius}
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
        />
        <text className="gauge-text" x="100" y="100">
          {animatedScore}
        </text>
      </svg>
      <div className="gauge-level" style={{ color }}>{text}</div>
    </div>
  );
};

export default SafetyGauge;
