const server = require('./src/configs/serverConfig');
const routes = require('./src/configs/routesConfig');
const { defaultConfig } = require('./src/configs/index');

server.register(async function (fastify) {

    routes.forEach((route, index) => {
        fastify[route.method](route.url, {
            schema: route.schema,
        }, route.handler);
    });
});

const start = async () => {
    try {
        let config = await defaultConfig();
        await server.decorate('config', config);
        await server.listen({ port: config.app.port, host: config.app.host })
        server.log.info(`server listening on ${server.server.address().port}`)
    } catch (err) {
        server.log.error(err)
        process.exit(1)
    }
}
start();