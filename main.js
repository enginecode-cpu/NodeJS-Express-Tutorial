'use strict'

const { createServer } = require('./server2.js');
const { getConfig } = require('./lib/config.js');

const env = process.env.NODE_ENV;

const main = async () => {
    const config = await getConfig();

    const server  = await createServer();
    server.listen(config.port, () => {
        console.log(`Server listening on port ${config.port}`);
    })

    process.on('SIGTERM', () => server.shutdown());
    process.on('SIGINT', () => server.shutdown())
}