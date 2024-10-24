const fs = require('fs');
const Iroh = require('iroh');

let code = fs.readFileSync('src/prestart.js', 'utf8');

let stage = new Iroh.Stage(code);

let varListener = stage.addListener(Iroh.VAR);

varListener.on("after", (e) => {
  const output = `Variable assigned: ${e.name} = ${e.value}\n`;
  fs.appendFileSync('iroh-output.txt', output);
});

eval(stage.script);
