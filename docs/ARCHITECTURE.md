# PACS Portal - Documentação Técnica Completa

**Autor:** Manus AI  
**Data:** 24 de fevereiro de 2026  
**Versão do Sistema:** b506a213

---

## Sumário Executivo

O **PACS Portal** é um sistema web moderno para gestão de laudos radiológicos que integra comunicação DICOM com servidores PACS externos. O sistema atual utiliza uma arquitetura **full-stack JavaScript/TypeScript** com comunicação tipo-segura via tRPC, diferente de abordagens anteriores que utilizavam tecnologias mais complexas ou desacopladas.

---

## 1. Arquitetura Geral do Sistema

### 1.1 Visão Geral

O sistema segue uma arquitetura **monolítica moderna** onde frontend e backend compartilham o mesmo repositório e são servidos pelo mesmo processo Node.js em produção. Esta abordagem simplifica o desenvolvimento e deployment comparada a arquiteturas microserviços ou completamente desacopladas.

```
┌─────────────────────────────────────────────────────────────┐
│                    PACS Portal (Node.js)                     │
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   Frontend       │◄────────┤   Backend        │          │
│  │   (React 19)     │  tRPC   │   (Express 4)    │          │
│  │                  │         │                  │          │
│  │  - Vite Build    │         │  - tRPC Router   │          │
│  │  - React Router  │         │  - Auth (JWT)    │          │
│  │  - TanStack Query│         │  - Business Logic│          │
│  └──────────────────┘         └─────────┬────────┘          │
│                                          │                    │
└──────────────────────────────────────────┼────────────────────┘
                                           │
                    ┌──────────────────────┼──────────────────────┐
                    │                      │                      │
                    ▼                      ▼                      ▼
            ┌───────────────┐     ┌──────────────┐      ┌──────────────┐
            │  MySQL/TiDB   │     │ PACS Server  │      │   S3 Storage │
            │   Database    │     │   (DICOM)    │      │  (Arquivos)  │
            └───────────────┘     └──────────────┘      └──────────────┘
```

### 1.2 Diferenças da Abordagem Anterior

Baseado no conhecimento do projeto, a abordagem anterior ("Lovable") tinha características diferentes:

| Aspecto | Sistema Anterior (Lovable) | Sistema Atual (PACS Portal) |
|---------|---------------------------|----------------------------|
| **Arquitetura** | Frontend e backend desacoplados | Monolito moderno integrado |
| **Comunicação** | REST API tradicional | tRPC com type-safety end-to-end |
| **Complexidade** | Maior, com mais camadas | Simplificada, menos overhead |
| **Deployment** | Requer configuração separada | Single process, mais simples |
| **Type Safety** | Parcial (contratos manuais) | Total (tipos compartilhados) |
| **Integração PACS** | Possivelmente via Orthanc API | Direta via protocolo DICOM (pynetdicom) |

---

## 2. Stack Tecnológica Atual

### 2.1 Frontend

**Framework Principal:** React 19.2.1

O frontend utiliza a versão mais recente do React com suporte a Server Components e melhorias de performance. A escolha do React 19 traz benefícios como:

- Renderização otimizada com concurrent features
- Melhor gerenciamento de estado assíncrono
- Suporte nativo a Suspense para data fetching

**Roteamento:** React Router DOM 7.13.1 + Wouter 3.9.0

Utiliza-se uma combinação de React Router para navegação principal e Wouter como alternativa leve para rotas simples, oferecendo flexibilidade no gerenciamento de navegação.

**Estilização:** Tailwind CSS 4.1.14

Tailwind 4 representa uma evolução significativa com:
- Engine de CSS completamente reescrito em Rust (Lightning CSS)
- Performance de build até 10x mais rápida
- Suporte nativo a CSS moderno (container queries, cascade layers)
- Formato de configuração simplificado

**Componentes UI:** shadcn/ui (via Radix UI)

Biblioteca de componentes acessíveis e customizáveis baseada em Radix UI primitives:
- 45+ componentes Radix UI instalados (accordion, dialog, dropdown, etc.)
- Totalmente acessível (ARIA compliant)
- Customização via Tailwind classes
- Sem runtime JavaScript desnecessário

**State Management:** TanStack Query (React Query) 5.90.2

