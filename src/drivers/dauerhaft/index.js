// назначение айди и канала:

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