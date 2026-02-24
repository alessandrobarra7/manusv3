# PACS Portal - Roadmap de Funcionalidades

## 🎯 Objetivo
Implementar todas as funcionalidades do frontend Lovable no PACS Portal, mantendo compatibilidade total com o backend tRPC existente.

---

## ✅ Funcionalidades Básicas (Implementadas)

- [x] Dashboard principal
- [x] Listagem de estudos DICOM
- [x] Templates de laudos básicos
- [x] Gerenciamento de unidades médicas
- [x] Autenticação OAuth
- [x] Sistema de auditoria básico

---

## 🚀 Funcionalidades a Implementar

### 1. Visualizador DICOM (ViewerPage)
- [ ] Visualizador de imagens DICOM integrado
- [ ] Navegação entre séries e instâncias
- [ ] Ferramentas de medição (distância, ângulo, área)
- [ ] Ferramentas de anotação
- [ ] Ajuste de windowing (brilho/contraste)
- [ ] Zoom e pan
- [ ] Rotação de imagens
- [ ] Exportação de imagens

### 2. Query PACS (PacsQueryPage)
- [ ] Interface de busca avançada no PACS
- [ ] Filtros por data, modalidade, paciente, médico
- [ ] Integração com Orthanc Query/Retrieve
- [ ] Visualização de resultados em grid
- [ ] Download de estudos do PACS
- [ ] Cache local de estudos

### 3. Conexões PACS (PacsConnectionsPage)
- [ ] Gerenciamento de múltiplas conexões Orthanc
- [ ] Configuração de credenciais por unidade
- [ ] Teste de conectividade
- [ ] Status de conexão em tempo real
- [ ] Logs de conexão
- [ ] Configuração de AE Title

### 4. Editor de Laudos Avançado (ReportEditorPage)
- [ ] Editor de texto rico (WYSIWYG)
- [ ] Sistema de templates dinâmicos
- [ ] Versionamento de laudos
- [ ] Assinatura digital
- [ ] Histórico de revisões
- [ ] Comparação de versões
- [ ] Exportação para PDF
- [ ] Impressão de laudos

### 5. Sistema de Anamnese Inteligente
- [ ] Anamnese de Abdomen
  - [ ] Formulário estruturado
  - [ ] Campos dinâmicos
  - [ ] Validação de dados
- [ ] Anamnese de Coluna
  - [ ] Formulário estruturado
  - [ ] Campos dinâmicos
  - [ ] Validação de dados
- [ ] Anamnese de Crânio
  - [ ] Formulário estruturado
  - [ ] Campos dinâmicos
  - [ ] Validação de dados
- [ ] Anamnese de Tórax
  - [ ] Formulário estruturado
  - [ ] Campos dinâmicos
  - [ ] Validação de dados
- [ ] Integração com templates de laudos
- [ ] Auto-preenchimento baseado em anamnese

### 6. Administração Completa (admin/)

#### 6.1 Gerenciamento de Usuários (UsersAdminPage)
- [ ] Listagem de usuários
- [ ] Criação de novos usuários
- [ ] Edição de usuários existentes
- [ ] Desativação/ativação de usuários
- [ ] Atribuição de roles (admin_master, admin_unit, radiologist, referring_doctor)
- [ ] Atribuição de unidades
- [ ] Histórico de atividades do usuário

#### 6.2 Gerenciamento de Unidades (UnitsAdminPage)
- [ ] Listagem de unidades médicas
- [ ] Criação de novas unidades
- [ ] Edição de unidades existentes
- [ ] Configuração de Orthanc por unidade
- [ ] Upload de logo da unidade
- [ ] Desativação/ativação de unidades

#### 6.3 Gerenciamento de Permissões (PermissionsAdminPage)
- [ ] Matriz de permissões por role
- [ ] Configuração de permissões granulares
- [ ] Permissões por módulo
- [ ] Permissões por ação (criar, editar, deletar, visualizar)

