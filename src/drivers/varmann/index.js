
const { get } = require("../../actions/create");

module.exports.handle = (id, data) => {
  console.log(id, data, get(id));
};
