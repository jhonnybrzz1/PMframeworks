# Discovery de Melhorias e Evolucao de Frameworks - PMframeworks

Data: 2026-05-06
Repo: jhonnybrzz1/PMframeworks
Decisao: nao evoluir/trocar framework agora. A evidencia aponta primeiro para corrigir confiabilidade do fluxo atual, baseline de testes e falhas funcionais.

## Fluxo Critico Real

Fluxo principal identificado no codigo:

1. Usuario seleciona um framework em `client/src/components/framework-analyzer.tsx`.
2. Usuario cola texto ou tenta enviar arquivo.
3. Frontend chama `POST /api/analyze` via `client/src/lib/api.ts`.
4. Backend valida payload com Zod em `shared/schema.ts` e chama LLM em `server/llm.ts`.
5. Resultado e salvo via `server/storage.ts`.
6. Usuario visualiza resultado em `client/src/components/analysis-results.tsx`.
7. Usuario exporta Markdown localmente ou PDF via `POST /api/generate-pdf` em `server/routes.ts`.

## Camadas e Frameworks Usados

| Camada | Framework/dependencia | Onde aparece | Observacao |
|---|---|---|---|
| Frontend | React 18 + TypeScript + Vite | `client/src`, `vite.config.ts` | App SPA com root Vite em `client` |
| Roteamento | wouter | `client/src/App.tsx` | Uso simples, sem evidencia para trocar |
| Estado servidor | TanStack Query | `client/src/lib/queryClient.ts`, componentes | Retry desabilitado globalmente |
| UI | Radix UI + Tailwind + componentes locais | `client/src/components/ui` | Muitas dependencias UI, mas sem dor comprovada de troca |
| Validacao | Zod + drizzle-zod | `shared/schema.ts`, `server/routes.ts` | Validacao minima no backend; frontend faz validacao manual |
| Backend | Express | `server/index.ts`, `server/routes.ts` | API pequena; sem evidencia para migrar framework |
| PDF | Playwright no servidor + fallback jsPDF no cliente | `server/routes.ts`, `client/src/components/analysis-results.tsx` | Fluxo sensivel e parcialmente protegido por teste quebrado |
| Persistencia | Drizzle/Postgres ou FileStorage local | `server/db.ts`, `server/storage.ts` | Arquivo esta com mudanca local e TypeScript quebrando |
| Testes | Vitest + Supertest + jest-image-snapshot + pdf-image | `server/reports/report.test.ts` | Config atual nao executa teste pelo script padrao |

## Baseline Executado

| Check | Resultado | Evidencia |
|---|---|---|
| `npm run check` | Falhou | `server/storage.ts`: `.desc` e `.equals` nao existem nos tipos Drizzle usados |
| `npm test -- --run` | Falhou | Vitest roda com root em `client` e nao encontra testes |
| `npx vitest --run server/reports/report.test.ts --root .` | Falhou | Teste usa assinatura removida no Vitest 4: `it(name, fn, { timeout })` |
| Inspecao de rotas | Falha funcional provavel | Frontend chama `/api/upload`, mas backend nao registra essa rota |

Observacao: `server/storage.ts` ja estava modificado antes deste discovery. Este documento nao altera codigo funcional.

## Top 3 - Fazer Agora

### 1. Restaurar baseline tecnico antes de qualquer evolucao

Evidencia: `npm run check` falha em `server/storage.ts`; `npm test -- --run` nao encontra testes; teste especifico de PDF falha por API removida no Vitest 4.
Impacto: alto. Sem baseline confiavel, qualquer upgrade de framework aumenta risco de quebra silenciosa.
Risco: baixo a medio, desde que limitado a TypeScript, config de teste e assinatura do teste.
Esforco: baixo.
Decisao: fazer agora.
Baseline de aceite: `npm run check` passa; `npm test -- --run` executa ao menos o teste de PDF ou uma suite server configurada explicitamente.

### 2. Corrigir ou remover promessa de upload de arquivo

Evidencia: `client/src/lib/api.ts` chama `POST /api/upload`; `client/src/components/framework-analyzer.tsx` aceita `.txt,.doc,.docx,.pdf`; `server/routes.ts` nao possui rota `/api/upload`.
Impacto: alto para UX, porque o usuario ve uma acao disponivel que tende a falhar sempre.
Risco: medio, pois upload de PDF/DOCX exige parser e limites de tamanho/seguranca.
Esforco: medio se suportar apenas `.txt`; alto se suportar PDF/DOCX corretamente.
Decisao: fazer agora com recorte minimo.
Baseline de aceite: upload `.txt` retorna texto; formatos nao suportados exibem erro claro; ou a UI remove upload ate existir backend.

