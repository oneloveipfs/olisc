let networkValidators = {
    avalon: require('./avalon'),
    hive: require('./hive')
}

module.exports = {
    validate: (network,op) => {
        if (!networkValidators[network])
            return false
        return networkValidators[network].validate(op)
    }
}