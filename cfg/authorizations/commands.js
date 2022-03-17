module.exports = {
  commu : {
    avatar : {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id]
      }
    },
    ban: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    bienvenue: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.invite.id]
      },
      roles : {
        type: "whitelist",
        list: [PUB.roles.turquoise.id]
      }
    },
    color: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      },
      roles : {
        type: "whitelist",
        list: [PUB.roles.turquoise.id]
      }
    },
    help : {},
    hotreload: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      }
    },
    kick: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    level: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id]
      }
    },
    list: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      }
    },
    new: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      }
    },
    nm: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    profil: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      }
    },
    propose: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id, PUB.salons.blueprint.id]
      }
    },
    purifier: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      },
      roles : {
        type: "whitelist",
        list: [PUB.roles.pourfendeureuse.id]
      }
    },
    quarantaine: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    raid: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    react: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    return: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.invite.id]
      }
    },
    roles: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    send: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    vote: {},
    xp: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    xpstatus: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id, PUB.salons.botsecret.id]
      },
      roles : {
        type: "whitelist",
        list: [PUB.roles.turquoise.id]
      }
    },
    pin: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    unpin: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    roll: {},
    timer: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.quizz.id]
      }
    },
    slowmode: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    edit: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    delete: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      }
    },
    id: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id]
      }
    },
    quizz : {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.quizz.id]
      },
      auths : {
        type: "whitelist",
        list: [PUB.users.lainou.id]
        // list: [PUB.users.syrinx.id, PUB.users.xenolune.id, PUB.users.echarpe.id]
      }
    },
    dm : {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      }
    }
  },
  vigi : {
    avatar : {},
    ban: {},
    help : {},
    hotreload: {},
    kick: {},
    nm: {},
    profil: {},
    quarantaine: {},
    raid: {},
    react: {},
    roles: {},
    send: {},
    vote: {},
    xp: {},
    xpstatus: {},
    pin: {},
    unpin: {},
    slowmode: {},
    edit: {},
    delete: {},
    id: {},
    alert : {},
    dm : {}
  },
  debug: {
    avatar: {},
    help: {},
    vote: {},
    roll: {}
  },
  cdc : {},
  dm: {
    level: {}
  }
}
