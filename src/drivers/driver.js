const {
  DRIVER_TYPE_RS21,
  DRIVER_TYPE_ARTNET,
  DRIVER_TYPE_BB_PLC1,
  DRIVER_TYPE_BB_PLC2,
  DRIVER_TYPE_M206,
  DRIVER_TYPE_M230,
  DRIVER_TYPE_MODBUS,
  DRIVER_TYPE_VARMANN,
  DRIVER_TYPE_INTESIS_BOX,
  // DRIVER_TYPE_ME210_701,
  DRIVER_TYPE_NOVA,
  DRIVER_TYPE_SWIFT,
  DRIVER_TYPE_ALINK,
  DRIVER_TYPE_RTD_RA,
  DRIVER_TYPE_DALI_GW,
  DRIVER_TYPE_MODBUS_RBUS,
  DRIVER_TYPE_MODBUS_TCP,
  DRIVER_TYPE_COMFOVENT,
  DRIVER_TYPE_DALI_DLC,
  DRIVER_TYPE_MD_CCM18_AN_E,
  DRIVER_TYPE_TICA,
  DRIVER_TYPE_DAUERHAFT,
  DRIVER_TYPE_PROXY,
  DRIVER_TYPE_TELEGRAM,
  DRIVER_TYPE_DMX512,
  DRIVER_TYPE_ROYAL_VENTO,
} = require("../constants");
const { get } = require("../actions");
const RS21 = require("./RS21");
const Artnet = require("./artnet");
const { Plc1, Plc2 } = require("./bb");
const M230 = require("./M230");
const M206 = require("./M206");
const modbusRBUS = require("./modbus/rbus");
const modbusTCP = require("./modbus/tcp");
const nova = require("./shuft/nova");
const swift = require("./shuft/swift");
const comfovent = require("./comfovent");
const varmann = require("./varmann");
const intesisbox = require("./intesisbox");
const md_ccm18_an_e = require("./MD-CCM18-AN-E");
const tica = require("./tica");
const rtdra = require("./RTD-RA");
const alink = require("./alink");
// const me210_701 = require("./owen/me210_701");
const dali_gw = require("./dali-gw");
const dali_dlc = require("./dali-dlc");
const dauerhaft = require("./dauerhaft");
const proxy = require("./proxy");
const telegram = require("./telegram");
const dmx512 = require("./dmx512");
const royal_vento = require("./royal/vento")
const es_brot_02 = require("./open-therm/ES-BROT-02")

const mac = require("../mac");

let instances = require("./drivers");

module.exports.manage = () => {
  const { project } = get(mac()) || {};
  if (project === undefined) return;
  const { driver } = get(project) || {};

  instances.clear();
  nova.clear();
  swift.clear();
  comfovent.clear();
  varmann.clear();
  intesisbox.clear();
  md_ccm18_an_e.clear();
  rtdra.clear();
  alink.clear();
  // me210_701.clear()
  dali_gw.clear();
  dali_dlc.clear();
  royal_vento.clear();

  if (!Array.isArray(driver)) return;
  for (const id of driver) {
    const { type } = get(id) || {};
    switch (type) {
      case DRIVER_TYPE_PROXY:
        instances.add(id, proxy);
        proxy.add(id);
        break;
      // case DRIVER_TYPE_TELEGRAM:
      //   instances.add(id, telegram);
      //   telegram.add(id);
      //   break;
      case DRIVER_TYPE_RS21:
        instances.add(id, new RS21(id));
        break;
      case DRIVER_TYPE_ARTNET:
        instances.add(id, new Artnet(id));
        break;
      case DRIVER_TYPE_DMX512:
        instances.add(id, dmx512);
        break;
      case DRIVER_TYPE_BB_PLC1:
        instances.add(id, new Plc1(id));
        break;
      case DRIVER_TYPE_BB_PLC2:
        instances.add(id, new Plc2(id));
        break;
      case DRIVER_TYPE_M206:
        instances.add(id, new M206(id));
        break;
      case DRIVER_TYPE_M230:
        instances.add(id, new M230(id));
        break;
      case DRIVER_TYPE_MODBUS:
      case DRIVER_TYPE_MODBUS_RBUS:
        instances.add(id, modbusRBUS);
        break;
      case DRIVER_TYPE_MODBUS_TCP:
        instances.add(id, modbusTCP);
        break;
      case DRIVER_TYPE_NOVA:
        instances.add(id, nova);
        nova.add(id);
        break;
      case DRIVER_TYPE_SWIFT:
        instances.add(id, swift);
        swift.add(id);
        break;
      case DRIVER_TYPE_VARMANN:
        instances.add(id, varmann);
        varmann.add(id);
        break;
      case DRIVER_TYPE_INTESIS_BOX:
        instances.add(id, intesisbox);
        intesisbox.add(id);
        break;
      case DRIVER_TYPE_MD_CCM18_AN_E:
        instances.add(id, md_ccm18_an_e);
        md_ccm18_an_e.add(id);
        break;
      case DRIVER_TYPE_TICA:
        instances.add(id, tica);
        tica.add(id);
        break;
      case DRIVER_TYPE_COMFOVENT:
        instances.add(id, comfovent);
        comfovent.add(id);
        break;
      case DRIVER_TYPE_RTD_RA:
        instances.add(id, rtdra);
        rtdra.add(id);
        break;
      case DRIVER_TYPE_ALINK:
        instances.add(id, alink);
        alink.add(id);
        break;
      // case DRIVER_TYPE_ME210_701:
      //   instances.add(id, me210_701);
      //   me210_701.add(id);
      //   break;
      case DRIVER_TYPE_DALI_GW:
        instances.add(id, dali_gw);
        dali_gw.add(id);
        break;
      case DRIVER_TYPE_DALI_DLC:
        instances.add(id, dali_dlc);
        dali_dlc.add(id);
        break;
      case DRIVER_TYPE_DAUERHAFT:
        instances.add(id, dauerhaft);
        dauerhaft.add(id);
        break;
      case DRIVER_TYPE_ROYAL_VENTO:
        instances.add(id, royal_vento);
        royal_vento.add(id);
        break;
      case DRIVER_TYPE_ES_BROT_02:
        instances.add(id, es_brot_02);
        es_brot_02.add(id);
        break;
    }
  }
};

module.exports.run = (action) => {
  if (action.id) {
    const instance = instances.get(action.id);
    if (instance && instance.run) {
      instance.run(action);
    }
  } else {
    for (const instance of instances.getAll()) {
      if (instance.acceptBroadcast && instance.run) {
        instance.run(action);
      }
    }
  }
};

module.exports.handle = (action) => {
  const instance = instances.get(action.id);
  if (instance && instance.handle) {
    instance.handle(action);
  }
};
