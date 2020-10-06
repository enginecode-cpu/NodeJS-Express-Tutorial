'use strict'

const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const http = require('http');
const helmet = require('helmet');
const static = require('serve-static');
const { stat } = require('fs');

class ApiServer extends http.Server {
    constructor(config) {
        const app = express();
        super(app);
        this.config = config;
        this.app = app;
        this.currentConnection = new Set();
        this.busy = WeakSet(); // 사용 중인 커넥션을 관리하기 위해서
        this.stopping = false; // 중단되어지는 과정인가
        this.app.static = static;
    }
    
    async start() {
        this.app.use(helmet());
        this.app.use(cookieParser());
        this.app.use(bodyParser());

        // Custom Middleware
        this.app.use((err, req, res, next) => {
            console.error(`Internal Error, ${err}`);
            if (req) {
                console.log(req);
            }
            if (res) {
                console.log(res);
            }
            next()
        })
        /*
        정적 파일이란?
        이미지, 음성, 동영상 파일 등
        자원에 사용되는 리소스 파일

        정적 파일을 핸들링하는 게 중요하다.

        정적 파일은 Express에서 바로 서빙하는 것보다
        리버스 프록시(nginx)를 통해서 서빙하는 것이 효율적이고 
        퍼포먼스적인 측면에서 좋다.

        그럼에도 불구하고, Express에서 정적 파일을 처리해야하는 경우에
        코드를 작성해보자.
         */
        this.app.use(this.app.static(path.join(__dirname, 'dist')), {
            setHeaders: (res, path) => {
                // 모든 곳에서 접근할 수 있도록 해라.
                res.setHeaders('Access-Control-Allow-Origin', '*');
                // 특정한 헤더 조건 없이 모든 헤더를 허용 해라.
                res.setHeaders('Access-Control-Allow-Headers', '*');
                res.setHeaders('Access-Control-Allow-Methods', 'GET')
            }
        })
    }
}
const createServer = async (config = {}) => {
    const server = new ApiServer(config);
    return server.start();
}