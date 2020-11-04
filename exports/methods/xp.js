const XPREACTION = 0.05
const XPREACTEDTO = 0.01

const LEVELMAX = 100

const MemberXP = DB.define('memberxp', {
  id: {
    type: SequelizeDB.STRING,
    allowNull: false,
    primaryKey: true
  },
  xp: {
    type: SequelizeDB.FLOAT
  },
  level: {
    type: SequelizeDB.INTEGER
  },
  activated: {
    type: SequelizeDB.BOOLEAN
  },
  notification: {
    type: SequelizeDB.STRING
  }
}, {
  timestamps: false
});

function xpByLevel(level) {
  return 0.9 * (87 * level + 13 * level * level);
}

const levelToXP = []
for (let i=0;i<LEVELMAX;i++) {
  levelToXP[i] = xpByLevel(i)
}

function calculateLevelByXp(xp) {
  let level;
  for (level = 0; level < LEVELMAX; level++) {
    if (xp < levelToXP[level]) break;
  }
  level--
  return level
}

function systemAccessAuthorised(msg) {
  return msg.channel.type === 'text' && // is in a GuildChannel
    msg.guild.id === PUB.servers.commu.id // is in Tipoui Guild
}

function updateLevel(level, target) {
  return MemberXP.update(
    {
      level: level
    },
    {
      where: {
        id: target
      },
      returning: true
    }
  )
}

function levelChange(entry, newLevel, previousLevel) {
  TiCu.Log.XP.levelChange(entry, previousLevel)
  if (!dev && newLevel > previousLevel && newLevel !== 0) {
    switch (entry.notification) {
      case "dm":
      case "mp":
        tipoui.members.resolve(entry.id).send(`Tu viens de passer niveau ${newLevel} ! Félicitations !\nSi tu ne souhaites plus recevoir ces notifications, n'hésites pas à désactiver cette fonctionnalité en allant dans le channel <#${PUB.salons.bots.id}> et en lançant la commande \`!level notif off\`\nEt si au contraire tu souhaites exposer au monde ces notifications, n'hésites pas à aller dans le channel <#${PUB.salons.bots.id}> et à lancer la commande \`!level notif public\``)
        break
      case "off":
        break
      case "":
      case "public":
      default:
        tipoui.channels.resolve(PUB.salons.bots.id).send(`<@${entry.id}> vient de passer niveau ${newLevel} ! Félicitations !\nSi tu ne souhaites plus recevoir ces notifications, n'hésites pas à désactiver cette fonctionnalité en lançant ici-même la commande \`!level notif off\`\nEt si tu préfères avoir ces notifications en privé, tu peux lancer ici-même la commande \`!level notif dm\``)
        break
    }
    if (!dev && newLevel%4 === 0 && newLevel !== 0) {
      TiCu.Vote.autoTurquoise(entry.id, newLevel/4)
    }
  }
}

function categoryMultiplier(categoryId) {
  const category = TiCu.Categories.findById(categoryId)
  return category ? (category.xpFactor ? category.xpFactor : 1) : 1
}

function channelMultiplier(channelId) {
  const channel = TiCu.Channels.findById(channelId)
  return channel ? (channel.xpFactor ? channel.xpFactor : 1) : 1
}

function xpFromMessage(msg) {
  const charNb = msg.content.length
  return (Math.atan((charNb-800.0)/200.0)*2 + 2.65 + charNb * 0.0027)
    * (msg.channel.parent ? categoryMultiplier(msg.channel.parent.id) : 1)
    * channelMultiplier(msg.channel.id)
}

