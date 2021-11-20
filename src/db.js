const level = require("level");
const { DB } = require("./assets/constants");
const assets = require("./assets");

assets.init();

module.exports = level(DB, { valueEncoding: "json" });
