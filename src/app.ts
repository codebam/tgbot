"use strict";

const util = require('util');
const fs = require('fs');
const toml = require('toml');
const Telegraf = require('telegraf');
const express = require('express')
const serverless = require('serverless-http');
const chai = require('chai');

// Methods
const read = util.promisify(fs.readFile);

const choose = (arr: Array<any>) => arr[Math.floor(Math.random() * arr.length)];

const buildBot = (conf: any) => ({
  bot: new Telegraf(conf.default.token),
  config: conf.default,
});

const buildApp = async (tg: any) => {
  const exp = express();
  exp.use(tg.bot.webhookCallback('/secret-path'));
  tg.bot.telegram.setWebhook('https://jolly-davinci-c9fb35.netlify.com:8443/.netlify/functions/app/secret-path');
  exp.get('/', (req: any, res: any) => {
    res.send('Hello World!');
  });
  exp.listen(3000, () => {
    console.log('Example app listening on port 3000!');
  });
  return ({
    ...tg,
    app: exp,
  });
};

const buildHandler = (tg: any) => ({
  ...tg,
  handler: serverless(tg.app),
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

const configureBot = (tg: any) => {
  Object.entries(tg.config.strings.individual).forEach((el: any) => singleCommand(tg, el));
  Object.entries(tg.config.strings.random).forEach((el: any) => randCommand(tg, el));
  Object.entries(tg.config.strings.list).forEach((el: any) => listCommand(tg, el));
  return tg;
};

const startBot = (tg: any) => tg.bot.launch();

const tg = ({ bot: new Telegraf('207418572:AAHyA0wx27_AsYXsplB7JvKhQ7AQZB0WOsg') });

module.exports.handler = (event: any, context: any) => buildApp(tg)
  .then(buildHandler)
  .then((tg: any) => {
    tg.bot.command('help', (ctx: any) => ctx.reply('at your service'));
    return tg;
  })
  .then(startBot)
  .then((tg: any) => tg.handler(event, context));
