# PACS Portal - Progresso de Desenvolvimento

**Última Atualização:** 23/02/2026 18:20 GMT-3

---

## ✅ **Funcionalidades Implementadas e Funcionando**

### 1. **Autenticação e Fluxo de Login**
- ✅ Tela de login redesenhada (layout 50/50 com imagem médica)
- ✅ Fluxo: Login → Busca PACS (rota raiz redireciona para `/pacs-query`)
- ✅ OAuth Manus integrado
- ✅ Sistema de permissões por unidade

### 2. **Busca PACS com C-FIND DICOM Real**
- ✅ Integração DICOM funcional usando Python + pynetdicom
- ✅ Consulta real ao Orthanc (179.67.254.135:11112 - PACSML)
- ✅ **44 estudos encontrados e exibidos com sucesso**
- ✅ Filtros: Nome paciente, ID, modalidade, data, accession number
- ✅ Interface compacta profissional (estilo software médico)
- ✅ Auditoria completa de queries PACS

### 3. **Backend tRPC**
- ✅ Endpoint `pacs.query` - Busca estudos via C-FIND DICOM
- ✅ Endpoint `pacs.getViewerUrl` - Gera URL para visualizador (OHIF tentado)
- ✅ Endpoint `pacs.download` - Estrutura para C-MOVE (não implementado)
- ✅ Sistema de auditoria (PACS_QUERY, OPEN_VIEWER, PACS_DOWNLOAD)

### 4. **Banco de Dados**
- ✅ Tabela `units` com campos PACS (pacs_ip, pacs_port, pacs_ae_title, pacs_local_ae_title)
- ✅ Unidade de teste cadastrada (Orthanc 179.67.254.135:11112 - PACSML)
- ✅ Sistema multi-tenant (usuários vinculados a unidades)

### 5. **Scripts Python DICOM**
- ✅ `server/dicom_query.py` - Script Python para C-FIND usando pynetdicom
- ✅ `server/dicom_query.sh` - Wrapper bash para isolar Python 3.11
- ✅ Integração Node.js → Python → PACS funcionando perfeitamente

---

## 🚧 **Em Desenvolvimento (Próximos Passos)**

### 1. **Redesign da Interface de Busca PACS** (Prioridade Alta)
**Baseado na imagem de referência fornecida pelo usuário**

#### Layout Novo:
- [ ] **Colunas**: Ações | Paciente | Exame
- [ ] **Ações coloridas por linha** (ícones):
  - 🟣 Visualizar (ícone olho roxo)
  - 📁 Arquivar (ícone pasta cinza)
  - 🟣 Laudar (ícone edição rosa)
  - 🔴 Excluir (ícone lixeira vermelho)
  - 🟢 Aprovar (ícone check verde)
  - 📤 Compartilhar
  - ⋯ Mais opções
  - 👤 Informações do paciente
  - 🔒 Segurança/Permissões

#### Filtros Avançados no Topo:
- [ ] **Período**: Dropdown (30 dias, 7 dias, hoje, etc.)
- [ ] **Status**: Tabs (Todos, Não Assinados, Prioridades, Plantão, Reavaliação, etc.)
- [ ] **Modalidades**: Checkboxes inline
  - TODAS, CR, CT, DX, EMD, MG, MR, US, VA, ECG, RESP, MAPA, HOLTER, OUTRAS

#### Informações por Linha:
- [ ] **Coluna Paciente**: Nome completo + ID
- [ ] **Coluna Exame**: Data + Modalidade + Descrição

### 2. **Visualizador DICOM Integrado** (Prioridade Alta)
**Decisão: Usar cornerstone.js integrado no portal, NÃO OHIF externo**

#### Motivo da Mudança:
- ❌ OHIF requer DICOMweb habilitado no Orthanc (porta 8042)
- ❌ Orthancs do usuário são configurados apenas com IP:porta:AETitle
- ✅ Visualizador integrado no portal é mais simples e direto

#### Implementação:
- [ ] Instalar cornerstone-core, cornerstone-tools, cornerstone-wado-image-loader
- [ ] Criar componente `DicomViewer.tsx` com canvas cornerstone
- [ ] Buscar imagens DICOM via WADO do Orthanc usando IP:porta
- [ ] Ferramentas básicas:
  - Zoom, Pan
  - Windowing (brilho/contraste)
  - Navegação entre séries/instâncias
  - Medição (distância, ângulo)
