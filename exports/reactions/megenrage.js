let megenrageFile = "/media/usb/nodejs/tipouitaculte/private/megenrage.json"

module.exports = {
    activated: true,
    methodName: 'megenrage',
    name: "Mégenrage",
    desc: "Envoie un DM à l'auteurice d'un message pour lui signifier qu'iel doit se relire et l'éditer pour éviter un mégenrage intempestif.",
    emoji: "🆔",
    authorizations: TiCu.Authorizations.getAuth("reaction", "megenrage"),
    run: function (reaction, usr, type) {
        if (type === "add") {
            let alreadySignaled
            let directMessage
            let target
            let jsonRead = { "action": "read" }
            jsonRead.target = megenrageFile
            let read = TiCu.json(jsonRead)
            if (read) {
                if (read.list.indexOf(reaction.message.id) >= 0) {
                    alreadySignaled = true
                    // target = reaction.author
                    // reaction(remove)
                    try {
                        target.send("L'auteurice de ce message a déjà été prévenu·e d'un possible mégenrage sur le message que tu as signalé.")
                        directMessage = true
                    } catch {
                        tipoui.channels[PUB.salons.bots.id].send("<@" + target.id + ">, je n'ai pas pu t'envoyer de message privé. Le message que tu as signalé a déjà été traité.")
                        directMessage = false
                    }
                } else {
                    alreadySignaled = false
                    //reaction(remove)
                    messageURL = reaction.message.url
                    target = reaction.message.author
                    read.push(reaction.message.id)
                    //TiCu.json({"action":"write", "content": read})
                    try {
                        target.send("Bonjour.\nL'un de tes messages a été signalé comme comportant une erreur de genrage, merci de le relire pour l'éditer. Si tu ne trouves pas la faute, ou que tu considères qu'il n'y en a pas, signale-le dans le message.\n" + messageURL)
                        directMessage = true
                    } catch {
                        reaction.message.channel("L'un des messages de ce salon a été signalé comme comportant une erreur de genrage et je n'ai pas pu contacter son auteurice directement. Merci de relire vos derniers messages.")
                        directMessage = false
                    }
                }
                TiCu.Log.Reactions.Megenrage(reaction.message, reaction.author.id, alreadySignaled, directMessage)
            } else TiCu.Log.Error("megenrage", "impossible de lire la liste des messages signalés", msg)
        }
    }
}