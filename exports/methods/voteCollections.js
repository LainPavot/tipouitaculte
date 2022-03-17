const fs = require("fs")
const emojiTable = {};
emojiTable[VotesEmojis[0]] = "oui";
emojiTable[VotesEmojis[1]] = "blanc";
emojiTable[VotesEmojis[2]] = "non";
emojiTable[VotesEmojis[3]] = "delai";

const results = {
  oui: "Proposition validée",
  non: "Proposition rejetée",
  delai: "Proposition ajournée"
}

function filterReactions(expectedEmojis) {
  return (reaction, user) => {return (!user.bot) && (expectedEmojis.includes(reaction.emoji.name))}
}

function checkThreshold(vote, collector) {
  if (vote.threshold === -1) {
    return false
  }
  switch (vote.type) {
    case "ban":
    case "kick":
    case "text":
    case "deturquoise":
    case "lenton":
    case "superlenton":
    case "lentoff":
    case "superlentoff":
      if (vote.votes.oui.length >= vote.threshold) {
        collector.stop("oui")
      }
      break
    case "turquoise":
      let nbVotes = 0
      for (const votes of Object.values(vote.votes)) {
        nbVotes += votes.length
      }
      if (nbVotes >= vote.threshold) {
        const nbVotesDelay = vote.votes.delai.length
        if (nbVotesDelay >= nbVotes) {
          collector.stop("delai")
        } else if ((vote.votes.oui.length + (vote.votes.blanc.length + nbVotesDelay)/2) / nbVotes >= 0.75) {
          collector.stop("oui")
        } else {
          collector.stop("non")
        }
      }
      break
    default:
      if (vote.votes.oui.length >= vote.threshold) {
        collector.stop("oui")
      } else if (vote.votes.non.length >= vote.threshold) {
        collector.stop("non")
      } else if (vote.votes.delai.length >= vote.threshold) {
        collector.stop("delai")
      }
  }
}

function updateVotes(reaction, collector) {
  if (VotesProps.indexOf(reaction.emoji.name) !== -1) {
    for (const devId of devTeam) {
      if (reaction.users.cache.keyArray().indexOf(devId) !== -1) {
        collector.stop(reaction.emoji.name === VotesProps[0] ? "oui" : "non")
      }
    }
    reaction.users.remove(reaction.users.cache.keyArray()[0])
  } else {
    let votesJSON = JSON.parse(fs.readFileSync(VotesFile))
    let msg = reaction.message
    let userId
    for (const id of reaction.users.cache.keyArray()) {
      if (id !== PUB.users.tipouitaculte.id) {
        userId = id
        reaction.users.remove(userId)
        break
      }
    }
    const hashedId = hash(userId)
    let alreadyVoted
    for (const emojiType of Object.values(emojiTable)) {
      if (votesJSON[msg.id].votes[emojiType].includes(hashedId)) {
        alreadyVoted = emojiType
      }
    }
    if (alreadyVoted) {
      votesJSON[msg.id].votes[alreadyVoted].splice(
        votesJSON[msg.id].votes[alreadyVoted].indexOf(hashedId),
        1
      )
    }
    votesJSON[msg.id].votes[emojiTable[reaction.emoji.name]].push(hashedId)
    if (votesJSON[msg.id].type === "turquoise" && emojiTable[reaction.emoji.name] !== alreadyVoted) {
      if (emojiTable[reaction.emoji.name] === "delai") {
        votesJSON[msg.id].threshold++
      } else if (alreadyVoted === "delai") {
        votesJSON[msg.id].threshold--
      }
    }
    fs.writeFileSync(VotesFile, JSON.stringify(votesJSON, null, 2))
    reaction.message.edit(
      updateEmbed(
        TiCu.VotesCollections.CreateEmbedAnon(
          tipoui.members.resolve(votesJSON[msg.id].target),
          votesJSON[msg.id].type,
          votesJSON[msg.id].threshold,
          votesJSON[msg.id]
        ),
        msg
      )
    )
    checkThreshold(votesJSON[msg.id], collector)
    TiCu.Log.VoteUpdate(userId, emojiTable[reaction.emoji.name], alreadyVoted, msg)
  }
}

