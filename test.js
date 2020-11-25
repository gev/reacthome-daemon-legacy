
const {spawn} = require('child_process');

const ffmpeg = spawn('ffmpeg', [
  '-re', '-f', 'lavfi', '-i', '"sine=frequency=2133:sample_rate=48000:duration=25"', 
  '-f', 's16le', '-ar', '48000', '-ac', '2',
  '-', 
]);
ffmpeg.on('error', console.error);
ffmpeg.stdout.on('data', (data) => {
  console.log(data.length);
})