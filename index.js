const config = require("./config");
const sess = new Map();
const usersess = new Map(); // user match session.

function generateSess(dandelion, wind, maxCol = 5, maxRow = 5) {
  let newSess = {
    turn: "d",
    map: {},
    dandelions: new Set(),
    seeds: new Set(),
    directions: new Set(),
    dandelion, wind
  };

  let sessID = Date.now() + Math.random().toString(36);

  for (let col = 0; col < maxCol; col++) {
    const a = String.fromCharCode(65 + col);
    newSess.map[a] = [];
    for (let row = 1; row <= maxRow; row++) {
      newSess.map[a].push(" ");
    }
  }

  sess.set(sessID, newSess);
  return sessID;
}

function genLine(n) {
  let str = "";
  for (let i = 0; i < n; i++) {
    str += "-";
  }

  return str;
}

function generateWindDirection(id, str) {
  const s = sess.get(id);
  let compass =`    Wind Directions
         ${s.directions.has("N") ? " " : "N"}
         |
  ${s.directions.has("NW") ? "  " : "NW"}     |     ${s.directions.has("NE") ? "  " : "NE"}
         |
         |
${s.directions.has("W") ? " " : "W"} -------+------- ${s.directions.has("E") ? " " : "E"}
         |
         |
  ${s.directions.has("SW") ? "  " : "SW"}     |     ${s.directions.has("SE") ? "  " : "SE"}
         |
         ${s.directions.has("S") ? " " : "S"}
`.split("\n");

  return str.split("\n")
    .map((str, i) => {
      return str + "     " + compass[i];
    }).join("\n");
}

function identifyPos(id, i, n) {
  const s = sess.get(id);
  // i => Column Position (A, B, C, D, E)
  // n => Row Position (0, 1, 2, 3, 4)

  let pos = i + (n+1);
  if (s.dandelions.has(pos)) return "*";
  else if (s.seeds.has(pos)) return ",";
  else return " ";
}

function draw(id) {
  if (!sess.has(id)) return "";
  const s = sess.get(id);
  let str = "   " + Object.keys(s.map).map((n, i) => i+1).join("   ");
  let row = 0
  for (const i of Object.keys(s.map)) {
    const l = `${i}| ${s.map[i].map((_, n) => identifyPos(id, i, n)).join(" | ")} |`;
    row = l.length;
    str += `\n${genLine(row)}`;
    str += `\n${l}`;
  }
  str += `\n${genLine(row)}`;

  str = generateWindDirection(id, str);

  return str;
}

function str(n) {
  return String.fromCharCode(65 + n);
}

function num(n) {
  let charCodeA = 'A'.charCodeAt(0);
  let inputCharCode = n.toUpperCase().charCodeAt(0);

  return inputCharCode - charCodeA + 1;
 }

function putDandelion(id, p) {
  const s = sess.get(id);
  if (s.turn !== "d") return "";
  if (p.length > 2 || p.length < 2) return "";
  p = p.toUpperCase();

  let pos = p.split("");
  if (pos[1] > 5 || pos[1] < 1) return "";
  if (!s.map[pos[0]] || !s.map[pos[0]][pos[1]-1]) return "";
  if (s.dandelions.has(p)) return "";

  s.dandelions.add(p);
  s.seeds.delete(p);
  s.turn = "w";

  if ((s.dandelions.size + s.seeds.size) >= 25) {
    usersess.delete(s.dandelion);
    usersess.delete(s.wind);
    sess.delete(id);
    return `${s.dandelion} win.`;
  }

  return `${s.wind}: Wind, It's your turn.`;
}

function wind(id, dir) {
  const s = sess.get(id);
  if (s.turn !== "w") return "";
  let invalid = false;
  dir = dir.toUpperCase();

  if (s.directions.has(dir)) return "";
  for (const d of s.dandelions) {
    if (invalid) break;
    // d => dandelion position (Could be D4)
    const pos = d.split("");
    // pos[0] => A, B, C, D, or E
    // pos[1] => 1, 2, 3, 4, or 5
    switch (dir) {
      case "E": {
        let seedPos = parseInt(pos[1]) + 1;
        while (true) {
          if (!s.map[pos[0]][seedPos-1]) break;
          s.seeds.add(pos[0] + seedPos);
          seedPos++
        }
        break;
      }
      case "SE": {
        let col = num(pos[0]);
        let row = parseInt(pos[1]) + 1;
        while (true) {
          if (!s.map[str(col)] || !s.map[str(col)][row-1]) break;
          s.seeds.add(str(col) + row);
          col++
          row++
        }
        break;
      }
      case "S": {
        let seedPos = num(pos[0]);
        while (true) {
          if (!s.map[str(seedPos)]) break;
          s.seeds.add(str(seedPos) + pos[1]);
          seedPos++
        }
        break;
      }
      case "SW": {
        let col = num(pos[0])-1;
        let row = parseInt(pos[1]);
        while (true) {
          if (!s.map[str(col)] || !s.map[str(col)][row-1]) break;
          s.seeds.add(str(col) + row);
          col++
          row--
        }
        break;
      }
      case "W": {
        let seedPos = parseInt(pos[1])-1;
        while (true) {
          if (!s.map[pos[0]][seedPos-1]) break;
          s.seeds.add(pos[0] + seedPos);
          seedPos--
        }
        break;
      }
      case "NW": {
        let col = num(pos[0])-1;
        let row = parseInt(pos[1]);
        while (true) {
          if (!s.map[str(col)] || !s.map[str(col)][row-1]) break;
          s.seeds.add(str(col) + row);
          col--
          row--
        }
        break;
      }
      case "N": {
        let seedPos = num(pos[0])-1;
        while (true) {
          if (!s.map[str(seedPos)]) break;
          s.seeds.add(str(seedPos) + pos[1]);
          seedPos--
        }
        break;
      }
      case "NE": {
        let col = num(pos[0])-1;
        let row = parseInt(pos[1]);
        while (true) {
          if (!s.map[str(col)] || !s.map[str(col)][row-1]) break;
          s.seeds.add(str(col) + row);
          col--
          row++
        }
        break;
      }
      default:
        invalid = true;
        break;
    }
  }

  for (const d of s.dandelions) {
    s.seeds.delete(d);
  }

  if (invalid) return "";
  else {
    s.turn = "d";
    s.directions.add(dir);

    if ((s.directions.size >= 7) || (s.dandelions.size + s.seeds.size) >= 25) {
      usersess.delete(s.dandelion);
      usersess.delete(s.wind);
      if ((s.dandelions.size + s.seeds.size) >= 25) {
        sess.delete(id);
        return `${s.dandelion} win.`;
      } else {
        sess.delete(id);
        return `${s.wind} win.`;
      }
    }
    return `${s.dandelion}: Dandelion, It's your turn.`;
  }
}


