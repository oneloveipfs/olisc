const mongo = require('./mongo')
const validator = require('./validator')

let actions = {
    new: async (user,network,operation,operationNetwork,scheduled) => {
        if (!validator.validate(operationNetwork,operation))
            return { error: 'operation validation failed' }
        else if (!validator.general.positiveInteger(scheduled) || scheduled < new Date().getTime())
            return { error: 'scheduled timestamp must be in the future' }
        let newDoc
        try {
            newDoc = await mongo.db.collection('operations').insertOne({
                user: user,
                network: network,
                operation: operation,
                operationNetwork: operationNetwork,
                scheduled: scheduled
            })
        } catch (e) {
            return { error: e.toString() }
        }
        return { result: { id: newDoc.insertedId.toString() } }
    },
    edit: async (user,network,id,updatedOperation,updatedOperationNetwork,scheduled) => {
        if (!validator.validate(updatedOperationNetwork,updatedOperation))
            return { error: 'updated operation validation failed' }
        else if (!validator.general.positiveInteger(scheduled) || scheduled < new Date().getTime())
            return { error: 'scheduled timestamp must be in the future' }
        let existing
        try {
            existing = await mongo.db.collection('operations').findOne({ _id: new mongo.objectId(id) })
        } catch (e) {
            return { error: e.toString() }
        }
        if (!existing)
            return { error: 'operation id does not exist' }
        else if (existing.tx || existing.error)
            return { error: 'cannot edit operations that have already been broadcasted' }
        else if (existing.user !== user || existing.network !== network)
            return { error: 'operation isn\'t yours to edit' }
        let update = { $set: {}}
        if (updatedOperation)
            update.$set.operation = updatedOperation
        if (scheduled)
            update.$set.scheduled = scheduled
        try {
            await mongo.db.collection('operations').updateOne({ _id: new mongo.objectId(id) },update)
        } catch (e) {
            return { error: e.toString() }
        }
        return { result: { ok: 1 } }
    },
    delete: async (user,network,id) => {
        let existing
        try {
            existing = await mongo.db.collection('operations').findOne({ _id: new mongo.objectId(id) })
        } catch (e) {
            return { error: e.toString() }
        }
        if (!existing)
            return { error: 'operation id does not exist already' }
        else if (existing.user !== user || existing.network !== network)
            return { error: 'operation isn\'t yours to delete' }
        try {
            await mongo.db.collection('operations').deleteOne({ _id: new mongo.objectId(id) })
        } catch (e) {
            return { error: e.toString() }
        }
        return { result: { ok: 1 } }
    },
    get: async (user,network,id) => {
        let result
        try {
            result = await mongo.db.collection('operations').findOne({ _id: new mongo.objectId(id) })
        } catch (e) {
            return { error: e.toString() }
        }
        if (result.user !== user || result.network !== network)
            return { error: 'operation isn\'t yours to look at' }
        return { result: result }
    },
    list: async (user,network) => {
        let result
        try {
            result = await mongo.db.collection('operations').find({ $and: [{ user: user }, { network: network }] }).toArray()
        } catch (e) {
            return { error: e.toString() }
        }
        return { result: result }
    }
}

module.exports = actions