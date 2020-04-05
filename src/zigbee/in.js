
const { get, set, count_on, count_off, onHold, onClick } = require('../actions');
const { DO, onOn, onOff, ACTION_SCRIPT_RUN } = require('../constants');
const { run } = require('../controllers/service');

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];
const count = [count_off, count_on];

module.exports = (id, { ID, clusters }, data) => {
  Object
    .entries(clusters)
    .forEach(([key, { attributes }]) => {
      switch(key) {
        case 'genBasic': {
          break;
        }
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
          console.log(id, ID, key, attributes, data);
          break;
        }
        case 'msTemperatureMeasurement': {
          set(id, { temperature: attributes.measuredValue / 100 });
          const { onTemperature } = get(id);
          if (onTemperature) {
            run({type: ACTION_SCRIPT_RUN, id: onTemperature });
          }
          console.log(id, ID, key, attributes, data);
          break;
        }
        case 'msRelativeHumidity': {
          set(id, { humidity: attributes.measuredValue / 100 });
          const { onHumidity } = get(id);
          if (onHumidity) {
            run({type: ACTION_SCRIPT_RUN, id: onHumidity });
          }
          console.log(id, ID, key, attributes, data);
          break;
        }
        default: {
          console.log(id, ID, key, attributes, data);
        }
      }
    });
};
