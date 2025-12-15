# ConectaTécnico — Central de Assistências Técnicas

## Descrição do Sistema
O ConectaTécnico é uma aplicação web desenvolvida para conectar clientes a assistências técnicas cadastradas.  
O sistema permite que técnicos criem contas, cadastrem suas assistências e que clientes possam buscar assistências por nome ou categoria, sem necessidade de login.

---

## Autor
- Nome: Diego Silva  
- Matrícula: 2020020050

---

## Tecnologias Utilizadas

### Backend
- Node.js v24.11.1  
- Express.js v4.x  
- SQLite3 v5.x  
- JWT v9.x  
- bcryptjs v2.x  
- dotenv v16.x  

### Frontend

- HTML5
- CSS3
- JavaScript

---

## Pré-requisitos

Antes de executar o projeto, é necessário ter instalado:

- Node.js (versão 18 ou superior)
- npm (gerenciador de pacotes do Node.js)
- Navegador web (Chrome, Edge, Firefox)

---

## Instruções de Instalação

1. Clone ou extraia o projeto:

2. Acesse a pasta do projeto:

3. Instale as dependências: npm install

## Instruções de Execução

1. Para iniciar o servidor: node server.js

2. O sistema ficará disponível em: http://localhost:3000

---

## Estrutura do Projeto

├── public/
│   ├── css/
│   │   └── styles.css
│   ├── index.html
│   ├── login.html
│   ├── register.html
│   ├── dashboard.html
│   ├── list.html
│   └── detail.html
│
├── server.js
├── conectatecnico.db
├── package.json
└── README.md

---

## Funcionalidades Implementadas

1. Sistema de autenticação com login (JWT)

2. Cadastro de técnicos

3. Controle de acesso por tipo de usuário

4. CRUD completo de assistências técnicas

5. Busca de assistências por nome e categoria

6. Validação de formulários no frontend

7. Validação de dados no backend

8. Tratamento de erros e respostas HTTP adequadas

9. Persistência de dados com banco SQLite

---

## Funcionalidades Não Implementadas

1. Edição de perfil do usuário

2. Upload de imagens para assistências

3. Avaliação/comentários de assistências

4. Paginação de resultados

5. Recuperação de senha

---

## Decisões Técnicas

1. Node.js + Express: escolhidos pela simplicidade, rapidez no desenvolvimento e ampla documentação.

2. SQLite: utilizado por ser um banco leve, fácil de configurar e adequado para projetos acadêmicos.

3. JWT: adotado para autenticação stateless, sem necessidade de sessões no servidor.

4. Clientes não precisam de conta: para simplificar o uso e reduzir a barreira de entrada no sistema.

---

## Rotas / Endpoints da API

1. Autenticação:

POST /api/register — Cadastro de técnico

POST /api/login — Login do usuário

GET /api/me — Dados do usuário autenticado

2. Assistências:

GET /api/assistances — Listar/buscar assistências

GET /api/assistances/:id — Detalhes da assistência

POST /api/assistances — Cadastrar assistência (técnico)

PUT /api/assistances/:id — Editar assistência

DELETE /api/assistances/:id — Excluir assistência

---

## Screenshots do Sistema

### Tela Inicial
![Tela Inicial](screenshots/inicial.png)

### Tela de Login
![Login](screenshots/login.png)

### Dashboard do Técnico
![Dashboard](screenshots/dashboard.png)

### Busca de Assistências
![Busca](screenshots/busca.png)

## Tela de Cadastro
![cadastro](screenshots/cadastro.png)

### Cadastro de Assistências
![cadastrodashboard](screenshots/cadastrodashboard.png)

---

## Dificuldades Encontradas e Soluções

1. Problemas com autenticação JWT: resolvidos com armazenamento correto do token no localStorage.

2. Erro no banco de dados SQLite: solucionado criando corretamente as tabelas e ajustando consultas SQL.

3. Busca não retornava resultados: corrigido ao ajustar os parâmetros da query na API.

4. Controle de permissões: implementado com middleware de autenticação no backend.
