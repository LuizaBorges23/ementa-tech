# EmentaTech 

Aplicacao Angular do sistema **EmentaTech**, responsavel pelas interfaces de administracao academica e portal do professor.

O frontend consome o backend Spring Boot do projeto complementar e trabalha com autenticacao via `Basic Auth` apos o login.

## Visao Geral

O sistema foi organizado em dois grandes fluxos:

- **Administrador**
  - dashboard inicial
  - gestao de professores
  - gestao de cursos
  - gestao de disciplinas
  - visualizacao de programa da disciplina

- **Professor**
  - meus dados
  - informacoes bibliograficas
  - programa da disciplina

Tambem existe tratamento para professor inativado: quando um professor perde o status ativo no sistema, o login dele passa a ser bloqueado e o frontend exibe a mensagem diretamente na tela de acesso.

## Stack

- Angular standalone components
- TypeScript
- CSS puro
- Angular Router com guards
- Integracao HTTP com backend Spring Boot

## Estrutura Principal

```text
src/
  app/
    app.routes.ts
    cursos/
    disciplina/
    professores/
    programa-disciplina/
    professor-portal/
    services/
  auth.service.ts
  admin.guard.ts
  professor.guard.ts
  inicio.component.ts
  login.component.ts
  cadastro.html
  styles.css
```

## Rotas

### Publicas

- `/` : tela inicial
- `/login` : autenticacao

### Administrador

- `/dashboard`
- `/professores`
- `/cursos`
- `/disciplinas`
- `/programa-disciplina/:id`

### Professor

- `/professor/meus-dados`
- `/professor/informacoes-bibliograficas`
- `/professor/programa-disciplina`

## Integracao com Backend

O frontend foi configurado para consumir o backend em:

```text
http://localhost:8081
```

Endpoints principais usados pelo front:

- `POST /auth/login`
- `GET /admin/professores`
- `PATCH /admin/professores/{id}/inativar`
- `PATCH /admin/professores/{id}/ativar`
- `GET /admin/cursos`
- `GET /admin/disciplinas`
- `GET /admin/programas-disciplinas`
- `GET /professor/me`
- `GET /professor/programas`

Observacoes importantes:

- o login usa `username` e `password`
- depois do login, o frontend guarda o `Basic Auth` no `localStorage`
- o backend precisa estar preparado para aceitar requisicoes vindas de `http://localhost:4200`

## Credenciais de Teste

### Administrador

- usuario: `admin`
- senha: `admin123`

### Professores

- usuario: `osvaldo.melo@ementatech.com`
- senha: `prof123`
- usuario: `joelma.pacheco@ementatech.com`
- senha: `prof123`
- usuario: `carlos.leandro@ementatech.com`
- senha: `prof123`
- usuario: `orivaldo.paranainfa@ementatech.com`
- senha: `prof123`

## Como Executar

### 1. Suba o backend

Este frontend depende do backend do projeto:

```text
../projeto-back-desenvolvimento-de-sistemas-grupo-8-main
```

O backend deve estar rodando na porta `8081`.

### 2. Suba o frontend

Com o estado atual deste workspace, os comandos validados para execucao foram:

```powershell
node_modules\.bin\ng.cmd serve --host 0.0.0.0 --port 4200
```

### 3. Build de producao

```powershell
node_modules\.bin\ng.cmd build
```

Saida gerada em:

```text
dist/sistema-controle-academico
```

## Regras de Acesso

- usuarios com `ROLE_ADMIN` sao direcionados para `/dashboard`
- usuarios com `ROLE_PROFESSOR` sao direcionados para `/professor/meus-dados`
- professor inativado nao consegue autenticar
- ao inativar um professor pelo painel administrativo, o acesso dele ao portal tambem e bloqueado

## Principais Arquivos

- `src/app/app.routes.ts` : mapa de rotas
- `src/auth.service.ts` : login, sessao e cabecalho de autorizacao
- `src/login.component.ts` : logica da tela de login
- `src/cadastro.html` : template da tela de login
- `src/styles.css` : estilos globais
- `src/app/services/` : camada de integracao HTTP
- `src/app/professor-portal/` : portal do professor

## Validacao

Ultima validacao local realizada neste frontend:

- `node_modules\.bin\ng.cmd build` executado com sucesso

## Observacoes

- o projeto usa componentes standalone
- a navegacao protegida depende dos guards `adminGuard` e `professorGuard`
- a interface foi ajustada para funcionar melhor em desktop, tablet e mobile
- o menu do portal do professor foi alinhado visualmente ao painel administrativo
