const general = require('./general')

// network specific types
let specificTypes = {
    asset: (val) => {
        if (!general.string(val))
            return false
        let split = val.split(' ')
        if (split.length !== 2 || !general.positiveFloat(parseFloat(split[0])) || (!split[1] !== 'HIVE' && !split[1] !== 'HBD'))
            return false
        let dec = split[0].split('.')
        if (dec.length !== 2 || dec[1].length !== 3)
            return false
        return true
    },
    basisPoints: (val) => general.positiveInteger(val) && val <= 10000
}

// some supported operations to validate
// this is up to the application developers to decide which ones to support
let operations = {
    comment: {
        parent_author: general.string,
        parent_permlink: general.string,
        author: general.string,
        permlink: general.string,
        title: general.string,
        body: general.string,
        json_metadata: general.jsonString
    },
    comment_options: {
        author: general.string,
        permlink: general.string,
        max_accepted_payout: specificTypes.asset,
        percent_hbd: specificTypes.basisPoints,
        allow_votes: general.bool,
        allow_curation_rewards: general.bool,
        extensions: general.array
    },
    custom_json: {
        required_auths: general.arrayOfStrings,
        required_posting_auths: general.arrayOfStrings,
        id: general.string,
        json: general.jsonString
    },
    vote: {
        voter: general.string,
        author: general.string,
        permlink: general.string,
        weight: specificTypes.basisPoints
    }
}

module.exports = {
    validate: (ops) => {
        if (!general.array(ops) || ops.length === 0)
            return false
        for (let op in ops) {
            if (!general.array(ops[op]) || ops[op].length !== 2 || !operations[ops[op][0]] || !general.json(operations[ops[op][1]]))
                return false
            for (let f in ops[op][1])
                if (!operations[ops[op][0]][f] || !operations[ops[op][0]][f](ops[op][1][f]))
                    return false
        }
        return true
    }
}