module.exports = {
  updateXp: function (type, value, target) {
    let booster = 1
    for (const role of Object.values(PUB.roles)) {
      const member = tipoui.members.resolve(target)
      if (member && member.roles && member.roles.cache.get(role.id)) booster += (role.xpAddedMultiplicator ? role.xpAddedMultiplicator : 0)
    }
    value = value * booster
    MemberXP.findOrCreate({where: {id: target}, defaults: {level: 0, xp: 0, activated: true}}).then(
      ([entry, created]) => {
        if (created) {
          TiCu.Log.XP.newEntry(entry)
        }
        if (entry.activated) {
          const newLevel = calculateLevelByXp(entry.xp + (type === 'add' ? value : -value))
          MemberXP.update({
            xp: entry.xp + (type === 'add' ? value : -value),
            level: newLevel
          }, {
            where: {
              id: target
            },
            returning: true
          }).then(
            ([numberUpdated, entries]) => {
              if (numberUpdated === 0) {
                TiCu.Log.XP.error(this.errorTypes.NOUPDATE, target)
              } else if (numberUpdated !== 1) {
                TiCu.Log.XP.error(this.errorTypes.MULTIPLEUPDATE, target)
              } else {
                if (newLevel !== entry.level) {
                  levelChange(entries[0], newLevel, entry.level)
                }
              }
            }
          )
        }
      }
    )
  },
  updateAllXp: function (type, value) {
    MemberXP.update({
      xp: SequelizeDB.literal(`xp ${type === 'add' ? '+' : '-'} ${value}`)
    }, {
      where: {
        activated: true
      },
      returning: true
    }).then(
      ([numberUpdated, entries]) => {
        for (let i=0;i<numberUpdated;i++) {
          const previousLevel = calculateLevelByXp(entries[i].xp + (type === 'add' ? -value : value))
          const currentLevel = calculateLevelByXp(entries[i].xp)
          if (previousLevel !== currentLevel) {
            updateLevel(currentLevel, entries[i].id).then(
              ([numberUpdated, subEntries]) => {
                if (numberUpdated === 0) {
                  TiCu.Log.XP.error(this.errorTypes.NOUPDATE, entries[i].id)
                } else if (numberUpdated !== 1) {
                  TiCu.Log.XP.error(this.errorTypes.MULTIPLEUPDATE, entries[i].id)
                } else {
                  levelChange(subEntries[0], currentLevel, previousLevel)
                }
              }
            )
          }
        }
      }
    )
  },
  processXpFromMessage: function (type, msg) {
    if (systemAccessAuthorised(msg)) {
      this.updateXPforSystemsToo(type, xpFromMessage(msg), msg.author.id, msg)
    }
  },
  processXpMessageUpdate: function (oldMsg, newMsg) {
    if (systemAccessAuthorised(oldMsg)) {
      const oldXp = xpFromMessage(oldMsg)
      const newXp = xpFromMessage(newMsg)
      this.updateXPforSystemsToo('add', newXp - oldXp, oldMsg.author.id, newMsg)
    }
  },
  reactionXp: function (type, reaction, usr) {
    if (systemAccessAuthorised(reaction.message)) {
      if (usr.id !== reaction.message.author.id && !usr.bot) {
        const categoryMul = reaction.message.channel.parent ? categoryMultiplier(reaction.message.channel.parent.id) : 1
        const channelMul = channelMultiplier(reaction.message.channel.id)
        this.updateXPforSystemsToo(type, XPREACTION * categoryMul * channelMul, usr.id, reaction.message)
        this.updateXPforSystemsToo(type, XPREACTEDTO * categoryMul * channelMul, reaction.message.author.id, reaction.message)
      }
    }
  },
  getMember: function(id) {
    return MemberXP.findByPk(id)
  },
  getXpByLevel: function(level) {
    return xpByLevel(level)
  },
  changeMemberStatus: function(target, activated, msg) {
    MemberXP.update({
      activated: activated
    }, {
      where: {
        id: target
      },
      returning: true
    }).then(
      ([numberUpdated, entries]) => {
        if (numberUpdated === 0) {
          TiCu.Log.XP.error(this.errorTypes.NOUPDATE, target)
        } else if (numberUpdated !== 1) {
          TiCu.Log.XP.error(this.errorTypes.MULTIPLEUPDATE, target)
        } else {
          if (msg) msg.channel.send(`Le compte de ${TiCu.Mention(target).displayName} est maintenant ${entries[0].activated ? 'activé' : 'désactivé'} dans le système`)
          TiCu.Log.XP.statusChange(entries[0])
        }
      }
    )
  },
  changeMemberNotification: function(target, notif, msg) {
    MemberXP.update({
      notification: notif
    }, {
      where: {
        id: target
      },
      returning: true
    }).then(
      ([numberUpdated, entries]) => {
        if (numberUpdated === 0) {
          TiCu.Log.XP.error(this.errorTypes.NOUPDATE, target)
        } else if (numberUpdated !== 1) {
          TiCu.Log.XP.error(this.errorTypes.MULTIPLEUPDATE, target)
        } else {
          TiCu.Log.XP.notifChange(entries[0], msg)
        }
      }
    )
  },
  resetEveryOneXp: function() {
    MemberXP.update({
      xp: 0,
      level: 0
    }, {
      where: {}
    })
  },
  updateXPforSystemsToo: function(type, value, target, msg) {
    if (msg.author.bot) {
      setTimeout(() => {
        const options = {
          hostname: "api.pluralkit.me",
          port: 443,
          path: `/v1/msg/${msg.id}`,
          method: 'GET'
        }

        const req = https.request(options, res => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          res.on('end', () => {
            if (res.statusCode === 200) {
              this.updateXp(type, value, JSON.parse(data).sender)
            }
          });
        })
        req.on('error', error => {
          TiCu.Log.XP.system("Problème avec l'API PluralKit", msg)
        })
        req.end()
      }, 1000)
    } else {
      this.updateXp(type, value, target)
    }
  },
  errorTypes: {
    AUTOVOTE: 'autovote',
    MULTIPLEUPDATE: 'multipleUpdate',
    NOUPDATE: 'noUpdate'
  }
}
