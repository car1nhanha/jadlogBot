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
  ctx.reply('📝 Comandos: \n\n digite o código apenas \n\n 012345678901234');
});

bot.start((ctx) => ctx.reply('Welcome'));
bot.help((ctx) => ctx.reply('Send me a sticker'));
bot.hears('hi', (ctx) => ctx.reply('Hey there'));
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
