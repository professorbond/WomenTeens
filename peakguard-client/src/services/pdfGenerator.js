import { jsPDF } from 'jspdf';

// ── Загрузка Roboto TTF (с кириллицей) из cdnjs ─────────────────────────────
let fontBase64Cache = null;

async function ensureCyrillicFont() {
  if (fontBase64Cache) return fontBase64Cache;

  const url = 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf';
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  // Конвертируем ArrayBuffer → base64 (чанками, чтобы не упасть на больших файлах)
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  fontBase64Cache = btoa(binary);
  return fontBase64Cache;
}

// ── Генерация PDF ────────────────────────────────────────────────────────────
export const generatePdf = async (trip) => {
  const fontData = await ensureCyrillicFont();

  const doc = new jsPDF();
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();
  const m = 20; // margin
  const cw = pw - m * 2; // content width
  let y = 20;

  // Подключаем Roboto
  doc.addFileToVFS('Roboto.ttf', fontData);
  doc.addFont('Roboto.ttf', 'Roboto', 'normal');
  doc.setFont('Roboto');

  // ── Helpers ─────────────────────────────────────────────────────────────
  const checkPage = (need = 25) => {
    if (y + need > ph - 20) { doc.addPage(); y = 20; }
  };

  const text = (str, size = 11, color = [0, 0, 0]) => {
    checkPage();
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(String(str || ''), cw);
    doc.text(lines, m, y);
    y += lines.length * size * 0.45 + 2;
  };

  const gap = (n = 5) => { y += n; };

  const divider = () => {
    doc.setDrawColor(210, 210, 210);
    doc.setLineWidth(0.3);
    doc.line(m, y, pw - m, y);
    y += 6;
  };

  const heading = (str, size = 14, color = [11, 28, 48]) => {
    checkPage(size + 10);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    doc.text(str, m, y);
    y += size * 0.5 + 4;
  };

  // ═══════════════════════════════════════════════════════════════════════
  //  ЗАГОЛОВОК
  // ═══════════════════════════════════════════════════════════════════════
  // Оранжевая полоса вверху
  doc.setFillColor(163, 57, 0);
  doc.rect(0, 0, pw, 8, 'F');

  y = 22;
  doc.setFontSize(26);
  doc.setTextColor(163, 57, 0);
  doc.text('PeakGuard', m, y);
  y += 8;

  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text('Горный офлайн-пакет безопасности', m, y);
  y += 10;

  divider();

  // ═══════════════════════════════════════════════════════════════════════
  //  СВОДКА ПО МАРШРУТУ
  // ═══════════════════════════════════════════════════════════════════════
  heading('Сводка маршрута');
  text(`Дата: ${trip.startDate || '—'}   •   Время старта: ${trip.startTime || '—'}`);
  text(`Дистанция: ${(trip.distanceKm || 0).toFixed(1)} км   •   Набор высоты: +${trip.elevationGainM || 0} м`);
  text(`Опыт группы: ${expLabel(trip.experience)}   •   Группа: ${trip.groupSize || 1} чел.`);
  gap(4);
  divider();

  // ═══════════════════════════════════════════════════════════════════════
  //  SAFETY SCORE
  // ═══════════════════════════════════════════════════════════════════════
  const score = trip.safetyScore ?? 0;
  const sc = score >= 80 ? [0, 133, 87] : score >= 50 ? [180, 83, 9] : [186, 26, 26];

  heading(`Safety Readiness Score: ${score} / 100`, 18, sc);

  if (trip.auditSummary) {
    text(trip.auditSummary, 10, [80, 80, 80]);
  }
  gap(2);
  divider();

  // ═══════════════════════════════════════════════════════════════════════
  //  ВЫЯВЛЕННЫЕ РИСКИ
  // ═══════════════════════════════════════════════════════════════════════
  if (trip.issues && trip.issues.length > 0) {
    heading('Выявленные риски');

    for (const issue of trip.issues) {
      checkPage(15);
      const c = issue.severity === 'critical' ? [186, 26, 26]
              : issue.severity === 'warning' ? [180, 83, 9]
              : [0, 105, 71];

      doc.setFontSize(9);
      doc.setTextColor(...c);
      doc.text(`[${(issue.severity || '').toUpperCase()}]  ${(issue.type || '').toUpperCase()}`, m, y);
      y += 5;

      text(issue.text, 10, [50, 50, 50]);
      gap(2);
    }
    divider();
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  РЕКОМЕНДАЦИИ
  // ═══════════════════════════════════════════════════════════════════════
  if (trip.recommendations && trip.recommendations.length > 0) {
    heading('Рекомендации AI', 14, [163, 57, 0]);

    for (const rec of trip.recommendations) {
      checkPage(12);
      text(`•  ${rec}`, 10, [40, 40, 40]);
      gap(1);
    }
    divider();
  }

  // ═══════════════════════════════════════════════════════════════════════
  //  ПРОТОКОЛ SOS
  // ═══════════════════════════════════════════════════════════════════════
  checkPage(60);
  heading('ПРОТОКОЛ SOS — ДЕЙСТВИЯ ПРИ ЧС В ГОРАХ', 14, [186, 26, 26]);

  const rules = [
    '1. СОХРАНЯЙТЕ СПОКОЙСТВИЕ. Остановитесь, оцените ситуацию.',
    '2. ОСТАВАЙТЕСЬ НА МЕСТЕ при потере ориентира.',
    '3. СИГНАЛ: 6 сигналов в минуту (свисток, фонарь), пауза 1 мин. Ответ — 3 сигнала.',
    '4. УКРЫТИЕ: защитите себя от ветра. Используйте термоодеяло.',
    '5. ВОДА: пейте маленькими глотками. Снег растапливайте.',
    '6. СВЯЗЬ: звоните 112. Сообщите координаты, кол-во людей, травмы.',
  ];
  for (const rule of rules) {
    checkPage(12);
    text(rule, 10, [40, 40, 40]);
    gap(1);
  }

  // ── Футер ──────────────────────────────────────────────────────────────
  doc.setFontSize(7);
  doc.setTextColor(170, 170, 170);
  doc.text('PeakGuard — Mountain Safe Expedition Systems', m, ph - 10);
  doc.text(new Date().toLocaleString('ru-RU'), pw - m - 40, ph - 10);

  // ── Сохранение ─────────────────────────────────────────────────────────
  doc.save(`PeakGuard_${(trip.id || 'kit').substring(0, 8)}.pdf`);
};

function expLabel(e) {
  return { beginner: 'Новичок', medium: 'Средний', expert: 'Эксперт' }[e] || e || '—';
}
