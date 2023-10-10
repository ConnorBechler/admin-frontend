/* eslint-disable */
import feathers from '@feathersjs/feathers';
import socketio from '@feathersjs/socketio-client';
import rest from '@feathersjs/rest-client';
import auth from '@feathersjs/authentication-client';
import io from 'socket.io-client';
import axios from 'axios';
// import { iff, discard } from 'feathers-hooks-common';
import feathersVuex from 'feathers-vuex';
import AuthManagement from 'authentication-local-management-v4/src/client';

const socket = io('', {transports: ['polling','websocket']});
const restClient = rest('/api').axios(axios);

const feathersClient = feathers()
  .configure(socketio(socket, { timeout: 20000 }))
  .configure(auth({
    storage: window.localStorage,
    path: '/auth',
    storageKey: 'auth',
  }))
  .hooks({
    before: {
      all: [
        /*
        iff(
          context => ['create', 'update', 'patch'].includes(context.method),
          discard('__id', '__isTemp')
        ),
        */
      ],
    },
  });

// TODO: implement WS/polling status in another js, import
feathersClient.io.on('disconnect', (data) => { console.log('io disc:', data); });
feathersClient.io.on('connect', () => { console.log('io conn'); });;
feathersClient.io.on('reconnecting', (data) => { console.log('io reconn attempt', data); });;
feathersClient.io.on('error', (data) => { console.log('io error', data); });;

export default feathersClient;

// Setting up feathers-vuex
const {
  makeServicePlugin,
  makeAuthPlugin,
  BaseModel,
  models,
  FeathersVuex,
} = feathersVuex(
  feathersClient,
  {
    serverAlias: 'api', // optional for working with multiple APIs (this is the default value)
    whitelist: ['$regex', '$options'],
  },
);

const authManagement = new AuthManagement(feathersClient);

export {
  makeAuthPlugin,
  makeServicePlugin,
  BaseModel,
  models,
  FeathersVuex,
  authManagement,
  restClient,
};
