import { jsPDF } from 'jspdf';

export const generatePdf = (trip) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(22);
  doc.setTextColor(249, 115, 22); // Orange primary
  doc.text('PeakGuard — Offline Security Kit', 20, 20);
  
  // Basic info
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${trip.startDate} | Time: ${trip.startTime}`, 20, 35);
  doc.text(`Distance: ${trip.distanceKm.toFixed(1)} km | Elevation Gain: +${trip.elevationGainM} m`, 20, 42);
  doc.text(`Experience Level: ${trip.experience} | Group Size: ${trip.groupSize}`, 20, 49);
  
  // Score
  doc.setFontSize(16);
  doc.setTextColor(34, 197, 94); // Green
  doc.text(`Safety Readiness Score: ${trip.safetyScore} / 100`, 20, 65);
  
  // Summary
  doc.setFontSize(11);
  doc.setTextColor(50, 50, 50);
  const splitSummary = doc.splitTextToSize(`Audit Summary: ${trip.auditSummary || ''}`, 170);
  doc.text(splitSummary, 20, 75);
  
  // SOS Rules
  let currentY = 75 + (splitSummary.length * 5) + 15;
  doc.setFontSize(14);
  doc.setTextColor(239, 68, 68); // Red
  doc.text('EMERGENCY SOS PROTOCOL', 20, currentY);
  
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  const rules = [
    "1. STAY CALM: Do not panic. Assess the situation.",
    "2. STAY PUT: If lost, do not wander. It's easier for rescuers to find a stationary target.",
    "3. SIGNAL: 6 signals per minute (whistle, flash, shout), then 1 minute pause. Reply is 3 signals.",
    "4. SHELTER: Protect yourself from wind and rain. Conserve body heat."
  ];
  
  currentY += 10;
  rules.forEach(rule => {
    const splitRule = doc.splitTextToSize(rule, 170);
    doc.text(splitRule, 20, currentY);
    currentY += splitRule.length * 6;
  });
  
  // Recommendations
  if (trip.recommendations && trip.recommendations.length > 0) {
    currentY += 10;
    doc.setFontSize(14);
    doc.setTextColor(249, 115, 22);
    doc.text('Safety Recommendations:', 20, currentY);
    currentY += 10;
    
    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    trip.recommendations.forEach(rec => {
      const splitRec = doc.splitTextToSize(`- ${rec}`, 170);
      doc.text(splitRec, 20, currentY);
      currentY += splitRec.length * 6;
    });
  }

  doc.save(`PeakGuard_OfflineKit_${trip.id.substring(0, 8)}.pdf`);
};