#### 6.4 Gerenciamento de Templates (TemplatesAdminPage)
- [ ] Listagem de templates de laudos
- [ ] Criação de novos templates
- [ ] Edição de templates existentes
- [ ] Templates globais vs. por unidade
- [ ] Templates por modalidade
- [ ] Campos dinâmicos em templates
- [ ] Preview de templates

#### 6.5 Auditoria Completa (AuditAdminPage)
- [ ] Listagem de logs de auditoria
- [ ] Filtros avançados (usuário, ação, data, unidade)
- [ ] Exportação de logs
- [ ] Visualização detalhada de ações
- [ ] Gráficos de atividade
- [ ] Alertas de atividades suspeitas

### 7. Melhorias de UI/UX
- [ ] Design system consistente
- [ ] Componentes shadcn/ui completos
- [ ] Tema escuro/claro
- [ ] Responsividade mobile
- [ ] Animações e transições
- [ ] Loading states
- [ ] Error boundaries
- [ ] Toast notifications
- [ ] Confirmação de ações destrutivas

### 8. Integrações
- [ ] Integração completa com Orthanc
- [ ] Integração com HL7/FHIR (futuro)
- [ ] Integração com sistemas HIS/RIS (futuro)
- [ ] API REST para integrações externas (futuro)

---

## 📋 Prioridades

### Fase 1 (Crítica) - 2-3 semanas
1. Visualizador DICOM básico
2. Query PACS
3. Conexões PACS
4. Editor de Laudos Avançado

### Fase 2 (Importante) - 2-3 semanas
1. Sistema de Anamnese completo
2. Gerenciamento de Usuários
3. Gerenciamento de Unidades
4. Gerenciamento de Templates

### Fase 3 (Desejável) - 1-2 semanas
1. Gerenciamento de Permissões
2. Auditoria Completa
3. Melhorias de UI/UX

### Fase 4 (Futuro)
1. Integrações avançadas
2. Mobile app
3. IA para auxílio diagnóstico

---

## 📝 Notas de Implementação

- Todas as funcionalidades devem usar tRPC para comunicação com backend
- Manter compatibilidade com backend existente
- Testes unitários para cada funcionalidade
- Documentação inline no código
- Commits atômicos e descritivos
- Code review antes de merge

---

**Última atualização:** 23/02/2026
**Status:** Frontend original restaurado e funcionando
**Próximo passo:** Implementar Visualizador DICOM

---

## 📝 Changelog de Implementações

### 23/02/2026 - Visualizador DICOM (Estrutura Base)
- [x] Criada página ViewerPage.tsx com estrutura para integração OHIF
- [x] Adicionada rota `/viewer/:studyId` no App.tsx
- [x] Integrado botão de visualização na listagem de estudos
- [x] Documentação das funcionalidades planejadas na página do visualizador
- [ ] Pendente: Configurar instância OHIF Viewer
- [ ] Pendente: Integrar com backend Orthanc via DICOMweb

### 23/02/2026 - PACS Query & Retrieve (Interface Implementada)
- [x] Criar endpoint tRPC para query PACS (estrutura base)
- [x] Implementar PacsQueryPage com filtros (nome, modalidade, data, ID paciente, accession, descrição)
- [x] Criar tabela de resultados similar ao visualizador de referência
- [x] Integrar botão de visualização com OHIF Viewer
- [x] Adicionar auditoria de queries PACS (PACS_QUERY, PACS_DOWNLOAD)
- [ ] Pendente: Implementar C-FIND real no Orthanc (179.67.254.135:11112 - PACSML)
- [ ] Pendente: Implementar C-MOVE para download de estudos

### 23/02/2026 - Redesign de Login e Fluxo Principal (Concluído)
- [x] Redesenhar página de login com layout 50/50 (formulário + imagem médica)
- [x] Adicionar imagem médica profissional no lado direito
- [x] Melhorar design do formulário de login (campos, botões, logo)
- [x] Ajustar rota inicial (/) para redirecionar para /pacs-query após login
- [x] Remover Dashboard como tela principal
- [x] Testar fluxo: Login → Busca de Exames PACS

