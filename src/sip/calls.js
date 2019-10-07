
const uuid = require('uuid/v4');

calls = new Map();

module.exports.get = id => calls.get(id);

module.exports.create = (request) => {
  const id = request.headers['call-id'];
  calls.set(id, request);
  return id;
};
