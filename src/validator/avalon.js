const general = require('./general')

let specificTypes = {
    authorTipPercent: (val) => general.positiveInteger(val) && val <= 100
}

let operations = {
    4: {
        link: general.string,
        pa: general.string,
        pp: general.string,
        json: general.json,
        vt: general.integer,
        tag: general.string
    },
    5: {
        link: general.string,
        author: general.string,
        vt: general.integer,
        tag: general.string
    },
    13: {
        link: general.string,
        pa: general.string,
        pp: general.string,
        json: general.json,
        vt: general.integer,
        tag: general.string,
        burn: general.integer
    },
    19: {
        link: general.string,
        author: general.string,
        vt: general.integer,
        tag: general.string,
        tip: specificTypes.authorTipPercent
    }
}

module.exports = {
    validate: (op) => {
        if (!general.json(op) || !general.positiveInteger(op.type) || !operations[op.type] || !general.json(op.data) || !general.string(op.sender))
            return false
        for (let f in op.data)
            if (!operations[op.type][f] || !operations[op.type][f](op.data[f]))
                return false
        return true
    }
}