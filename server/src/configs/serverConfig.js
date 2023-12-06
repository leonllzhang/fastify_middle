const { jwtVerify } = require("../utils/utils");

const server = require("fastify")({
  logger: true,
});

const authenticate = (request, reply, next) => {
  // 在请求处理之前执行的操作
  if (
    request.url.indexOf("/api/verify") < 0 &&
    request.url.indexOf("/docs") < 0
  ) {
    const jwtToken = request.headers["authorization"];
    let user = null;
    if (jwtToken) {
      user =  jwtVerify(jwtToken, server.config.app.jwtSecreKey);
    }
    if (!user) {
      return reply.status(403).send({ error: "Permission denied" });
    }
  }
  next();
};

server.addHook("preHandler", authenticate);

server.register(require("@fastify/cors"), {
  // TODO:  enable CORS as as your needs
  origin: [
    "http://localhost:7789",
    "http://127.0.0.1:7789",
    "http://0.0.0.0:7789",
  ],
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
});

server.register(require("@fastify/swagger"), {
  swagger: {
    info: {
      title: "Redbull API",
      description:
        "Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger",
      version: "1.0.0",
    },
    externalDocs: {
      url: "https://swagger.io",
      description: "Find more info here",
    },
    host: "localhost" + ":" + 7789,
    //basePath: "/api",
    schemes: ["http", "https"],
    consumes: ["application/json"],
    produces: ["application/json"],
    tags: [{ name: "appMaker", description: "AppMaker api" }],
  },
  hideUntagged: true,
});

server.register(require("@fastify/swagger-ui"), {
  routePrefix: "/docs",
  // exposeRoute: true,
  // uiConfig: {
  //   docExpansion: 'full',
  //   deepLinking: false
  // },
  // uiHooks: {
  //   onRequest: function (request, reply, next) { next() },
  //   preHandler: function (request, reply, next) { next() }
  // },
  // staticCSP: true,
  // transformStaticCSP: (header) => header,
  // transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
  // transformSpecificationClone: true
});

module.exports = server;