Gerenciamento de estado servidor com features avançadas:
- Cache inteligente de dados
- Sincronização automática
- Optimistic updates
- Retry logic configurável

**Data Fetching:** tRPC Client 11.6.0

Cliente type-safe que se conecta ao backend tRPC, eliminando a necessidade de definir contratos de API manualmente.

### 2.2 Backend

**Runtime:** Node.js com TypeScript 5.9.3

**Framework Web:** Express 4.21.2

Express continua sendo a escolha sólida para aplicações Node.js por sua maturidade, ecossistema extenso e performance comprovada.

**API Layer:** tRPC 11.6.0

tRPC é a tecnologia central que diferencia este sistema. Características principais:

- **Type-safety end-to-end:** Tipos TypeScript compartilhados entre frontend e backend
- **Sem code generation:** Não requer ferramentas de build adicionais
- **Inferência automática:** Tipos são inferidos automaticamente
- **Procedures:** Substitui conceito de endpoints REST por procedures tipadas
- **Superjson:** Serialização avançada que preserva tipos complexos (Date, Map, Set, etc.)

**Autenticação:** JWT (Jose 6.1.0) + Manus OAuth

Sistema de autenticação híbrido:
- OAuth via Manus platform para login inicial
- JWT para manutenção de sessão
- Cookies HTTP-only para segurança
- Middleware de autenticação em procedures protegidas

**ORM:** Drizzle ORM 0.44.5

ORM TypeScript-first com características modernas:
- Type-safe query builder
- Migrations automáticas
- Performance próxima a SQL raw
- Suporte a MySQL/TiDB

**Validação:** Zod 4.1.12

Schema validation library integrada com tRPC para validação de inputs:
- Validação em runtime
- Inferência de tipos TypeScript
- Mensagens de erro customizáveis
- Composição de schemas

### 2.3 Integração DICOM

**Biblioteca Python:** pynetdicom

O sistema utiliza Python para comunicação DICOM via script `dicom_query.py`:

```python
# Principais funcionalidades:
- C-FIND: Busca de estudos no PACS
- C-MOVE: Transferência de imagens (planejado)
- C-STORE: Recebimento de imagens (planejado)
```

**Fluxo de Integração:**

1. Frontend chama procedure tRPC `pacs.query`
2. Backend valida credenciais e permissões
3. Backend executa script shell `dicom_query.sh`
4. Script shell chama Python com `pynetdicom`
5. Python faz C-FIND no PACS server
6. Resultados retornam via stdout como JSON
7. Backend parseia JSON e retorna via tRPC
8. Frontend recebe dados tipados automaticamente

**Configuração PACS por Unidade:**

Cada unidade (clínica/hospital) tem sua própria configuração PACS:

```typescript
interface UnitPACSConfig {
  pacs_ip: string;              // Ex: "179.67.254.135"
  pacs_port: number;            // Ex: 11112
  pacs_ae_title: string;        // Ex: "PACSML"
  pacs_local_ae_title: string;  // Ex: "PACSMANUS"
}
```

### 2.4 Visualização DICOM (Planejado)

**Biblioteca:** Cornerstone.js

Componentes já instalados mas não integrados:
- `cornerstone-core`: Engine de renderização
- `cornerstone-tools`: Ferramentas de manipulação (zoom, pan, window/level)
- `cornerstone-wado-image-loader`: Carregamento de imagens via WADO
- `dicom-parser`: Parser de tags DICOM

**Status:** Componente `DicomViewer.tsx` criado mas não funcional ainda.

### 2.5 Storage

**S3-Compatible Storage**

Configuração para armazenamento de arquivos:
- AWS SDK S3 Client 3.693.0
- Presigned URLs para acesso temporário
- Helpers em `server/storage.ts`

**Estratégia de Armazenamento:**

Conforme conhecimento do projeto:
- **Portal/DB VMs:** Armazenamento limitado (apenas metadados)
- **Orthanc instances:** 4TB cada para imagens DICOM
- **Visualização:** Download temporário, descarte após laudo

---

## 3. Lógica de Negócio Atual

### 3.1 Modelo de Dados

**Entidades Principais:**

