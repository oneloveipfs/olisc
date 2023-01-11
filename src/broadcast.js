const hive = require('@hiveio/hive-js')
const blurt = require('@blurtfoundation/blurtjs')
const avalon = require('javalon')
const { config } = require('./config')

let broadcast = {
    init: (apis) => {
        if (apis.hive)
            hive.api.setOptions({ url: apis.hive, useAppbaseApi: true })
        if (apis.blurt)
            blurt.api.setOptions({ url: apis.blurt, useAppbaseApi: true })
        if (apis.avalon)
            avalon.init({ api: apis.avalon })
    },
    hive: (operation) => {
        return new Promise((rs,rj) => {
            if (!config.wifs.hive)
                return rj('No Wif')
            hive.broadcast.send({ extensions: [], operations: operation },[config.wifs.hive],(e,result) => {
                if (e)
                    rj(e.toString())
                else
                    rs(result.id)
            })
        })
    },
    blurt: (operation) => {
        return new Promise((rs,rj) => {
            if (!config.wifs.blurt)
                return rj('No Wif')
            blurt.broadcast.send({ extensions: [], operations: operation },[config.wifs.blurt],(e,result) => {
                if (e)
                    rj(e.toString())
                else
                    rs(result.id)
            })
        })
    },
    avalon: (operation) => {
        return new Promise((rs,rj) => {
            if (!config.wifs.avalon)
                return rj('No Wif')
            delete operation.ts
            // some services may not want to have access to user funds
            if (config.avalon && !config.avalon.type13 && operation.type === 13) {
                operation.type = 4
                delete operation.data.burn
            }
            avalon.sendRawTransaction(avalon.signMultisig([config.wifs.avalon],operation.sender,operation),(e) => {
                if (e)
                    rj(e.error)
                else
                    rs(operation.hash)
            })
        })
    }
}

module.exports = broadcast