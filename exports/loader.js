// Init
const EXPRESS = require("express")
const EventsModule = require("events")
const fs = require("fs")
const cron = require('node-cron')
const crypto = require('crypto');
const _ = require('lodash');
const {MessageAttachment} = require("discord.js");

const helpText = `
Paramètres de index.js :
   --help, -h : Affiche cette aide
   --dev, -d : Enclenche le mode développement (désactivation de la majorité des fonctionnalités)
   --config, -c : Lit le fichier passé en valeur de paramètre et l'utilise pour l'activation/désactivation des fonctionnalités pour le mode dev
`

function parseForAutoCommands(msg) {
  for (const autoCommand of Object.values(TiCu.Auto)) {
    if (!!msg.content.match(autoCommand.trigger) && TiCu.Authorizations.Auto(autoCommand, msg)) {
      autoCommand.run(msg)
    }
  }
}

function createEmbedCopy(msg, user, edited = false, previousContent) {
  let embed = new DiscordNPM.MessageEmbed()
    .setColor(user.displayColor)
    .setAuthor(user.displayName, user.user.avatarURL, msg.url)
    .setDescription(edited ? previousContent : msg.content)
    .setTimestamp()
  if (msg.channel.id !== PUB.salons.invite.id) {
    embed.addField("Utilisateurice", `<@${user.id}>`)
      .addField("Identifiant", user.id)
  }
  if (edited) {
    embed.addField("Nouveau contenu du message", msg.content)
  }
  if (msg.attachments) {
    let attachments = Array.from(msg.attachments.values())
    for(let i=0;i<attachments.length;i++){
      embed.addField("Pièce-jointe URL #" + i, attachments[i].url)
      embed.addField("Pièce-jointe ProxyURL #" + i, attachments[i].proxyURL)
    }
  }
  return embed
}

function getMessageFromServ(serv, originMsg, channel) {
  const chan = serv.channels.resolve(channel)
  if (chan) {
    return chan.messages.cache.find(
      msg => msg.author.bot && msg.embeds && msg.embeds[0].author.url === originMsg.url
    )
  } else {
    return undefined
  }
}

function retrieveMessageForEdit(originMsg, channel) {
  const tipouiMsg = getMessageFromServ(tipoui, originMsg, channel)
  return tipouiMsg ? tipouiMsg : getMessageFromServ(vigi, originMsg, channel)
}

function parseCommandLineArgs() {
  const configRegEx = /^(-c|--config)=(([A-Z]:\\|\/)?([^\/\s\\]+[\/\\])*[^\/\s\\]+\.json)$/
  const absolutePathRegEx = /^([A-Z]:\\|\/)/
  global.devConfig = undefined
  global.dev = false
  process.argv.slice(2) // Remove first two arguments from command line (which should be node and index.js)
  process.argv.forEach((value, index) => {
    let configFileName = ""
    switch(true) { //Switching on value but... hey, needed regExp ^^
      case value === "--dev":
      case value === "-d":
        global.dev = true
        break
      case value === "--help":
      case value === "-h":
        console.log(helpText)
        process.exit(0) //exit the node process if help was called
        break
      case value === "-c":
      case value === "--config":
        configFileName = process.argv[index+1]
        if (configFileName && fs.existsSync(configFileName)) {
          devConfig = require(`${!!configFileName.match(absolutePathRegEx) ? "" : "../"}${configFileName}`)
        }
        break
      case !!value.match(configRegEx):
        configFileName = value.match(configRegEx)[2]
        if (configFileName && fs.existsSync(configFileName)) {
          devConfig = require(`${!!configFileName.match(absolutePathRegEx) ? "" : "../"}${configFileName}`)
        }
        break
    }
  })
}

