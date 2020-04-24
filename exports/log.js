module.exports = {
  Error : function(cmd, err, msg) {
    if(cmd === "vote") {
      msg.channel.send("Erreur avec la commande `" + cmd + "` : " + err +".")
        .then(newMsg => {
          msg.delete()
          newMsg.delete(10000)
        })
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Erreur : (`" + cmd + "`, " + err +")")
    } else {
      msg.reply("erreur avec la commande `" + cmd + "` : " + err +".")
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Erreur : (`" + cmd + "`, " + err +")")
    }
  },
  Json : function(type, target) {
    if(type === "err") maxilog[PUB.servers.commu.id].send(TiCu.Date("log") + " : JSON\nErreur JSON (" + target + ")")
    else maxilog[PUB.servers.commu.id].send(TiCu.Date("log") + " : JSON\n" + type + " - " + target)
  },
  Quarantaine : function(type, newMsg, msg) {
    maxilog[PUB.servers.vigi.id].send(TiCu.Date("log") + " : Quarantaine - " + type + "\n" + newMsg.url)
    msg.react("💬")
  },
  UpdatedQuarantaine : function(type, newMsg, msg, error = undefined) {
    if (error !== undefined) {
      maxilog[PUB.servers.vigi.id].send(`${TiCu.Date("log")} : UpdatedQuarantaine Error\n${error}`)
    } else {
      maxilog[PUB.servers.vigi.id].send(TiCu.Date("log") + " : UpdatedQuarantaine - " + type + "\n" + newMsg.url)
      msg.react("✅")
    }
  },
  DM : function(embed, msg) {
    maxilog[PUB.servers.vigi.id].send(TiCu.Date("log") + " : DM")
    maxilog[PUB.servers.vigi.id].send(embed)
    msg.react("💬")
  },
  UpdatedDM : function(embed, msg, error = undefined) {
    if (error !== undefined) {
      maxilog[PUB.servers.vigi.id].send(`${TiCu.Date("log")} : UpdatedDM Error\n${error}`)
    } else {
      maxilog[PUB.servers.vigi.id].send(TiCu.Date("log") + " : UpdatedDM", embed)
      msg.react("✅")
    }
  },
  VoteUpdate : function(userId, emoji, previousVote, msg) {
    const user = tipoui.members.get(userId)
    maxilog[msg.guild.id].send(`${TiCu.Date("log")} : VoteCollections\n${hash(userId)} a ${previousVote ? "changé son vote \`" + previousVote + "\` en vote" : "voté"} \`"${emoji}"\` sur le vote :\n${msg.url}`)
    user.send(`Votre ${previousVote ? "changement de vote \`" + previousVote + "\` en " : ""}vote \`"${emoji}"\` a bien été pris en compte.\n${msg.url}`)
  },
  VoteCollector : function(msg) {
    maxilog[msg.guild.id].send(TiCu.Date("log") + " : VoteCollections\nInitialisation du vote pour le message :\n" + msg.url)
  },
  VoteDone : function (reason, type, msg, target) {
    if (type === "text" || type === "prop") {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : VoteDone\nFin du vote pour le message :\n" + msg.url)
    } else {
      maxilog[msg.guild.id].send(
        TiCu.Date("log") + " : VoteDone\nFin du vote (avec le resultat \"" + reason + "\") pour le message\n" + msg.url +
        "\nVote de " + type + " pour " + tipoui.members.get(target).displayName
      )
    }
  },
  ServerPage : function(req) {
    maxilog[PUB.servers.commu.id].send(TiCu.Date("log") + " : Server\nServed Page : " + req.path)
  },
  Commands : {
    Avatar: function(target, msg) {
      if(msg.member.id !== target.id) {
        maxilog[msg.guild.id].send(TiCu.Date("log") + "Avatar\n" + msg.member.displayName + "a affiché l'avatar de " + target.displayName)
      }
    },
    Ban : function(target, reason, msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Ban \n" + msg.member.displayName + " a banni " + target.username + " / " + target.id + ".")
      minilog[msg.guild.id].send(msg.member.displayName + " a banni " + target.username + ".")
      if(reason) {
        maxilog[msg.guild.id].send("Raison : " + reason)
        minilog[msg.guild.id].send("Raison : " + reason)
      }
      msg.react("✅")
    },
    Bienvenue : function(target, msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Bienvenue\n" + msg.member.displayName + " a souhaité la bienvenue à " + target.displayName + " / " + target.id + ".")
      minilog[msg.guild.id].send(msg.member.displayName + " a souhaité la bienvenue à " + target.displayName + ".")
      tipoui.channels.get(PUB.salons.invite.id).send("Bienvenue " + target.displayName + " ! <:patatecoeur:585795622846857256>\nTe voici désormais Phosphate d'Alumine. N'hésite pas à m'envoyer un message privé si tu as des questions sur le serveur ou un message à transmettre aux Vigiliant·es.\nNous espérons que tu seras à ton aise et que tout se passera bien.")
    },
    Color : function(action, color, msg) {
      if(action === "switched") {
        if(color === "turquoise") {
          maxilog[msg.guild.id].send(TiCu.Date("log") + " : Color\n" + msg.member.displayName + " a réinitialisé sa couleur.")
          msg.react("✅")
        } else {
          maxilog[msg.guild.id].send(TiCu.Date("log") + " : Color\n" + msg.member.displayName + " a adopté la couleur " + color + ".")
          msg.react("✅")
        }
      }
      if(action === "deleted") {
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Color\n" + "La couleur " + color + " a été supprimée.")
        msg.react("♻")
      }
    },
    HotReload: function(type, msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Hot Reload\n${TiCu.Mention(msg.author.id).displayName} a redémarré TipouiTaCulte (${type})`)
      msg.react("✅")
    },
    Kick : function(target, reason, msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Kick \n" + msg.member.displayName + " a kické " + target.username + " / " + target.id + ".")
      minilog[msg.guild.id].send(msg.member.displayName + " a kické " + target.username + ".")
      if(reason) {
        maxilog[msg.guild.id].send("Raison : " + reason)
        minilog[msg.guild.id].send("Raison : " + reason)
      }
      msg.react("✅")
    },
    Level: function(target, msg) {
      if(msg.member.id !== target) {
        maxilog[msg.guild.id].send(TiCu.Date("log") + "Level\n" + msg.member.displayName + "a affiché le level de " + tipoui.members.get(target).displayName)
      }
    },
    NM: function(target, action, res, msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Non-Mixte\n${msg.member.displayName} a ${action ? "donné" : "retiré"} accès à ${res} salons non-mixtes pour ${target.displayName} (${target.id}).`)
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Non-Mixte\n${msg.member.displayName} a ${action ? "donné" : "retiré"} accès à ${res} salons non-mixtes pour ${target.displayName}.`)
      msg.react("✅")
    },
    Profil: function(target, msg) {
      if(msg.member.id !== target.id) {
        maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Profil\n${msg.member.displayName} a affiché le profil de ${tipoui.members.get(target.id).displayName}`)
      }
    },
    Purifier : function(target, msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Purifier \n" + msg.member.displayName + " a ajouté " + target.displayName + " parmi les Pourfendeureuses de Cismecs.")
      minilog[msg.guild.id].send(msg.member.displayName + " a ajouté " + target.displayName + " parmi les Pourfendeureuses de Cismecs.")
      msg.react("✅")
    },
    Quarantaine : function(action, target, reason, msg) {
      if(action) {
        minilog[msg.guild.id].send(msg.member.displayName + "a mis " + target.displayName + " en quarantaine.")
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Quarantaine\n" + msg.member.displayName + " a mis " + target.displayName + " / " + target.id + " en quarantaine.")
        tipoui.channels.get(PUB.salons.quarantaineUser.id).send("<@" + target.id + ">, tu as été placé·e en quarantaine. Tous les messages que tu transmetras dans ce salon seront transmis aux Vigilant·es, comme lorsque tu m'envoies un message privé, et je m'occuperais de transmettre leurs réponses.\n⚠Quitter le serveur alors que tu es ici te vaudra un ban immédiat.⚠")
        msg.react("✅")
      } else {
        minilog[msg.guild.id].send(msg.member.displayName + "a enlevé " + target.displayName + " de quarantaine.")
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Quarantaine\n" + msg.member.displayName + " a enlevé " + target.displayName + " / " + target.id + " de quarantaine.")
        msg.react("✅")
      }
      if(reason) {
        minilog[msg.guild.id].send("Raison : " + reason)
        maxilog[msg.guild.id].send("Raison : " + reason)
      }
    },
    Raid: function(arg, msg) {
      if(arg === "on") {
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Raid\nL'alerte Raid a été lancée par " + msg.member.displayName + ".")
        minilog[msg.guild.id].send("L'alerte Raid a été lancée. Les liens d'invitation au serveur ne seront plus distribués jusqu'à `!raid off` ou redémarrage du bot.")
        msg.channel.send("Désactivation du lien d'invitation, activation du mode raid... :scream: Que la force soit avec nous !")
      } else {
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Raid\nL'alerte Raid a été désactivée par " + msg.member.displayName + ".")
        minilog[msg.guild.id].send("L'alerte Raid a été désactivée.")
        msg.channel.send("Réactivation du lien d'invitation, désactivation du mode raid... :smiley:")
      }
      msg.react("✅")
    },
    React: function(emoji, target, msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : React \n" + msg.member.displayName + " a réagi " + emoji + "à ce message : `" + target.url)
      minilog[msg.guild.id].send(msg.member.displayName + " a réagi " + emoji + " à un message dans <#" + target.channel.id + ">.")
    },
    Roles : function(target, action, roles, msg) {
      let author = msg.member ? msg.member.displayName : msg.author.username
      let roleNames = ""
      for(i=0;i<roles.length;i++) {
        roleNames += "`" + tipoui.roles.get(roles[i]).name + "` "
      }
      action = (action === "addRoles") ? "ajouté" : "enlevé"
      minilog[msg.guild.id].send(author + " a " + action + " des rôles à " + target.displayName)
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : Roles\n" + author + " a " + action + " des rôles à " + target.displayName + "\n" + roleNames)
      msg.react("✅")
    },
    Send : function(cmdMsg, newMsg) {
      let author = cmdMsg.member ? cmdMsg.member.displayName : cmdMsg.author.username
      maxilog[cmdMsg.guild.id].send(TiCu.Date("log") + " : Send \n" + author + " a envoyé un message vers `" + newMsg.channel.toString() + "`\n" + newMsg.url)
      maxilog[cmdMsg.guild.id].send(newMsg.toString())
      minilog[cmdMsg.guild.id].send(author + " a envoyé un message vers " + newMsg.channel.toString())
      cmdMsg.react("✅")
    },
    Vote : {
      Public : function(msg) {
        minilog[msg.guild.id].send(msg.member.displayName + " a lancé un vote public")
        maxilog[msg.guild.id].send(TiCu.Date("log") + " : Vote\n" + msg.member.displayName + " a lancé un vote public :\n" + msg.url)
        maxilog[msg.guild.id].send(msg.content)
      },
      Anon : function(type, params, newMsg, msg) {
        /* Might receive empty params[2] */
        if(type === "text" || type === "prop") {
          minilog[msg.guild.id].send(`Un vote anonyme a été lancé dans ${newMsg.channel.name}`)
          maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Vote\n${hash(msg.author.id)} a lancé un vote anonyme ${msg.url}`)
        } else {
          minilog[msg.guild.id].send(`Un vote anonyme pour ${type} ${TiCu.Mention(params[2])} a été lancé dans ${newMsg.channel.name}`)
          maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Vote\n${hash(msg.author.id)} a lancé un vote anonyme : ${type} ${TiCu.Mention(params[2])}\n${msg.url}`)
        }
        maxilog[msg.guild.id].send(new DiscordNPM.RichEmbed(newMsg.embeds[0]))
        msg.delete()
      },
      AutoTurquoise: function(newMsg, target, voteNumber) {
        minilog[newMsg.guild.id].send(`Un nouveau vote anonyme automatique de passage Turquoise (#${voteNumber}) a été lancé pour ${TiCu.Mention(target).displayName}`)
        maxilog[newMsg.guild.id].send(new DiscordNPM.RichEmbed(newMsg.embeds[0]))
      }
    },
    Xp: function(target, value, give, reason, msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : XP\n${tipoui.members.get(msg.author.id).displayName} a  ${give ? 'donné' : 'enlevé'} ${value} XP à ${target}${reason ? " pour la raison : " + reason : ""}`)
    },
    Retour : function(msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Retour\n${msg.member.displayName} a récupéré ses rôles et accès avec la fonction de retour`)
      msg.react("✅")
    },
    Pin: function(target, msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Pin \n${msg.member.displayName} a pin ce message : ${target.url}`)
      minilog[msg.guild.id].send(`${msg.member.displayName} a pin un message dans <#${target.channel.id}>.`)
    },
    Unpin: function(target, msg) {
      maxilog[msg.guild.id].send(`${TiCu.Date("log")} : Unpin \n${msg.member.displayName} a unpin ce message : ${target.url}`)
      minilog[msg.guild.id].send(`${msg.member.displayName} a unpin un message dans <#${target.channel.id}>.`)
    },
  },
  ReactionError: function(reaction, usr, type) {
    let errorText;
    if (type === "add") {
      errorText = tipoui.members.get(usr.id).displayName + " tried to trigger a bot reaction by reacting to " + reaction.message.url + " with " + reaction.emoji.name
    } else {
      errorText = tipoui.members.get(usr.id).displayName + " tried to trigger a bot reaction by deleting their reaction " + reaction.emoji.name + " to " + reaction.message.url
    }
    maxilog[reaction.message.guild.id].send(TiCu.Date("log") + " : ReactionError\nSomething went wrong with authorizations\n" + errorText)
  },
  Reactions: {
    genericReaction: function(reaction, usr, type) {
      if (type === "add") {
        maxilog[reaction.message.guild.id].send(TiCu.Date("log") + " : ReactionAdd\n" + tipoui.members.get(usr.id).displayName + " a réagit à " + reaction.message.url + " avec " + reaction.emoji.name)
      } else {
        maxilog[reaction.message.guild.id].send(TiCu.Date("log") + " : ReactionRemove\n" +tipoui.members.get(usr.id).displayName + " a supprimé sa réaction " + reaction.emoji.name + " à " + reaction.message.url)
      }
    },
    Pin: function(target) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Pin \nLa communauté a pin ce message : ${target.url}`)
      minilog[PUB.servers.commu.id].send(`La communauté a pin un message dans <#${target.channel.id}>.`)
      },
      Megenrage: function (message, reactorID, alreadySignaled, directMessage) {
          if(alreadySignaled && directMessage) {
              maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Mégenrage\nUn DM a été envoyé à <@${reactorID}> pour lui annoncer que ce message a déjà été signalé comme comportant du mégenrage (ID : ${message.id}).`)
          } elseif(alreadySignaled && !directMessage) {
              maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Mégenrage\n<@${reactorID}> a été prévenu·e dans <#${PUB.salons.bots.id}> pour lui annoncer que ce message a déjà été signalé comme comportant du mégenrage (ID : ${message.id}).`)
          } elseif(!alreadySignaled && directMessage) {
              maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Mégenrage\nUn DM a été envoyé à <@${message.author.id}> pour lui signaler qu'un de ses messages contient du mégenrage, d'après <@${reactorID}>\n${message.url}`)
              minilog[PUB.servers.commu.id].send(`Un message de <@${message.author.id}> a été signalé comme comportant du mégenrage par <@${reactor}>. J'ai pu lui envoyer un DM.\n${message.url}`)
          } elseif(!alreadySignaled && !directMessage) {
              maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : Mégenrage\nUn DM a été envoyé dans <@${message.channel.id}> pour signaler qu'un message de <@${message.author.id}> contient du mégenrage, d'après <@${reactorID}>.\n${message.url}`)
              minilog[PUB.servers.commu.id].send(`Un message de <@${message.author.id}> a été signalé comme comportant du mégenrage par <@${reactor}>. J'ai du envoyer un message public dans <#${message.channel.id}.\n${message.url}`)
          }
      }
  },
  Auto: {
    SuchTruc: function(msg) {
      maxilog[msg.guild.id].send(TiCu.Date("log") + " : SuchTruc\nSuch Log, much info !" + msg.url)
    }
  },
  XP: {
    newEntry: function(entry) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : newXPMember\n${tipoui.members.get(entry.id).displayName} was added to the XP system`)
    },
    levelChange: function(entry, previousLevel) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : levelChange\n${tipoui.members.get(entry.id).displayName} changed level from ${previousLevel} to ${entry.level}`)
    },
    statusChange: function(entry) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XPMemberStatusChange\n${tipoui.members.get(entry.id).displayName} is now ${entry.activated ? 'in' : 'out of'} the XP system`)
    },
    notifChange: function(entry, msg) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XPMemberNotifChange\n${tipoui.members.get(entry.id).displayName} a maintenant ses notifications de changement de niveau sur le système ${entry.notification}`)
      msg.react("✅")
    },
    error: function(type, target) {
      switch(type) {
        case TiCu.Xp.errorTypes.AUTOVOTE:
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XP ERROR\nThere was a problem launching the Turquoise auto vote for ${tipoui.members.get(target).displayName}`)
          break;
        case TiCu.Xp.errorTypes.NOUPDATE:
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XP ERROR\nThere was a problem updating the XP for ${tipoui.members.get(target).displayName} : no entries updated`)
          break;
        case TiCu.Xp.errorTypes.MULTIPLEUPDATE:
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XP ERROR\nThere was a problem updating the XP for ${tipoui.members.get(target).displayName} : updated multiple entries`)
          break;
        default:
          maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XP ERROR\nGeneric error, sorry for the lack of information`)
      }
    },
    system: function(text, msg) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : XP ERROR\n${text} ${msg.url}`)
    }
  },
  Profil: {
    newEntry: function(entry) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : newMemberProfil\n${tipoui.members.get(entry.id).displayName} was added to the Profil system`)
    },
    newField: function(entry, id) {
      maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : newMemberProfilField\n${tipoui.members.get(id).displayName} created a new field : ${entry.name} = ${entry.value}`)
    }
  },
  AutoRole: function(member, roleName, type) {
    maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : autoRole\n${member.displayName} a ${type === "add" ? "adopté" : "renié"} le rôle de ${roleName}`)
  },
  Census: function(member) {
    maxilog[PUB.servers.commu.id].send(`${TiCu.Date("log")} : census\n${member.displayName} a été retiré·e du système de vote pour inactivité`)
  }
}
