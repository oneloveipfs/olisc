const Parser = require('body-parser')
const mongo = require('./mongo')
const actions = require('./actions')
const config = require('./config')

let api = {
    authenticator: async (req) => {
        return { user: '', network: '', error: '' }
    },
    init: async (app, appConfig = {}, mongoClientDb = null, authenticator = null) => {
        config.init(appConfig)
        await mongo.init(mongoClientDb)

        if (typeof authenticator === 'function')
            api.authenticator = authenticator

        for (let m in api.methods) {
            let mi = m
            app[api.methods[mi].verb](config.config.apiNamespace+api.methods[mi].method, Parser.json(), async (req,res) => {
                let auth = await api.authenticator(req)
                if (auth.error)
                    return res.status(403).send({error: auth.error})

                let args = []
                api.methods[mi].fields.forEach(field => args.push(req.body[field]))
                let action = await api.methods[mi].action(auth.user,auth.network,...args)
                if (action.error)
                    return res.status(500).send({error: action.error})
                else
                    return res.send(action.result)
            })
        }
    },
    methods: [
        {
            verb: 'post',
            method: '/new',
            fields: ['op','opNetwork'],
            action: actions.new
        },
        {
            verb: 'put',
            method: '/edit',
            fields: ['id','op'],
            action: actions.edit
        },
        {
            verb: 'delete',
            method: '/delete',
            fields: ['id'],
            action: actions.delete
        },
        {
            verb: 'get',
            method: '/get',
            fields: ['id'],
            action: actions.get
        },
        {
            verb: 'get',
            method: '/list',
            fields: [],
            action: actions.list
        }
    ]
}

module.exports = api