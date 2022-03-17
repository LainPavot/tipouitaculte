const MAX = 25
const MIN = 3

const boomTable = [
  "https://media.tenor.com/images/abd1a7caf83fd0fe0c8136ec25d1bb88/tenor.gif",
  "https://cdn.discordapp.com/attachments/479315447452532746/693481167994880020/giphy.gif",
  "https://i.gifer.com/22ks.gif",
  "https://media.giphy.com/media/2sddCIZRYfiPlNeLZn/giphy.gif",
  "https://media.giphy.com/media/z9iE1SPAptyLK/giphy.gif",
  "https://media.giphy.com/media/xTiTnK1UBZjC4sW6mA/giphy.gif",
  "https://media.giphy.com/media/d4aVHC1HKnButuXC/giphy.gif",
  "https://media.giphy.com/media/l4lQW9KfRQscU0ds4/giphy.gif",
  "https://media.giphy.com/media/C9rGEm6SUnOE/giphy-downsized.gif",
  "https://media.giphy.com/media/AAWBs9MMvLfnW/giphy.gif",
  "https://media.giphy.com/media/laUY2MuoktHPy/giphy.gif",
  "https://media.giphy.com/media/XKCdA6ERnXp6M/giphy.gif",
  "exports/autoGames/images/kaboomBongoCat.gif",
  "exports/autoGames/images/ok_boomer.gif",
  "exports/autoGames/images/BOOM02.gif",
  "exports/autoGames/images/boomPump.gif",
  "exports/autoGames/images/dalekBoom.gif",
  "exports/autoGames/images/ArgBoom.gif"
]

module.exports = {
  activated: true,
  methodName: "tictac",
  name : "Tic Tac Boom",
  desc : "Fait exploser la bombe de façon aléatoire",
  trigger: /[tT][a-zA-Z]+[cCkK]/,
  server: "tipoui",
  channel: PUB.salons.tictacboom.id,
  init : function() {
    if (games[this.name]) {
      games[this.name].stop()
    }
    maxilog[global[this.server].id].send(`${this.name} commence.`)
    this.nbMsg = 0
    this.limit = 1
    var tcb_channel = global[this.server].channels.resolve(this.channel) ;
    if (tcb_channel === null) {
      console.log(`The channel TiCTacBoom (${this.channel}) has not been found.`) ;
      return ;
    }
    games[this.name] = tcb_channel.createMessageCollector(
      m => !!m.content.match(this.trigger)
    )
    games[this.name].on("end", () => maxilog[global[this.server].id].send(`${this.name} a pris fin.`))
    games[this.name].on("collect", m => {
      this.nbMsg++
      if (this.nbMsg >= this.limit) {
        global[this.server].channels.resolve(this.channel).send("BOOM ! ", {files:[boomTable[Math.floor(Math.random() * boomTable.length)]]})
        this.nbMsg = 0
        this.limit = Math.ceil(Math.random() * (MAX - MIN)) + MIN
      }
    })
  }
}
