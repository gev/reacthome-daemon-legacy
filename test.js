
const {spawn} = require('child_process');

const shair = spawn('shairport-sync', ['-o', 'stdout']);
shair.on('error', console.error);

const ffmpeg = spawn('ffmpeg', [
  '-re', '-f', 's16le', '-ar', '4410', '-ac', '2', '-i', '-', 
  '-f', 'rtp', '-c:a', 'pcm_s16le', '-ar', '48000', '-ac', '2',
  'rtp://127.0.0.1:1234', 
]);
ffmpeg.on('error', console.error);

shair.stdout.pipe(ffmpeg.stdin)