import { Tabletojson } from 'tabletojson';
import { Telegraf } from 'telegraf';
require('dotenv').config();

export const bot = new Telegraf(process.env.TOKEN_TELEGRAM);

const emojis = {
  data(data): string {
    const newData = new Date(data);
    return `🗓 ${data}, ${newData.getHours() <= 17 ? '🌅' : '🌃'}`;
  },
  origem(): string {
    return '🚚';
  },
  status(): string {
    return '🚛';
  },
  destino(): string {
    return '🏢';
  },
  documento(): string {
    return '📄';
  },
};

const formatador = (vetor: any) => {
  const response = vetor.map((item) => {
    return `
Data/ Hora: ${emojis.data(item['Data/ Hora'])}

Origem: ${emojis.origem()} ${item['Ponto Origem']}

Status: ${emojis.status()} ${item['Status']}

Destino: ${emojis.destino()} ${item['Ponto Destino']}

Documento: ${emojis.documento()} ${item['Documento']}
    `;
  });
  return response;
};

export const rastreador = async (id: string) => {
  try {
    const response = await Tabletojson.convertUrl(
      `https://www.jadlog.com.br/siteInstitucional/tracking_dev.jad?cte=${id}`,
      (e) => {
        return formatador(e[0]);
      },
      (err) => {
        return err;
      },
    );

    return response;
  } catch (error) {
    return error;
  }
};

const regex = /^[0-9]{14}$/;

// comandos
bot.command('help', async (ctx) => {
  ctx.reply(`
📝 Comandos:
\n digite o código apenas ex: 012345678901234
\n /help para ver os comandos
\n /resumo *código* para ver o resumo da ultima movimentação
`);
});

bot.start((ctx) =>
  ctx.reply(`
🤖 Olá, eu sou o rastreador não oficial para a Jadlog\n
digite o código apenas ex: 012345678901234\n
ou use o comando /resumo + *código* para ver o resumo da ultima movimentação
  `),
);
bot.help((ctx) => ctx.reply('Send me a sticker'));

// comando sem código
bot.hears(regex, (ctx) => {
  const id = ctx.message.text;
  ctx.reply(`Aguarde um momento...`);
  rastreador(id)
    .then((response) => {
      response.forEach((item, i) => {
        setTimeout(() => {
          ctx.reply(`${item}`);
        }, 1000 * i);
      });
    })
    .catch((error) => {
      ctx.reply(`${error}`);
    });
});

// comando com o código
bot.command('resumo', async (ctx) => {
  const id = ctx.message.text.split(' ')[1];
  ctx.reply(`Aguarde um momento...`);
  ctx.reply(`Esta foi a última movimentação:`);
  rastreador(id)
    .then((response) => {
      ctx.reply(`${response[response.length - 1]}`);
    })
    .catch((error) => {
      ctx.reply(`${error}`);
    });
});
