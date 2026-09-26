import { generatePdf } from '../services/pdfGenerator';
import { Download } from 'lucide-react';

const OfflineKitButton = ({ trip }) => {
  return (
    <button onClick={() => generatePdf(trip)} className="btn-outline" style={{ width: '100%' }}>
      <Download size={18} />
      Скачать Offline Kit (PDF)
    </button>
  );
};

export default OfflineKitButton;
