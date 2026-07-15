// Драйвер Hisense B544(E) — константы. См. INC-066, docs/06-devices/hvac/hisense-b544/.
// Карта регистров подтверждена практикой (донгл + HUB4): B544E-modbus-registers.pdf.

module.exports.TIMEOUT = 1000; // мс между тиками round-robin (как intesisbox)

// Modbus-адреса B544
module.exports.COIL_ONOFF = 0x0;   // FC05 write coil / FC02 read discrete input — вкл/выкл
module.exports.HOLD_SETPOINT = 0x0; // FC06 write holding — уставка (18..32)
module.exports.HOLD_MODE = 0x2;    // FC06 write holding — режим
module.exports.HOLD_FAN = 0x3;     // FC06 write holding — вентилятор
module.exports.INPUT_TEMP = 0x1;   // FC04 read input registers, старт блока чтения
module.exports.INPUT_COUNT = 8;    // читаем 0x1..0x8: temp(0x1),setpoint(0x2),mode(0x7),fan(0x8)

module.exports.COIL_ON = 0xff00;   // значение coil для FC05 «включить»
module.exports.COIL_OFF = 0x0000;  // «выключить»

module.exports.SETPOINT_MIN = 18;
module.exports.SETPOINT_MAX = 32;

// Трансляция режима. Демон/клиент шлёт mode по конвенции Intesis-регистра
// (0=auto,1=heat,2=dry,3=fan,4=cool). B544 write holding 0x2: 0=fan,1=heat,2=cool,3=dry,4=auto.
// ⚠️ Проверить на железе (Гейт 2). Режим НЕ на критическом пути охлаждения (термостат
// использует ACTION_ON/OFF), поэтому неизвестное значение просто не пишется (guard в sync).
module.exports.MODE_TO_B544 = { 0: 4, 1: 1, 2: 3, 3: 0, 4: 2 };
// Обратная трансляция для readback (FC04 0x7): B544 0=fan,1=heat,2=cool,3=dry,5/6/7=auto → демон.
module.exports.MODE_FROM_B544 = { 0: 3, 1: 1, 2: 4, 3: 2, 5: 0, 6: 0, 7: 0 };
