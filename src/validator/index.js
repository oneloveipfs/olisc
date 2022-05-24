const general = require('./general')

let networkValidators = {
    avalon: require('./avalon'),
    blurt: require('./blurt'),
    hive: require('./hive')
}

module.exports = {
    validate: (network,op,user,net) => {
        if (!networkValidators[network])
            return false
        return networkValidators[network].validate(op,user,net)
    },
    general
}