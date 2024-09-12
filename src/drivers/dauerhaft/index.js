// назначение айди и канала:
  // 0x9a id  chl	chh 0xaa 0xaa	crc дважды
  // 0x9a id  chl	chh 0xсa 0xсa	crc (запрос статуса)
  // ответ:
  // Head code	  0xd8										
  // D1	  Motor ID										
  // D2	  Motor Channel low 8 bits  b0 - b7 for 1 - 8 channel										
  // D3	  Motor channel high 8 bits  b0 - b7 for 9 - 16 channel										
  // D4	  Baud Rate:  00:1200   01:2400    02:4800    03:9600   04:19200										
  // D5	  Hand control method Settings: 0Normal    1Press the button to go UP, then press it to STOP, then press it to go DOWN, then press it to STOP, infinite loop    2ress the UP button to go UP, then press the UP button to STOP, press the DOWN button to go DOWN, then press the DOWN button to STOP, pressing the button opposite the direction of motor operation will change the direction    3Runs when button is pressed, stops when hand is released    4When the motor is moving up or down, pressing any button will stop it										
  // D6	Rotational speed in RPM/min (50-130)										
  // D7	  0xca Feedback on function of curtain motor enquiries										
  // D8	Zone Bit										
  //   b0：  0 with hand pull start  1 without hand pull start 										
  //   b1：  0 default direction 1 reverse										
  //   b2：  0 continuous movement  1 dot movement										
  //   b3：  0With slow start  1 without slow start										
  //   b4：  0 to limit point with clearance 1 to limit point without clearance										
  //   b5：  0 Stop at limit point 1 Stop when blocked										
  //   b6：  0Remembering the itinerary 1 Not to remember the itinerary										
  //     b7:   Reserved										

// управление вверх/вниз/остановить:
// up:     0x9a id  chl	chh 0x0a 0xdd	crc
// down:   0x9a id  chl	chh 0x0a 0xee crc
// stop:   0x9a id  chl	chh	0x0a 0xcc crc

// установка направления:
// 0x9a	0x09 id chl	chh	(b1: 0 defaut direction 1 opposite direction) crc	

// установка концевых значений:
// Up limit:    0x9a id chl chh 0xda 0xdd crc			
// Down limit:  0x9a id chl chh 0xda 0xee crc

// управление процентами:
// 0x9a	id chl chh	0xdd 0-100 crc		
// 100full close/Up limit   0full open/Down limit

// считывание положения:
// запрос:
// 0x9a id chl chh 0xcc 0x00 crc  (date feedback when ID corresponding)
// 0x9a id chl chh 0xcc 0xcc crc  (date feedback directly no matter ID corresponing or not)

// ответ:
// Single fram date：head code(0xd8) + ID(1Byte) +Channel(2Byte) + Date(5Byte) + Verify(ID ^ Channel  ^ Date)
// D1	Motor ID
// D2	Motor Channel low 8 bits  b0 - b7 for 1 - 8 channel
// D3	Motor channel high 8 bits  b0 - b7 for 9 - 16 channel
// D4	Current        unit 0.01mA
// D5	Voltage        Unit V
// D6	Speed         Unit RPM/m
// D7	Position       100 close/up limit         0 open/down limit
// D8 :
// 	  b0：            0 Motor stop                1 Motor run
// 	  b1：            0 no limit set               1 limit set down
// 	  b2：            0 No middle limit 1       1 set middle limit 1
// 	  b3：            0 No middle limit 2       1 set middle limit 2
// 	  b4：            0 No middle limit 3       1 set middle limit 3
// 	  b5：            0 No middle limit 4       1 set middle limit 4
// 	  b6：            no definition
// 	  b7：            no definition



// crc: D1 ^ D2 ^ D3 ^ D4 ^ D5 ^ D6 ^ D7 ^ D8


const { get, set } = require('../../actions');
const { ACTION, ACTION_SET_ADDRESS } = require('../../constants');
const { delay } = require('../../util');

const timers = new Map();
const queues = new Map();

let tid = 0;

const sync = async (id, kind, modbus, address, port, n, mask) => {
  // for (let i = 0; i < n; i += 1) {
  //   const ch = `${id}/${kind}/${port}.${i}`
  //   const { synced, value } = get(ch) || {};
  //   if (!synced) {
  //     writeRegisters(modbus, address, 41001, [(port << 8) | (mask | i), (2 << 8) | value, 0, 0]);
  //     set(ch, { synced: true });
  //     await delay(20);
  //     // } else if (mask === 0) {
  //     //   readWriteRegisters(modbus, address, 32001, 4, 42001, [(tid << 8) | port, (i << 8) | 1]);
  //     //   tid += 1;
  //     //   tid %= 0xff;
  //     //   await delay(100)
  //   }
  // }
}

const syncPort = async (id, port, modbus, address) => {
  // const channel = get(id) || {};
  // const numberGroups = channel[`numberGroups${port}`] || 16;
  // const numberLights = channel[`numberLights${port}`] || 64;
  // await sync(id, DALI_GROUP, modbus, address, port, numberGroups, 0b1000_0000);
  // await sync(id, DALI_LIGHT, modbus, address, port, numberLights, 0b0000_0000);
}

const loop = (id) => async () => {
  // const dev = get(id) || {};
  // const { bind } = dev;
  // if (bind) {
  //   const [modbus, , address] = bind.split('/');
  //   await syncPort(id, 1, modbus, address);
  //   await syncPort(id, 2, modbus, address);
  // }
  // timers.set(id, setTimeout(loop(id), 20));
}

module.exports.run = (action) => {
  switch (action.type) {
    case ACTION_SET_ADDRESS: {
      queues.get(action.id).push(Buffer.from([

      ]));
      break;
    }
  }

}

module.exports.handle = ({ id, data }) => {
  // switch (data[0]) {
  //   case READ_WRITE_REGISTERS:
  //     const port = data[3];
  //     const index = data[4];
  //     const value = data[6];
  //     set(`${id}/${DALI_LIGHT}/${port}.${index}`, { value });
  //     break;
  // }
}


module.exports.clear = () => {
  timers.forEach(i => clearImmediate(i))
  timers.clear();
  queues.clear();
}

module.exports.add = (id) => {
  if (timers.has(id)) {
    clearTimeout(timers.get(id))
  }
  timers.set(id, setTimeout(loop(id), 100));
  queues.set(id, []);
};
