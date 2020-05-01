let dateFormat = require("dateformat")
dateFormat.i18n = {
    dayNames: [
        "Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi",
    ],
    monthNames: [
        "Jan", "Fév", "Mars", "Avr", "Mai", "Juin", "Juil", "Août", "Sept", "Oct", "Nov", "Déc", "Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ],
    timeNames: [
        'a', 'p', 'am', 'pm', 'A', 'P', 'AM', 'PM'
    ]
}

module.exports = {
  alias: [
    "time",
    "date",
    "arrivé",
    "arrivée",
    "arriver"
  ],
  activated: true,
  name : "Time",
  desc : "Donne la date et l'heure de votre dernière arrivée sur le serveur.",
  schema : "!time",
  authorizations : TiCu.Authorizations.getAuth("command", "time"),
  run : function(params, msg) {
      if (msg.member === PUB.user.yuffy.id) {
          d = new Date()
          msg.reply("tu es arrivée sur le serveur " + dateFormat(d, "dddd d mmmm yyyy") + "à 13:12.")
      } else {
          d = msg.member.joinedAt
          msg.reply("tu es arrivæ sur le serveur " + dateFormat(d, "dddd d mmmm yyyy à HH:MM:ss") + ".")
      }
  }
}
