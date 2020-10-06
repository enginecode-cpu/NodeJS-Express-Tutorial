'use strict'

const express = require('express');
const helmet = require('helmet');

const PORT = 8080;
const HOST = '0.0.0.0';

const app =express();

app.use(helmet.xssFilter());
app.use(helmet.frameguard());

app.get('/', (req, res) => {
    res.send('Welcome');
})

app.listen(PORT, HOST);
console.log(`Running on ${HOST}:${PORT}`);