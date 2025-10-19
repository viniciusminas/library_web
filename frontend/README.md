# 📚 Library Web – Sistema de Biblioteca Online

Aplicação full stack para gerenciamento de biblioteca, permitindo **cadastro de livros, usuários, reservas e controle de multas**.  
Desenvolvida em **React + TypeScript (frontend)** e **Spring Boot + PostgreSQL (backend)**.

---

## 🚀 Tecnologias Utilizadas

### 🔹 Frontend
- React 18 com TypeScript  
- React Router DOM  
- Axios  
- Bootstrap 5 (estilização)

### 🔹 Backend
- Spring Boot 
- JPA / Hibernate  
- PostgreSQL  
- Flyway (controle de migrações)

> ℹ️ O backend roda em repositório/projeto separado e expõe a API REST consumida pelo frontend.

---

## 🧱 Estrutura do Projeto

```
frontend/
├── public/
├── src/
│   ├── components/      # Componentes reutilizáveis (Navbar, Modais, etc.)
│   ├── features/        # Módulos funcionais (livros, pessoas, reservas, multas)
│   ├── pages/           # Páginas principais
│   ├── types/           # Tipos e interfaces TypeScript
│   ├── App.tsx
│   └── index.tsx
├── package.json
└── README.md
```

---

## ⚙️ Como Rodar o Projeto Localmente

### 🧩 Pré-requisitos
- Node.js (>= 18)
- Backend em execução (Spring Boot) expondo a API, por padrão em `http://localhost:8080`

### ▶️ Passos

#### 1️⃣ Clonar o repositório
```bash
git clone https://github.com/viniciusminas/library_web.git
cd library_web/frontend
```

#### 2️⃣ Instalar dependências
```bash
npm install
```

#### 3️⃣ Configurar a URL da API
Crie um arquivo `.env` na pasta `frontend` (mesmo nível do `package.json`) com:

```
REACT_APP_API_URL=http://localhost:8080
```

> Se preferir usar o **proxy do Create React App**, você também pode definir `"proxy": "http://localhost:8080"` no `package.json` e deixar a `baseURL` vazia no Axios.

#### 4️⃣ Executar o Frontend
```bash
npm start
```

A aplicação ficará disponível em:  
👉 **http://localhost:3000**

---

## API do Backend disponível em: https://github.com/viniciusminas/api_library

## 🧪 Scripts úteis

- `npm start` – roda o app em modo desenvolvimento  
- `npm run build` – cria o build de produção  
- `npm test` – executa testes (se configurados)  
- `npm run lint` – verifica problemas de lint (se configurado)

---

## 🔐 Boas práticas (importante em repositório público)

- **Não** comitar arquivos `.env` com credenciais reais.  
- Use `.env.example` com chaves “placeholders” para guiar quem for rodar o projeto.
- Mantenha dependências atualizadas e evite expor tokens/URLs sensíveis no código.

---

## 📸 Preview

| Tela | Descrição |
|------|-----------|
| 📘 **Livros** | Cadastro, edição e consulta de livros |
| 👤 **Pessoas** | Registro de usuários da biblioteca |
| 📅 **Reservas** | Controle de empréstimos |
| 💰 **Multas** | Cálculo e baixa de multas |

---

## 🧑‍💻 Autor

**Vinícius Minas**  
💼 Desenvolvedor de Software  
🌐 [github.com/viniciusminas](https://github.com/viniciusminas)  
📧 [viniciusminas@exemplo.com](mailto:viniciusminas@exemplo.com)

---

## 🪶 Licença
Este projeto é de uso acadêmico e livre para estudo e aprimoramento.
