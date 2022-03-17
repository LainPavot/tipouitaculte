// Init
const loader = require('./exports/loader')
loader.loadFull('./')

const fakeLog = {
  send: function (message) {
    console.log(message)
  }
}

function createLogger(type, server) {
  if (server[type] && server[type] !== "") {
    global[type][server.id] = Discord.channels.resolve(dev ? PUB.salons.logsDev.id : server[type])
  } else {
    global[type][server.id] = fakeLog
  }
}

function autoRoles() {
  const messageForRolesId = "831134956205506570"
  const messageForExistransinterId = "759347410529943562"
  const messageForDeposerLesArmesId = "892835638326489128"
  const messageForTurquoiseRoles = "900057156219441155"
  const emojisRoles = {
    "📹" : "notifyoutube",
    "🎥" : "notiftwitch",
    "🐝" : "espritruche",
    "📜" : "notifactu",
    "🎉" : "notifevent",
    "🍑" : "notifnudes",
    "🐸" : "grenouille",
    "frogangel2" : "grenouille-turquoise"
  }
  roles_salon = tipoui.channels.resolve(PUB.salons.rolessalons.id)
  if (roles_salon === null) {
    console.log(`The channel « roles salon » (${PUB.salons.rolessalons.id}) has not been found`) ;
    console.log("Deactivating the channel.") ;
    return ;
  }
  roles_salon.messages.fetch(messageForRolesId).then(msg => {
    msg.createReactionCollector((reaction, user) => {
      return (!user.bot) && (Object.keys(emojisRoles).includes(reaction.emoji.name))
    }).on("collect", reaction => {
      for (const user of reaction.users.cache.array()) {
        if (!user.bot) {
          const member = tipoui.members.resolve(user.id)
          const askedRoleId = PUB.roles[emojisRoles[reaction.emoji.name]].id
          if (
            askedRoleId !== PUB.roles["grenouille-turquoise"].id
            || member.roles.cache.keyArray().includes(PUB.roles.turquoise.id)
          ) {
            if (member.roles.cache.keyArray().includes(askedRoleId)) {
              member.roles.remove(askedRoleId)
              TiCu.Log.AutoRole(member, emojisRoles[reaction.emoji.name], "remove")
            } else {
              member.roles.add(askedRoleId)
              TiCu.Log.AutoRole(member, emojisRoles[reaction.emoji.name], "add")
            }
          }
          reaction.users.remove(user.id)
        }
      }
    })
  })
  roleOuiNon(messageForExistransinterId, PUB.roles.notifexistransinter.id, "notifexistransinter")
  roleOuiNon(messageForDeposerLesArmesId, PUB.roles.deposerLesArmes.id, "Déposer Les Armes")
  const emojisRolesTurquoises = {
    "🔥" : "pourfendeureuse",
    "🔞" : "luxure",
    "🏹" : "aro",
    "👑" : "ace",
    "💜" : "certainementpascis",
    "🌸" : "grrrrl",
    "🌈" : "queer",
    "💥" : "demolisseureuse"
  }
  const emojisNMTurquoises = {
    "🎭" : "neuroa",
    "🖤" : "poc",
    "💙" : "trans",
    "🐱" : "systeme"
  }
  tipoui.channels.resolve(PUB.salons.rolessalons.id).messages.fetch(messageForTurquoiseRoles).then(msg => {
    msg.createReactionCollector((reaction, user) => {return (!user.bot) && (Object.keys(emojisRolesTurquoises).includes(reaction.emoji.name) || Object.keys(emojisNMTurquoises).includes(reaction.emoji.name))})
       .on(
         "collect",
         reaction => {
           for (const user of reaction.users.cache.array()) {
             if (!user.bot) {
               const member = tipoui.members.resolve(user.id)
               if (member.roles.cache.keyArray().includes(PUB.roles.turquoise.id)) {
                 if (Object.keys(emojisRolesTurquoises).includes(reaction.emoji.name)) {
                   const roleName = emojisRolesTurquoises[reaction.emoji.name]
                   const askedRoleId = PUB.roles[roleName].id
                   if (member.roles.cache.keyArray().includes(askedRoleId)) {
                     member.roles.remove(askedRoleId)
                     TiCu.Log.AutoRole(member, roleName, "remove")
                   } else {
                     member.roles.add(askedRoleId)
                     TiCu.Log.AutoRole(member, roleName, "add")
                   }
                 } else {
                   const roleName = emojisNMTurquoises[reaction.emoji.name]
                   for (const chan of PUB.nonmixtes[roleName].salons) {
                     const channel = tipoui.channels.resolve(chan)
                     if (channel.permissionOverwrites.has(member.id) && channel.permissionOverwrites.get(member.id).allow.has("VIEW_CHANNEL")) {
                       channel.createOverwrite(member, {VIEW_CHANNEL: false}).catch()
                       TiCu.Log.AutoRole(member, roleName, "remove", true)
                     } else {
                       channel.createOverwrite(member, {VIEW_CHANNEL: true}).catch()
                       TiCu.Log.AutoRole(member, roleName, "add", true)
                     }
                   }
                 }
               } else {
                 member.send("Ces rôles ne sont accessibles qu'aux membres Turquoises")
               }
               reaction.users.remove(user.id)
             }
           }
         }
       )
  })
}

