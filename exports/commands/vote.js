module.exports = {
  alias: [
    "vote"
  ],
  activated: true,
  name : "Vote",
  desc : "Lancer un vote public ou anonymisé, éventuellement pour kick/ban/turquoise/deturquoise.",
  schema : "!vote <anon|anonyme> <turquoise|kick|ban|deturquoise|> <@>\nou\n!vote <anon|anonyme> <text> (texte)\nou\n!vote (texte)\nou\n!vote <lent|superlent> <on|off>",
  authorizations : TiCu.Authorizations.getAuth("command", "vote"),
  run : function(params, msg) {
    let crop, target
    let channel = msg.channel
    let anon = params[0] === "anon" || params[0] === "anonyme"
    let type = params[1]
    if (anon) {
      if (msg.guild.id === PUB.servers.debug.id) {
        msg.reply("Seuls des votes publics peuvent être lancés sur ce serveur.")
      } else {
        if (params[2]) {target = TiCu.Mention(params[2])}
        else { return TiCu.Log.Error("vote", "les votes anonymes nécessitent une cible", msg)}
        if (type === "kick" || type === "ban" || type === "deturquoise") {
          if (channel.guild.id === PUB.servers.vigi.id) {
            channel = tipoui.channels.resolve(PUB.salons.salleDesVotes.id)
          } else if (channel.id !== PUB.salons.salleDesVotes.id && channel.id !== PUB.salons.automoderation.id && channel.id !== PUB.salons.debug.id) {
            return TiCu.Log.Error("vote", `les votes de kick, ban et deturquoise sont restreints aux salons <#${PUB.salons.automoderation.id}> et <#${PUB.salons.salleDesVotes.id}>`, msg)
          }
        } else if (type === "turquoise") {
          if (channel.guild.id === PUB.servers.vigi.id || channel.id === PUB.salons.plaidoierie.id) {
            channel = tipoui.channels.resolve(PUB.salons.salleDesVotes.id)
          } else if (channel.id !== PUB.salons.salleDesVotes.id && channel.id !== PUB.salons.debug.id) {
            return TiCu.Log.Error("vote", `les votes de passage Turquoise sont restreints au salon <#${PUB.salons.salleDesVotes.id}>`, msg)
          }
        } else if (type !== "text") {return TiCu.Log.Error("vote", "type de vote anonyme invalide", msg)}
        if (typeof target != "object" && type !== "text") {return TiCu.Log.Error("vote", "cible invalide", msg)}
        crop = new RegExp(dev ? /^%vote\s+[^\s]+\s+/ : /^!vote\s+[^\s]+\s+/)
        if (!msg.content.match(crop)) {return TiCu.Log.Error("vote", "paramètres manquants", msg)}
        const msgMatch = msg.content.match(/^!vote\s+anon\s+(text|kick|ban|turquoise|deturquoise)\s+(.+)/s)
        channel.send(`<@&${PUB.roles.vote.id}>`, TiCu.VotesCollections.CreateEmbedAnon(target, type, TiCu.Vote.voteThreshold(type), undefined, undefined, msgMatch ? msgMatch[2] : undefined))
          .then(newMsg => {
            if(TiCu.json(TiCu.Vote.createJsonForAnonVote(target, type, newMsg))) {
              TiCu.Vote.addReactionsToMessage(newMsg)
              TiCu.VotesCollections.Init(type, newMsg)
              TiCu.Log.Commands.Vote.Anon(type, params, newMsg, msg)
              if (type === "kick" || type === "ban" || type === "deturquoise") {
                newMsg.pin()
              }
            } else TiCu.Log.Error("vote", "erreur d'enregistrement du vote", msg)
          })
      }
    } else if(channel.id === PUB.salons.salleDesVotes.id) {
      return TiCu.Log.Error("vote", `seuls les votes anonymisés sont autorisés dans <#${PUB.salons.salleDesVotes.id}>`, msg)
    } else if(params[0] === "lent" || params[0] === "superlent") {
      if (Array.from(tipoui.members.resolve(msg.author.id).roles.cache.values()).filter(e => PUB.roles.turquoise.id === e.id).length > 0) {
        type = params[0] + params[1]
        if (params[1] !== "on" && params[1] !== "off") {
          return TiCu.Log.Error("vote", "les votes 'lent' et 'superlent' nécessitent un second paramètre 'on' ou 'off'", msg)
        }
        channel = msg.channel
        channel.send(TiCu.VotesCollections.CreateEmbedAnon(target, type, TiCu.Vote.voteThreshold(type), undefined, undefined, (params[1] === "on" ? "Passage du salon en mode " : "Retrait du salon en mode ") + params[0]))
               .then(newMsg => {
                 if (TiCu.json(TiCu.Vote.createJsonForAnonVote(target, type, newMsg))) {
                   TiCu.Vote.addReactionsToMessage(newMsg)
                   TiCu.VotesCollections.Init(type, newMsg)
                   TiCu.Log.Commands.Vote.Anon(type, params, newMsg, msg)
                   newMsg.pin()
                 } else TiCu.Log.Error("vote", "erreur d'enregistrement du vote", msg)
               })
      } else {
        TiCu.Log.Error("vote", "les votes 'lent' et 'superlent' sont réservés aux Turquoises", msg)
      }
    } else {
      TiCu.Vote.addReactionsToMessage(msg)
      TiCu.Log.Commands.Vote.Public(msg)
    }
  }
}
