# Desafio Técnico Backend - Sistema de Gerenciamento de Pedidos

Sistema de gerenciamento de pedidos com autenticação JWT, construído com Node.js, Express, MongoDB e TypeScript.

## 🚀 Tecnologias

- **Node.js** - Ambiente de execução JavaScript
- **Express** - Framework web
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **TypeScript** - Superset JavaScript com tipagem estática
- **Zod** - Validação de schemas
- **JWT** - Autenticação via tokens
- **Bcrypt** - Hash de senhas
- **Vitest** - Framework de testes

## 📁 Estrutura do Projeto

```
src/
├── config/          # Configurações (database, env)
├── models/          # Schemas do Mongoose
├── types/           # Tipos e interfaces TypeScript
├── dtos/            # Data Transfer Objects e validação
├── middlewares/     # Middlewares (auth, error, validation)
├── utils/           # Utilitários (JWT)
├── app.ts           # Configuração do Express
└── server.ts        # Entrada da aplicação
```

## 🔧 Pré-requisitos

- Node.js (v18 ou superior)
- Docker e Docker Compose
- npm ou yarn

## ⚙️ Instalação

1. Clone o repositório:

```bash
git clone <url-do-repositorio>
cd order-management-challenge
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://admin:admin123@localhost:27017/order-management?authSource=admin
JWT_SECRET=seu-segredo-aqui
JWT_EXPIRES_IN=7d
```

4. Inicie o MongoDB com Docker Compose:

```bash
# Usando npm scripts (recomendado)
npm run docker:up

# Ou usando docker-compose diretamente
docker-compose up -d
```

**Serviços disponíveis:**

- **MongoDB**: `localhost:27017`
- **Mongo Express** (Interface web): `http://localhost:8081`
  - Usuário: `admin`
  - Senha: `admin123`

**Scripts NPM para Docker:**

```bash
npm run docker:up       # Iniciar containers
npm run docker:down     # Parar containers
npm run docker:logs     # Ver logs em tempo real
npm run docker:restart  # Reiniciar containers
npm run docker:clean    # Parar e remover volumes (apaga dados)
```

## 🏃 Execução

### Modo desenvolvimento (com hot reload):

```bash
npm run dev
```

### Build para produção:

```bash
npm run build
npm start
```

## 🧪 Testes

```bash
# Executar testes
npm test

# Executar testes com interface gráfica
npm run test:ui

# Executar testes com cobertura
npm run test:coverage
```

## 📚 Estrutura de Dados

### User

```typescript
{
  email: string; // único
  password: string; // hash bcrypt
  createdAt: Date;
  updatedAt: Date;
}
```

### Order

```typescript
{
  lab: string;
  patient: string;
  customer: string;
  state: 'CREATED' | 'ANALYSIS' | 'COMPLETED';
  status: 'ACTIVE' | 'DELETED';
  services: [
    {
      name: string;
      value: number;
      status: 'PENDING' | 'DONE';
    }
  ];
  createdAt: Date;
  updatedAt: Date;
}
```

## 🔐 Autenticação

A API utiliza JWT (JSON Web Token) para autenticação. Após o login, inclua o token no header das requisições:

```
Authorization: Bearer <seu-token>
```

## 📝 Regras de Negócio

1. **Validação de Pedidos:**

   - Não é permitido criar pedidos sem serviços
   - O valor total dos serviços não pode ser zero
   - Pedidos iniciam com `state: CREATED` e `status: ACTIVE`

2. **Fluxo de Estados:**
   - Transição válida: `CREATED` → `ANALYSIS` → `COMPLETED`
   - Não é permitido pular etapas ou retroceder

## 👨‍💻 Desenvolvimento

Este projeto segue boas práticas de desenvolvimento:

- **Arquitetura em camadas** (Models, DTOs, Middlewares)
- **Tipagem forte** com TypeScript
- **Validação de dados** com Zod
- **Tratamento de erros** centralizado
- **Segurança** com hash de senhas e JWT
