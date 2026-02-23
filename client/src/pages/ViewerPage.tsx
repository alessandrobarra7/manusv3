import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ExternalLink } from 'lucide-react';

export function ViewerPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const studyInstanceUid = params.studyId || '';
  const [viewerUrl, setViewerUrl] = useState<string>('');

  const { data, isLoading, error } = trpc.pacs.getViewerUrl.useQuery(
    { studyInstanceUid },
    { enabled: !!studyInstanceUid }
  );

  useEffect(() => {
    if (data?.viewerUrl) {
      setViewerUrl(data.viewerUrl);
      // Redirect to OHIF Viewer in new tab
      window.open(data.viewerUrl, '_blank');
    }
  }, [data]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando visualizador DICOM...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
            <h2 className="text-lg font-semibold text-red-900 mb-2">Erro ao Carregar Visualizador</h2>
            <p className="text-sm text-red-700">{error.message}</p>
          </div>
          <Button onClick={() => setLocation('/pacs-query')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Busca
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <ExternalLink className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Visualizador DICOM</h1>
          <p className="text-gray-600">
            O visualizador OHIF foi aberto em uma nova aba do navegador.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 mb-2">
            <strong>Study Instance UID:</strong>
          </div>
          <code className="text-xs text-gray-800 break-all bg-white px-3 py-2 rounded border block">
            {studyInstanceUid}
          </code>
        </div>

        <div className="flex flex-col gap-3">
          {viewerUrl && (
            <Button 
              onClick={() => window.open(viewerUrl, '_blank')} 
              className="w-full"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir Visualizador Novamente
            </Button>
          )}
          <Button 
            onClick={() => setLocation('/pacs-query')} 
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para Busca PACS
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t">
          <p className="text-xs text-gray-500 text-center">
            Caso a aba não tenha aberto automaticamente, clique no botão acima para abrir o visualizador.
          </p>
        </div>
      </div>
    </div>
  );
}
