import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Eye, 
  FileText, 
  Archive, 
  Trash2, 
  CheckCircle, 
  Share2, 
  MoreVertical,
  User,
  Shield,
  RefreshCw,
  Calendar
} from "lucide-react";
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

  const handleSearch = () => {
    setIsQuerying(true);
    queryPacs.mutate({
      patientName: filters.patientName,
      patientId: filters.patientId,
      modality: filters.modality,
      studyDate: filters.studyDate,
      accessionNumber: filters.accessionNumber,
    });
  };

  const handleAction = (action: string, study: any) => {
    toast.info(`Ação "${action}" em desenvolvimento para: ${study.patientName}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Exames</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              PACS: 179.67.254.135:11112 (PACSML)
            </p>
          </div>
          <div className="text-sm text-gray-600">
            {queryResults.length} estudo(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Patient Name */}
          <div className="col-span-3">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Nome do Paciente
            </label>
            <Input
              placeholder="Digite o nome..."
              value={filters.patientName}
              onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          {/* Patient ID */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              ID do Paciente
            </label>
            <Input
              placeholder="ID..."
              value={filters.patientId}
              onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          {/* Modality */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Modalidade
            </label>
            <Select value={filters.modality} onValueChange={(value) => setFilters({ ...filters, modality: value })}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Todas</SelectItem>
                <SelectItem value="CR">CR - Radiografia Computadorizada</SelectItem>
                <SelectItem value="CT">CT - Tomografia</SelectItem>
                <SelectItem value="MR">MR - Ressonância Magnética</SelectItem>
                <SelectItem value="US">US - Ultrassom</SelectItem>
                <SelectItem value="DX">DX - Raio-X Digital</SelectItem>
                <SelectItem value="MG">MG - Mamografia</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Study Date */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Data do Estudo
            </label>
            <Input
              type="date"
              value={filters.studyDate}
              onChange={(e) => setFilters({ ...filters, studyDate: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          {/* Accession Number */}
          <div className="col-span-2">
            <label className="text-xs font-medium text-gray-700 mb-1 block">
              Accession Number
            </label>
            <Input
              placeholder="Accession..."
              value={filters.accessionNumber}
              onChange={(e) => setFilters({ ...filters, accessionNumber: e.target.value })}
              className="h-8 text-xs"
            />
          </div>

          {/* Search Button */}
          <div className="col-span-1 flex items-end">
            <Button 
              onClick={handleSearch} 
              disabled={isQuerying}
              className="h-8 w-full text-xs"
            >
              {isQuerying ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Search className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Period and Status Filters */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5 text-gray-500" />
            <span className="text-gray-600">Período:</span>
            <Select defaultValue="30">
              <SelectTrigger className="h-7 w-28 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="7">7 Dias</SelectItem>
                <SelectItem value="30">30 Dias</SelectItem>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-600">Status:</span>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">Todos</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">Não Assinados</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">Prioridades</Badge>
              <Badge variant="outline" className="text-xs cursor-pointer hover:bg-gray-100">Plantão</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="px-6 py-4">
        {queryResults.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Nenhum estudo encontrado</p>
            <p className="text-gray-400 text-xs mt-1">Use os filtros acima para buscar estudos</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-2 text-[11px] font-semibold text-gray-700 w-[200px]">
                    Ações
                  </TableHead>
                  <TableHead className="py-2 text-[11px] font-semibold text-gray-700 w-[140px]">
                    Data de Realização
                  </TableHead>
                  <TableHead className="py-2 text-[11px] font-semibold text-gray-700">
                    Nome do Paciente
                  </TableHead>
                  <TableHead className="py-2 text-[11px] font-semibold text-gray-700">
                    Descrição do Exame
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {queryResults.map((study, index) => (
                  <TableRow key={index} className="hover:bg-gray-50 border-b border-gray-100">
                    {/* Actions Column */}
                    <TableCell className="py-2">
                      <div className="flex items-center gap-1">
                        {/* Visualizar - Purple */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-purple-100"
                          title="Visualizar"
                          onClick={() => handleAction("Visualizar", study)}
                        >
                          <Eye className="h-4 w-4 text-purple-600" />
                        </Button>

                        {/* Arquivar - Gray */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Arquivar"
                          onClick={() => handleAction("Arquivar", study)}
                        >
                          <Archive className="h-4 w-4 text-gray-600" />
                        </Button>

                        {/* Laudar - Pink */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-pink-100"
                          title="Laudar"
                          onClick={() => handleAction("Laudar", study)}
                        >
                          <FileText className="h-4 w-4 text-pink-600" />
                        </Button>

                        {/* Excluir - Red */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-100"
                          title="Excluir"
                          onClick={() => handleAction("Excluir", study)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>

                        {/* Aprovar - Green */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-green-100"
                          title="Aprovar"
                          onClick={() => handleAction("Aprovar", study)}
                        >
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </Button>

                        {/* Compartilhar - Blue */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-100"
                          title="Compartilhar"
                          onClick={() => handleAction("Compartilhar", study)}
                        >
                          <Share2 className="h-4 w-4 text-blue-600" />
                        </Button>

                        {/* More Options */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Mais opções"
                        >
                          <MoreVertical className="h-4 w-4 text-gray-500" />
                        </Button>

                        {/* Patient Info */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Informações do paciente"
                        >
                          <User className="h-4 w-4 text-gray-500" />
                        </Button>

                        {/* Security */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          title="Segurança"
                        >
                          <Shield className="h-4 w-4 text-gray-500" />
                        </Button>
                      </div>
                    </TableCell>

                    {/* Date Column */}
                    <TableCell className="py-2">
                      <div className="text-xs text-gray-900">
                        {study.studyDate ? 
                          new Date(study.studyDate.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('pt-BR') 
                          : "-"}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {study.studyTime || ""}
                      </div>
                    </TableCell>

                    {/* Patient Name Column */}
                    <TableCell className="py-2">
                      <div className="text-xs font-medium text-gray-900">
                        {study.patientName ? study.patientName.replace(/\^/g, ' ') : "-"}
                      </div>
                    </TableCell>

                    {/* Exam Description Column */}
                    <TableCell className="py-2">
                      <div className="text-xs text-gray-900">
                        {study.studyDescription || "Sem descrição"}
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        {study.modality || "-"}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