- [ ] Integrar com botão "Visualizar" da tabela

### 3. **Sistema de Laudos** (Próxima Fase)
- [ ] Página de criação de laudo
- [ ] Editor de texto rico
- [ ] Templates de laudos por modalidade
- [ ] Assinatura digital
- [ ] Impressão de laudos
- [ ] Integração com visualizador (abrir imagem + laudo lado a lado)

### 4. **Gerenciamento de Unidades** (Próxima Fase)
- [ ] Página de cadastro de unidades
- [ ] Formulário com campos: Nome, IP PACS, Porta, AE Title
- [ ] Teste de conectividade DICOM
- [ ] Listagem de unidades cadastradas
- [ ] Edição/exclusão de unidades

---

## 📊 **Arquitetura Atual**

```
Frontend React (PACS Portal)
    ↓ tRPC
Backend Node.js + Express
    ↓ spawn Python script
Python 3.11 + pynetdicom
    ↓ C-FIND DICOM (porta 11112)
Orthanc Remoto (179.67.254.135:11112 - PACSML)
    ↓
Estudos DICOM retornados
```

### **Arquitetura Futura (com visualizador):**

```
Frontend React
    ↓ tRPC
Backend Node.js
    ↓ WADO (HTTP)
Orthanc Local (IP:porta configurável)
    ↓ C-FIND/C-MOVE
PACS Remoto (IP:porta:AETitle)
```

---

## 🔧 **Arquivos Principais**

### Backend:
- `server/routers.ts` - Endpoints tRPC (pacs.query, pacs.getViewerUrl, pacs.download)
- `server/dicom_query.py` - Script Python C-FIND usando pynetdicom
- `server/dicom_query.sh` - Wrapper bash para Python 3.11
- `server/db.ts` - Funções de acesso ao banco de dados
- `drizzle/schema.ts` - Schema do banco (units, users, audit_log, etc.)

### Frontend:
- `client/src/pages/PacsQueryPage.tsx` - Interface de busca PACS
- `client/src/pages/ViewerPage.tsx` - Página do visualizador (OHIF tentado, será substituído)
- `client/src/pages/Login.tsx` - Tela de login redesenhada
- `client/src/App.tsx` - Rotas da aplicação

### Database:
- `drizzle/0003_black_luckman.sql` - Migration com campos PACS na tabela units

---

## 🎯 **Decisões Técnicas Importantes**

### 1. **Visualizador: Cornerstone.js integrado (NÃO OHIF)**
**Motivo:** Orthancs do usuário não terão DICOMweb habilitado, apenas DICOM C-FIND/C-MOVE via IP:porta:AETitle.

### 2. **Python Bridge para DICOM**
**Motivo:** Bibliotecas DICOM em Node.js são instáveis. Python + pynetdicom é muito mais confiável.

### 3. **Interface Compacta Profissional**
**Motivo:** Usuário pediu design "estilo software médico", não "website genérico". Layout denso com mais informações visíveis.

### 4. **Multi-tenant por Unidade**
**Motivo:** Cada usuário pertence a uma unidade, cada unidade tem seu próprio Orthanc (IP:porta:AETitle).

---

## 📝 **Notas para Próxima Sessão**

1. **Redesenhar PacsQueryPage** com ações coloridas baseado na imagem de referência
2. **Implementar visualizador cornerstone.js** integrado no portal
3. **Testar visualização** de imagens DICOM reais do Orthanc
4. **Implementar C-MOVE** para download de estudos do PACS remoto para Orthanc local (se necessário)

---

## 🐛 **Problemas Conhecidos**

1. **Python SRE module mismatch** - Warnings no console do servidor (não afeta funcionalidade)
2. **OHIF Viewer** - Não funciona sem DICOMweb no Orthanc (será substituído por cornerstone.js)

---

## 📚 **Referências**

- **Orthanc de Teste**: 179.67.254.135:11112 (PACSML)
- **Imagem de Referência**: Layout com ações coloridas fornecido pelo usuário
- **Código 2 (Lauds)**: Referência de design de login

---

**Status Geral:** ✅ **C-FIND DICOM funcionando perfeitamente! Próximo: Redesign + Visualizador integrado**
