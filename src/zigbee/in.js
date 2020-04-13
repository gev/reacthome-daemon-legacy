
const { get, set, count_on, count_off, onHold, onClick } = require('../actions');
const { ENDPOINT, DO, onOn, onOff, ACTION_SCRIPT_RUN } = require('../constants');
const { run } = require('../controllers/service');

const onDI = [onOff, onOn, onHold, onClick];
const onDO = [onOff, onOn];
const count = [count_off, count_on];

module.exports = (id, { ID, clusters, inputClusters }, data) => {
  console.log(inputClusters);
  Object
    .entries(clusters)
    .forEach(([key, { attributes }]) => {
      switch(key) {
        case 'genOnOff': {
          const channel = `${id}/${ENDPOINT}/${ID}`;
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
        case 'genLevelCtrl': {
          const channel = `${id}/${ENDPOINT}/${ID}`;
          const chan = get(channel);
          set(channel, { level: attributes.currentLevel });
          if (chan && chan.bind) {
            const l = attributes.currentLevel ? 1 : 0;
            const l_ = chan.level ? 1 : 0;
            if (l !== l_) {
              const script = chan[onDO[l]];
              if (script) {
                run({ type: ACTION_SCRIPT_RUN, id: script });
              }
              count[l](chan.bind);
            }
          }
          console.log(id, ID, key, attributes, data);
          break;
        }
        case 'lightingColorCtrl': {
          const channel = `${id}/${ENDPOINT}/${ID}`;
          set(channel, {hue: attributes.currentHue, saturation: attributes.currentSaturation})
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
          const value = data.zonestatus & 0x1;
          set(id, { value });
          const device = get(id);
          const script = device[onDO[value]];
          if (script) {
            run({type: ACTION_SCRIPT_RUN, id: script });
          }
          console.log(id, ID, key, attributes, data);
        }
      }
    });
};
