let config = {
    init: (appConfig = {}) => {
        config.config = Object.assign(config.config,appConfig)
    },
    config: {
        mongodbUrl: 'mongodb://localhost:27017',
        mongodbName: 'olisc',
        apiNamespace: '/olisc',
        runInterval: 300000,
        avalon: {
            type13: false
        },
        rpcs: {},
        wifs: {}
    }
}

module.exports = config