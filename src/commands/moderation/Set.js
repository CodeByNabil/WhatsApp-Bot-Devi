import BaseCommand from '../../libs/BaseCommand.js'

export default class Command extends BaseCommand {
    constructor(client, handler) {
        super(client, handler, {
            command: 'set',
            category: 'moderation',
            description: {
                content: 'Changes the group name/description',
                usage: '[name] --name|| [description/quote] --desc'
            },
            exp: 1
        })
    }

    exec = async (M, { flags, text }) => {
        const keys = Object.keys(flags)
        const content = text || M.quoted?.message?.conversation || ''
        if (!content) return void M.reply('❌ Please provide a text or reply to a message!')
        if (keys.includes('name')) {
            await this.client.groupUpdateSubject(M.from, content.trim())
            await M.reply('✅ Group name updated!')
        } else if (keys.includes('desc')) {
            await this.client.groupUpdateDescription(M.from, content.trim())
            await M.reply('✅ Group description updated!')
        } else return void M.reply('❌ Please use --name or --desc flag!')
    }
}