```typescript
// Unidades (Clínicas/Hospitais)
interface Unit {
  id: number;
  name: string;
  slug: string;
  pacs_ip?: string;
  pacs_port?: number;
  pacs_ae_title?: string;
  orthanc_base_url?: string;
  logoUrl?: string;
  isActive: boolean;
}

// Usuários
interface User {
  id: number;
  open_id: string;
  name: string;
  email: string;
  role: 'admin_master' | 'admin_unit' | 'doctor' | 'technician';
  unit_id?: number;
}

// Estudos (Exames)
interface Study {
  id: number;
  unit_id: number;
  study_instance_uid: string;
  patient_name: string;
  patient_id: string;
  study_date: string;
  modality: string;
  study_description?: string;
}

// Laudos
interface Report {
  id: number;
  study_id: number;
  doctor_id: number;
  template_id?: number;
  status: 'draft' | 'completed' | 'revised';
  body: string;
  findings?: string;
  conclusion?: string;
}

// Templates de Laudo
interface Template {
  id: number;
  unit_id?: number;  // null = global
  name: string;
  modality?: string;
  bodyTemplate: string;
  fields?: any;
  isGlobal: boolean;
}
```

### 3.2 Fluxo de Busca de Exames

**Processo Completo:**

1. **Usuário acessa página de busca** (`/pacs-query`)
   - Interface carrega informações da unidade do usuário
   - Exibe filtros: nome do paciente, período (Hoje, 7 dias, 30 dias, Todos)

2. **Usuário seleciona filtros e clica "Buscar"**
   - Frontend chama `trpc.pacs.query.mutate()`
   - Dados enviados: `{ patientName, patientId, modality, studyDate, accessionNumber }`

3. **Backend processa requisição**
   ```typescript
   // Validação de permissões
   if (!ctx.user.unit_id) throw FORBIDDEN;
   
   // Busca configuração PACS da unidade
   const unit = await getUnitById(ctx.user.unit_id);
   
   // Interpreta valores especiais de data
   if (studyDate === 'TODAY') {
     studyDate = formatDate(new Date());  // YYYYMMDD
   } else if (studyDate === 'LAST_7_DAYS') {
     studyDate = formatDate(7daysAgo) + '-';  // Range
   }
   
   // Executa script Python
   const result = await execDicomQuery({
     pacs_ip: unit.pacs_ip,
     pacs_port: unit.pacs_port,
     filters: { patient_name, study_date, ... }
   });
   
   // Registra auditoria
   await createAuditLog({
     action: 'PACS_QUERY',
     results_count: result.count
   });
   ```

4. **Script Python executa C-FIND DICOM**
   ```python
   # Conecta ao PACS
   assoc = ae.associate(pacs_ip, pacs_port, ae_title=pacs_ae_title)
   
   # Monta query dataset
   ds = Dataset()
   ds.PatientName = filters['patient_name']
   ds.StudyDate = filters['study_date']
   ds.QueryRetrieveLevel = 'STUDY'
   
   # Executa C-FIND
   responses = assoc.send_c_find(ds, StudyRootQueryRetrieveInformationModelFind)
   
   # Coleta resultados
   studies = [parse_response(r) for r in responses if r.Status == 0xFF00]
   
   # Retorna JSON
   print(json.dumps({'success': True, 'studies': studies, 'count': len(studies)}))
   ```

5. **Frontend recebe resultados tipados**
   ```typescript
   const { data, isLoading } = trpc.pacs.query.useMutation();
   
   // data é automaticamente tipado como:
   // { success: boolean; studies: Study[]; count: number; }
   
   // Renderiza tabela com estudos
   {data?.studies.map(study => (
     <TableRow key={study.studyInstanceUid}>
       <TableCell>{formatDate(study.studyDate)}</TableCell>
       <TableCell>{cleanPatientName(study.patientName)}</TableCell>
       <TableCell>
         <Button onClick={() => handleVisualize(study)}>Ver</Button>
         <Button onClick={() => handleReport(study)}>Laudar</Button>
       </TableCell>
     </TableRow>
   ))}
   ```

### 3.3 Tratamento de Timezone

**Problema Resolvido:**

Anteriormente, o navegador do usuário calculava "hoje" em seu timezone local (ex: UTC), enquanto o servidor PACS estava em timezone diferente (ex: EST), causando discrepância nas buscas.

