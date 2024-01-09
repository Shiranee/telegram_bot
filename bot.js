// libraries
process.env.TZ = 'America/Sao_Paulo';
const TelegramBot = require('node-telegram-bot-api');
const schedule = require('node-schedule');
const { Pool } = require('pg');

//bot connection token
const token = '';
const bot = new TelegramBot(token, { polling: true });
let chatName = '';

// time options
let options = {
  timeZone: 'America/Sao_Paulo',
  hour12: false,
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
};

// currency format for BRL
let currency = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

//function to generate the current time stamp
let callTime = function () {
  return new Date().toLocaleDateString('pt-BR', options)
}

// database conection settings
const client = new Pool({
    user: ''
  , host: ''
  , database: ''
  , password: ''
  , port: ''
});

// alerts if the conection was sucessfull
client.connect().then(() => {
  console.log('Connected to PostgreSQL database!'); 
}).catch((err) => {
  console.error('Error connecting to the database:', err);
});

// database query
let query = `
  SELECT
          1000 AS revenue
        , '10:30' AS last_order
`;

// database query
let query2 = `
  SELECT
          500 AS revenue_yt
`;

// sql connector
function asyncQuery(conection, sqlQuery) {
  return new Promise((resolve, reject) => {
    conection.query(sqlQuery, function(err, result) {
           if (err) {
               reject(err);
           } else {
               resolve(result);
           }
       })
  })
}

// command to get the chat id and send the message to the group with the values fetched from the database
const sendTelMessage = function () {
  bot.getChat(chatName).then(function(chat) {
    let chatID = chat.id;
    
    async function getQuery() {
      let dbRevenue = await asyncQuery(client, query);
      let revenue = dbRevenue.rows[0].revenue;
      let revenueCurrency = currency.format(revenue);
      let lastOrder = dbRevenue.rows[0].last_order;

      let dbRevenueYt = await asyncQuery(client, query2);
      let revenueYt = dbRevenueYt.rows[0].revenue_yt;
      let revenueYtCurrency = currency.format(revenueYt);

      let growth = Math.round((revenue / revenueYt - 1)*100);
      let DoD = (growth >= 0) ? `↑ ${growth}%, Maior` : `↓ ${growth}%, Menor`;

      let messageText = `Receita: ${revenueCurrency} (${DoD} comparado a ontem)
Ultimo Pedido: ${lastOrder}`

      bot.sendMessage(chatID, messageText);
      console.log(messageText, revenueYt, revenue);
    }
    
    getQuery();

  });
}

sendTelMessage();

//execute the function to send a message at given intervals
schedule.scheduleJob('*/5 * * * *', sendTelMessage);