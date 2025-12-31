import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Order Management API",
      version: "1.0.0",
      description:
        "Sistema de gerenciamento de pedidos laboratoriais com autenticação JWT, validação robusta e arquitetura em camadas.",
      contact: {
        name: "API Support",
        email: "support@example.com",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://z80ccg8g8cc4wc4w00gw844k.31.97.253.3.sslip.io",
        description: "Servidor de Produção",
      },
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Verificação de saúde da API",
      },
      {
        name: "Auth",
        description: "Autenticação de usuários",
      },
      {
        name: "Users",
        description: "Gerenciamento de usuários",
      },
      {
        name: "Orders",
        description: "Gerenciamento de pedidos",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token JWT para autenticação. Obtido através do endpoint /auth/login",
        },
      },
      schemas: {
        // Auth Schemas
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
              description: "Email do usuário",
            },
            password: {
              type: "string",
              minLength: 1,
              example: "senha123",
              description: "Senha do usuário",
            },
          },
        },
        LoginResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Login realizado com sucesso",
            },
            data: {
              type: "object",
              properties: {
                token: {
                  type: "string",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                  description: "Token JWT para autenticação",
                },
                user: {
                  $ref: "#/components/schemas/UserResponse",
                },
              },
            },
          },
        },

        // User Schemas
        CreateUserRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
              description: "Email do usuário (único)",
            },
            password: {
              type: "string",
              minLength: 6,
              example: "senha123",
              description: "Senha do usuário (mínimo 6 caracteres)",
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "64a1b2c3d4e5f6789012345",
              description: "ID único do usuário",
            },
            email: {
              type: "string",
              format: "email",
              example: "user@example.com",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T12:00:00.000Z",
            },
            deletedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              example: null,
            },
          },
        },
        UserListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/UserResponse",
              },
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },

        // Order Schemas
        Service: {
          type: "object",
          required: ["name", "value"],
          properties: {
            name: {
              type: "string",
              minLength: 1,
              example: "Exame de Sangue",
              description: "Nome do serviço",
            },
            value: {
              type: "number",
              minimum: 0,
              example: 150.0,
              description: "Valor do serviço",
            },
            status: {
              type: "string",
              enum: ["PENDING", "DONE"],
              default: "PENDING",
              example: "PENDING",
              description: "Status do serviço",
            },
          },
        },
        CreateOrderRequest: {
          type: "object",
          required: ["lab", "patient", "customer", "services"],
          properties: {
            lab: {
              type: "string",
              minLength: 1,
              example: "Lab Central",
              description: "Nome do laboratório",
            },
            patient: {
              type: "string",
              minLength: 1,
              example: "João Silva",
              description: "Nome do paciente",
            },
            customer: {
              type: "string",
              minLength: 1,
              example: "Hospital São José",
              description: "Nome do cliente",
            },
            services: {
              type: "array",
              minItems: 1,
              items: {
                $ref: "#/components/schemas/Service",
              },
              description: "Lista de serviços (mínimo 1, valor total > 0)",
            },
          },
        },
        OrderResponse: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "64a1b2c3d4e5f6789012345",
              description: "ID único do pedido",
            },
            lab: {
              type: "string",
              example: "Lab Central",
            },
            patient: {
              type: "string",
              example: "João Silva",
            },
            customer: {
              type: "string",
              example: "Hospital São José",
            },
            state: {
              type: "string",
              enum: ["CREATED", "ANALYSIS", "COMPLETED"],
              example: "CREATED",
              description: "Estado do pedido",
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "DELETED"],
              example: "ACTIVE",
              description: "Status do pedido",
            },
            services: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Service",
              },
            },
            createdAt: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T12:00:00.000Z",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T12:00:00.000Z",
            },
          },
        },
        OrderListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/OrderResponse",
              },
            },
            pagination: {
              $ref: "#/components/schemas/Pagination",
            },
          },
        },

        // Common Schemas
        Pagination: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 10,
            },
            total: {
              type: "integer",
              example: 25,
            },
            totalPages: {
              type: "integer",
              example: 3,
            },
          },
        },
        HealthResponse: {
          type: "object",
          properties: {
            status: {
              type: "string",
              example: "ok",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              example: "2023-07-01T12:00:00.000Z",
            },
          },
        },
        SuccessMessage: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Operação realizada com sucesso",
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 400,
            },
            message: {
              type: "string",
              example: "Erro de validação",
            },
            error: {
              type: "string",
              example: "Bad Request",
            },
          },
        },
        ValidationErrorResponse: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              example: 400,
            },
            message: {
              type: "string",
              example: "Erro de validação",
            },
            errors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  field: {
                    type: "string",
                    example: "email",
                  },
                  message: {
                    type: "string",
                    example: "Email inválido",
                  },
                },
              },
            },
          },
        },
      },
    },
    paths: {
      "/health": {
        get: {
          tags: ["Health"],
          summary: "Verificar saúde da API",
          description: "Endpoint para verificar se a API está funcionando corretamente",
          responses: {
            "200": {
              description: "API está funcionando",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/HealthResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Realizar login",
          description: "Autentica um usuário e retorna um token JWT",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/LoginRequest",
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Login realizado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/LoginResponse",
                  },
                },
              },
            },
            "400": {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Credenciais inválidas",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/user": {
        post: {
          tags: ["Users"],
          summary: "Criar novo usuário",
          description: "Registra um novo usuário no sistema",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateUserRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Usuário criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Usuário criado com sucesso",
                      },
                      data: {
                        $ref: "#/components/schemas/UserResponse",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Dados inválidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            "409": {
              description: "Email já cadastrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ["Users"],
          summary: "Listar usuários",
          description: "Retorna lista paginada de usuários",
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Número da página",
              schema: {
                type: "integer",
                default: 1,
                minimum: 1,
              },
            },
            {
              name: "limit",
              in: "query",
              description: "Quantidade de itens por página",
              schema: {
                type: "integer",
                default: 10,
                minimum: 1,
                maximum: 100,
              },
            },
          ],
          responses: {
            "200": {
              description: "Lista de usuários",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/UserListResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/user/{id}": {
        get: {
          tags: ["Users"],
          summary: "Buscar usuário por ID",
          description: "Retorna os dados de um usuário específico",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID do usuário (ObjectId)",
              schema: {
                type: "string",
                example: "64a1b2c3d4e5f6789012345",
              },
            },
          ],
          responses: {
            "200": {
              description: "Dados do usuário",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        $ref: "#/components/schemas/UserResponse",
                      },
                    },
                  },
                },
              },
            },
            "404": {
              description: "Usuário não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Users"],
          summary: "Deletar usuário (soft delete)",
          description: "Realiza soft delete do usuário",
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID do usuário (ObjectId)",
              schema: {
                type: "string",
                example: "64a1b2c3d4e5f6789012345",
              },
            },
          ],
          responses: {
            "200": {
              description: "Usuário deletado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessMessage",
                  },
                },
              },
            },
            "404": {
              description: "Usuário não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/order": {
        post: {
          tags: ["Orders"],
          summary: "Criar novo pedido",
          description:
            "Cria um novo pedido com estado inicial CREATED e status ACTIVE. Requer pelo menos um serviço com valor total maior que zero.",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/CreateOrderRequest",
                },
              },
            },
          },
          responses: {
            "201": {
              description: "Pedido criado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Pedido criado com sucesso",
                      },
                      data: {
                        $ref: "#/components/schemas/OrderResponse",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Dados inválidos (sem serviços ou valor total zerado)",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ValidationErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Não autorizado - Token JWT inválido ou ausente",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        get: {
          tags: ["Orders"],
          summary: "Listar pedidos",
          description: "Retorna lista paginada de pedidos com filtro opcional por estado",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "page",
              in: "query",
              description: "Número da página",
              schema: {
                type: "integer",
                default: 1,
                minimum: 1,
              },
            },
            {
              name: "limit",
              in: "query",
              description: "Quantidade de itens por página",
              schema: {
                type: "integer",
                default: 10,
                minimum: 1,
              },
            },
            {
              name: "state",
              in: "query",
              description: "Filtrar por estado do pedido",
              schema: {
                type: "string",
                enum: ["CREATED", "ANALYSIS", "COMPLETED"],
              },
            },
          ],
          responses: {
            "200": {
              description: "Lista de pedidos",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/OrderListResponse",
                  },
                },
              },
            },
            "401": {
              description: "Não autorizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/order/{id}": {
        get: {
          tags: ["Orders"],
          summary: "Buscar pedido por ID",
          description: "Retorna os dados de um pedido específico",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID do pedido (ObjectId)",
              schema: {
                type: "string",
                example: "64a1b2c3d4e5f6789012345",
              },
            },
          ],
          responses: {
            "200": {
              description: "Dados do pedido",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      data: {
                        $ref: "#/components/schemas/OrderResponse",
                      },
                    },
                  },
                },
              },
            },
            "401": {
              description: "Não autorizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Pedido não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
        delete: {
          tags: ["Orders"],
          summary: "Deletar pedido (soft delete)",
          description:
            "Realiza soft delete do pedido. Apenas pedidos que não estão no estado COMPLETED podem ser deletados.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID do pedido (ObjectId)",
              schema: {
                type: "string",
                example: "64a1b2c3d4e5f6789012345",
              },
            },
          ],
          responses: {
            "200": {
              description: "Pedido deletado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/SuccessMessage",
                  },
                },
              },
            },
            "400": {
              description: "Não é possível deletar pedidos finalizados",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Não autorizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Pedido não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
      "/order/{id}/advance": {
        patch: {
          tags: ["Orders"],
          summary: "Avançar estado do pedido",
          description:
            "Avança o estado do pedido seguindo a sequência: CREATED → ANALYSIS → COMPLETED. Não é possível pular etapas ou retroceder.",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              description: "ID do pedido (ObjectId)",
              schema: {
                type: "string",
                example: "64a1b2c3d4e5f6789012345",
              },
            },
          ],
          responses: {
            "200": {
              description: "Estado do pedido avançado com sucesso",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      message: {
                        type: "string",
                        example: "Estado do pedido avançado com sucesso",
                      },
                      data: {
                        $ref: "#/components/schemas/OrderResponse",
                      },
                    },
                  },
                },
              },
            },
            "400": {
              description: "Não é possível avançar (pedido já está COMPLETED)",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "401": {
              description: "Não autorizado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
            "404": {
              description: "Pedido não encontrado",
              content: {
                "application/json": {
                  schema: {
                    $ref: "#/components/schemas/ErrorResponse",
                  },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
