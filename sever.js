'use strict'

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');

class ApiServer extends http.Server {
    constructor(config) {
        const app = express();
        super(app);
        this.config = config;
        this.app = app;
        this.currentConnection = new Set();
        this.busy = WeakSet(); // 사용 중인 커넥션을 관리하기 위해서
        this.stopping = false; // 중단되어지는 과정인가
    }
    
    async start() {
        this.app.use(helmet());
        this.app.use(cookieParser());
        this.app.use(bodyParser());
    }
}
const createServer = async (config = {}) => {
    const server = new ApiServer(config);
    return server.start();
}