**Solução Implementada:**

```typescript
// Frontend envia valor especial
studyDate: "TODAY"  // Não calcula data localmente

// Backend interpreta no timezone do servidor
if (studyDate === 'TODAY') {
  const now = new Date();  // Usa timezone do servidor
  studyDate = `${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}`;
}
```

Isso garante que "Exames de Hoje" sempre busca baseado no horário do servidor onde o PACS está rodando.

### 3.4 Limpeza de Dados PACS

**Problema:** PACS retorna Patient ID concatenado ao nome:
```
"patientName": "MARCELL^JEAN^SOUSA^DOS^SANTOS 700800919172781"
```

**Solução no Frontend:**

```typescript
// Remove caracteres ^ e números longos no final
const cleanName = study.patientName
  .replace(/\^/g, ' ')           // MARCELL JEAN SOUSA DOS SANTOS 700800919172781
  .replace(/\s+\d{10,}$/g, '');  // MARCELL JEAN SOUSA DOS SANTOS
```

Regex `/\s+\d{10,}$/g` remove espaço seguido de 10+ dígitos no final da string.

### 3.5 Controle de Acesso

**Hierarquia de Roles:**

1. **admin_master:** Acesso total, gerencia todas as unidades
2. **admin_unit:** Administra apenas sua unidade
3. **doctor:** Realiza laudos, visualiza exames de sua unidade
4. **technician:** Visualiza exames, sem permissão de laudo

**Implementação via Procedures:**

```typescript
// Procedure pública (sem autenticação)
publicProcedure: t.procedure

// Procedure protegida (requer login)
protectedProcedure: t.procedure.use(authMiddleware)

// Procedure admin (requer role admin_master)
adminProcedure: protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin_master') throw FORBIDDEN;
  return next({ ctx });
})
```

**Filtro por Unidade:**

```typescript
// Usuários veem apenas dados de sua unidade
const studies = await getStudiesByUnitId(ctx.user.unit_id);

// Exceto admin_master que vê tudo
if (ctx.user.role === 'admin_master') {
  const allStudies = await getAllStudies();
}
```

### 3.6 Auditoria

**Registro de Ações:**

Todas as ações críticas são registradas na tabela `audit_logs`:

```typescript
await createAuditLog({
  user_id: ctx.user.id,
  unit_id: ctx.user.unit_id,
  action: 'PACS_QUERY' | 'OPEN_VIEWER' | 'CREATE_REPORT' | ...,
  target_type: 'PACS' | 'STUDY' | 'REPORT' | ...,
  target_id: string,
  ip_address: ctx.req.ip,
  user_agent: ctx.req.headers['user-agent'],
  metadata: { ...additionalData }
});
```

Isso permite rastreabilidade completa de quem fez o quê, quando e de onde.

---

## 4. Comparação: Sistema Atual vs. Anterior

### 4.1 Vantagens do Sistema Atual

**Type Safety End-to-End**

Com tRPC, alterações no backend são imediatamente refletidas no frontend sem necessidade de atualizar contratos manualmente:

```typescript
// Backend
export const appRouter = router({
  pacs: router({
    query: protectedProcedure
      .input(z.object({ patientName: z.string() }))
      .mutation(async ({ input }) => {
        return { studies: [...], count: 0 };
      })
  })
});

// Frontend - tipos inferidos automaticamente!
const { mutate } = trpc.pacs.query.useMutation();
mutate({ patientName: "João" });  // ✅ Tipado
mutate({ nome: "João" });         // ❌ Erro de compilação
```

**Desenvolvimento Mais Rápido**

- Sem necessidade de manter contratos de API separados
- Refatorações seguras (renomear campos atualiza frontend automaticamente)
- Menos código boilerplate
- Feedback imediato de erros de tipo

**Deployment Simplificado**

- Single process: `npm run build && npm start`
- Não requer configuração de CORS
- Menos pontos de falha
- Mais fácil de escalar horizontalmente

**Performance**

- Serialização otimizada com Superjson
- Menos overhead de rede (sem parsing JSON manual)
- Batch de requests automático
- Cache inteligente via TanStack Query

### 4.2 Desvantagens Potenciais

**Acoplamento**

