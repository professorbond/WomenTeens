import { useState } from 'react';
import { generatePdf } from '../services/pdfGenerator';
import { Download, Loader2 } from 'lucide-react';

const OfflineKitButton = ({ trip }) => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      await generatePdf(trip);
    } catch (e) {
      console.error('PDF generation error:', e);
      alert('Ошибка генерации PDF');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleDownload} className="btn-outline" style={{ width: '100%' }} disabled={loading}>
      {loading ? <Loader2 size={18} className="spinner" /> : <Download size={18} />}
      {loading ? 'Генерация PDF...' : 'Скачать Offline Kit (PDF)'}
    </button>
  );
};

export default OfflineKitButton;
