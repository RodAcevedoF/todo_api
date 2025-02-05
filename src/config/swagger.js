import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Todo API Documentation",
    version: "1.0.0",
    description: "API for managing to-dos, books, and videos.",
    contact: {
      name: "Rodrigo",
      email: "raacevedof@gmail.com"
    }
  },
  servers: [
    {
      url: "http://localhost:4000/api",
      description: "Development server"
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      bearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"]
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