function parseAndRunCommand(msg) {
  let params = []
  let rawParams = []
  msg.content.substring(1).match(/([^\\\s]?["][^"]+[^\\]["]|[^\s]+)/g).forEach(value => {
    if (value[0] === '"') {
      rawParams.push(value.substr(1, value.length-2))
      params.push(value.substr(1, value.length-2).toLowerCase())
    } else {
      rawParams.push(value.replace(/\\/g, ""))
      params.push(value.replace(/\\/g, "").toLowerCase())
    }
  })
  let cmd = params.shift()
  rawParams.shift()
  TiCu.Commands[cmd] ? TiCu.Authorizations.Command(cmd, msg) ? TiCu.Commands[cmd].run(params, msg, rawParams) : TiCu.Log.Error(cmd, "permissions manquantes", msg) : msg.react("❓")
}

module.exports = {
  loadFull: function(rootPath) {
    parseCommandLineArgs()
    this.loadInit()
    this.loadTicu(rootPath)
    this.loadParsing()
  },
  loadInit: function() {
    global.DAY = 24 * 60 * 60 * 1000
    cron.schedule("0 30 2 * * *", () => {
      TiCu.Purger.purgeChannels([PUB.salons.invite.id], 7*DAY)
    })
    cron.schedule("0 30 3 * * *", () => {
      TiCu.Purger.purgeChannels(PUB.salonsEphemeres.slice())
    })
    cron.schedule("0 30 6 * * *", () => {
      TiCu.Purger.purgeChannels(PUB.salonsEphemeresCdC.slice(), 7*DAY)
    })
    cron.schedule("0 30 8 * * *", () => {
      TiCu.NewMembers.notificationAndKick()
    })
    cron.schedule("0 10 13 28 * *", () => {
      if (TiCu.Census.collector) {
        TiCu.Census.collector.stop()
      }
    })
    cron.schedule("0 12 13 28 * *", () => {
      TiCu.Census.initCensus()
    })
    global.CFG = require("../cfg/private.json")
    global.Server = EXPRESS()
    global.https = require('https')
    global.SequelizeDB = require("sequelize")
    global.DB = new SequelizeDB(CFG.sequelizeURL, {logging: false})
    global.DiscordNPM = require("discord.js")
    global.bignum = require('bignum')
    global._ = require('lodash')
    const intentFlags = DiscordNPM.Intents.FLAGS
    global.Discord = new DiscordNPM.Client({
      fetchAllMembers: true,
      intents: [
        intentFlags.GUILDS,
        intentFlags.GUILD_MEMBERS,
        intentFlags.GUILD_MESSAGES,
        intentFlags.GUILD_MESSAGE_REACTIONS,
        intentFlags.DIRECT_MESSAGES,
        intentFlags.DIRECT_MESSAGE_REACTIONS
      ]
    })
    global.Event = new EventsModule.EventEmitter()
    global.VotesFile = "private/votes.json"
    global.KickedFile = "private/kicked.json"
    global.ReturnFile = "private/return.json"
    global.CensusFile = "private/census.json"
    global.AlertingFile = "private/alerting.json"
    global.VotesEmojis = ["✅","⚪","🛑","⏱"]
    global.VotesProps = ["👍", "👎"]
    global.activeInvite = true
    global.colorHexa = new RegExp(/^#[\da-f]{6}$/)
    global.maxReturnTime = 30 * 24 * 60 * 60 * 1000 // 30 jours
    global.hash = (txt) => { return crypto.createHmac("sha256", CFG.expressSalt).update(txt).digest("hex") }
    global.pluralKitWebHookId = "641374991115485184"
    global.DISCORD_EPOCH = 1420070400000
  },
  loadTicu: function(rootPath) {
    global.PUB = require("../cfg/public.json")
    global.devTeam = []
    Object.values(PUB.users).forEach(value => {
      if (value.dev) {
        devTeam.push(value.id)
      }
    })
    global.devTeam = devTeam.concat(CFG.vigiIds)
    global.authorizations = {
      auto: require("../cfg/authorizations/auto"),
      command: require("../cfg/authorizations/commands"),
      reaction: require("../cfg/authorizations/reactions"),
    }
    global.TiCu = {
      Date : require("../exports/methods/date.js"),
      Log : require("../exports/methods/log.js"),
      json : require("../exports/methods/json.js"),
      Xp : require("../exports/methods/xp.js"),
      Mention : require("../exports/methods/mention.js"),
      Authorizations : require("../exports/methods/authorizations.js"),
      VotesCollections : require("../exports/methods/voteCollections.js"),
      Categories : require("../exports/methods/categories.js"),
      Channels : require("../exports/methods/channels.js"),
      Vote : require("../exports/methods/vote.js"),
      Profil : require("../exports/methods/profil.js"),
      Census : require("../exports/methods/census.js"),
      Messages : require("../exports/methods/messages.js"),
      DiscordApi : require("../exports/methods/discordApi.js"),
      Purger : require("../exports/methods/purger.js"),
      Alerte : require("../exports/methods/alerte.js"),
      Quizz : require("../exports/methods/quizz.js"),
      NewMembers : require("../exports/methods/newMembers.js"),
      DM : require("../exports/methods/dm.js"),
      Commands : {},
      Reactions : {},
      Auto : {},
      AutoGames: {}
    }

    const commandFiles = fs.readdirSync(rootPath + "exports/commands/");
    for (const command of commandFiles) {
      const aux = require("../exports/commands/" + command)
      if (aux.alias && aux.activated) {
        for (const aliasCmd of aux.alias) {
          if (!dev || (dev && devConfig && devConfig.ticuCommands && devConfig.ticuCommands[aliasCmd])) {
            TiCu.Commands[aliasCmd] = aux
          }
        }
      }
    }

    const reactionFiles = fs.readdirSync(rootPath + "exports/reactions/");
    for (const reaction of reactionFiles) {
      const aux = require("../exports/reactions/" + reaction)
      if (aux.methodName && aux.activated) {
        if (!dev || (dev && devConfig && devConfig.ticuReactions && devConfig.ticuReactions[aux.methodName])) {
          TiCu.Reactions[aux.methodName] = aux
        }
      }
    }

    const autoFiles = fs.readdirSync(rootPath + "exports/auto/");
    for (const auto of autoFiles) {
      const aux = require("../exports/auto/" + auto)
      if (aux.methodName && aux.activated) {
        if (!dev || (dev && devConfig && devConfig.ticuAuto && devConfig.ticuAuto[aux.methodName])) {
          TiCu.Auto[aux.methodName] = aux
        }
      }
    }

    const autoGamesFiles = fs.readdirSync(rootPath + "exports/autoGames/");
    for (const autoGame of autoGamesFiles) {
      if (autoGame !== "images") {
        const aux = require("../exports/autoGames/" + autoGame)
        if (aux.methodName && aux.activated) {
          if (!dev || (dev && devConfig && devConfig.ticuAutoGames && devConfig.ticuAutoGames[aux.methodName])) {
            TiCu.AutoGames[aux.methodName] = aux
          }
        }
      }
    }
    if (global.tipoui) {
      this.launchGames()
    }
  },
  loadParsing: function() {
    global.cmdRegex = dev ? /^%[a-zA-Z]/ : /^![a-zA-Z]/  //change the call character for TTC
    global.parseMessage = (msg) => {
      TiCu.Xp.processXpFromMessage("add", msg)
      if (msg.author.bot) {
        return ;
      }
      if(msg.channel.type === "dm" ) {
        let user = tipoui.members.resolve(msg.author.id) ? tipoui.members.resolve(msg.author.id) : undefined
        if(user) {
          if(!user.roles.cache.find(e => e.id === PUB.roles.quarantaineRole.id)) {
            if(msg.content.match(cmdRegex)) {
              parseAndRunCommand(msg)
            } else {
              let embed = createEmbedCopy(msg, user)
              vigi.channels.resolve(PUB.salons.dmVigiServ.id).send(embed)
                .then(() => TiCu.Log.DM(embed, msg))
            }
          } else {
            msg.reply("utilise plutôt <#" + PUB.salons.quarantaineUser.id + "> s'il te plaît. Ce message n'a pas été transmis.")
          }
        } else {
          msg.reply("je ne parle qu'aux gens de Tipoui ♥")
        }
      } else if(msg.channel.id === PUB.salons.quarantaineUser.id || msg.channel.id === PUB.salons.quarantaineVigiServ.id) {
        if(msg.channel.id === PUB.salons.quarantaineUser.id) {
          let user = msg.member
          vigi.channels.resolve(PUB.salons.quarantaineVigiServ.id).send(createEmbedCopy(msg, user))
            .then(newMsg => TiCu.Log.Quarantaine("reçu", newMsg, msg))
        } else if(msg.channel.id === PUB.salons.quarantaineVigiServ.id) {
          tipoui.channels.resolve(PUB.salons.quarantaineUser.id).send(msg.content)
            .then(newMsg => TiCu.Log.Quarantaine("envoyé", newMsg, msg))
        }
      } else if(msg.channel.id === PUB.salons.invite.id) {
        if(msg.content.match(cmdRegex)) {
          parseAndRunCommand(msg)
        }
        tipoui.channels.resolve(PUB.salons.inviteArchive.id).send(createEmbedCopy(msg, msg.member)).then().catch()
      } else if (msg.channel.id === PUB.salons.chaudron.id) {
        let messageRepostAttachments = []
        if (msg.attachments.size > 0) {
          let attachments = Array.from(msg.attachments.values())
          for (let i=0; i < attachments.length; i++) {
            messageRepostAttachments.push(new MessageAttachment(attachments[i].attachment))
          }
          tipoui.channels
            .resolve(PUB.salons.photoChaudron.id)
            .send("<@"+msg.member.id+">\n"+msg.content, messageRepostAttachments)
            .then(newMsg => (
              tipoui.channels
              .resolve(PUB.salons.chaudron.id)
              .send("Auteurice : <@"+msg.member.id+">\nContenu d'origine du message : \"" + msg.content + "\"\nImages : " + newMsg.url)
              .then(() => {msg.delete()}).catch()
            ))
            .catch()
          ;
        } else if(msg.content.match(cmdRegex)) {
          parseAndRunCommand(msg)
        }
      } else if(msg.content.match(cmdRegex)) {
        parseAndRunCommand(msg)
      } else {
        parseForAutoCommands(msg)
      }
    }

    global.parseMessageDelete = (msg) => {
      if (msg.channel.type !== "dm" && msg.guild.id === PUB.servers.commu.id) {
        if (!PUB.salonsEphemeres.includes(msg.channel.id)) {
          TiCu.Xp.processXpFromMessage("remove", msg)
        } else {
          if (msg.timestamp > Date.now() - 89*24*60*60*1000) {
            TiCu.Xp.processXpFromMessage("remove", msg)
          }
        }
      }
    }

    global.parseMessageUpdate = (oldMsg, newMsg) => {
      TiCu.Xp.processXpMessageUpdate(oldMsg, newMsg)
      if(!oldMsg.author.bot) {
        if(newMsg.channel.type === "dm" ) {
          if(!oldMsg.content.match(cmdRegex)) {
            let user = tipoui.members.resolve(newMsg.author.id) ? tipoui.members.resolve(newMsg.author.id) : undefined
            if (user) {
              if (!user.roles.cache.find(e => e.id === PUB.roles.quarantaineRole.id)) {
                const previousBotEmbed = retrieveMessageForEdit(oldMsg, PUB.salons.dmVigiServ.id)
                if (previousBotEmbed) {
                  let embed = createEmbedCopy(newMsg, user, true, previousBotEmbed.embeds[0].description)
                  previousBotEmbed.edit(embed).then(() => TiCu.Log.UpdatedDM(embed, newMsg))
                } else TiCu.Log.UpdatedDM(undefined, newMsg, "Could not find previous bot message to update")
              }
            }
          }
        } else if(newMsg.channel.id === PUB.salons.quarantaineUser.id || newMsg.channel.id === PUB.salons.quarantaineVigiServ.id) {
          if (newMsg.channel.id === PUB.salons.quarantaineUser.id) {
            const previousBotEmbed = retrieveMessageForEdit(oldMsg, PUB.salons.quarantaineVigiServ.id)
            if (previousBotEmbed) {
              let embed = createEmbedCopy(newMsg, newMsg.member, true, previousBotEmbed.embeds[0].description)
              previousBotEmbed.edit(embed).then(msgEdited => TiCu.Log.UpdatedQuarantaine("reçu", msgEdited, newMsg))
            } else TiCu.Log.UpdatedQuarantaine("reçu", undefined, newMsg, "Could not find previous bot message to update")
          } else if(newMsg.channel.id === PUB.salons.quarantaineVigiServ.id) {
            const previousBotEmbed = retrieveMessageForEdit(oldMsg, PUB.salons.quarantaineUser.id)
            if (previousBotEmbed) {
              let embed = createEmbedCopy(newMsg, newMsg.member, true, previousBotEmbed.embeds[0].description)
              previousBotEmbed.edit(embed).then(msgEdited => TiCu.Log.UpdatedQuarantaine("envoyé", msgEdited, newMsg))
            } else TiCu.Log.UpdatedQuarantaine("envoyé", undefined, newMsg, "Could not find previous bot message to update")
          }
        } else if(newMsg.channel.id === PUB.salons.invite.id) {
          const previousBotEmbed = retrieveMessageForEdit(oldMsg, PUB.salons.inviteArchive.id)
          if (previousBotEmbed) {
            let embed = createEmbedCopy(newMsg, newMsg.member, true, previousBotEmbed.embeds[0].description)
            previousBotEmbed.edit(embed).then().catch()
          }
        }
      }
    }

    /**
     * Find the right reaction response and run the relevant command
     * @param reaction MessageReaction
     * @param usr User
     * @param type "add" | "remove"
     */
    global.parseReaction = (reaction, usr, type) => {
      if (!usr.bot && (!reaction.message.author.bot || reaction.message.webhookID === pluralKitWebHookId)) {
        if (reaction.message.guild.id === PUB.servers.commu.id) {
          TiCu.Xp.reactionXp(type, reaction, usr)
        }
        let found = false
        for (const reactionFunction of Object.values(TiCu.Reactions)) {
          if (reaction.emoji.name === reactionFunction.emoji) {
            if (TiCu.Authorizations.Reaction(reactionFunction, reaction, usr)) {
              reactionFunction.run(reaction, usr, type)
            } else TiCu.Log.ReactionError(reaction, usr, type)
            found = true
          }
        }
      }
    }

    global.parseGuildMemberAdd = (member) => {
      if (member.guild.id === PUB.servers.commu.id) {
        TiCu.NewMembers.arrival(member.id)
        const jsonActionData = {action : "read", target : KickedFile}
        const kicked = TiCu.json(jsonActionData).list.includes(member.id)
        jsonActionData.target = ReturnFile
        const returnData = TiCu.json(jsonActionData)
        if (returnData.members[member.id] && TiCu.Date("raw") - returnData.members[member.id].date < maxReturnTime) {
          tipoui.channels.resolve(PUB.salons.genTP.id).send(`Oh ! Rebienvenue <@${member.id}> ! Tu peux utiliser la fonction de retour (\`!retour\`) dans <#${PUB.salons.invite.id}> pour récupérer tes rôles et accès. N'oublie cependant pas de rajouter tes pronoms dans ton pseudo tout de même`)
        } else {
          tipoui.channels.resolve(PUB.salons.genTP.id).send(`Oh ! Bienvenue <@${member.id}> ! Je te laisse lire les Saintes Règles, rajouter tes pronoms dans ton pseudo et nous faire une ptite présentation dans le salon qui va bien :heart:\nSi tu n'as pas fait vérifier ton numéro de téléphone ou d'abonnement Nitro, il va aussi te falloir aussi attendre 10 petites minutes que Discord s'assure tu n'es pas une sorte d'ordinateur mutant venu de l'espace... Même si en vrai ça serait trop cool quand même !`)
        }
        if (kicked || returnData.members[member.id]) {
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Retour de membre\n${member.user.toString()} - ${member.user.tag} - ${member.id} (${kicked ? "kické-e" : "départ volontaire"})`)
          vigi.channels.resolve(PUB.servers.vigi.entreesSorties).send(`Retour de ${member.user.toString()} - ${member.user.tag} - ${member.id} (${kicked ? "kické-e" : "départ volontaire"})`)
        } else {
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Arrivée de membre\n${member.user.toString()} - ${member.user.tag} - ${member.id}`)
          vigi.channels.resolve(PUB.servers.vigi.entreesSorties).send(`Arrivée de ${member.user.toString()} - ${member.user.tag} - ${member.id}`)
        }
      } else if (member.guild.id === PUB.servers.cdc.id) {
        let tipouiMember = tipoui.members.resolve(member.id)
        if (tipouiMember) {
          // Didn't want to store that in conf... Might be useful to though
          const turquoiseCdc = "695907116644302879"
          const phosphateCdc = "695907457515520061"
          if (tipouiMember.roles.cache.get(PUB.roles.turquoise.id)) {
            member.roles.add(turquoiseCdc)
          } else if (tipouiMember.roles.cache.get(PUB.roles.phosphate.id)) {
            member.roles.add(phosphateCdc)
          } else {
            member.guild.channels.resolve("610381774660436018").send(`<@${member.id}> n'est ni phosphate ni turquoise sur Tipoui`)
          }
        } else {
          tipoui.fetchBans()
            .then(
              bans => {
                if (bans.find(user => user.id === member.id)) {
                  member.kick("A été ban de Tipoui")
                } else {
                  member.guild.channels.resolve("610381774660436018").send(`<@${member.id}> n'est pas sur Tipoui`)
                }
              }
            ).catch(
              () => {
                member.guild.channels.resolve("610381774660436018").send(`<@${member.id}> n'est pas sur Tipoui et il est impossible de savoir si iel a été ban`)
              }
            )
        }
      }
    }

    global.parseGuildMemberRemove = (member) => {
      if(member.guild.id === PUB.servers.commu.id) {
        TiCu.Alerte.removeMember(member.id)
        const jsonActionData = {action : "read", target : KickedFile}
        const kickedData = TiCu.json(jsonActionData)
        jsonActionData.target = ReturnFile
        const returnData = TiCu.json(jsonActionData)
        if (kickedData && returnData) {
          if (!kickedData.list.includes(member.id)) {
            returnData.members[member.id] = {
              date : TiCu.Date("raw"),
              roles : [],
              nm : []
            }
            const noSaveRoles = [
              PUB.servers.commu.id, //@everyone role
              // special roles, not sure how it works...
              PUB.roles.utip.id,
              PUB.roles.nitro.id,
              PUB.roles.armu.id
            ]
            for (const role of member.roles.cache.array()) {
              if (!role.name.startsWith('#') && !noSaveRoles.includes(role.id)) {
                returnData.members[member.id].roles.push(role.id)
              }
            }
            for (const nm of Object.values(PUB.nonmixtes)) {
              if (nm.alias[0] !== "vigi") {
                const channel = tipoui.channels.resolve(nm.salons[0])
                if (channel.permissionOverwrites.has(member.id) && channel.permissionOverwrites.get(member.id).allow.has("VIEW_CHANNEL")) {
                  returnData.members[member.id].nm.push(nm.alias[0])
                }
              }
            }
            jsonActionData.action = "write"
            jsonActionData.content = returnData
            TiCu.json(jsonActionData)
          }
        } else {
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Départ de membre\nImpossible d'écrire le fichier de retour pour ${member.user.toString()} - ${member.user.tag} - ${member.id}`)
        }
        maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Départ de membre\n${member.user.toString()} - ${member.user.tag} - ${member.id}`)
        vigi.channels.resolve(PUB.servers.vigi.entreesSorties).send(`Départ de ${member.user.toString()} - ${member.user.tag} - ${member.id}`)
      }
    }

    global.parseGuildMemberUpdate = (oldUsr, newUsr) => {
      if(newUsr.roles.cache.get(PUB.roles.turquoise.id) && !oldUsr.roles.cache.get(PUB.roles.turquoise.id)) {
        let cdcMember = cdc.members.resolve(newUsr.id)
        if (cdcMember) {
          cdcMember.roles.add("695907116644302879")
        }
        newUsr.roles.add(PUB.roles.turquoiseColor.id)
        newUsr.roles.add(PUB.roles.vote.id)
        tipoui.channels.resolve(PUB.salons.genTutu.id).send("Bienvenue parmi les 💠Turquoises <@" + newUsr.id + "> ! <:turquoise_heart:417784485724028938>\nTu as désormais accès à de nouveaux salons, notamment <#453706061031931905> où tu pourras découvrir les spécificités de cette promotion. Par ailleurs, n'hésite pas à consulter <#453702956315836436> pour voir les rôles auxquels tu peux prétendre, et demande-les-moi par message privé.")
      }
      if(newUsr.roles.cache.get(PUB.roles.luxure.id)) {
        if(!newUsr.roles.cache.get(PUB.roles.hammer.id) && newUsr.roles.cache.get(PUB.roles.demolisseureuse.id)) {newUsr.roles.add(PUB.roles.hammer.id)}
        else if(newUsr.roles.cache.get(PUB.roles.hammer.id) && !newUsr.roles.cache.get(PUB.roles.demolisseureuse.id)) {newUsr.roles.remove(PUB.roles.hammer.id)}
        if(!newUsr.roles.cache.get(PUB.roles.naughty.id) && newUsr.roles.cache.get(PUB.roles.grrrrl.id)) {newUsr.roles.add(PUB.roles.naughty.id)}
        else if(newUsr.roles.cache.get(PUB.roles.naughty.id) && !newUsr.roles.cache.get(PUB.roles.grrrrl.id)) {newUsr.roles.remove(PUB.roles.naughty.id)}
      } else if(oldUsr.roles.cache.get(PUB.roles.luxure.id) && !newUsr.roles.cache.get(PUB.roles.luxure.id)) {
        if(newUsr.roles.cache.get(PUB.roles.hammer.id)) {newUsr.roles.remove(PUB.roles.hammer.id)}
        if(newUsr.roles.cache.get(PUB.roles.naughty.id)) {newUsr.roles.remove(PUB.roles.naughty.id)}
      }
    }
  },
  launchGames : function () {
    if (TiCu.AutoGames) {
      for (const autoGame of Object.values(TiCu.AutoGames)) {
        autoGame.init()
      }
    }
  },
  updateSalonsName : function() {
    global.salonsById = {}
    for (const value of Object.values(PUB.salons)) {
      const tipouiSalon = tipoui.channels.resolve(value.id)
      if (tipouiSalon) {
        salonsById[value.id] = tipouiSalon.name
      }
    }
  }
}