function createCollector(type, msg) {
  TiCu.VotesCollections.Collectors[msg.id] = msg.createReactionCollector(filterReactions(type === "prop" ? VotesEmojis.concat(VotesProps) : VotesEmojis));
  TiCu.VotesCollections.Collectors[msg.id].on("collect", (reaction, user) =>
    TiCu.VotesCollections.Collected(type, reaction, TiCu.VotesCollections.Collectors[msg.id]))
  TiCu.VotesCollections.Collectors[msg.id].on("end", (reactions, reason)  =>
    TiCu.VotesCollections.Done(type, reactions, reason, msg))
  TiCu.Log.VoteCollector(msg)
}

function first(indexes) {
  let res = [undefined, 7000]
  for (const emoji of Object.keys(indexes)) {
    if (indexes[emoji] < res[1]) {
      res = [emoji, indexes[emoji]]
    }
  }
  return res
}

function parseToDesc(voteDesc) {
  const indexes = {}
  for (const emoji of VotesEmojis) {
    const aux = voteDesc.indexOf(emoji)
    if (aux !== -1) {
      indexes[emoji] = aux
    }
  }
  let indexTab = []
  let length = Object.keys(indexes).length
  while(length > 0) {
    const aux = first(indexes)
    indexTab.push(aux)
    delete indexes[aux[0]]
    length--
  }
  return indexTab
}

function updateEmbed(embed, msg) {
  if (msg.embeds[0].description) {
    embed.setDescription(msg.embeds[0].description)
  }
  for (const emoji of VotesEmojis) {
    const aux = msg.embeds[0].fields.findIndex((v) => {return v.name.indexOf(emoji) !== -1})
    if (aux !== -1) {
      embed.fields[embed.fields.findIndex((v) => {return v.name === `${emoji} : ${emojiTable[emoji]}`})].name = msg.embeds[0].fields[aux].name
    }
  }
  return embed
}

