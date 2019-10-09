
const assets = require('../assets');
const state = require('../controllers/state');
const { sendAction } = require('../webrtc/peer');
const { LIST } = require('./constants');

const N = 256;

const split = (x, n) => x.reduce ((a, b, i) => {
  if (i % n === 0) {
    a.push([b]);
  } else {
    a[a.length - 1].push(b);
  }
  return a;
}, []);

module.exports = async (session) => {
  split(state.list(), N).forEach(state => {
    sendAction(session, { type: LIST, state });
  });
  console.log(split(await assets.list(), N));
  // split(await assets.list(), N).forEach(assets => {
  //   sendAction(session, { type: LIST, assets });
  // });
};
