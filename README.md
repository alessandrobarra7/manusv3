# PACS Portal - Sistema de Gestão de Laudos Radiológicos

Portal PACS multi-tenant completo para gestão de estudos DICOM, laudos radiológicos e integração com múltiplas instâncias Orthanc.

## 🎯 Funcionalidades

### ✅ Implementadas (FASES 0-3)

#### Autenticação e RBAC Multi-tenant
- ✅ Sistema de autenticação JWT via Manus OAuth
- ✅ 4 níveis de permissão (roles):
  - `admin_master`: Acesso total ao sistema
  - `admin_unit`: Gerencia usuários e templates da própria unidade
  - `radiologist`: Cria/edita laudos e visualiza estudos
  - `referring_doctor`: Apenas visualiza estudos e laudos
- ✅ Segregação completa de dados por unidade médica
- ✅ Validação de permissões em todas as rotas

#### Dashboard e Métricas
- ✅ Dashboard com estatísticas em tempo real
- ✅ Métricas: Total de estudos, laudos pendentes, unidades ativas, usuários
- ✅ Ações rápidas para principais funcionalidades
- ✅ Seção de atividades recentes (preparada para auditoria)

#### Gestão de Unidades Médicas
- ✅ CRUD completo de unidades
- ✅ Configuração de endpoints Orthanc por unidade:
  - `orthanc_base_url`: URL base do servidor Orthanc
  - `orthanc_basic_user`: Usuário de autenticação básica
  - `orthanc_basic_pass`: Senha (armazenada com segurança)
- ✅ Gerenciamento de logo por unidade
- ✅ Controle de status (ativo/inativo)

#### Sistema de Estudos DICOM
- ✅ Listagem de estudos com paginação
- ✅ Filtros avançados:
  - Nome do paciente (`patient_name`)
  - Modalidade (`modality`)
  - Data do estudo (`study_date`)
  - Número de acesso (`accession_number`)
- ✅ Cache local de estudos (tabela `studies_cache`)
- ✅ Visualização de detalhes do estudo
- ✅ Botão para abrir viewer DICOM

#### Templates de Laudos
- ✅ CRUD completo de templates
- ✅ Templates por modalidade (CT, MR, US, CR, DX, etc.)
- ✅ Templates globais (admin_master) ou por unidade
- ✅ Editor de templates com variáveis dinâmicas
- ✅ Suporte a campos personalizados

#### Sistema de Laudos
- ✅ Criação de laudos vinculados a estudos
- ✅ Sistema de rascunho automático
- ✅ Versionamento de laudos (histórico)
- ✅ Status: draft, signed, revised
- ✅ Assinatura digital com timestamp

#### Sistema de Auditoria
- ✅ Registro completo de todas as ações:
  - LOGIN, LOGOUT
  - VIEW_STUDY, OPEN_VIEWER
  - CREATE_REPORT, UPDATE_REPORT, SIGN_REPORT
  - CREATE_UNIT, UPDATE_UNIT, DELETE_UNIT
  - CREATE_USER, UPDATE_USER, DELETE_USER
- ✅ Captura de IP, user agent e metadata
- ✅ Timestamp de todas as operações

### 🚧 Pendentes (FASES 4-5)

#### FASE 4 - Proxy DICOMweb e OHIF Viewer
- [ ] Implementar proxy DICOMweb no backend
  - `/dicomweb/{unitSlug}/qido` (Query/Retrieve)
  - `/dicomweb/{unitSlug}/wado` (Web Access)
- [ ] Cliente Orthanc com autenticação
- [ ] Integração OHIF Viewer v3
- [ ] Substituir dados mock por consultas reais ao Orthanc

#### FASE 5 - Produção
- [ ] Geração de PDF de laudos
- [ ] Logo da unidade no PDF
- [ ] Assinatura digital avançada
- [ ] Export de laudos para Orthanc

## 🏗️ Arquitetura

### Stack Tecnológica

**Backend:**
- Node.js 22 + TypeScript
- tRPC 11 (type-safe API)
- Express 4
- Drizzle ORM + MySQL/TiDB
- JWT para autenticação

**Frontend:**
- React 19
- Tailwind CSS 4
- shadcn/ui components
- Wouter (routing)
- TanStack Query (via tRPC)

**Banco de Dados:**
- MySQL/TiDB (gerenciado pela Manus)
- 6 tabelas principais:
  - `users` - Usuários com roles e vinculação a unidades
  - `units` - Unidades médicas com config Orthanc
  - `studies_cache` - Cache de estudos DICOM
  - `reports` - Laudos radiológicos
  - `templates` - Templates de laudos
  - `audit_log` - Registro de auditoria

### Estrutura de Diretórios

```
pacs-portal/
├── client/               # Frontend React
│   ├── src/
│   │   ├── pages/       # Páginas da aplicação
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Units.tsx
│   │   │   ├── Studies.tsx
│   │   │   └── Templates.tsx
│   │   ├── components/  # Componentes reutilizáveis
│   │   └── lib/         # Utilitários e config
├── server/              # Backend tRPC
│   ├── routers.ts       # Definição de rotas da API
│   ├── db.ts            # Helpers de banco de dados
│   └── _core/           # Infraestrutura (auth, trpc, etc)
├── drizzle/             # Schema e migrações do DB
│   └── schema.ts        # Definição das tabelas
└── scripts/             # Scripts utilitários
    └── seed.mjs         # Seed de dados iniciais
```

## 🚀 Como Usar

### 1. Primeiro Acesso

Ao fazer login pela primeira vez, você será automaticamente promovido a `admin_master` (dono do projeto).

### 2. Criar Unidades Médicas

