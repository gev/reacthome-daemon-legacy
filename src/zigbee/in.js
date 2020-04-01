
const { get, set, count_on, count_off, onHold, onClick } = require('../actions');
const { DO, onOn, onOff, ACTION_SCRIPT_RUN } = require('../constants');
const { run } = require('../controllers/service');

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];
const count = [count_off, count_on];

module.exports = (id, { ID, clusters }) => {
  Object
    .entries(clusters)
    .forEach(([key, { attributes }]) => {
      switch(key) {
        case 'genOnOff': {
          const channel = `${id}/${DO}/${ID}`;
          const chan = get(channel);
          set(channel, { value: attributes.onOff });
          if (chan && chan.bind) {
            if (chan.value !== attributes.onOff) {
              const script = chan[onDO[attributes.onOff]];
              if (script) {
                run({ type: ACTION_SCRIPT_RUN, id: script });
              }
              count[attributes.onOff](chan.bind);
            }
          }
          // case ''
        break;
        }
      }
    });
};
