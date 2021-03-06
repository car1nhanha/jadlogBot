import { Tabletojson } from 'tabletojson';
import { Telegraf } from 'telegraf';
require('dotenv').config();

export const bot = new Telegraf(process.env.TOKEN_TELEGRAM);

const emojis = {
  data(data): string {
    const newData = new Date(data);
    return `馃棑 ${data}, ${newData.getHours() <= 17 ? '馃寘' : '馃寖'}`;
  },
  origem(): string {
    return '馃殮';
  },
  status(): string {
    return '馃殯';
  },
  destino(): string {
    return '馃彚';
  },
  documento(): string {
    return '馃搫';
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
馃摑 Comandos:
\n digite o c贸digo apenas ex: 012345678901234
\n /help para ver os comandos
\n /resumo *c贸digo* para ver o resumo da ultima movimenta莽茫o
`);
});

bot.start((ctx) =>
  ctx.reply(`
馃 Ol谩, eu sou o rastreador n茫o oficial para a Jadlog\n
digite o c贸digo apenas ex: 012345678901234\n
ou use o comando /resumo + *c贸digo* para ver o resumo da ultima movimenta莽茫o
  `),
);
bot.help((ctx) => ctx.reply('Send me a sticker'));

// comando sem c贸digo
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

// comando com o c贸digo
bot.command('resumo', async (ctx) => {
  const id = ctx.message.text.split(' ')[1];
  ctx.reply(`Aguarde um momento...`);
  ctx.reply(`Esta foi a 煤ltima movimenta莽茫o:`);
  rastreador(id)
    .then((response) => {
      ctx.reply(`${response[response.length - 1]}`);
    })
    .catch((error) => {
      ctx.reply(`${error}`);
    });
});
