
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
          break;
        }
        case 'msTemperatureMeasurement': {
          set(id, { humidity: attributes.measuredValue / 100 });
          const { onTenperature } = get(id);
          if (onTenperature) {
            run({type: ACTION_SCRIPT_RUN, id: onTenperature });
          }
          break;
        }
        case 'msRelativeHumidity': {
          set(id, { humidity: attributes.measuredValue / 100 });
          const { onHumidity } = get(id);
          if (onHumidity) {
            run({type: ACTION_SCRIPT_RUN, id: onHumidity });
          }
          break;
        }
        default: {
          console.log(id, ID, key, attributes);
        }
      }
    });
};
