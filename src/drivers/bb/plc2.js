
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
    this.start();
  }

  start() {
    const { host, port = 502 } = get(this.id) || {};
    this.master = new Master({ host, port, device: 1 });
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

  masterHandle({ cmd, data }) {
    console.log(data);
    // param.forEach((p) => {
    //   let value;
    //   switch (p) {
    //     case
    //   }
    // })
  }

}
