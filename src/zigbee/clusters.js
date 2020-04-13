
const { DO, ALARM, COLOR, LEVEL, TEMPERATURE, HUMIDITY } = require('../constants');
const controller = require('./controller');

const clusters = new Map();

const type = (res) => () => {
  return res;
}

const bind = async (endpoint, cluster, config) => {
  // if (endpoint.binds.length > 0) return;
  try {
    await endpoint.bind(cluster, controller.getDevicesByType('Coordinator')[0].getEndpoint(1));
    await endpoint.configureReporting(cluster, config);
    console.log('bind', endpoint, cluster);
  } catch (e) {
    console.error(e);
  }
};

const configure = (res, cluster, config) => (endpoint) => {
  bind(endpoint, cluster, config);
  return res;
};

clusters.set(0x0006, configure(DO, 'genOnOff', [{
  attribute: 'onOff',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}]));

clusters.set(0x0008, configure(LEVEL, 'genLevelCtrl', [{
  attribute: 'currentLevel',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}]));

clusters.set(0x0300, configure(COLOR, 'lightingColorCtrl', [{
  attribute: 'currentHue',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}, {
  attribute: 'currentSaturation',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}]));

clusters.set(0x0402, configure(TEMPERATURE, 'msTemperatureMeasurement', [{
  attribute: 'measuredValue',
  minimumReportInterval: 60,
  maximumReportInterval: 300,
  reportableChange: 10,
}]));

clusters.set(0x0405, configure(HUMIDITY, 'msRelativeHumidity', [{
  attribute: 'measuredValue',
  minimumReportInterval: 60,
  maximumReportInterval: 300,
  reportableChange: 10,
}]));

clusters.set(0x0500, configure(ALARM, 'ssIasZone', [{
  attribute: 'zoneState',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}, {
  attribute: 'iasCieAddr',
  minimumReportInterval: 0,
  maximumReportInterval: 1,
  reportableChange: 0,
}]));

module.exports = (endpoints) =>
  endpoints.reduce((config, endpoint) => {
    const cluster = endpoint.inputClusters
      .filter(id => clusters.has(id))
      .map(id => clusters.get(id)(endpoint));
    if (cluster.length > 0) {
      config.push({id: endpoint.ID, cluster});
    }
    return config;
  }, []);