1. Acesse **Unidades Médicas** no menu
2. Clique em **Nova Unidade**
3. Preencha:
   - Nome da unidade
   - Slug (identificador único, ex: `unidade-central`)
   - Orthanc Base URL (ex: `http://192.168.3.250:8042`)
   - Credenciais Orthanc (opcional)

### 3. Popular com Dados de Exemplo

Execute o script de seed para criar dados iniciais:

```bash
node scripts/seed.mjs
```

Isso criará:
- 2 unidades médicas de exemplo
- 3 templates de laudos (Raio-X, TC, US)
- 3 estudos DICOM mock

### 4. Criar Templates de Laudos

1. Acesse **Templates de Laudos**
2. Clique em **Novo Template**
3. Defina:
   - Nome do template
   - Modalidade (opcional)
   - Corpo do template com variáveis

**Variáveis disponíveis:**
- `{patient_name}` - Nome do paciente
- `{study_date}` - Data do estudo
- `{radiologist_name}` - Nome do radiologista
- `{report_date}` - Data do laudo

### 5. Visualizar Estudos

1. Acesse **Estudos DICOM**
2. Use os filtros para buscar:
   - Nome do paciente
   - Modalidade
   - Data
   - Número de acesso
3. Clique em **Ver** para detalhes
4. Clique no ícone de documento para laudar

## 🔒 Segurança

### RBAC (Role-Based Access Control)

Todas as rotas validam:
1. **Autenticação**: Usuário está logado?
2. **Role**: Usuário tem permissão para esta ação?
3. **Unit**: Dados pertencem à unidade do usuário?

### Auditoria Completa

Todas as ações críticas são registradas em `audit_log`:
- Quem fez a ação (`user_id`)
- Em qual unidade (`unit_id`)
- Qual ação (`action`)
- Quando (`timestamp`)
- De onde (`ip_address`, `user_agent`)

### Segregação de Dados

- Usuários só veem dados da própria unidade
- `admin_master` pode ver todas as unidades
- Queries sempre filtram por `unit_id`

## 🧪 Testes

Execute os testes unitários:

```bash
pnpm test
```

**Cobertura atual:**
- ✅ Autenticação e logout
- ✅ RBAC de unidades
- ✅ Segregação de dados por unidade

## 📊 Modelo de Dados

### Relacionamentos

```
users (n) ←→ (1) units
  ↓
reports (n) → (1) studies_cache
  ↓
reports (n) → (1) templates

audit_log → users
audit_log → units
```

### Campos Técnicos Obrigatórios

Conforme especificação, os seguintes nomes de campos devem ser mantidos:

**Unidades:**
- `orthanc_base_url`
- `orthanc_basic_user`
- `orthanc_basic_pass`

**Estudos:**
- `patient_name`
- `modality`
- `study_date`
- `accession_number`

**Auditoria:**
- `user_id`
- `timestamp`

**Proxy DICOMweb (FASE 4):**
- `{unitSlug}` na URL

## 🔄 Próximas Etapas (FASE 4)

### Implementar Proxy DICOMweb

O proxy DICOMweb unificará o acesso a múltiplas instâncias Orthanc:

```typescript
// Backend: server/orthanc-proxy.ts
app.get('/dicomweb/:unitSlug/qido/*', async (req, res) => {
  const unit = await getUnitBySlug(req.params.unitSlug);
  // Proxy para unit.orthanc_base_url
});
```

### Integrar OHIF Viewer

Configurar OHIF para usar o proxy:

```javascript
// OHIF config
dataSources: [{
  namespace: '@ohif/extension-default.dataSourcesModule.dicomweb',
  configuration: {
    friendlyName: 'PACS Portal',
    qidoRoot: '/dicomweb/{unitSlug}/qido',
    wadoRoot: '/dicomweb/{unitSlug}/wado',
  }
}]
```

## 📝 Notas Técnicas

### Por que tRPC?

- **Type-safety end-to-end**: Frontend e backend compartilham tipos
- **Sem código boilerplate**: Não precisa definir schemas duplicados
- **Auto-complete**: IDE sugere procedures e tipos automaticamente
- **Validação com Zod**: Inputs validados em runtime

### Por que Drizzle ORM?

- **Type-safe**: Queries validadas em compile-time
- **Migrações SQL**: Controle total sobre o schema
- **Performance**: Queries otimizadas, sem overhead
- **MySQL/TiDB**: Compatível com banco gerenciado pela Manus

### Estrutura de Roles

```
admin_master (super admin)
  ├── Gerencia todas as unidades
  ├── Cria templates globais
  └── Acessa todos os dados

admin_unit (admin da unidade)
  ├── Gerencia usuários da unidade
  ├── Cria templates da unidade
  └── Vê dados da unidade

radiologist (radiologista)
  ├── Cria e edita laudos
  ├── Visualiza estudos
  └── Acessa viewer DICOM

referring_doctor (médico solicitante)
  ├── Visualiza estudos
  └── Visualiza laudos (somente leitura)
```

## 🎨 Design

Interface profissional médico-hospitalar com:
- Paleta de cores azul (confiança, profissionalismo)
- Tipografia clara e legível
- Cards e tabelas para organização de dados
- Feedback visual em todas as ações
- Responsivo (desktop e tablet)

## 📞 Suporte

Para dúvidas sobre:
- **Funcionalidades**: Consulte este README
- **Bugs**: Verifique os logs em `.manus-logs/`
- **Orthanc**: Consulte [documentação oficial](https://book.orthanc-server.com/)
- **OHIF**: Consulte [documentação OHIF](https://docs.ohif.org/)

---

**Desenvolvido com Manus** 🚀
