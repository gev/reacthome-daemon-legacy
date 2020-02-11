
module.exports.sleep = t => new Promise(resolve => {
  setTimeout(resolve, t);
});