### 3. Proteger o fluxo de PDF com teste executavel e fallback claro

Evidencia: PDF e parte central do produto; existe teste visual, mas ele nao roda na config atual e esta incompatível com Vitest 4. O backend injeta dados direto no HTML por string replacement.
Impacto: alto, porque PDF e entrega principal para stakeholder.
Risco: medio, pois Playwright, template HTML e conversao visual sao sensiveis a ambiente.
Esforco: medio.
Decisao: fazer agora, sem trocar Playwright.
Baseline de aceite: teste de `POST /api/generate-pdf` passa em CI/local; caso Playwright falhe, erro do usuario e rastreavel; conteudo dinamico e escapado/sanitizado antes de entrar no HTML.

## Oportunidades Priorizadas - Maximo 8

| Rank | Oportunidade | Impacto | Risco | Esforco | Evidencia | Decisao |
|---:|---|---|---|---|---|---|
| 1 | Corrigir baseline TypeScript e testes | Alto | Baixo/medio | Baixo | `npm run check` e testes falham | Fazer agora |
| 2 | Corrigir fluxo de upload ou remover UI | Alto | Medio | Medio | `/api/upload` inexistente | Fazer agora |
| 3 | Tornar teste de PDF executavel e sanitizar template | Alto | Medio | Medio | PDF e fluxo critico; teste quebrado | Fazer agora |
| 4 | Alinhar validacao frontend/backend para limite de 8000 chars | Medio | Baixo | Baixo | UI bloqueia >8000, Zod nao limita | Fazer depois |
| 5 | Melhorar UX de erro/retry em analise e PDF | Medio | Baixo | Baixo | Query retry global desabilitado; erros genericos | Fazer depois |
| 6 | Revisar persistencia local vs Postgres | Medio | Medio | Medio | Storage local foi introduzido; Postgres path tem erro TS | Fazer depois apos baseline |
| 7 | Remover dependencias/imports nao usados e backups | Baixo/medio | Baixo | Baixo | imports como `html2canvas` e arquivos `.bak/.backup` | Fazer depois |
| 8 | Avaliar upgrade/migracao de frameworks UI/router/build | Baixo sem evidencia | Alto | Alto | Nao ha falha atribuida a React, Vite, Radix, wouter | Nao fazer agora |

## Itens Postergados com Motivo

| Item | Motivo |
|---|---|
| Trocar Express por outro backend | API pequena; nenhum problema confirmado que migracao resolva |
| Trocar wouter por React Router | Roteamento atual e simples; sem evidencia de dor |
| Trocar Radix/shadcn/Tailwind | Problemas atuais sao fluxo/API/teste, nao biblioteca UI |
| Migrar PDF para outra lib | Playwright ainda e adequado; problema e falta de baseline executavel e hardening |
| Refatoracao ampla de storage | Existe falha TS, mas primeiro deve restaurar baseline e decidir persistencia alvo |

## Matriz de Decisao

Criterios usados: impacto no fluxo critico, risco de quebra, esforco, evidencia observada.

| Tipo | Entra agora quando | Exemplo neste repo |
|---|---|---|
| Fazer agora | Evidencia direta + alto impacto + mudanca contida | Baseline TS/teste, upload inexistente, PDF testavel |
| Fazer depois | Potencial claro, mas depende de protecao/baseline | Validacao unificada, retry/erros, persistencia |
| Nao fazer | Upgrade grande sem ganho comprovado | Troca de React/Vite/Radix/Express/wouter |

## Recomendacao Final

Nao trocar framework agora.

Plano curto recomendado:

1. Fechar baseline: TypeScript e teste de PDF precisam passar.
2. Corrigir o contrato do upload: implementar suporte minimo ou remover a promessa da UI.
3. Endurecer PDF: teste executavel, sanitizacao do template e erro rastreavel.

Depois disso, reavaliar melhorias incrementais de UX e persistencia. Migracoes de framework so devem voltar para discussao se uma metrica ou falha concreta mostrar que o framework atual e a causa do problema.
