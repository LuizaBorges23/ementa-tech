# EmentaTech Frontend

Aplicacao Angular do sistema **EmentaTech**, responsavel pela interface administrativa e pelo portal do professor do projeto de controle de programas de disciplina e bibliografia.

O frontend se integra com o backend Spring Boot do projeto complementar, usando autenticacao via `Basic Auth` apos o login.

## Objetivo

O sistema foi construído para apoiar a gestao academica de:

- IES
- escolas
- cursos
- professores
- disciplinas
- programas de disciplina
- bibliografias basicas e complementares

Tambem existe um portal dedicado ao professor, com acesso aos seus dados, bibliografias e programas vinculados.

## Funcionalidades Atuais

### Area do administrador

- tela inicial institucional
- login com redirecionamento por perfil
- dashboard administrativo
- gestao de IES
- gestao de escolas
- gestao de cursos
- gestao de professores
- listagem de disciplinas
- visualizacao de programa da disciplina
- ativacao e inativacao de professores
- ativacao e inativacao de cursos

### Area do professor

- meus dados
- informacoes bibliograficas
- programa disciplina

### Regras ja refletidas na interface

- professor inativado nao consegue acessar o portal
- o login do administrador vai para `/dashboard`
- o login do professor vai para `/professor/meus-dados`
- a sessao do usuario fica armazenada no `localStorage`

## Stack

- Angular 19
- TypeScript
- standalone components
- Angular Router
- Angular Forms
- CSS puro
- RxJS

## Estrutura do Projeto

```text
src/
  app/
    app.routes.ts
    cursos/
    disciplina/
    escolas/
    ies/
    professor-portal/
    professores/
    programa-disciplina/
    services/
  admin.guard.ts
  auth.service.ts
  cadastro.html
  dashboard.component.ts
  dashboard.html
  inicio.component.css
  inicio.component.ts
  login.component.ts
  professor.guard.ts
  styles.css
```

## Rotas

### Publicas

- `/`
- `/login`

### Administrador

- `/dashboard`
- `/ies`
- `/escolas`
- `/cursos`
- `/professores`
- `/disciplinas`
- `/programa-disciplina/:id`

### Professor

- `/professor/meus-dados`
- `/professor/informacoes-bibliograficas`
- `/professor/programa-disciplina`

## Integracao com o Backend

O frontend esta configurado para consumir o backend em:

```text
http://localhost:8081
```

### Fluxo de autenticacao

1. O usuario envia `username` e `password` para `POST /auth/login`
2. O frontend monta o cabecalho `Basic Auth`
3. A sessao e salva no `localStorage`
4. As telas protegidas passam a consumir os endpoints administrativos ou do professor

### Endpoints principais usados pelo frontend

- `POST /auth/login`
- `GET /admin/ies`
- `GET /admin/escolas`
- `GET /admin/cursos`
- `POST /admin/cursos`
- `PUT /admin/cursos/{id}`
- `PATCH /admin/cursos/{id}/inativar`
- `PATCH /admin/cursos/{id}/ativar`
- `GET /admin/professores`
- `POST /admin/professores`
- `PUT /admin/professores/{id}`
- `PATCH /admin/professores/{id}/inativar`
- `PATCH /admin/professores/{id}/ativar`
- `GET /admin/disciplinas`
- `GET /admin/programas-disciplinas`
- `GET /professor/me`
- `GET /professor/programas`

## Credenciais de Teste

As credenciais abaixo dependem do backend seedado corretamente.

### Administrador

- usuario: `admin`
- senha: `admin123`

### Professores

- usuario: `carlos.leandro@ementatech.com`
- senha: `prof123`
- usuario: `joelma.pacheco@ementatech.com`
- senha: `prof123`
- usuario: `osvaldo.melo@ementatech.com`
- senha: `prof123`
- usuario: `orivaldo.paranainfa@ementatech.com`
- senha: `prof123`

## Como Executar

### 1. Suba o backend

Este frontend depende do backend localizado no projeto complementar:

```text
C:\Users\lulub\Downloads\projeto-back-desenvolvimento-de-sistemas-grupo-8-main
```

O backend deve estar rodando em `http://localhost:8081`.

### 2. Suba o frontend

Neste workspace, as dependencias ja estao presentes em `node_modules/`. Os comandos validados para execucao usam diretamente o binario local do Angular:

```powershell
node_modules\.bin\ng.cmd serve --host 0.0.0.0 --port 4200
```

### 3. Build de producao

```powershell
node_modules\.bin\ng.cmd build
```

Saida:

```text
dist/sistema-controle-academico
```

## Observacoes Importantes do Workspace

- este workspace possui `package-lock.json` e `node_modules/`, mas atualmente nao possui `package.json` na raiz
- por isso, os comandos do Angular devem ser executados pelo binario local em `node_modules\.bin`
- se o backend for alterado, reinicie a aplicacao Spring Boot antes de testar
- se o navegador continuar mostrando uma versao antiga da interface, use `Ctrl+F5`

## Regras de Navegacao e Acesso

- `adminGuard` protege as rotas administrativas
- `professorGuard` protege o portal do professor
- usuarios com `ROLE_ADMIN` entram no painel administrativo
- usuarios com `ROLE_PROFESSOR` entram no portal do professor
- professor inativado recebe bloqueio de acesso no backend e mensagem de erro no login

## Arquivos-Chave

- `src/app/app.routes.ts`: definicao de rotas
- `src/auth.service.ts`: login, sessao e cabecalho de autenticacao
- `src/admin.guard.ts`: protecao das rotas do administrador
- `src/professor.guard.ts`: protecao das rotas do professor
- `src/dashboard.component.ts`: dashboard administrativo
- `src/app/services/`: camada de integracao HTTP
- `src/app/professor-portal/`: telas do portal do professor
- `src/styles.css`: estilos globais

## Estado Atual da Interface

O frontend foi ajustado para funcionar melhor em desktop, tablet e mobile. As telas administrativas seguem um mesmo padrao visual, e o portal do professor foi alinhado ao restante do sistema.

## Validacao

Validacoes locais ja realizadas neste projeto:

- build do Angular concluido com sucesso
- integracao com backend validada em ambiente local

## Licenca

Projeto academico para fins educacionais.
