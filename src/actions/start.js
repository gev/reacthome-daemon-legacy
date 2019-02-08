
const { get } = require('./create');
const { service } = require('../controllers');
const { ACTION_SCRIPT_RUN } = require('../constants');

module.exports.start = (id) => {
  const project = get(id);
  if (project && project.onStart) {
    service.run({ type: ACTION_SCRIPT_RUN, id: project.onStart });
  }
}
