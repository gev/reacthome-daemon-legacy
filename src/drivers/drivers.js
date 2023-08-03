let instances = {};


module.exports.get = (id) => instances[id];

module.exports.add = (id, instance) => instances[id] = instance;

module.exports.clear = () => {
    Object.entries(instances).forEach(([_, instance]) => {
        if (instance.stop) instance.stop();
    });
    instances = {};
}
