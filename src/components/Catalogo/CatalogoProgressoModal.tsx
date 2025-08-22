import { X, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import type { ProgressInfo } from "../../functions/gerarPdf";


interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  progress: ProgressInfo | null;
}

export function CatalogoProgressoModal({ isOpen, onClose, progress }: ProgressModalProps) {
  if (!isOpen || !progress) return null;

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'complete':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <AlertCircle className="text-red-500" size={24} />;
      default:
        return <Loader2 className="text-blue-500 animate-spin" size={24} />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'complete':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <FileText className="text-gray-600" size={20} />
            <h3 className="font-semibold text-gray-900">Gerando PDF</h3>
          </div>
          {progress.status === 'complete' && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} className="text-gray-500" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Status Icon e Info */}
          <div className="flex items-center gap-4 mb-6">
            {getStatusIcon()}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-900">
                  {progress.current} de {progress.total} processados
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {progress.percentage}%
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ease-out ${getStatusColor()}`}
                  style={{ width: `${progress.percentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Current Item */}
          <div className="space-y-2">
            <div className="text-sm text-gray-600">
              Status: <span className="font-medium">{progress.message}</span>
            </div>
            
            {progress.currentItem && progress.status === 'processing' && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                <span className="font-medium">Processando:</span><br />
                {progress.currentItem}
              </div>
            )}

            {progress.status === 'complete' && (
              <div className="text-sm text-green-600 bg-green-50 p-3 rounded-lg flex items-center gap-2">
                <CheckCircle size={16} />
                PDF gerado e download iniciado!
              </div>
            )}

            {progress.status === 'error' && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg flex items-center gap-2">
                <AlertCircle size={16} />
                Erro na geração do PDF
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        {progress.status !== 'processing' && (
          <div className="px-6 pb-6">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}