const EmbedFactory = require("./EmbedFactory");

module.exports = class Response {
    constructor(message) {
        this.message = message;
        this.embedFactory = new EmbedFactory(this.message.client);
    }

    send(content, embed, bypassRemoval) {
        let selfDestruct = (bypassRemoval || false) ? null : this.getMessageSelfDestructTime(true);
        var checkAutoRemove = (msg) => { if(selfDestruct != null) msg.delete(selfDestruct * 1000) };
        embed = this.modifyEmbedForSelfDestructTime(embed, selfDestruct);
        return embed ?
            this.message.channel.sendMessage(content, { embed }).then(msg => { checkAutoRemove(msg); return msg; }) :
            this.message.channel.sendMessage(content).then(msg => { checkAutoRemove(msg); return msg; });
    }

    edit(message, content, embed, bypassRemoval) {
        let selfDestruct = (bypassRemoval || false) ? null : this.getMessageSelfDestructTime(true);
        var checkAutoRemove = (msg) => { if(selfDestruct != null) msg.delete(selfDestruct * 1000) };
        embed = this.modifyEmbedForSelfDestructTime(embed, selfDestruct);
        return embed ?
            message.edit(content, { embed: embed }).then(msg => { checkAutoRemove(msg); return msg; }) :
            message.edit(content).then(msg => { checkAutoRemove(msg); return msg; });
    }

    reply(content, embed, bypassRemoval) {
        let contentSuffix = content && content != "" ? `: ${content}` : "";
        return this.send(`⦗${this.message.author}⦘${contentSuffix}`, embed, bypassRemoval);
    }

    dm(content, embed) {
        return embed ?
            this.message.author.sendMessage(content, { embed }) :
            this.message.author.sendMessage(content);
    }

    modifyEmbedForSelfDestructTime(embed, selfDestruct) {
        if(embed && selfDestruct != null) {
            if(!embed.footer) embed.footer = {text: ""};
            embed.footer.text = `This message will self-destruct in ${selfDestruct} second${selfDestruct == 1 ? "" : "s"}` + (embed.footer.text != "" ? " · " : "") + embed.footer.text;
        }
        return embed;
    }

    getMessageSelfDestructTime(isForBot) {
        var guildConfig = this.message.guild.getConfig();
        let removeTime = isForBot ? guildConfig.autoRemoveBotMessages : guildConfig.autoRemoveUserCommands;
        if(removeTime != null && removeTime >= 0) return removeTime;
        return null;
    }

};