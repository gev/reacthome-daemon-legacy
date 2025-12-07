const { AsyncLocalStorage } = require('async_hooks');
const contextStore = new AsyncLocalStorage();

module.exports = {
  getStore: () => contextStore.getStore() || {},
  run: (context, callback) => contextStore.run(context, callback)
};

