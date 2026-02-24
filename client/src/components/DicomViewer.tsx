import { useEffect, useRef, useState } from 'react';
import * as cornerstone from 'cornerstone-core';
import * as cornerstoneTools from 'cornerstone-tools';
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader';
import * as dicomParser from 'dicom-parser';
import { Button } from '@/components/ui/button';
import { Loader2, ZoomIn, ZoomOut, Move, RotateCw, Maximize2, X } from 'lucide-react';

// Initialize Cornerstone
cornerstoneWADOImageLoader.external.cornerstone = cornerstone;
cornerstoneWADOImageLoader.external.dicomParser = dicomParser;

// Configure WADO Image Loader
cornerstoneWADOImageLoader.configure({
  beforeSend: (xhr: XMLHttpRequest) => {
    // Add any headers if needed
  },
});

interface DicomViewerProps {
  studyInstanceUid: string;
  onClose: () => void;
}

export function DicomViewer({ studyInstanceUid, onClose }: DicomViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageIds, setImageIds] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageCount, setImageCount] = useState(0);

  useEffect(() => {
    // Initialize Cornerstone Tools
    cornerstoneTools.external.cornerstone = cornerstone;
    cornerstoneTools.init();

    // Load DICOM files
    loadDicomFiles();

    return () => {
      // Cleanup
      if (viewerRef.current) {
        try {
          cornerstone.disable(viewerRef.current);
        } catch (e) {
          // Element might not be enabled
        }
      }
    };
  }, [studyInstanceUid]);

  const loadDicomFiles = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch list of DICOM files for this study
      const response = await fetch(`/api/dicom-files/${studyInstanceUid}`);
      const data = await response.json();

      if (!data.success || !data.files || data.files.length === 0) {
        throw new Error('Nenhum arquivo DICOM encontrado para este estudo');
      }

      // Create image IDs for Cornerstone
      const ids = data.files.map((filename: string) => 
        `wadouri:/api/dicom-files/${studyInstanceUid}/${filename}`
      );

      setImageIds(ids);
      setImageCount(ids.length);
      setCurrentImageIndex(0);

      // Enable Cornerstone on the div
      if (viewerRef.current) {
        cornerstone.enable(viewerRef.current);

        // Load and display first image
        await displayImage(ids[0]);

        // Add tools
        setupTools();
      }

      setIsLoading(false);
    } catch (err: any) {
      console.error('Error loading DICOM files:', err);
      setError(err.message || 'Erro ao carregar imagens DICOM');
      setIsLoading(false);
    }
  };

  const displayImage = async (imageId: string) => {
    if (!viewerRef.current) return;

    try {
      const image = await cornerstone.loadImage(imageId);
      cornerstone.displayImage(viewerRef.current, image);
    } catch (err) {
      console.error('Error displaying image:', err);
      throw new Error('Erro ao exibir imagem DICOM');
    }
  };

  const setupTools = () => {
    if (!viewerRef.current) return;

    const element = viewerRef.current;

    // Add tools
    cornerstoneTools.addTool(cornerstoneTools.ZoomTool);
    cornerstoneTools.addTool(cornerstoneTools.PanTool);
    cornerstoneTools.addTool(cornerstoneTools.WwwcTool);
    cornerstoneTools.addTool(cornerstoneTools.LengthTool);
    cornerstoneTools.addTool(cornerstoneTools.AngleTool);

    // Set initial tool to Wwwc (windowing)
    cornerstoneTools.setToolActive('Wwwc', { mouseButtonMask: 1 });
  };

  const handleZoomIn = () => {
    if (!viewerRef.current) return;
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.scale += 0.25;
    cornerstone.setViewport(viewerRef.current, viewport);
  };

  const handleZoomOut = () => {
    if (!viewerRef.current) return;
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.scale -= 0.25;
    cornerstone.setViewport(viewerRef.current, viewport);
  };

  const handlePan = () => {
    if (!viewerRef.current) return;
    cornerstoneTools.setToolActive('Pan', { mouseButtonMask: 1 });
  };

  const handleRotate = () => {
    if (!viewerRef.current) return;
    const viewport = cornerstone.getViewport(viewerRef.current);
    viewport.rotation += 90;
    cornerstone.setViewport(viewerRef.current, viewport);
  };

  const handleReset = () => {
    if (!viewerRef.current) return;
    cornerstone.reset(viewerRef.current);
  };

  const handleNextImage = async () => {
    if (currentImageIndex < imageCount - 1) {
      const nextIndex = currentImageIndex + 1;
      setCurrentImageIndex(nextIndex);
      await displayImage(imageIds[nextIndex]);
    }
  };

  const handlePreviousImage = async () => {
    if (currentImageIndex > 0) {
      const prevIndex = currentImageIndex - 1;
      setCurrentImageIndex(prevIndex);
      await displayImage(imageIds[prevIndex]);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" />
          <p>Carregando imagens DICOM...</p>
          <p className="text-sm text-gray-400 mt-2">Baixando estudo do PACS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md">
          <h2 className="text-xl font-bold text-red-600 mb-4">Erro ao Carregar Visualizador</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={onClose} className="w-full">
            Fechar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Visualizador DICOM</h2>
          <p className="text-sm text-gray-400">
            Imagem {currentImageIndex + 1} de {imageCount}
          </p>
        </div>
        <Button onClick={onClose} variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="bg-gray-800 p-2 flex items-center gap-2">
        <Button onClick={handleZoomIn} variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button onClick={handleZoomOut} variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button onClick={handlePan} variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Pan">
          <Move className="h-4 w-4" />
        </Button>
        <Button onClick={handleRotate} variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Rotate">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button onClick={handleReset} variant="ghost" size="icon" className="text-white hover:bg-gray-700" title="Reset">
          <Maximize2 className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        {imageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button 
              onClick={handlePreviousImage} 
              disabled={currentImageIndex === 0}
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-gray-700"
            >
              Anterior
            </Button>
            <Button 
              onClick={handleNextImage} 
              disabled={currentImageIndex === imageCount - 1}
              variant="ghost" 
              size="sm" 
              className="text-white hover:bg-gray-700"
            >
              Próxima
            </Button>
          </div>
        )}
      </div>

      {/* Viewer */}
      <div className="flex-1 flex items-center justify-center bg-black p-4">
        <div 
          ref={viewerRef} 
          className="w-full h-full"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '100%',
          }}
        />
      </div>
    </div>
  );
}
