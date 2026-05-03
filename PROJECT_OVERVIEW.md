# 📨 MailForge (HTML Email Tester) - Visão Geral do Projeto

**MailForge** é um aplicativo local desenvolvido em Node.js com Express para testar templates de e-mail em formato HTML. Ele permite que desenvolvedores e profissionais de marketing enviem e testem layouts de e-mail utilizando as credenciais SMTP do Gmail.

## 📌 Funcionalidades Principais
- **Editor e Disparo de E-mail:** Interface para criar, visualizar e disparar e-mails em formato HTML.
- **Armazenamento Seguro (Local):** Utiliza um banco de dados SQLite (`mailforge.db`) para persistir automaticamente as configurações SMTP (E-mail, Senha de App e Assunto) assim como a lista de destinatários.
- **Gerenciamento de Contatos:** Possibilidade de adicionar múltiplos contatos e alternar quais vão receber as campanhas/testes.
- **Validação de Conexão SMTP:** Endpoint dedicado (`/api/test-connection`) para verificar se as credenciais do Gmail são válidas antes de efetuar os disparos.

## 🛠️ Tecnologias Utilizadas
- **Backend:** Node.js, Express
- **Módulo de E-mail:** Nodemailer
- **Banco de Dados:** SQLite via pacote `better-sqlite3` (modo WAL ativado para performance contínua).
- **Frontend:** Vanilla HTML/CSS/JS localizados na pasta `public`.
- **Serviços Extras:** CORS e Nodemon (devDependencies).

## 🗂️ Estrutura de Diretórios e Arquivos Mapeados
- **`server.js`**: Ponto de entrada do backend. Contém a configuração do servidor Express, rotas da API REST (`/api/smtp-config`, `/api/contacts`, `/api/send`, etc.), inicialização e criação fluida das tabelas do SQLite.
- **`package.json`**: Mapeia dependências e scripts de inicialização, revelando suporte ao modo Dev (`npm run dev`).
- **`mailforge.db`**: O próprio banco de dados relacional que possui tabelas essenciais (`smtp_config` e `contacts`).
- **`public/`**: Contém a interface com o usuário (`index.html`, além das pastas `css/` e `js/`).

## 🚀 Como Executar
1. Instale as dependências: `npm install`
2. Inicie o servidor: `npm run dev` (com nodemon) ou `npm start`
3. Acesse a interface localmente em: `http://localhost:3000`

---
> *Este documento foi criado para fornecer o escopo da arquitetura e recursos do código e pode ser atualizado de acordo com o crescimento do sistema.*
