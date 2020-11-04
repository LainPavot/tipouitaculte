const fs = require("fs")
let colorRole = new RegExp(/^#[\da-f]+$/)
let quarantaineFile = "/media/usb/nodejs/tipouitaculte/private/quarantaine.json"

module.exports = {
  alias: [
    "quarantaine"
  ],
  activated: true,
  name : "Quarantaine",
  desc : "Mettre ou retirer eun membre de la quarantaine, afin de régler des problèmes en privé, ou vérifier son statut de quarantaine.",
  schema : "!quarantaine <@> <+|ajouter|add> (raison)\nou\n!quarantaine <@> <-|enlever|retirer|supprimer|remove> (raison)\nou\n!quarantaine <target> <statut|status>",
  authorizations : TiCu.Authorizations.getAuth("command", "quarantaine"),
  run : function(params, msg) {
    let crop = new RegExp(/^(!quarantaine\s+[^\s]+\s+[^\s]+\s+)/)
    let action = params[1]
    let target
    if(TiCu.Mention(params[0])) {target = TiCu.Mention(params[0])} else return TiCu.Log.Error("quarantaine", "cible invalide", msg)
    let reason = !!params[2]
    if(reason) {reason = msg.content.substring(msg.content.match(crop)[1].length)}
    switch(action) {
      case "+":
      case "ajouter":
      case "add":
        if(!(target.roles.cache.get(PUB.roles.quarantaineRole.id))) {
          msg.reply(`voulez-vous mettre <@${target.id}> en quarantaine ?`)
            .then(newMsg => {
              newMsg
              .react("👍")
              .then(() => newMsg.react("👎"))
              .then(() => {
                let filter = (reaction, user) => {return (user.id === msg.author.id)}
                newMsg
                  .awaitReactions(filter, { max: 1, time: 10000, errors: ["time"] })
                  .then(collected => {
                    const reaction = collected.firstKey();
                    if (reaction === "👍") {
                      let roles = []
                      target.roles.array().forEach((role) => {if(!(role.name.match(colorRole) || role.name === "@everyone" || role.name === "@here" || role.id === PUB.roles.nso.id)) {roles.push(role.id)}})
                      let json = {"action": "write","content": {}}
                      json.target = quarantaineFile
                      json.content[target.id] = {"roles": roles}
                      json.content[target.id].date = TiCu.Date("fr")
                      if(TiCu.json(json)) {
                        try {
                          target.roles.add(PUB.roles.quarantaineRole.id)
                          target.roles.removes(roles)
                            .then(() => TiCu.Log.Commands.Quarantaine(true, target, reason, msg))
                        } catch (error) {TiCu.Log.Error("quarantaine", "erreur de modification des rôles", msg)}
                      } else TiCu.Log.Error("quarantaine", "impossible d'enregistrer les rôles actuels", msg)
                    } else {
                      return TiCu.Log.Error("quarantaine", "annulation", msg)
                    }
                  })
                  .catch(collected => {
                    if (!collected) Event.emit("cancelAwait", "quarantaine", target)
                  })
              })
            })
        } else return TiCu.Log.Error("quarantaine", "cible déjà en quarantaine", msg)
        break
      case "-":
      case "enlever":
      case "retirer":
      case "supprimer":
      case "remove":
        if((target.roles.cache.get(PUB.roles.quarantaineRole.id))) {
          msg.reply(`voulez-vous sortir <@${target.id}> de quarantaine ?`)
            .then(newMsg => {
              newMsg
                .react("👍")
                .then(() => newMsg.react("👎"))
                .then(() => {
                  let filter = (reaction, user) => {return (user.id === msg.author.id)}
                  newMsg
                    .awaitReactions(filter, { max: 1, time: 10000, errors: ["time"] })
                    .then(collected => {
                      const reaction = collected.firstKey();
                      if (reaction === "👍") {
                        let jsonRead = {"action": "read"}
                        jsonRead.target =  quarantaineFile
                        let read = TiCu.json(jsonRead)
                        let jsonRemove = {"action": "delete"}
                        jsonRemove.target = quarantaineFile
                        jsonRemove.content = target.id
                        if(read) {
                          if(TiCu.json(jsonRemove)) {
                            try {
                              target.roles.remove(PUB.roles.quarantaineRole.id)
                              target.roles.add(read[target.id].roles)
                                .then(() => TiCu.Log.Commands.Quarantaine(false, target, reason, msg))
                            } catch (error) {TiCu.Log.Error("quarantaine", "erreur de modification des rôles")}
                          } else TiCu.Log.Error("quarantaine", "erreur de suppression des données de quarantaine", msg)
                        } else TiCu.Log.Error("quarantaine", "impossible de récupérer les rôles passés", msg)
                      } else {
                        return TiCu.Log.Error("quarantaine", "annulation", msg)
                      }
                    })
                    .catch(collected => {
                      if (!collected) Event.emit("cancelAwait", "quarantaine", target)
                    })
                })
            })
        } else return TiCu.Log.Error("quarantaine", "cible pas en quarantaine", msg)
        break
      case "statut":
      case "status":
        return msg.reply(`<@${target.id}> ${!(target.roles.cache.get(PUB.roles.quarantaineRole.id)) ? "est" : "n'est pas"} en quarantaine.`)
      default:
        return TiCu.Commands.help.run([this.alias[0], "action non reconnue"], msg)
      }
  }
}