// IRC bot.
const net = require("net");
const irc = new net.Socket();
const connectIRC = _ => irc.connect(config.port, config.host);

irc.on("connect", _ => {
  console.log("--- Connected.");
  irc.setEncoding("utf8");
  irc.write([
    `NICK ${config.nick}`,
    `USER ${config.user} * * :${config.name}`,
  ].join("\r\n") + "\r\n");
});

let nicktries = 1
irc.on("data", data => {
  console.log(data);
  let mask = data.split(" ")[0].slice(1);
  let nick = mask.split("!")[0];
  if (data.startsWith(":")) data = data.split(" ").slice(1).join(" ");
  if (data.startsWith("PING ")) return irc.write("PONG " + data.slice(5));

  if (data.startsWith("001")) return irc.write(config.channels.map(i => "JOIN " + i).join("\r\n") + "\r\n");

  if (data.startsWith("PRIVMSG ")) {
    const msg = data.slice(0, data.length - 2).split(":").slice(1).join(":");
    const chan = data.slice(8, (data.length-msg.length)-4);
    const argv = msg.split(" ");
    const sessID = usersess.get(nick);

    switch (argv[0]) {
      case "!dandelion": {
        let dandelion = nick;
        let wind = argv[1];

        if (!wind)
          return irc.msg(chan, "Usage: !dandelion [windplayer-nick]");
        if (sessID)
          return irc.msg(chan, "You are in a match. To stop, Send !destroy");
        if (usersess.has(wind))
          return irc.msg(chan, "That user is in a match.");

        let id = generateSess(dandelion, wind);
        usersess.set(dandelion, id);
        usersess.set(wind, id);
        irc.msg(chan, "[Tip: To stop current match, Type !destroy]");
        irc.msg(chan, `${dandelion}: Dandelion, It's your turn.`);
        for (const msg of draw(id).split("\n")) {
          irc.msg(chan, msg);
        }
        break;
      }
      case "!wind": {
        let dandelion = argv[1];
        let wind = nick;

        if (!dandelion)
          return irc.msg(chan, "Usage: !wind [dandelionplayer-nick]");
        if (sessID)
          return irc.msg(chan, "You are in a match. To stop, Send !destroy");
        if (usersess.has(dandelion))
          return irc.msg(chan, "That user is in a match.");

        let id = generateSess(dandelion, wind);
        usersess.set(dandelion, id);
        usersess.set(wind, id);
        irc.msg(chan, "[Tip: To stop current match, Type !destroy]");
        irc.msg(chan, `${dandelion}: Dandelion, It's your turn.`);
        for (const msg of draw(id).split("\n")) {
          irc.msg(chan, msg);
        }
        break;
      }
      case "!destroy": {
        if (!sessID) return irc.msg(chan, "You are not in a match.");
        const s = sess.get(sessID);
        usersess.delete(s.dandelion);
        usersess.delete(s.wind);
        sess.delete(sessID);
        irc.msg(chan, "Match succesfully destroyed.");
        break;
      }
      default: {
        if (!sessID) return;
        const s = sess.get(sessID);
        switch (s.turn) {
          case "w": {
            if (s.wind !== nick) return;
            const msg = wind(sessID, argv[0]);
            if (msg?.length) {
              irc.msg(chan, msg);
              for (const msg of draw(sessID).split("\n")) {
                irc.msg(chan, msg);
              }
            }
            break;
          }
          case "d":
            if (s.dandelion !== nick) return;
            const msg = putDandelion(sessID, argv[0]);
            if (msg?.length) {
              irc.msg(chan, msg);
              for (const msg of draw(sessID).split("\n")) {
                irc.msg(chan, msg);
              }
            }
            break;
        }
        break;
      }
    }
  }
});

irc.msg = (chan, msg) => irc.write(`PRIVMSG ${chan} :${msg}\r\n`);
irc.on("close", connectIRC);
irc.on("error", console.error);

setInterval(_ =>
  irc.write("PING :" + Date.now() + "\r\n")
, 1000 * 30);

connectIRC();

