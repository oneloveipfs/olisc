const general = require('./general')

let specificTypes = {
    authorTipPercent: (val) => general.positiveInteger(val) && val <= 100,
    username: (val) => {
        if (!general.string(val) || val.length < 1 || val.length > 50) return false
        let allowedUsernameChars = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let allowedUsernameCharsOnlyMiddle = '-.'
        val = val.toLowerCase()
        for (let i = 0; i < val.length; i++) {
            const c = val[i]
            if (allowedUsernameChars.indexOf(c) === -1) 
                if (allowedUsernameCharsOnlyMiddle.indexOf(c) === -1 || i === 0 || i === val.length-1)
                    return false
        }
        return true
    }
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
        author: specificTypes.username,
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
        author: specificTypes.username,
        vt: general.integer,
        tag: general.string,
        tip: specificTypes.authorTipPercent
    }
}

module.exports = {
    validate: (op,user,network) => {
        if (!general.json(op) || !general.positiveInteger(op.type) || !operations[op.type] || !general.json(op.data) || !specificTypes.username(op.sender))
            return false
        if (op.sender !== user || (network !== 'avalon' && network !== 'all'))
            return false
        for (let f in op.data)
            if (!operations[op.type][f] || !operations[op.type][f](op.data[f]))
                return false
        return true
    }
}