### 23/02/2026 - Redesign PACS Query - Layout Compacto Profissional (Concluído)
- [x] Redesenhar PacsQueryPage com layout compacto (estilo software, não website)
- [x] Filtros em linha horizontal grid 12 colunas
- [x] Tabela densa com linhas menores (py-2) e tipografia xs
- [x] Reduzir espaçamentos e paddings (h-8 inputs, h-9 headers)
- [x] Tipografia menor e mais profissional (text-xs, text-[11px])
- [x] Cores neutras (gray-50 bg, gray-700 text)
- [x] Header compacto com contador de resultados
- [x] Botões de ação compactos (h-7 w-7)

### 23/02/2026 - Implementação C-FIND DICOM Real (Concluído ✅)
- [x] Atualizar schema units com campos PACS (pacs_ip, pacs_port, pacs_ae_title)
- [x] Gerar e aplicar migration para novos campos (0003_black_luckman.sql)
- [x] Criar script Python dicom_query.py usando pynetdicom
- [x] Instalar pynetdicom e pydicom no servidor
- [x] Criar bash wrapper dicom_query.sh para isolar Python 3.11
- [x] Integrar script Python no backend tRPC (pacs.query)
- [x] Criar unidade de teste (Orthanc 179.67.254.135:11112 - PACSML)
- [x] Testar busca real no Orthanc (44 estudos encontrados com sucesso!)
- [x] Implementar tratamento de erros DICOM
- [x] Logs de auditoria já implementados (PACS_QUERY action)

### 23/02/2026 - Tentativa OHIF Viewer (Descontinuado)
- [x] Criar endpoint tRPC pacs.getViewerUrl para gerar URL OHIF
- [x] Implementar ViewerPage.tsx com redirecionamento para OHIF
- [x] Conectar botão "Visualizar" ao endpoint
- [x] Testar integração - **Resultado**: OHIF requer DICOMweb no Orthanc
- **Decisão**: Implementar visualizador integrado no portal (cornerstone.js) ao invés de OHIF externo

### 23/02/2026 - Redesign Interface Busca PACS (Concluído ✅)
- [x] Redesenhar PacsQueryPage com layout baseado na imagem de referência
- [x] Adicionar ações coloridas por linha:
  - 🟪 Visualizar (ícone olho roxo)
  - 📁 Arquivar (ícone pasta cinza)
  - 💖 Laudar (ícone edição rosa)
  - 🔴 Excluir (ícone lixeira vermelho)
  - 🟢 Aprovar (ícone check verde)
  - 🔵 Compartilhar (ícone share azul)
  - ⋯ Mais opções, Info paciente, Segurança
- [x] Implementar coluna de Ações com 9 ícones coloridos
- [x] Reorganizar colunas: Ações | Data de Realização | Nome do Paciente | Descrição do Exame
- [x] Adicionar filtros avançados no topo (Período, Status, Modalidades)
- [x] Corrigir formatação de nomes (remover caracteres ^)
- [x] Simplificar colunas conforme solicitado

### Próxima Fase - Visualizador Integrado
- [ ] Implementar visualizador cornerstone.js integrado no portal
- [ ] Buscar imagens DICOM via WADO do Orthanc
- [ ] Criar componente DicomViewer com cornerstone-core
- [ ] Adicionar ferramentas básicas (zoom, pan, windowing)
- [ ] Testar visualização de imagens reais do PACS

### 23/02/2026 - Reorganização Interface Busca PACS (Concluído ✅)
- [x] Alterar barra de título: remover dados PACS, adicionar boas-vindas com nome da unidade
- [x] Simplificar filtros: manter apenas Nome do Paciente e Data
- [x] Adicionar botões rápidos: Exames de Hoje, Período (dropdown: Hoje/7dias/30dias/Todos), Plantão
- [x] Remover filtros: ID do Paciente, Modalidade, Accession Number
- [x] Reordenar colunas da tabela:
  1. Data de Realização (com horário)
  2. Nome do Paciente (com descrição do exame e modalidade)
  3. Visualizador (botão "Ver" roxo)
  4. Laudar (botão "Laudar" rosa)
  5. Médico (nome + CRM)
  6. Status de Laudo (Pendente/Em Andamento/Concluído com cores)
