# NewLook — Personal Stylist com IA

**Unidade Curricular:** Algoritmos e Programação
**Professor:** Alexandre "Montanha" de Oliveira
**Semestre:** 2026/1

---

## Integrantes do Grupo

| Nome |
|------|
| _Heitor Afonso Vieira de Almeida_ |
| _José Arthur Vicente Oliveira_ |
| _Josué Luís Pimenta Alecrim_ |
| _Yasmin Louise Fontes Guimarães_ |

---

## Descrição

Aplicação web que utiliza inteligência artificial (Google Gemini) para analisar fotos de usuários, gerar looks personalizados com peças, marcas e preços, e produzir uma imagem realista do usuário vestindo as roupas sugeridas. O projeto combina conceitos de orientação a objetos, persistência em banco relacional e integração com API de IA generativa.

**Repositório:** [https://github.com/Heitor-Bug/NewLook](https://github.com/Heitor-Bug/NewLook)

---

## Como Executar

### Pré-requisitos

- JDK 21
- Maven (ou o wrapper `mvnw.cmd` incluso)
- Chave de API do Google Gemini (`GOOGLE_API_KEY`)

---

### Backend — Opção 1: PowerShell

1. Abra o **PowerShell** e navegue até a pasta do projeto (`newlook-api/`)
2. Configure a chave da API:
   ```powershell
   $env:GOOGLE_API_KEY='sua-chave-aqui'
   ```
3. Execute a aplicação:
   ```powershell
   mvnw.cmd spring-boot:run
   ```
4. A API sobe em `http://localhost:8080`

### Backend — Opção 2: VS Code

1. Abra a pasta do projeto no **VS Code**
2. Abra o terminal integrado (`Ctrl + '`)
3. No terminal, configure a chave da API:
   ```powershell
   $env:GOOGLE_API_KEY='sua-chave-aqui'
   ```
4. Execute a aplicação de uma das formas:
   - No terminal: `mvnw.cmd spring-boot:run`
   - Ou vá até `src/main/java/com/newlook/newlook_api/NewlookApiApplication.java` e clique em **Run Java** (play)

---

### Frontend

1. Com o backend rodando, abra a pasta `frontend/` no VS Code
2. Clique com direito em `frontend/pages/login.html` → **Open with Live Server**
3. O site abre em `http://127.0.0.1:5500`

---

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Linguagem | Java 21 |
| Framework | Spring Boot 4.0.6 |
| Banco de Dados | SQLite |
| IA Generativa | Google Gemini (`google-genai` 1.57.0) |
| Build | Maven |
| Frontend | HTML + CSS + JavaScript (Tailwind via CDN) |

---

## Requisitos Obrigatórios

### 1. Estruturas de Decisão

| Estrutura | Onde foi usado |
|-----------|---------------|
| `if` / `else` | `LoginController.java` — valida se usuário existe ou não; `LookMetodos.java` — verifica se marca é "Opcional" antes de exibir; valida se `idLook` foi gerado corretamente |


### 2. Controle de Fluxo

| Mecanismo | Onde foi usado |
|-----------|---------------|
| `return` | `LoginController.java` — retorna ID do usuário autenticado ou 0; `LookMetodos.java` — retorna ID do look gerado ou -1 |
| `try` / `catch` | `LookMetodos.java` — tratamento de exceções nas chamadas à API Gemini e operações SQL; `UserMetodos.java` — tratamento de erros SQL |


### 3. Estruturas de Repetição

| Estrutura | Onde foi usado |
|-----------|---------------|
| `for` | `LookMetodos.java` — iteração sobre o array de roupas do JSON retornado pelo Gemini; iteração sobre as partes da resposta da IA |
| `while` | `LookMetodos.java` — loop sobre `ResultSet` para percorrer registros de looks e roupas |


### 4. Orientação a Objetos

| Conceito | Onde foi usado |
|----------|---------------|
| Classes | `NewlookApiApplication`, `LoginController`, `LookController`, `UserMetodos`, `LookMetodos`, `CorsConfig`, `Prompts` |
| Objetos | Instâncias criadas com `new UserMetodos()`, `new Client()`, `new ObjectMapper()` |
| Encapsulamento | Atributos `private` em `UserMetodos` e `LookMetodos` (URL do banco); métodos públicos para acesso |
| Interfaces | `CorsConfig` implementa `WebMvcConfigurer` (interface do Spring para configurar CORS) |

### 5. Persistência em Banco de Dados (SQLite)

| Operação | Endpoint / Método |
|----------|------------------|
| **Create** | `POST /post/user/cadastro` — insere usuário; `POST /post/foto` — insere look e roupas |
| **Read** | `GET /get/user` — consulta usuário; `GET /get/looks` — lista looks; `GET /get/look` — detalhes do look + roupas |
| **Update** | `POST /post/user/edit` — atualiza dados do usuário |
| **Delete** | `POST /post/user/deletar` — remove usuário; `POST /post/look/deletar` — remove look |

Todos os acessos utilizam `PreparedStatement` para execução segura das queries SQL.

### 6. Interface com o Usuário

A aplicação expõe uma **API REST** consumida por um **frontend web** (HTML/CSS/JS). A comunicação é feita via `fetch()` com o backend em `localhost:8080`. O frontend possui páginas de login, cadastro, geração de look, visualização de looks salvos e configurações.

---

## Diferenciais Implementados

### Integração com IA Generativa (Padrão Ouro)

O projeto utiliza o **Google Gemini** em 3 estágios:

1. **Análise da foto** (`gemini-2.5-flash`) — identifica características corporais, faciais, cromáticas e visuais do usuário
2. **Geração do look** (`gemini-2.5-flash`) — produz um JSON com peças, cores, modelos, marcas, preços e justificativas técnicas
3. **Criação da imagem** (`gemini-3.1-flash-image`) — edita a foto original substituindo as roupas pelas peças sugeridas, preservando a identidade do usuário

---

## Estrutura do Projeto

```
newlook-api/
├── pom.xml                        # Configuração Maven
├── dbNewLook.db                   # Banco de dados SQLite
├── src/main/java/com/newlook/newlook_api/
│   ├── NewlookApiApplication.java # Ponto de entrada Spring Boot
│   ├── CorsConfig.java            # Configuração de CORS
│   ├── LoginController.java       # Endpoints de usuário
│   ├── LookController.java        # Endpoints de look
│   ├── UserMetodos.java           # CRUD de usuários (JDBC)
│   ├── LookMetodos.java           # CRUD de looks + chamadas Gemini (JDBC)
│   └── Prompts.java               # Templates dos prompts de IA
├── src/main/resources/
│   └── application.properties     # Configurações da aplicação
└── frontend/                      # Interface web
    ├── pages/                     # HTML (login, cadastro, index, looks, settings)
    ├── js/                        # Lógica JavaScript
    └── css/                       # Estilos customizados
```

---

## Banco de Dados

Tabelas no SQLite (`dbNewLook.db`):

### Usuarios
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER (PK) | Identificador |
| `nome` | VARCHAR(100) | Nome do usuário |
| `email` | VARCHAR(150) | Email (único) |
| `senha` | VARCHAR(32) | Senha |
| `genero` | VARCHAR(32) | Gênero |
| `data_cadastro` | DATE | Data de cadastro |

### Looks
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER (PK) | Identificador |
| `id_usuario` | INTEGER (FK) | Referência ao usuário |
| `nome` | VARCHAR(100) | Nome do look |
| `estilo` | VARCHAR(100) | Estilo escolhido |
| `ocasiao` | VARCHAR(100) | Ocasião |
| `estacao_ano` | VARCHAR(100) | Estação |
| `faixa_preco` | DECIMAL | Faixa de preço |
| `cores_favoritas` | VARCHAR(100) | Cores preferidas |
| `imagem` | BLOB | Imagem gerada pela IA |

### Roupas
| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INTEGER (PK) | Identificador |
| `id_look` | INTEGER (FK) | Referência ao look |
| `peca` | VARCHAR(100) | Tipo de peça |
| `cor` | VARCHAR(100) | Cor |
| `modelo` | VARCHAR(100) | Modelo |
| `marca` | VARCHAR(100) | Marca |
| `preco` | DECIMAL | Preço |
| `justificativa_tecnica` | VARCHAR(5000) | Justificativa da escolha |

---

## Endpoints da API

### Usuários
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/post/user/cadastro` | Cadastrar usuário |
| `POST` | `/post/user/auth` | Autenticar usuário |
| `POST` | `/post/user/edit` | Editar dados |
| `POST` | `/post/user/deletar` | Excluir conta |
| `GET` | `/get/user` | Buscar dados |

### Looks
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/test` | Health check |
| `POST` | `/post/foto` | Gerar look completo (foto + análise + IA + imagem) |
| `GET` | `/get/looks` | Listar looks do usuário |
| `GET` | `/get/look` | Detalhes de um look |
| `POST` | `/post/look/deletar` | Excluir look |
