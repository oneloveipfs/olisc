const { MongoClient, Db } = require('mongodb')
const config = require('./config')

let mongo = {
    db: new Db(MongoClient,'a'),
    init: async (existingClientDb) => {
        if (!existingClientDb)
            mongo.db = (await MongoClient.connect(config.config.mongodbUrl)).db(config.config.mongodbName)
        else
            mongo.db = existingClientDb
    }
}

module.exports = mongo