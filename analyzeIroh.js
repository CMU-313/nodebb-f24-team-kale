'use strict';

const fs = require('fs');
const Iroh = require('iroh');

const code = fs.readFileSync('src/prestart.js', 'utf8');

const stage = new Iroh.Stage(code);

const varListener = stage.addListener(Iroh.VAR);

varListener.on('after', (e) => {
	const output = `Variable assigned: ${e.name} = ${e.value}\n`;
	fs.appendFileSync('iroh-output.txt', output);
});

eval(stage.script);
