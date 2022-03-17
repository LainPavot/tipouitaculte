const fs = require("fs")
module.exports = function(data) {
  let action = data.action ? data.action : ""
  let target = data.target ? data.target : ""
  let content = data.content ? data.content : ""
  if (!fs.existsSync(target)) {
    console.log(`The JSON file has not been found on ${target}. Creating it.`) ;
    fs.writeFileSync(target, "[]", { flag: 'w' }, err => {})
    votesJSON = [] ;
  }
  let file = fs.readFileSync(target)
  let read = JSON.parse(file)
  if(!read) { TiCu.Log.Json("err", "read"); return false }
  let write
  switch(action) {
    case "read":
      return read
    case "write":
      write = read ? content ? {...read, ...content} : "" : ""
      if(write) {
        write = JSON.stringify(write, null, 2)
        fs.writeFileSync(target, write)
        return true
      } else { TiCu.Log.Json("err", "write"); return false }
    case "delete":
      if(read[content]) {
        delete read[content]
        write = JSON.stringify(read, null, 2)
        fs.writeFileSync(target, write)
        return true
      } else { TiCu.Log.Json("err", "delete"); return false }
    default:
      TiCu.Log.Json("err", "action")
      return false
  }
}
