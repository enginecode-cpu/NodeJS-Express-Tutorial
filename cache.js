/*
 효율적으로 캐시를 관리하기 위한
 Redis를 활용한 캐싱 계층을 설계하는 방법
 */

'use strict'

const RedisCluster = require('redis-cluster');
const RedisClient = require('redis');
const config = require('./config');

const { promisify } = require('util');

let redis, redisSub;
let subCallbacks = new Map();

async function getRedisClient() {
    const config = await config.getConfig();

    if (sub && redisSub) return redisSub;
    if (!sub && redis) return redis;

    const options = {};
    let newClient;

    if (config.redisUseClient) {
        newClient = new RedisClient({
            servers: [
                {
                    host: config.redisHost,
                    port: config.redisPort
                }
            ],
            createClient: (port, host) => RedisClient.createClient(port, host, options)
        })
    } else {
        newClient = RedisClient.createClient(config.redisPort, config.redisHost, options);
    }

    if (sub) {
        redisSub = newClient;
        newClient.on('message', (topic, message) => {
            if (subCallbacks.has(topic)) {
                const callback = subCallbacks.get(topic);
                callback(message);
            }
        });

        newClient.on('error', (err) => {
            console.error(err);
            newClient.end();
        })
    } else {
        redis = newClient;       
    }

    newClient.on('connect', () => {
        console.log(`${sub} connected`);
    })

    newClient.on('reconnect', () => {
        console.log(`Redis ${sub} reconnected`);
    })

    promisifyClient(newClient);

    return newClient;
}

function promisifyClient(redis) {
    redis.get = promisify(redis.get.bind(redis));
}