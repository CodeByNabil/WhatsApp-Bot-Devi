import { QuickDB } from 'quick.db'
import { MongoDriver } from 'quickmongo'
export default class DatabaseHandler {
    constructor(config, log) {
        this.config = config
        this.log = log
        const url = this.config.mongo
        if (!url) {
            this.log.error('MONGODB_URL is missing, please fill the value!')
            process.exit(1)
        }
        this.url = url
    }

    connect = async () => {
        try {
            const driver = new MongoDriver(this.url)
            await driver.connect()
            this.log.info('Database connection opened!')
            this.log.info('Database connected!')
            
            const database = new QuickDB({ driver }) 

            Object.assign(
                this,
                {
                    command: database.table('command'),
                    group: database.table('guild'),
                    user: database.table('user'),
                    session: database.table('session')
                },
                database
            )

            return { connected: true }
        } catch (err) {
            this.log.error(err)
            return { connected: false }
        }
    }

    getAllUsers = async () => {
        const allData = await this.user.all()
        const users = allData.map((x) => {
            const data = x.value || {}
            return {
                jid: `${x.id}.whatsapp.net`,
                ...data
            }
        })
        return users
    }

    getUserInfo = async (jid) => {
        const isMod = this.config.mods.includes(jid)
        const exp = (await this.user.get(`${jid}.exp`)) ?? 0
        const status = (await this.user.get(`${jid}.status`)) ?? {
            isBan: false,
            reason: ''
        }
        return {
            jid,
            isMod,
            exp,
            status
        }
    }
}