Frontend e backend estão mais acoplados. Mudanças no backend podem forçar rebuild do frontend.

**Menos Flexibilidade de Deployment**

Não é possível deployar frontend e backend em servidores completamente separados (embora seja possível com configuração adicional).

**Curva de Aprendizado**

Desenvolvedores precisam entender conceitos de tRPC (procedures, routers, context) além de REST tradicional.

### 4.3 Quando Usar Cada Abordagem

**Use Sistema Atual (tRPC Monolito) quando:**

- Time pequeno/médio trabalhando no mesmo repositório
- Prioridade é velocidade de desenvolvimento
- Type safety é crítica
- Frontend e backend evoluem juntos

**Use Sistema Anterior (REST Desacoplado) quando:**

- Times separados para frontend e backend
- Múltiplos clientes (web, mobile, parceiros) consomem mesma API
- Necessidade de versionamento de API independente
- Requisitos de escala extrema

---

## 5. Próximos Passos Técnicos

### 5.1 Funcionalidades Pendentes

**Visualizador DICOM Funcional**

- Integrar Cornerstone.js com dados do PACS
- Implementar C-MOVE para download de imagens
- Ferramentas básicas: zoom, pan, window/level
- Navegação entre séries

**Sistema de Laudos Completo**

- Editor de laudos com templates
- Campos dinâmicos por modalidade
- Assinatura digital
- Geração de PDF

**Impressão de Laudos**

- Template profissional em PDF
- Inclusão de imagens selecionadas
- Cabeçalho com logo da unidade
- Rodapé com assinatura digital

**Seleção de Médico**

- Atribuir/alterar médico responsável
- Notificações de novos exames
- Dashboard de produtividade

### 5.2 Melhorias de Infraestrutura

**Integração com Orthanc**

Conforme conhecimento do projeto, o objetivo é integrar com instâncias Orthanc locais:

- Cadastro de Orthancs no portal
- Configuração de IP, porta, AE Title
- Envio/recebimento de exames via DICOM
- Armazenamento de 4TB por Orthanc

**Otimização de Storage**

- Portal mantém apenas metadados
- Imagens armazenadas em Orthanc
- Download temporário para visualização
- Limpeza automática após laudo

**Escalabilidade**

- Load balancing para múltiplas unidades
- Cache distribuído (Redis)
- CDN para assets estáticos
- Monitoring e alertas

---

## 6. Conclusão

O **PACS Portal** atual representa uma abordagem moderna e pragmática para gestão de laudos radiológicos. A escolha de **tRPC** como camada de comunicação oferece vantagens significativas em type safety e velocidade de desenvolvimento, adequadas para um sistema em evolução rápida.

A integração **direta com PACS via pynetdicom** (ao invés de depender exclusivamente de Orthanc) oferece flexibilidade para conectar com diversos vendors de PACS, enquanto mantém a porta aberta para integração futura com Orthanc para armazenamento e funcionalidades avançadas.

A arquitetura **monolítica moderna** é apropriada para o estágio atual do projeto, podendo evoluir para microserviços conforme necessário, mas sem a complexidade prematura de sistemas distribuídos.

**Principais Diferenciais Técnicos:**

1. **Type Safety Total:** tRPC elimina classe inteira de bugs de integração
2. **Comunicação DICOM Nativa:** Flexibilidade para conectar com qualquer PACS
3. **Stack Moderna:** React 19, Tailwind 4, TypeScript 5.9
4. **Auditoria Completa:** Rastreabilidade de todas as ações
5. **Multi-tenancy:** Suporte a múltiplas unidades com isolamento de dados

O sistema está bem posicionado para crescimento incremental, com fundação sólida em tecnologias comprovadas e padrões modernos de desenvolvimento.

---

**Referências:**

- [tRPC Documentation](https://trpc.io/)
- [React 19 Release Notes](https://react.dev/blog/2024/12/05/react-19)
- [Tailwind CSS v4 Alpha](https://tailwindcss.com/blog/tailwindcss-v4-alpha)
- [Drizzle ORM](https://orm.drizzle.team/)
- [pynetdicom Documentation](https://pydicom.github.io/pynetdicom/)
- [Cornerstone.js](https://www.cornerstonejs.org/)
