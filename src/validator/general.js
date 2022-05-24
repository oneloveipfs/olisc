// General data types
let generalValidator = {
    optional: (validator) => (val) => typeof val === 'undefined' || validator(val),
    string: (val) => typeof val === 'string',
    bool: (val) => typeof val === 'boolean',
    integer: (val) => Number.isInteger(val) && Number.isSafeInteger(val) && val >= Number.MIN_SAFE_INTEGER && val <= Number.MAX_SAFE_INTEGER,
    positiveInteger: (val) => generalValidator.integer(val) && val >= 0,
    float: (val) => typeof val === 'number' && !isNaN(val),
    positiveFloat: (val) => generalValidator.float(val) && val >= 0,
    array: (val) => Array.isArray(val),
    arrayOfStrings: (val) => {
        if (!generalValidator.array(val))
            return false
        for (let i in val)
            if (!generalValidator.string(val[i]))
                return false
        return true
    },
    singleItemArray: (arrayValidator) => (val) => arrayValidator(val) && val.length <= 1,
    json: (val) => typeof val === 'object',
    nonArrayJson: (val) => generalValidator.json(val) && !generalValidator.array(val),
    jsonString: (val) => {
        try {
            JSON.parse(val)
        } catch { return false }
        return true
    }
}

module.exports = generalValidator