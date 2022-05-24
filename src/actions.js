const mongo = require('./mongo')
const validator = require('./validator')

let actions = {
    index: async () => {
        return { result: {
            ok: 1,
            count: await mongo.db.collection('operations').estimatedDocumentCount()
        }}
    },
    new: async (user,network,operation,operationNetwork,scheduled) => {
        if (!operationNetwork)
            return { error: 'opNetwork is required' }
        if (!validator.validate(operationNetwork,operation,user,network))
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
        if (!validator.validate(updatedOperationNetwork,updatedOperation,user,network))
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
        if (!result)
            return { error: 'operation not found', status: 404 }
        if (result.user !== user || result.network !== network)
            return { error: 'operation isn\'t yours to look at' }
        return { result: result }
    },
    list: async (user,network,filter) => {
        let query = [
            { user: user },
            { network: network }
        ]
        let result
        if (filter && typeof filter.status === 'string') {
            if (filter.status === 'pending') {
                query.push({ error: { $exists: false }})
                query.push({ tx: { $exists: false }})
            } else if (filter.status === 'success') {
                query.push({ tx: { $exists: true }})
                query.push({ error: { $exists: false }})
            } else if (filter.status === 'errored')
                query.push({ error: { $exists: true }})
        }
        if (filter && typeof filter.opNetwork === 'string')
            query.push({ operationNetwork: filter.opNetwork })
        try {
            result = await mongo.db.collection('operations').find({ $and: query }).toArray()
        } catch (e) {
            return { error: e.toString() }
        }
        return { result: result }
    }
}

module.exports = actions