// Graphene chain commons
const general = require('./general')

let getBroadcaster = (op => {
    switch(op[0]) {
        case 'comment':
        case 'comment_options':
            return op[1].author
        case 'custom_json':
            return op[1].required_auths[0] || op[1].required_posting_auths[0]
        case 'vote':
            return op[1].voter
    }
})

module.exports = {
    validate: (network,operations,ops,user,net) => {
        if (!general.array(ops) || ops.length === 0)
            return false
        for (let op in ops) {
            if (!general.array(ops[op]) || ops[op].length !== 2 || !operations[ops[op][0]] || !general.json(ops[op][1]))
                return false
            for (let f in ops[op][1])
                if (!operations[ops[op][0]][f] || !operations[ops[op][0]][f](ops[op][1][f]))
                    return false
            if (getBroadcaster(ops[op]) !== user || (net !== network && net !== 'all'))
                return false
        }
        return true
    }
}