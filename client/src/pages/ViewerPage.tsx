import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Maximize2, Minimize2 } from 'lucide-react';

export function ViewerPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerUrl, setViewerUrl] = useState<string>('');

  const studyId = params.studyId;

  useEffect(() => {
    // Construct OHIF viewer URL
    // In production, this would point to your OHIF instance
    // For now, we'll use a placeholder that shows the integration structure
    if (studyId) {
      // Example: OHIF viewer URL with study instance UID
      // const ohifUrl = `http://localhost:3001/viewer?StudyInstanceUIDs=${studyId}`;
      // For demo purposes, we'll show a message
      setViewerUrl(`/api/viewer/${studyId}`);
    }
  }, [studyId]);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleBack = () => {
    setLocation('/studies');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar para Estudos
            </Button>
            <div className="h-6 w-px bg-border" />
            <div>
              <h1 className="text-lg font-semibold">Visualizador DICOM</h1>
              <p className="text-sm text-muted-foreground">
                Estudo ID: {studyId}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="h-4 w-4 mr-2" />
                Sair do Fullscreen
              </>
            ) : (
              <>
                <Maximize2 className="h-4 w-4 mr-2" />
                Fullscreen
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Viewer Container */}
      <div className="container py-6">
        <Card className="p-8 text-center min-h-[600px] flex flex-col items-center justify-center">
          <div className="max-w-2xl space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Visualizador DICOM - Em Desenvolvimento</h2>
              <p className="text-muted-foreground">
                O visualizador DICOM será integrado com OHIF Viewer (Open Health Imaging Foundation)
              </p>
            </div>

            <div className="bg-muted p-6 rounded-lg text-left space-y-4">
              <h3 className="font-semibold text-lg">Funcionalidades Planejadas:</h3>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Visualização de imagens DICOM com suporte a múltiplas modalidades</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Ferramentas de medição (distância, ângulo, área, ROI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Ajuste de windowing (brilho/contraste) com presets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Navegação entre séries e instâncias</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Zoom, pan, rotação e inversão de imagens</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Anotações e marcações</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Comparação lado a lado de estudos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Exportação de imagens e cine loops</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">✓</span>
                  <span>Integração com Orthanc via DICOMweb</span>
                </li>
              </ul>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>Próximos Passos:</strong> Configurar instância OHIF Viewer e integrar com backend Orthanc
              </p>
            </div>

            <div className="pt-4">
              <Button onClick={handleBack}>
                Voltar para Lista de Estudos
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
