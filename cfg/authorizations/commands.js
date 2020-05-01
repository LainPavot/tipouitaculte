module.exports = {
  commu : {
    avatar : {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    ban: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    bienvenue: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.invite.id]
      },
      auths : {
        type: "any"
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
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    help : {
      chans : {
        type : "any"
      },
      auths : {
        type : "any"
      },
      roles : {
        type : "any"
      }
    },
    hotreload: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      },
      auths : {
        type: "whitelist",
        list: devTeam
      },
      roles : {
        type: "any"
      }
    },
    kick: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    level: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    list: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    new: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id]
      },
      auths : {
        type: "whitelist",
        list: devTeam
      },
      roles : {
        type: "any"
      }
    },
    nm: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    profil: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    propose: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id, PUB.salons.bots.id, PUB.salons.blueprint.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    purifier: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id]
      },
      auths : {
        type: "any"
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
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    raid: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    react: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    return: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.invite.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    roles: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    send: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    time: {
        chans: {
            type: "whitelist",
            list: [PUB.salons.bots.id]
        },
        auths: {
            type: "any"
        },
        roles: {
            type: "any"
        }
    },
    vote: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    xp: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    xpstatus: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.bots.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
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
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    unpin: {
      chans : {
        type: "whitelist",
        list: [PUB.salons.debug.id, PUB.salons.botsecret.id]
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    roll: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    }
  },
  vigi : {
    avatar : {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    ban: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    help : {
      chans : {
        type : "any"
      },
      auths : {
        type : "any"
      },
      roles : {
        type : "any"
      }
    },
    hotreload: {
      chans : {
        type : "any"
      },
      auths : {
        type: "whitelist",
        list: devTeam
      },
      roles : {
        type: "any"
      }
    },
    kick: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    nm: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    profil: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    quarantaine: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    raid: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    react: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    roles: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    send: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    time: {
        chans: {
            type: "any"
        },
        auths: {
            type: "any"
        },
        roles: {
            type: "any"
        }
    },
    vote: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    xp: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    xpstatus: {
      chans : {
        type : "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    pin: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    },
    unpin: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    }
  },
  debug: {
    avatar: {
      chans: {
        type: "any"
      },
      auths: {
        type: "any"
      },
      roles: {
        type: "any"
      }
    },
    help: {
      chans: {
        type: "any"
      },
      auths: {
        type: "any"
      },
      roles: {
        type: "any"
      }
    },
    vote: {
      chans: {
        type: "any"
      },
      auths: {
        type: "any"
      },
      roles: {
        type: "any"
      }
    },
    time: {
        chans: {
            type: "whitelist",
            list: [PUB.salons.bots.id]
        },
        auths: {
            type: "any"
        },
        roles: {
            type: "any"
        }
    },
    roll: {
      chans : {
        type: "any"
      },
      auths : {
        type: "any"
      },
      roles : {
        type: "any"
      }
    }
  },
    cdc: {
        time: {
            chans: {
                type: "whitelist",
                list: [PUB.salons.bots.id]
            },
            auths: {
                type: "any"
            },
            roles: {
                type: "any"
            }
        }
    },
  dm: {
    level: {
      chans: {
        type: "any"
      },
      auths: {
        type: "any"
      },
      roles: {
        type: "any"
      }
    }
  }
}