module.exports = {
  Init : (type, msg) => {
    createCollector(type, msg)
  },
  Startup : () => {
    console.log(VotesFile)
    let votesJSON ;
    if (!fs.existsSync(VotesFile)) {
      console.log(`The vote file has not been found on ${VotesFile}. Creating it.`) ;
      fs.writeFileSync(VotesFile, "[]", { flag: 'w' }, err => {})
      votesJSON = [] ;
    } else {
      votesJSON = JSON.parse(fs.readFileSync(VotesFile).toString());
    }
    for (const [id, entry] of Object.entries(votesJSON)) {
      if (typeof entry === "object") {
        var target = (entry.guild ? Discord.guilds.resolve(entry.guild) : tipoui) ;
        target.channels
          .resolve(entry.chan)
          .messages.fetch(id)
          .then(msg => {
            createCollector(entry.type, msg);
          })
        ;
      }
    }
  },
  Collectors : {},
  Collected : (type, reaction, collector) => {
      updateVotes(reaction, collector)
  },
  Done : (type, reactions, reason, msg) => {
    let votesJSON = JSON.parse(fs.readFileSync(VotesFile))
    let target = votesJSON[msg.id].target
    if (reason === "oui") {
      switch (type) {
        case "ban":
          TiCu.Log.VoteDone(reason, type, msg, target)
          tipoui.members.resolve(target).ban().then()
          break
        case "kick":
          TiCu.Log.VoteDone(reason, type, msg, target)
          tipoui.members.resolve(target).kick().then()
          break
        case "turquoise":
          tipoui.members.resolve(target).roles.add([PUB.roles.turquoise.id, PUB.roles.turquoiseColor.id])
            .then(() => {
              TiCu.Log.VoteDone(reason, type, msg, target)
              TiCu.Census.addUserToData(target)
            })
          break
        case "deturquoise":
          tipoui.members.resolve(target).roles.remove([PUB.roles.turquoise.id, PUB.roles.turquoiseColor.id, PUB.roles.vote.id])
                .then(() => {
                  TiCu.Log.VoteDone(reason, type, msg, target)
                })
          break
        case "lenton":
          msg.channel.setRateLimitPerUser(60).then(() => {
            msg.channel.send(`Le mode lent a été activé par la communauté sur ce salon`)
            TiCu.Log.VoteDone(reason, type, msg, target)
          })
          break;
        case "superlenton":
          msg.channel.setRateLimitPerUser(30 * 60).then(() => {
            msg.channel.send(`Le mode superlent a été activé par la communauté sur ce salon`)
            TiCu.Log.VoteDone(reason, type, msg, target)
          })
          break;
        case "lentoff":
          msg.channel.setRateLimitPerUser(0).then(() => {
            msg.channel.send(`Le mode lent a été désactivé par la communauté sur ce salon`)
            TiCu.Log.VoteDone(reason, type, msg, target)
          })
          break;
        case "superlentoff":
          msg.channel.setRateLimitPerUser(0).then(() => {
            msg.channel.send(`Le mode superlent a été désactivé par la communauté sur ce salon`)
            TiCu.Log.VoteDone(reason, type, msg, target)
          })
          break;
        case "text":
        case "prop":
        default:
          TiCu.Log.VoteDone(reason, type, msg)
          break
      }
    } else {
      TiCu.Log.VoteDone(reason, type, msg, target)
    }
    msg.edit(
      updateEmbed(
        TiCu.VotesCollections.CreateEmbedAnon(
          tipoui.members.resolve(votesJSON[msg.id].target),
          votesJSON[msg.id].type,
          votesJSON[msg.id].threshold,
          votesJSON[msg.id],
          results[reason]
        ),
        msg
      )
    )
    delete votesJSON[msg.id]
    fs.writeFileSync(VotesFile, JSON.stringify(votesJSON, null, 2))
    msg.reactions.removeAll()
    msg.unpin().then().catch()
  },
  CreateEmbedAnon: (target, type, threshold, voteJson = undefined, result = undefined, description = undefined) => {
    let nbVotes = 0
    let indexTab = []
    if (voteJson !== undefined) {
      for (const votes of Object.values(voteJson.votes)) {
        nbVotes += votes.length
      }
    }
    const embed = new DiscordNPM.MessageEmbed()
    if (target) {
      embed.setAuthor(`Vote ${type === "auto" ? "automatique " : "" }de ${type === "turquoise" || type === "auto" ? "passage" : ""} ${type === "auto" ? "TURQUOISE" : type.toUpperCase()} pour ${target.displayName}`, target.user.avatarURL)
      embed.setColor(target.displayColor)
    } else {
      embed.setAuthor(type === "text" ? `Vote Anonyme` : "Proposition anonyme")
      if (description) {
        indexTab = parseToDesc(description)
        embed.setDescription(description.substr(0, indexTab[0] ? indexTab[0][1]-1 : description.length))
        for (const emoji of VotesEmojis) {
          const aux = indexTab.findIndex((v) => {return v[0] === emoji})
          let desc = `${emoji} : ${emojiTable[emoji]}`
          if (aux !== -1) {
            if (aux === indexTab.length-1) {
              desc = description.substr(indexTab[aux][1])
            } else {
              desc = description.substr(indexTab[aux][1], indexTab[aux+1][1]-indexTab[aux][1])
            }
          }
          embed.addField(desc, voteJson !== undefined ? voteJson.votes[emojiTable[emoji]].length : 0, emoji !== VotesEmojis[3])
        }
      }
    }
    if (embed.fields.length === 0) {
      if (target && type === "turquoise") {
        embed.addField("Cible", "<@" + target.id + ">")
      }
      for (const emoji of VotesEmojis) {
        embed.addField(`${emoji} : ${emojiTable[emoji]}`, voteJson !== undefined ? voteJson.votes[emojiTable[emoji]].length : 0, emoji !== VotesEmojis[3])
      }
    }
    embed.addField("Votes nécessaires", threshold === -1 ? 'Vote sans limite' : threshold, true)
    embed.addField("Votes actuels", nbVotes, true)
    if (result !== undefined) {
      embed.addField("Résultat du vote", result)
    }
    return embed
  }
}
