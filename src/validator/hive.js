const general = require('./general')
const graphene = require('./graphene')

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
    basisPoints: (val) => general.integer(val) && val <= 10000 && val >= -10000,
    basisPointsOnlyPositive: (val) => general.positiveInteger(val) && val <= 10000,
    username: (val) => {
        if (!general.string(val) || val.length < 3 || val.length > 16)
            return false
        let ref = val.split(".")
        for (let i = 0; i < ref.length; i++)
            if (!/^[a-z]/.test(ref[i]) || !/^[a-z0-9-]*$/.test(ref[i]) || /--/.test(ref[i]) || !/[a-z0-9]$/.test(ref[i]) || ref[i].length < 3)
                return false
        return true
    },
    arrayOfUsernames: (val) => {
        if (!general.arrayOfStrings(val))
            return false
        for (let i in val)
            if (!specificTypes.username(val[i]))
                return false
        return true
    }
}

// some supported operations to validate
// this is up to the application developers to decide which ones to support
let operations = {
    comment: {
        parent_author: general.string,
        parent_permlink: general.string,
        category: general.optional(general.string),
        author: specificTypes.username,
        permlink: general.string,
        title: general.string,
        body: general.string,
        json_metadata: general.jsonString
    },
    comment_options: {
        author: specificTypes.username,
        permlink: general.string,
        max_accepted_payout: specificTypes.asset,
        percent_hbd: specificTypes.basisPointsOnlyPositive,
        allow_votes: general.bool,
        allow_curation_rewards: general.bool,
        extensions: general.array
    },
    custom_json: {
        required_auths: general.singleItemArray(specificTypes.arrayOfUsernames),
        required_posting_auths: general.singleItemArray(specificTypes.arrayOfUsernames),
        id: general.string,
        json: general.jsonString
    },
    vote: {
        voter: specificTypes.username,
        author: specificTypes.username,
        permlink: general.string,
        weight: specificTypes.basisPoints
    }
}

module.exports = {
    validate: (ops,user,network) => graphene.validate('hive',operations,ops,user,network),
    specificTypes,
    operations
}