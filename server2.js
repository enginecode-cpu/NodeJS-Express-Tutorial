'use strict'

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const static = require('serve-static');

class ApiServer extends http.Server {
    constructor(config) {
        const app = express();
        super(app);
        this.config = config;
        this.app = app;
        this.currentConnection = new Set();
        this.busy = new WeakSet(); // 사용 중인 커넥션을 관리하기 위해서
        this.stopping = false; // 중단되어지는 과정인가
        this.app.static = static;
    }
    
    async start() {
        this.app.use((req, res, next) => {
            this.busy.add(req.socket);
            res.on('finish', () => {
                if (this.stopping) req.socket.end();
                this.busy.delete();
            })
            next();
        })

        this.app.use(cookieParser());
        this.app.get('/_health', (req, res) => {
            res.sendStatus(200);
        })

        this.app.use((err, req, res, next) => {
            res.status(500).send(generateApiError('Api::Error'));
        })

        this.on('connection', (c) => {
            this.currentConnection.add(c);
            c.on('close', () => this.currentConnection.delete(c));
        })

        return this;
    }

    shutdown() {
        if (this.stopping) return;
        
        this.stopping = true;
        this.close(() => {
            process.exit(0);
        })

        setTimeout(() => {
            console.error(`비정상적인 종료과정으로서, (강제 종료합니다.)`);
            process.exit(1);
        }, this.config.shutdownTimeout).unref();

        if (this.currentConnection.size) > 0 {
            console.log(`현재 동시 접속 중인 연결(${this.currentConnection.size})을 대기 중 입니다.`);

            for (const con of this.currentConnection) {
                if (!this.busy.has(con)) {
                    con.end();
                }
            }
        }
    }
}
const createServer = async (config = {}) => {
    const server = new ApiServer(config);
    return await erver.start();
}

module.exports = {
    createServer
};