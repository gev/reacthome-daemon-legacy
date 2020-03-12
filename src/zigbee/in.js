
const { set } = require('../actions');
const { DO } = require('../constants');

module.exports = (id, { ID, clusters }) => {
  Object
    .entries(clusters)
    .forEach(([key, { attributes }]) => {
      switch(key) {
        case 'genOnOff': {
          const channel = `${id}/${DO}/${ID}`;
          set(channel, { value: attributes.onOff });
          break;
        }
      }
    });
};
