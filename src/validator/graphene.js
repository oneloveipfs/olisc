// Graphene chain commons
const general = require('./general')

module.exports = {
    validate: (operations,ops) => {
        if (!general.array(ops) || ops.length === 0)
            return false
        for (let op in ops) {
            if (!general.array(ops[op]) || ops[op].length !== 2 || !operations[ops[op][0]] || !general.json(ops[op][1]))
                return false
            for (let f in ops[op][1])
                if (!operations[ops[op][0]][f] || !operations[ops[op][0]][f](ops[op][1][f]))
                    return false
        }
        return true
    }
}