function roleOuiNon(messageId, askedRoleId, roleName) {
  tipoui.channels.resolve(PUB.salons.rolessalons.id).messages.fetch(messageId).then(msg => {
    msg.createReactionCollector((reaction, user) => {return (!user.bot) && (["❌", "✅"].includes(reaction.emoji.name))})
       .on(
         "collect",
         reaction => {
           for (const user of reaction.users.cache.array()) {
             if (!user.bot) {
               const member = tipoui.members.resolve(user.id)
               if (member.roles.cache.keyArray().includes(askedRoleId) && reaction.emoji.name === "❌") {
                 member.roles.remove(askedRoleId)
                 TiCu.Log.AutoRole(member, roleName, "remove")
               } else if (!member.roles.cache.keyArray().includes(askedRoleId) && reaction.emoji.name === "✅") {
                 member.roles.add(askedRoleId)
                 TiCu.Log.AutoRole(member, roleName, "add")
               }
               reaction.users.remove(user.id)
             }
           }
         }
       )
  })
}

Discord.once("ready", () => {
  if (dev) {
    _.forEach(PUB.servers, (server) => {
      server.id = PUB.servers.debug.id ;
    })
  }
  global.tipoui = Discord.guilds.resolve(PUB.servers.commu.id)
  global.vigi = Discord.guilds.resolve(PUB.servers.vigi.id)
  global.cdc = Discord.guilds.resolve(PUB.servers.cdc.id)

  global.maxilog = []
  global.minilog = []
  for (const server of Object.values(PUB.servers)) {
    createLogger("maxilog", server)
    createLogger("minilog", server)
  }
  console.log(TiCu.Date("log") + " : Connexion à Discord.")
  loader.updateSalonsName()
  global.games = {}
  loader.launchGames()
  if (!dev || (dev && devConfig)) {
    if (!dev) {
      maxilog[PUB.servers.commu.id].send(TiCu.Date("log") + " : Reconnexion.")
      minilog[PUB.servers.commu.id].send("Coucou, je suis de retour ♥")
    }

    if (!dev || (devConfig && devConfig.generic && devConfig.generic.voteStartup)) {
      TiCu.VotesCollections.Startup()
    }
    if (!dev || (devConfig && devConfig.generic && devConfig.generic.census)) {
      TiCu.Census.initCensus()
    }
    if (!dev || (devConfig && devConfig.generic && devConfig.generic.autoRoles)) {
      autoRoles()
    }
    if (!dev || (devConfig && devConfig.server)) {
      Server.get(
        "/discord/invite/:key",
        function (req, res) {
          const hashedDate = hash(TiCu.Date("raw").toString().substr(0, 8))
          if (activeInvite) {
            if (req.params.key === hashedDate) {
              Discord.channels.resolve(PUB.salons.invite.id)
                .createInvite({maxUses: 1, maxAge: 300})
                .then(invite => {
                    res.send(invite.url)
                    TiCu.Log.ServerPage(req)
                  }
                )
            } else {
              res.send("https://www.youtube.com/watch?v=BAHtStfZZWg")
            }
          } else {
            res.send("https://tipoui.me/discord/raid.php")
          }
        }
      )
    }
  }
})

console.log()
if (!dev || (dev && devConfig)) {
  if (!dev || (devConfig.parsing && devConfig.parsing.message)) {
    console.log("Loading module parseMessage on message.")
    Discord.on("messageCreate", (msg) => {
      parseMessage(msg)
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.messageDelete)) {
    console.log("Loading module parseMessageDelete on messageDelete.")
    Discord.on("messageDelete", (msg) => {
      parseMessageDelete(msg)
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.messageUpdate)) {
    console.log("Loading module parseMessageUpdate on messageUpdate.")
    Discord.on("messageUpdate", (oldMsg, newMsg) => {
      parseMessageUpdate(oldMsg, newMsg)
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.messageReactionAdd)) {
    console.log("Loading module parseReaction on messageReactionAdd.")
    Discord.on("messageReactionAdd", (reaction, usr) => {
      parseReaction(reaction, usr, "add")
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.messageReactionRemove)) {
    console.log("Loading module parseReaction on messageReactionRemove.")
    Discord.on("messageReactionRemove", (reaction, usr) => {
      parseReaction(reaction, usr, "remove")
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.guildMemberAdd)) {
    console.log("Loading module parseGuildMemberAdd on guildMemberAdd.")
    Discord.on("guildMemberAdd", usr => {
      parseGuildMemberAdd(usr)
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.guildMemberRemove)) {
    console.log("Loading module parseGuildMemberRemove on guildMemberRemove.")
    Discord.on("guildMemberRemove", usr => {
      parseGuildMemberRemove(usr)
    })
  }

  if (!dev || (devConfig.parsing && devConfig.parsing.guildMemberUpdate)) {
    console.log("Loading module parseGuildMemberUpdate on guildMemberUpdate.")
    Discord.on("guildMemberUpdate", (oldUsr, newUsr) => {
      parseGuildMemberUpdate(oldUsr, newUsr)
    })
  }

  // Server
  if (!dev || (devConfig && devConfig.server)) {
    Server.listen(3000);
  }
}

// Discord
Discord.login(CFG.discordToken)