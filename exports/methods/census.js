function createUpdateEmbed(previousEmbed, newVote = false) {
  const previousFields = previousEmbed ? previousEmbed.fields : undefined
  const embed = new DiscordNPM.MessageEmbed()
  embed.setAuthor("Recensement des votant-e-s")
  embed.setDescription("Vote de recensement des votant·e·s présent·es sur le serveur. Celui-ci sera relancé chaque 28 du mois à 13h12 et retirera le rôle de votant·e aux personnes n'ayant pas répondu ou répondant négativement.")

  const checkFieldName = "✅ : garder ou récupérer le rôle"
  const crossFieldName = "❌ : abandonner le rôle"
  embed.addField(checkFieldName, previousFields ? previousFields[previousFields.findIndex((v) => {return v.name === checkFieldName})].value : 0)
  embed.addField(crossFieldName, previousFields ? previousFields[previousFields.findIndex((v) => {return v.name === crossFieldName})].value : 0)

  const nbVotesName = "Nombre de votant·e·s"
  let nbVotes = previousFields ? previousFields[previousFields.findIndex((v) => {return v.name === nbVotesName})].value : 0
  if (newVote) {
    nbVotes++
  }
  embed.addField(nbVotesName, nbVotes)
  return embed
}

function createCollector(msg) {
  const newCollector = msg.createReactionCollector((reaction, user) => {
    return (!user.bot) && (["✅", "❌"].includes(reaction.emoji.name))
  })
  TiCu.Census.collector = newCollector
  newCollector.on("collect", (reaction) => {
    TiCu.Census.updateCensus(reaction)
  })
  newCollector.on("end", () => {
    TiCu.Census.closeCensus()
  })
}

module.exports = {
  closeCensus : function () {
    const jsonData = {
      action : "read",
      target : CensusFile
    }
    const censusData = TiCu.json(jsonData)
    const voteMembers = tipoui.roles.cache.get(PUB.roles.vote.id).members
    for (const member of voteMembers.array()) {
      if (!censusData.members.includes(member.id)) {
        member.roles.remove(PUB.roles.vote.id).then(() => {
          TiCu.Log.Census(member)
          member.send("Suite à l'absence de réaction sur le vote de recensement, je t'ai enlevé le rôle de votant-e. Tu peux le récupérer simplement en votant sur le prochain vote de recensement.")
        })
      }
    }
    censusData.members = []
    censusData.id = ""
    jsonData.action = "write"
    jsonData.content = censusData
    TiCu.json(jsonData)
  },
  initCensus : function () {
    const jsonData = {
      action : "read",
      target : CensusFile
    }
    const censusData = TiCu.json(jsonData)
    if (censusData.id) {
      tipoui.channels.resolve(PUB.salons.salleDesVotes.id).messages.fetch(censusData.id).then(
        msg => {
          msg.edit(createUpdateEmbed(msg.embeds[0]))
          createCollector(msg)
        }
      )
    } else {
      tipoui.channels.resolve(PUB.salons.salleDesVotes.id).send(`<@&${PUB.roles.vote.id}>`, createUpdateEmbed()).then(
        msg => {
          msg.react("✅")
          msg.react("❌")
          createCollector(msg)
          jsonData.action = "write"
          censusData.id = msg.id
          censusData.members = []
          jsonData.content = censusData
          TiCu.json(jsonData)
          TiCu.Messages.fetchMessageFromUrl("https://discordapp.com/channels/355041348476338182/453706061031931905/714803564609929326", {reply: function(){}}).then(
            editMsg => editMsg.edit(`Le recensement courant pour les votant·e·s est disponible ici : ${msg.url}\nIl permet de conserver son rôle, de le récupérer et de s'en séparer par une simple réaction et sera renouvelé chaque 28 du mois.`).then().catch()
          ).catch()
        }
      )
    }
  },
  updateCensus : function(reaction) {
    const jsonData = {
      action : "read",
      target : CensusFile
    }
    let censusData = TiCu.json(jsonData)
    let msg = reaction.message
    let userId
    for (const id of reaction.users.cache.keyArray()) {
      if (id !== PUB.users.tipouitaculte.id) {
        userId = id
        reaction.remove(userId)
        break
      }
    }
    if (!censusData.members.includes(userId)) {
      TiCu.Census.addUserToData(userId)
      msg.edit(createUpdateEmbed(msg.embeds[0], true))
    }
    if (reaction.emoji.name === "✅") {
      tipoui.members.resolve(userId).then(member => {
        if (!member.roles.cache.get(PUB.roles.vote.id)) {
          member.roles.add(PUB.roles.vote.id).then(() => member.send("Tu as récupéré le rôle de votant·e"))
        }
      })
    } else {
      tipoui.members.resolve(userId).then(member => {
        if (member.roles.cache.get(PUB.roles.vote.id)) {
          member.roles.remove(PUB.roles.vote.id).then(() => member.send("Tu as abandonné le rôle de votant·e"))
        }
      })
    }
  },
  addUserFromId : function(userId) {
    const jsonData = {
      action : "read",
      target : CensusFile
    }
    let censusData = TiCu.json(jsonData)
    let msg = TiCu.Census.collector.message
    if (!censusData.members.includes(userId)) {
      TiCu.Census.addUserToData(userId)
      msg.edit(createUpdateEmbed(msg.embeds[0], true))
    }
    tipoui.members.resolve(userId).then(member => {
      if (!member.roles.cache.get(PUB.roles.vote.id)) {
        member.roles.add(PUB.roles.vote.id).then(() => member.send("Tu as récupéré le rôle de votant·e"))
      }
    })
  },
  addUserToData : function(userId) {
    const jsonData = {
      action : "read",
      target : CensusFile
    }
    let censusData = TiCu.json(jsonData)
    censusData.members.push(userId)
    jsonData.action = "write"
    jsonData.content = censusData
    TiCu.json(jsonData)
  },
  collector : undefined
}