- [x] Remover botões de ações não utilizados (Arquivar, Excluir, Aprovar, Compartilhar, etc.)

### 23/02/2026 - Visualizador DICOM Cornerstone.js com Cache Temporário (Em Andamento)
- [x] Criar script Python para C-MOVE (dicom_move.py)
- [x] Criar bash wrapper para isolar Python 3.11 (dicom_move.sh)
- [x] Instalar bibliotecas Cornerstone.js (cornerstone-core, cornerstone-tools, cornerstone-wado-image-loader, dicom-parser)
- [x] Criar endpoint backend para servir arquivos DICOM do cache (GET /api/dicom-files/:studyUid/:filename)
- [x] Criar endpoint para listar arquivos DICOM (GET /api/dicom-files/:studyUid)
- [x] Implementar endpoint tRPC pacs.startViewer (C-MOVE + retornar cache info)
- [x] Criar componente DicomViewer.tsx com Cornerstone.js
- [x] Adicionar ferramentas básicas (zoom, pan, rotate, reset)
- [ ] **PENDENTE**: Adicionar type definitions para Cornerstone.js
- [ ] **PENDENTE**: Integrar DicomViewer na página de busca PACS (botão Ver)
- [ ] **PENDENTE**: Testar C-MOVE real com Orthanc
- [ ] **PENDENTE**: Testar visualização de imagens DICOM
- [ ] **PENDENTE**: Implementar limpeza automática de cache
- [ ] **PENDENTE**: Adicionar indicador de progresso durante C-MOVE
- [ ] **PENDENTE**: Implementar navegação entre séries/instâncias

### 23/02/2026 - BUG: Consulta de Exames Parou de Funcionar
- [ ] Diagnosticar problema (verificar logs, erros TypeScript, endpoint tRPC)
- [ ] Corrigir erro identificado
- [ ] Testar consulta novamente (buscar "TESTE")
- [ ] Verificar se retorna 44 estudos como antes

### 23/02/2026 - BUG: Busca por Data Não Funciona (RESOLVIDO ✅)
- [x] Diagnosticar por que botão "Exames de Hoje" não retorna resultados
- [x] Verificar se filtro de data está sendo enviado corretamente ao backend
- [x] Identificar problema: navegador em UTC enviava data 24/02 enquanto servidor em EST estava em 23/02
- [x] Corrigir lógica: frontend envia "TODAY" e backend calcula data no timezone do servidor
- [x] Testar busca por data: 48 estudos encontrados com sucesso!
- **Causa raiz**: Diferença de timezone entre navegador (GMT+0) e servidor (EST/GMT-5)
- **Solução**: Backend interpreta valor especial "TODAY" e calcula data local do servidor

### 23/02/2026 - BUG: Campo de Data Manual Não Funciona
- [ ] Diagnosticar por que campo de data manual não retorna resultados
- [ ] Verificar formato da data sendo enviado ao backend (deve ser YYYYMMDD)
- [ ] Corrigir conversão de formato YYYY-MM-DD para YYYYMMDD
- [ ] Testar busca com data manual (ex: 20/02/2026)

### 23/02/2026 - Implementar Busca por Período (CONCLUÍDO ✅)
- [x] Implementar botão "Hoje" para buscar exames de hoje
- [x] Implementar botão "7 dias" para buscar exames dos últimos 7 dias
- [x] Implementar botão "30 dias" para buscar exames dos últimos 30 dias
- [x] Implementar botão "Todos" para buscar todos os exames sem filtro de data
- [x] Remover campo de data manual problemático
- [x] Adicionar indicador visual do período selecionado (botão azul)
- [x] Backend interpreta valores especiais: TODAY, LAST_7_DAYS, LAST_30_DAYS
- [x] Testar todas as opções: Hoje (1 estudo), 7 Dias (9 estudos), 30 Dias (16 estudos), Todos (16 estudos)
- **Solução**: Interface simplificada com botões de período ao invés de campo manual
