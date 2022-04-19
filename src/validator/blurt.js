// Graphene fork example - Blurt
const hive = require('./hive')
const graphene = require('./graphene')
const general = require('./general')

// network specific types
let specificTypes = {
    asset: (val) => {
        if (!general.string(val))
            return false
        let split = val.split(' ')
        if (split.length !== 2 || !general.positiveFloat(parseFloat(split[0])) || !split[1] !== 'BLURT')
            return false
        let dec = split[0].split('.')
        if (dec.length !== 2 || dec[1].length !== 3)
            return false
        return true
    },
    basisPoints: hive.specificTypes.basisPoints,
    username: hive.specificTypes.username,
}

// some supported operations to validate
// this is up to the application developers to decide which ones to support
let operations = {
    comment: hive.operations.comment,
    comment_options: {
        author: general.string,
        permlink: general.string,
        max_accepted_payout: specificTypes.asset,
        allow_votes: general.bool,
        allow_curation_rewards: general.bool,
        extensions: general.array
    },
    custom_json: hive.operations.custom_json,
    vote: hive.operations.vote
}

module.exports = {
    validate: (ops) => graphene.validate(operations,ops)
}