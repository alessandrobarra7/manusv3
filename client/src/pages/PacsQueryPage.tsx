import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Download, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function PacsQueryPage() {
  const [filters, setFilters] = useState({
    patientName: "",
    patientId: "",
    modality: "ALL",
    studyDate: "",
    accessionNumber: "",
  });

  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [isQuerying, setIsQuerying] = useState(false);

  // Query PACS mutation
  const queryPacs = trpc.pacs.query.useMutation({
    onSuccess: (data: any) => {
      setQueryResults(data.studies || []);
      toast.success(`${data.studies?.length || 0} estudos encontrados`);
      setIsQuerying(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao consultar PACS");
      setIsQuerying(false);
    },
  });

  // Download study mutation
  const downloadStudy = trpc.pacs.download.useMutation({
    onSuccess: () => {
      toast.success("Download iniciado com sucesso");
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao fazer download do estudo");
    },
  });

  const handleSearch = () => {
    setIsQuerying(true);
    queryPacs.mutate(filters);
  };

  const handleClear = () => {
    setFilters({
      patientName: "",
      patientId: "",
      modality: "ALL",
      studyDate: "",
      accessionNumber: "",
    });
    setQueryResults([]);
  };

  const handleDownload = (studyInstanceUid: string) => {
    downloadStudy.mutate({ studyInstanceUid });
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    // DICOM date format: YYYYMMDD
    if (dateStr.length === 8) {
      const year = dateStr.substring(0, 4);
      const month = dateStr.substring(4, 6);
      const day = dateStr.substring(6, 8);
      return `${day}/${month}/${year}`;
    }
    return dateStr;
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return "-";
    // DICOM time format: HHMMSS
    if (timeStr.length >= 6) {
      const hour = timeStr.substring(0, 2);
      const minute = timeStr.substring(2, 4);
      return `${hour}:${minute}`;
    }
    return timeStr;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header compacto */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Busca de Estudos DICOM</h1>
            <p className="text-xs text-gray-500 mt-0.5">PACS: 179.67.254.135:11112 (PACSML)</p>
          </div>
          <div className="text-xs text-gray-500">
            {queryResults.length} estudo(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Filtros compactos em linha */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="grid grid-cols-12 gap-3 items-end">
          <div className="col-span-3">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Nome do Paciente
            </label>
            <Input
              placeholder="Digite o nome..."
              value={filters.patientName}
              onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 text-sm"
            />
          </div>
          
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              ID do Paciente
            </label>
            <Input
              placeholder="ID..."
              value={filters.patientId}
              onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Modalidade
            </label>
            <Select
              value={filters.modality}
              onValueChange={(value) => setFilters({ ...filters, modality: value })}
            >
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="CR">CR</SelectItem>
                <SelectItem value="CT">CT</SelectItem>
                <SelectItem value="MR">MR</SelectItem>
                <SelectItem value="US">US</SelectItem>
                <SelectItem value="DX">DX</SelectItem>
                <SelectItem value="MG">MG</SelectItem>
                <SelectItem value="PT">PT</SelectItem>
                <SelectItem value="NM">NM</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Data do Estudo
            </label>
            <Input
              type="date"
              value={filters.studyDate}
              onChange={(e) => setFilters({ ...filters, studyDate: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 block mb-1">
              Accession Number
            </label>
            <Input
              placeholder="Accession..."
              value={filters.accessionNumber}
              onChange={(e) => setFilters({ ...filters, accessionNumber: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="h-8 text-sm"
            />
          </div>

          <div className="col-span-1 flex gap-1">
            <Button 
              onClick={handleSearch} 
              disabled={isQuerying}
              size="sm"
              className="h-8 w-full"
            >
              {isQuerying ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Tabela densa */}
      <div className="p-4">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {queryResults.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Data/Hora</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Nome do Paciente</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Data Nasc.</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">ID Paciente</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Mod.</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Descrição</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Accession</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700">Exam ID</TableHead>
                    <TableHead className="h-9 text-xs font-semibold text-gray-700 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {queryResults.map((study, index) => (
                    <TableRow key={index} className="hover:bg-gray-50">
                      <TableCell className="py-2 text-xs">
                        <div className="font-medium text-gray-900">
                          {formatDate(study.studyDate)}
                        </div>
                        <div className="text-gray-500 text-[11px]">
                          {formatTime(study.studyTime)}
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-xs font-medium text-gray-900">
                        {study.patientName || "Não informado"}
                      </TableCell>
                      <TableCell className="py-2 text-xs text-gray-600">
                        {formatDate(study.patientBirthDate)}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono text-gray-700">
                        {study.patientId || "-"}
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge 
                          variant="outline" 
                          className="text-[10px] font-semibold px-1.5 py-0.5"
                        >
                          {study.modality || "N/A"}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2 text-xs text-gray-600 max-w-xs truncate">
                        {study.studyDescription || "-"}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono text-gray-600">
                        {study.accessionNumber || "-"}
                      </TableCell>
                      <TableCell className="py-2 text-xs font-mono text-gray-600">
                        {study.studyId || "-"}
                      </TableCell>
                      <TableCell className="py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/viewer/${study.studyInstanceUid || index}`}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 w-7 p-0"
                              title="Visualizar"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            title="Download"
                            onClick={() => handleDownload(study.studyInstanceUid)}
                            disabled={!study.studyInstanceUid}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <Search className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm font-medium text-gray-900">Nenhum estudo encontrado</p>
              <p className="text-xs text-gray-500 mt-1">
                {isQuerying
                  ? "Consultando PACS..."
                  : "Use os filtros acima para buscar estudos"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
