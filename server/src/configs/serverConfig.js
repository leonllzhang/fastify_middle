const config = require('../../config');
const server = require('fastify')({
  logger: true
});

server.register(require('@fastify/cors'), {
  // TODO:  enable CORS as as your needs
  origin: ['http://localhost:7789', 'http://127.0.0.1:7789', 'http://0.0.0.0:7789'],
  methods: ['GET', 'PUT', 'PATCH', 'POST', 'DELETE']
})

server.register(require('@fastify/swagger'), {
    swagger: {
      info: {
        title: 'Redbull API',
        description: 'Building a blazing fast REST API with Node.js, MongoDB, Fastify and Swagger',
        version: '1.0.0',
      },
      externalDocs: {
        url: 'https://swagger.io',
        description: 'Find more info here'
      },
      host: config.host + ':' + config.port,
      //basePath: "/api",
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
      tags: [
        { name: 'appMaker', description: 'AppMaker api' }
      ]
    },
    hideUntagged: true
  });

server.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
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
  })

module.exports = server;