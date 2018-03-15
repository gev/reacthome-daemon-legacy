
const { createStore, applyMiddleware } = require('redux');
const thunk = require('redux-thunk');

module.exports = (reducer, state) =>
  createStore(reducer, state, applyMiddleware(thunk.default));
