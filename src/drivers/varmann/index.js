
const { get } = require("../../actions/create");

const instance = new Set();

module.exports.handle = ({id, data}) => {
  console.log(id, data, get(id));
};

module.exports.clear = () => {
  instance.clear();
}

module.exports.add = (id) => {
  instance.add(id);
};
