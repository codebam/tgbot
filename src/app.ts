"use strict";

const util = require('util');
const fs = require('fs');
const Telegraf = require('telegraf');
const toml = require('toml');

// Methods
const read = util.promisify(fs.readFile);

const choose = (arr: Array<any>) => arr[Math.floor(Math.random() * arr.length)];

const readConfig = (conf: any) => ({
  bot: new Telegraf(conf.default.token),
  config: conf.default,
});

const singleCommand = (tg: any, elem: any) => {
  tg.bot.command(elem[0], (ctx: any) => ctx.reply(elem[1]));
  return tg;
};

const randCommand = (tg: any, elem: any) => {
  tg.bot.command(elem[0], (ctx: any) => ctx.reply(choose(elem[1])));
  return tg;
};

const listReply = (elem: any) => {
  let command = `${elem[0]}\n`;
  elem[1].forEach((el: string) => command += `\n- ${el}`);
  return command;
}

const listCommand = (tg: any, elem: any) => {
  tg.bot.command(elem[0], (ctx: any) => ctx.reply(listReply(elem)));
  return tg;
};

const initialize = (tg: any) => {
  Object.entries(tg.config.individual.strings).forEach((el: any) => singleCommand(tg, el));
  Object.entries(tg.config.random.strings).forEach((el: any) => randCommand(tg, el));
  Object.entries(tg.config.list.strings).forEach((el: any) => listCommand(tg, el));
  return tg;
};

// Main
read('./config.toml', 'utf8')
  .then(toml.parse)
  .then(readConfig)
  .then(initialize)
  .then((tg: any) => tg.bot.launch())
  .then(console.log('Bot started!'));
