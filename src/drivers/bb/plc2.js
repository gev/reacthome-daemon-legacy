
const { get, set } = require('../../actions');
const service = require('../../controllers/service');
const Master = require('./master');

const param = [
  "water_counter_1",
  "water_counter_2",
  "water_counter_3",
  "water_counter_4",

  "vent_power",
  "vent_fan_speed",
  "vent_damper",

  "acc1_power",
  "acc1_mode",
  "acc1_fan_speed",
  "acc1_vane_position",

  "acc2_power",
  "acc2_mode",
  "acc2_fan_speed",
  "acc2_vane_position",

  "acc3_power",
  "acc3_mode",
  "acc3_fan_speed",
  "acc3_vane_position",

  "acc4_power",
  "acc4_mode",
  "acc4_fan_speed",
  "acc4_vane_position",

  "t1_air_temperature",
  "t1_humidity",
  "t1_floor_temperature",

  "t2_air_temperature",
  "t2_humidity",
  "t2_floor_temperature",

  "t3_air_temperature",
  "t3_humidity",

  "t4_air_temperature",
  "t4_humidity",
  "t4_floor_temperature",

  "t5_air_temperature",
  "t5_humidity",

  "t6_air_temperature",
  "t6_humidity",
  "t6_floor_temperature",

  "t7_air_temperature",
  "t7_humidity",
  "t7_floor_temperature",

  "t8_air_temperature",
  "t8_humidity",
  "t8_floor_temperature",

  "ventilator_relay_k1",
  "ventilator_relay_k6",
  "ventilator_relay_k7",
  "ventilator_relay_k8",

  "voltage_phase_a",
  "voltage_phase_b",
  "voltage_phase_c",

  "current_phase_a",
  "current_phase_b",
  "current_phase_c",

  "power_phase_a",
  "power_phase_b",
  "power_phase_c",

  "room1_set_point",
  "room2_set_point",
  "room3_set_point",
  "room4_set_point",
  "room5_set_point",
  "room6_set_point",
  "room7_set_point",
  "room8_set_point",

  "room1_floor_power",
  "room2_floor_power",
  "room4_floor_power",
  "room6_floor_power",
  "room7_floor_power",
  "room8_floor_power"
];

module.exports = class {

  constructor(id) {
    this.id = id;
    this.temperature = {};
    this.start();
  }

  start() {
    const { host, port = 502 } = get(this.id) || {};
    this.master = new Master({ host, port, device: 2 });
    this.master.on('error', console.error);
    this.master.on('data', (event) => {
      console.log(event);
      this.masterHandle(event);
    });
    this.timer = setInterval(() => {
      this.master.readHoldingRegisters(0, 82);
    }, 1000);
  }

  stop() {
    clearInterval(this.timer);
    this.master.destroy();
  }

  handle() {

  }

  set(id, value) {
    const channel = `${this.id}/channel/${id}`;
    set(channel, { value });
  }

  masterHandle({ cmd, data }) {
    console.log(data);
    let offset = 0;
    param.forEach(id => {
      if (id)
        switch (id) {
          case "voltage_phase_a":
          case "voltage_phase_b":
          case "voltage_phase_c":
          case "current_phase_a":
          case "current_phase_b":
          case "current_phase_c":
          case "power_phase_a":
          case "power_phase_b":
          case "power_phase_c": {
            offset += offset % 4;
            const buff = Buffer.alloc(4);
            data.copy(buff, 0, offset + 2, offset + 4);
            data.copy(buff, 2, offset + 0, offset + 2);
            const value = buff.readFloatBE();
            this.set(id, value);
            offset += 4;
            break;
          }
          case "water_counter_1":
          case "water_counter_2":
          case "water_counter_3":
          case "water_counter_4": {
            const value = data.readUInt16BE(offset);
            // meter[id].tick();
            this.set(id, value);
            offset += 2;
            break;
          }
          case "room1_set_point":
          case "room2_set_point":
          case "room3_set_point":
          case "room4_set_point":
          case "room5_set_point":
          case "room6_set_point":
          case "room7_set_point":
          case "room8_set_point":
          case "t1_air_temperature":
          case "t1_floor_temperature":
          case "t2_air_temperature":
          case "t2_floor_temperature":
          case "t3_air_temperature":
          case "t4_air_temperature":
          case "t4_floor_temperature":
          case "t5_air_temperature":
          case "t6_air_temperature":
          case "t6_floor_temperature":
          case "t7_air_temperature":
          case "t7_floor_temperature":
          case "t8_air_temperature":
          case "t8_floor_temperature": {
            let value = Math.round(data.readUInt16BE(offset) / 10) / 10;
            if (!this.temperature[id]) {
              this.temperature[id] = [value];
            } else {
              this.temperature[id].push(value);
              if (this.temperature[id].length > 60) {
                this.temperature[id].shift();
                value = this.temperature[id].sort((a, b) => a > b)[30];
                this.set(id, value);
              }
            }
            offset += 2;
            break;
          }
          case "t1_humidity":
          case "t2_humidity":
          case "t3_humidity":
          case "t4_humidity":
          case "t5_humidity":
          case "t6_humidity":
          case "t7_humidity":
          case "t8_humidity": {
            const value = Math.round(data.readUInt16BE(offset) / 10);
            this.set(id, value);
            offset += 2;
            break;
          }
          default: {
            const value = data.readUInt16BE(offset);
            this.set(id, value );
            offset += 2;
          }
        }
      else offset += 2;
    });
  }

}
