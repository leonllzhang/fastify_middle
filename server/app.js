const server = require('./src/configs/serverConfig');
const routes = require('./src/configs/routesConfig');
const config = require('./config')

// routes.forEach((route, index) => {
//     server.route(route);
// });

server.register(async function (fastify) {
    fastify.get("/", async (request, reply) => {
        return {
            message: "Hello Restful Api"
        };
    });
    routes.forEach((route, index) => {
        fastify[route.method](route.url, {
            schema: route.schema,
        }, route.handler);
        // if(route.method==="post") {
        //     fastify[route.method](route.url, {
        //         schema: route.schema,
        //     }, route.handler);
        // } else {
        //     fastify[route.method](route.url, route.handler);
        // }
    });
});

const start = async () => {
    try {
        await server.listen({ port: config.port, host: config.host })
        server.log.info(`server listening on ${server.server.address().port}`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start();