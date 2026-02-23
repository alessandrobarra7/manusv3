import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Eye, Download, Calendar, RefreshCw } from "lucide-react";
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
    modality: "",
    studyDate: "",
    accessionNumber: "",
    studyDescription: "",
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
      modality: "",
      studyDate: "",
      accessionNumber: "",
      studyDescription: "",
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Search className="h-8 w-8" />
            Busca no PACS
          </h1>
          <p className="text-muted-foreground mt-2">
            Consulte estudos DICOM no servidor PACS (179.67.254.135:11112 - PACSML)
          </p>
        </div>

        {/* Search Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros de Busca</CardTitle>
            <CardDescription>
              Preencha os campos desejados para buscar estudos no PACS
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="patientName">Nome do Paciente</Label>
                <Input
                  id="patientName"
                  placeholder="Digite o nome..."
                  value={filters.patientName}
                  onChange={(e) => setFilters({ ...filters, patientName: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="patientId">ID do Paciente</Label>
                <Input
                  id="patientId"
                  placeholder="ID do paciente..."
                  value={filters.patientId}
                  onChange={(e) => setFilters({ ...filters, patientId: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="modality">Modalidade</Label>
                <Select
                  value={filters.modality}
                  onValueChange={(value) => setFilters({ ...filters, modality: value })}
                >
                  <SelectTrigger id="modality">
                    <SelectValue placeholder="Todas as modalidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">Todas</SelectItem>
                    <SelectItem value="CR">CR - Radiografia Computadorizada</SelectItem>
                    <SelectItem value="CT">CT - Tomografia Computadorizada</SelectItem>
                    <SelectItem value="MR">MR - Ressonância Magnética</SelectItem>
                    <SelectItem value="US">US - Ultrassom</SelectItem>
                    <SelectItem value="DX">DX - Radiografia Digital</SelectItem>
                    <SelectItem value="MG">MG - Mamografia</SelectItem>
                    <SelectItem value="PT">PT - PET</SelectItem>
                    <SelectItem value="NM">NM - Medicina Nuclear</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studyDate">Data do Estudo</Label>
                <Input
                  id="studyDate"
                  type="date"
                  value={filters.studyDate}
                  onChange={(e) => setFilters({ ...filters, studyDate: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="accessionNumber">Número de Acesso</Label>
                <Input
                  id="accessionNumber"
                  placeholder="Accession number..."
                  value={filters.accessionNumber}
                  onChange={(e) => setFilters({ ...filters, accessionNumber: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="studyDescription">Descrição do Estudo</Label>
                <Input
                  id="studyDescription"
                  placeholder="Descrição..."
                  value={filters.studyDescription}
                  onChange={(e) => setFilters({ ...filters, studyDescription: e.target.value })}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button onClick={handleSearch} disabled={isQuerying} className="flex-1 md:flex-none">
                {isQuerying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Buscar no PACS
                  </>
                )}
              </Button>
              <Button onClick={handleClear} variant="outline">
                Limpar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Resultados da Busca</CardTitle>
            <CardDescription>
              {queryResults.length} estudo(s) encontrado(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {queryResults.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data do Estudo</TableHead>
                      <TableHead>Nome do Paciente</TableHead>
                      <TableHead>Data de Nascimento</TableHead>
                      <TableHead>ID do Paciente</TableHead>
                      <TableHead>Modalidade</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Accession Number</TableHead>
                      <TableHead>Exam ID</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {queryResults.map((study, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">
                          {formatDate(study.studyDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {study.patientName || "Não informado"}
                        </TableCell>
                        <TableCell>
                          {formatDate(study.patientBirthDate)}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {study.patientId || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{study.modality || "N/A"}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {study.studyDescription || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {study.accessionNumber || "-"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {study.studyId || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/viewer/${study.studyInstanceUid || index}`}>
                              <Button variant="ghost" size="sm" title="Visualizar Estudo">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Download para PACS Local"
                              onClick={() => handleDownload(study.studyInstanceUid)}
                              disabled={!study.studyInstanceUid}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium">Nenhum estudo encontrado</p>
                <p className="text-sm mt-2">
                  {isQuerying
                    ? "Consultando PACS..."
                    : "Use os filtros acima para buscar estudos no PACS"}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
