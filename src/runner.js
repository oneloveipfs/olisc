const mongo = require('./mongo')
const broadcast = require('./broadcast')
const { config } = require('./config')

let runner = {
    init: () => {
        broadcast.init(config.rpcs)
        runner.scheduleNext()
    },
    scheduleNext: () => {
        let nextInterval = Math.ceil(new Date().getTime() / config.runInterval) * config.runInterval
        setTimeout(async () => {
            await runner.run()
            runner.scheduleNext()
        }, nextInterval - new Date().getTime())
    },
    run: async () => {
        let pendingOps = await mongo.db.collection('operations').find({ $and: [
            { scheduled: { $lte: new Date().getTime() }},
            { error: { $exists: false }},
            { tx: { $exists: false }}
        ]}).toArray()
        for (let op in pendingOps)
            if (broadcast[pendingOps[op].operationNetwork]) {
                let txhash
                try {
                    txhash = await broadcast[pendingOps[op].operationNetwork](pendingOps[op].operation)
                } catch (e) {
                    mongo.db.collection('operations').updateOne({ _id: pendingOps[op]._id }, { $set: { error: e } }).then(() => {}).catch(() => {})
                }
                mongo.db.collection('operations').updateOne({ _id: pendingOps[op]._id }, { $set: { tx: txhash } }).then(() => {}).catch(() => {})
            }
    }
}

module.exports = runner