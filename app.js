process.env["NTBA_FIX_319"] = 1;

const TelegramBot = require("node-telegram-bot-api");
const config = require("config");
const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const fetch = require("node-fetch");
const CronJob = require("cron").CronJob;

const TOKEN = config.get("token");
const PORT = config.get("port");
const bot = new TelegramBot(TOKEN);
bot.setWebHook(`${config.get("url")}/bot`);

const app = new Koa();
const router = Router();

router.post("/bot", ctx => {
	const { body } = ctx.request;
	bot.processUpdate(body);
	ctx.status = 200;
});

app.use(bodyParser());
app.use(router.routes());

app.listen(PORT, () => {
	console.log(`Listening on ${PORT}`);
});

/////* Планировщик задач *////
let morningGreetJob = new CronJob({
	cronTime: "00 00 09 * * 1-5",
	onTick: () => {
		let morningGreet = "Доброе утро!";
		let chatId = -1001095382082;
		bot.sendMessage(chatId, morningGreet);
	},
	start: true,
	timeZone: "Europe/Moscow"
});

let timeToEat = new CronJob({
	cronTime: "00 00 12 * * 1-5",
	onTick: () => {
		let eatMessage = "Время обеда, приятного аппетита.";
		let chatId = -1001095382082;
		bot.sendMessage(chatId, eatMessage);
	},
	start: true,
	timeZone: "Europe/Moscow"
});

let goHome = new CronJob({
	cronTime: "00 55 17 * * 1-5",
	onTick: () => {
		let byeMessage = "Пора домой!";
		let chatId = -1001095382082;
		bot.sendMessage(chatId, byeMessage);
	},
	start: true,
	timeZone: "Europe/Moscow"
});

let itsFriday = new CronJob({
	cronTime: "03 55 17 * * 5",
	onTick: () => {
		let bamboleilo = "БАМБОЛЕЙЛОООО, БАМБОЛЕЙЛООООО!";
		let voiceId = "AwADAgADfAEAAl3-kUqHo5Gi9RablQI";
		let chatId = -1001095382082;
		bot.sendVoice(chatId, voiceId);
		bot.sendMessage(chatId, bamboleilo);
	},
	start: true,
	timeZone: "Europe/Moscow"
});

/////* Обработчики чата для бота *////
/* Отладка */
bot.on("message", msg => {
	const {
		chat: { id }
	} = msg;
	console.log(msg);
});

/* Ответ на /help */
bot.onText(/\/help/, msg => {
	const {
		chat: { id }
	} = msg;
	let answer = "Джаред пока ничего не умеет 😕";
	bot.sendMessage(id, answer);
});

/* Ответ на /about */
bot.onText(/\/about/, msg => {
	const {
		chat: { id }
	} = msg;
	let answer =
		"Джаред скрам-мастер от бога. Он поможет с любым вопросом и решит любую проблему. Просто спроси у Джареда!";
	bot.sendMessage(id, answer);
});

/* Стикер с Путиным в ответ на упоминание */
bot.on("message", msg => {
	const {
		chat: { id },
		text
	} = msg;
	let textInclude = "путин";
	let stickerId = "CAADAgADdwEAAp6c1AXSYeGRV6WhyAI";
	if (
		text &&
		text
			.toString()
			.toLowerCase()
			.includes(textInclude)
	) {
		bot.sendSticker(id, stickerId);
	}
});

bot.onText(/\/gifme/, msg => {
	const {
		chat: { id }
	} = msg;
	const text = "Какую гифку запостить?";

	let keyboardStr = JSON.stringify({
		inline_keyboard: [
			[
				{ text: "Смешную", callback_data: "funny" },
				{ text: "Фэйл", callback_data: "fail" },
				{ text: "Котэ", callback_data: "cats" },
				{ text: "Мемас", callback_data: "memes" },
				{ text: "Рандом", callback_data: "random" }
			]
		]
	});

	let keyboard = {
		reply_markup: JSON.parse(keyboardStr)
	};

	bot.sendMessage(id, text, keyboard);
});

const giphy = {
	baseURL: "https://api.giphy.com/v1/gifs/",
	key: config.get("giphy_key"),
	type: "random",
	rating: "pg-13"
};

bot.on("callback_query", msg => {
	const {
		chat: { id }
	} = msg;
	console.log(msg);
	let gifURL = encodeURI(
		giphy.baseURL +
			giphy.type +
			"?api_key=" +
			giphy.key +
			"&tag=" +
			msg.data
	);

	getAsyncURL(gifURL, id);
});

async function getAsyncURL(url, chatId) {
	try {
		const res = await fetch(url);
		const data = await res.json();
		bot.sendDocument(chatId, data.data.images.downsized_large.url);
	} catch (err) {
		console.log(err);
	}
}

// getAsyncURL(gifURL);

// bot.onText(/\/gifme/, msg => {
// 	const {
// 		chat: { id }
// 	} = msg;
// 	const giphyTag = {
// 		funny: "funny",
// 		fail: "fail",
// 		cats: "cats",
// 		memes: "memes"
// 	}
// 	const giphy = {
// 		baseURL: "https://api.giphy.com/v1/gifs/",
// 		key: config.get("giphy_key"),
// 		tag: gifTags.fail,
// 		type: "random",
// 		rating: "pg-13"
// 	};
// 	let gifURL = encodeURI(
// 		giphy.baseURL + giphy.type + "?api_key=" + giphy.key + "&tag=" + giphyTag.funny
// 	);

// 	async function getAsyncURL(url) {
// 		try {
// 			const res = await fetch(url);
// 			const data = await res.json();
// 			bot.sendDocument(id, data.data.images.downsized_large.url);
// 		} catch (err) {
// 			console.log(err);
// 		}
// 	}
// 	getAsyncURL(gifURL);
// });
