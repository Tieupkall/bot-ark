if (!global.waitForPrefixs)
    global.waitForPrefixs = [];
if (!global.notWaitForPrefixs)
    global.notWaitForPrefixs = [];

module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const stringSimilarity = require('string-similarity'),
        escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        logger = require("../../utils/log.js");
    const axios = require('axios')
    const moment = require("moment-timezone");
    return async function ({ event }) {
        const dateNow = Date.now()
        const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss DD/MM/YYYY");
        const { allowInbox, PREFIX, ADMINBOT, NDH, DeveloperMode, adminOnly, keyAdminOnly, ndhOnly, adminPaOnly } = global.config;

        const { userBanned, threadBanned, threadInfo, threadData, commandBanned } = global.data;
        const { commands, cooldowns } = global.client;
        const { client } = global;
        let { body, senderID, threadID, messageID } = event;
        senderID = String(senderID);
        threadID = String(threadID);

        const threadSetting = threadData.get(threadID) || {}
        const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex((threadSetting.hasOwnProperty("PREFIX")) ? threadSetting.PREFIX : PREFIX)})\\s*`);
        // if (senderID == '100010382497517')
        //   console.log(event.messageReply);
        // if (!prefixRegex.test(body) && !global.waitForPrefixs.includes(threadID)) console.log(global.waitForPrefixs, 
        const callCommandWithoutPrefix = global.waitForPrefixs.includes(event.messageReply?.messageID);
        if (!prefixRegex.test(body) && !callCommandWithoutPrefix) return;
        const adminbot = require('./../../config.json');
        //// admin -pa /////
        if (!global.data.allThreadID.includes(threadID) && !ADMINBOT.includes(senderID) && adminbot.adminPaOnly == true)
            return api.sendMessage("𝗠𝗢𝗗𝗘 » 𝗖𝗵𝗶̉ 𝗰𝗼́ 𝗮𝗱𝗺𝗶𝗻 𝗺𝗼̛́𝗶 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝗯𝗼𝘁 𝘁𝗿𝗼𝗻𝗴 𝗶𝗻𝗯𝗼𝘅 𝗿𝗶𝗲̂𝗻𝗴 💬", threadID, messageID)
        ////end 
        if (!ADMINBOT.includes(senderID) && adminbot.adminOnly == true) {
            if (!ADMINBOT.includes(senderID) && adminbot.adminOnly == true) return api.sendMessage('𝗠𝗢𝗗𝗘 » 𝗖𝗵𝗶̉ 𝗮𝗱𝗺𝗶𝗻 𝗺𝗼̛́𝗶 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝗯𝗼𝘁 👑', threadID, messageID)
        }
        if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly == true) {
            if (!NDH.includes(senderID) && !ADMINBOT.includes(senderID) && adminbot.ndhOnly == true) return api.sendMessage('𝗠𝗢𝗗𝗘 » 𝗖𝗵𝗶̉ 𝘀𝘂𝗽𝗽𝗼𝗿𝘁 𝗯𝗼𝘁 𝗺𝗼̛́𝗶 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝗯𝗼𝘁 👾', threadID, messageID)
        }
        const dataAdbox = require('./../../modules/commands/cache/data.json');

        const threadInf = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
        let findd;
        if (event.isGroup)
            findd = threadInf.adminIDs ? threadInf.adminIDs.find(el => el.id == senderID) : '';


        // check permission for gpt and use command without prefix
        if (callCommandWithoutPrefix && ![
            ...ADMINBOT,
            ...NDH,
            ...(threadInf.adminIDs || []).map(el => el.id),
        ].includes(senderID))
            return api.sendMessage("Bạn không có quyền sử dụng chức năng này", threadID, messageID);

        if (dataAdbox.adminbox.hasOwnProperty(threadID) && dataAdbox.adminbox[threadID] == true && !ADMINBOT.includes(senderID) && !findd && event.isGroup == true) return api.sendMessage('𝗠𝗢𝗗𝗘 » 𝗖𝗵𝗶̉ 𝗾𝘂𝗮̉𝗻 𝘁𝗿𝗶̣ 𝘃𝗶𝗲̂𝗻 𝗺𝗼̛́𝗶 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗱𝘂̀𝗻𝗴 𝗯𝗼𝘁 🍄', event.threadID, event.messageID)
        if (userBanned.has(senderID) || threadBanned.has(threadID) || allowInbox == ![] && senderID == threadID) {
            if (!ADMINBOT.includes(senderID.toString())) {
                if (userBanned.has(senderID)) {
                    const { reason, dateAdded } = userBanned.get(senderID) || {};
                    return api.sendMessage(global.getText("handleCommand", "userBanned", reason, dateAdded), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5 * 1000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                } else {
                    if (threadBanned.has(threadID)) {
                        const { reason, dateAdded } = threadBanned.get(threadID) || {};
                        return api.sendMessage(global.getText("handleCommand", "threadBanned", reason, dateAdded), threadID, async (err, info) => {
                            await new Promise(resolve => setTimeout(resolve, 5 * 1000));
                            return api.unsendMessage(info.messageID);
                        }, messageID);
                    }
                }
            }
        }
        const [matchedPrefix] = body.match(prefixRegex) || [''];
        const args = body.slice(matchedPrefix.length).trim().split(/ +/);

        commandName = args.shift().toLowerCase();
        var command = commands.get(commandName);
        if (!command) {
            var allCommandName = [];
            const commandValues = commands['keys']();
            for (const cmd of commandValues) allCommandName.push(cmd)
            const checker = stringSimilarity.findBestMatch(commandName, allCommandName);
            const timeStart = Date.now();
            const moment = require("moment-timezone");
            const timeNow = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY || HH:mm:ss");
            const xuly = Math.floor((Date.now() - global.client.timeStart)/4444)
 var trinhtrang = xuly < 10 ? " 𝗧𝗼̂́𝘁":
  xuly > 10 && xuly < 100 ? " 𝗧𝗮̣𝗺 𝗼̂̉𝗻" : " 𝗗𝗲𝗹𝗮𝘆";
            if (checker.bestMatch.rating >= 0.5) command = client.commands.get(checker.bestMatch.target);
            else {
                if (!global.waitForPrefixs.includes(event.messageReply?.messageID))
                    api.sendMessage(`[ 🐳 ] 𝗫𝗶𝗻 𝗰𝗵𝗮̀𝗼, 𝐎𝐳𝐚𝐰𝐚 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗴𝗶𝘂́𝗽\n𝗴𝗶̀ 𝗰𝗵𝗼 𝗯𝗮̣𝗻 𝗸𝗵𝗼̂𝗻𝗴?\n\n[ 🐳 ] 𝗧𝗵𝗮̉ 𝗰𝗮̉𝗺 𝘅𝘂́𝗰 "❤" 𝘃𝗮̀𝗼 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻 𝗻𝗮̀𝘆 𝗻𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘅𝗲𝗺 𝐭𝐡𝐞̂𝐦 𝐭𝐡𝐨̂𝐧𝐠 𝐭𝐢𝐧<𝟑\n◆━━━━━━━━━━━━━━━━━━━━◆\n🛸ㅤㅤㅤ🌏　°　　🌖　•　　.°•\n　🚀 ㅤ✯ ㅤ★ㅤ　*　ㅤ　°　ㅤ　🛰 ㅤ　° ㅤ🪐.　ㅤ　•ㅤ　°ㅤ ★ㅤ　•ㅤ ☄\n◆━━━━━━━━━━━━━━━━━━━━◆\n[ ⚙️ ] 𝗧𝗶̀𝗻𝗵 𝘁𝗿𝗮̣𝗻𝗴: ${trinhtrang}\n[ ⚙️ ] 𝗧𝗵𝗼̛̀𝗶 𝗴𝗶𝗮𝗻 𝘅𝘂̛̉ 𝗹𝘆́: ${Date.now() - timeStart} 𝗴𝗶𝗮̂𝘆`, threadID, (err, info) => {
                        if (err)
                            return;
                        global.waitForPrefixs.push(info.messageID);
                        if ([
                            ...ADMINBOT,
                            ...NDH,
                            ...(threadInf.adminIDs || []).map(el => el.id),
                        ].includes(senderID)) {
                            global.client.handleReply.push({
                                name: 'gpt',
                                messageID: info.messageID,
                                senderID,
                                type: "gptAsk"
                            });
                            global.client.handleReaction.push({
                                name: "gpt",
                                messageID: info.messageID,
                                senderID,
                                type: "sailenh"
                            })
                        }
                    });
                return;
            }
        }
        if (commandBanned.get(threadID) || commandBanned.get(senderID)) {
            if (!ADMINBOT.includes(senderID)) {
                const banThreads = commandBanned.get(threadID) || [],
                    banUsers = commandBanned.get(senderID) || [];
                if (banThreads.includes(command.config.name))
                    return api.sendMessage(global.getText("handleCommand", "commandThreadBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5 * 1000))
                        return api.unsendMessage(info.messageID);
                    }, messageID);
                if (banUsers.includes(command.config.name))
                    return api.sendMessage(global.getText("handleCommand", "commandUserBanned", command.config.name), threadID, async (err, info) => {
                        await new Promise(resolve => setTimeout(resolve, 5 * 1000));
                        return api.unsendMessage(info.messageID);
                    }, messageID);
            }
        }
        if (command.config.commandCategory.toLowerCase() == 'nsfw' && !global.data.threadAllowNSFW.includes(threadID) && !ADMINBOT.includes(senderID))
            return api.sendMessage(global.getText("handleCommand", "threadNotAllowNSFW"), threadID, async (err, info) => {

                await new Promise(resolve => setTimeout(resolve, 5 * 1000))
                return api.unsendMessage(info.messageID);
            }, messageID);
        var threadInfo2;
        if (event.isGroup == !![])
            try {
                threadInfo2 = (threadInfo.get(threadID) || await Threads.getInfo(threadID))
                if (Object.keys(threadInfo2).length == 0) throw new Error();
            } catch (err) {
                logger(global.getText("handleCommand", "cantGetInfoThread", "error"));
            }
        var permssion = 0;
        var threadInfoo = (threadInfo.get(threadID) || await Threads.getInfo(threadID));
        const find = threadInfoo.adminIDs.find(el => el.id == senderID);
        if (NDH.includes(senderID.toString())) permssion = 2;
        if (ADMINBOT.includes(senderID.toString())) permssion = 3;
        else if (!ADMINBOT.includes(senderID) && !NDH.includes(senderID) && find) permssion = 1;
        if (command.config.hasPermssion > permssion) return api.sendMessage(global.getText("handleCommand", "permssionNotEnough", command.config.name), event.threadID, event.messageID);

        if (!client.cooldowns.has(command.config.name)) client.cooldowns.set(command.config.name, new Map());
        const timestamps = client.cooldowns.get(command.config.name);;
        const expirationTime = (command.config.cooldowns || 1) * 1000;
        if (timestamps.has(senderID) && dateNow < timestamps.get(senderID) + expirationTime)
            return api.sendMessage(`🌸 𝗕𝗮̣𝗻 𝘃𝘂̛̀𝗮 𝘀𝘂̛̉ 𝗱𝘂̣𝗻𝗴 𝗹𝗲̣̂𝗻𝗵 𝗻𝗮̀𝘆 𝗿𝗼̂̀𝗶 🌸\n𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝘁𝗵𝘂̛̉ 𝗹𝗮̣𝗶 𝘀𝗮𝘂 ${((timestamps.get(senderID) + expirationTime - dateNow) / 1000).toString().slice(0, 5)} 𝗴𝗶𝗮̂𝘆 𝗻𝘂̛̃𝗮 𝗻𝘂̛̃𝗮 𝗻𝗵𝗲́, 𝘅𝗮̀𝗶 𝗹𝗲̣̂𝗻𝗵 𝗹𝗮̣𝗶 𝗰𝗵𝗮̣̂𝗺 𝘁𝗵𝗼̂𝗶 🖤`, threadID, messageID);

        var getText2;
        if (command.languages && typeof command.languages == 'object' && command.languages.hasOwnProperty(global.config.language))
            getText2 = (...values) => {
                var lang = command.languages[global.config.language][values[0]] || '';
                for (var i = values.length; i > 0x2533 + 0x1105 + -0x3638; i--) {
                    const expReg = RegExp('%' + i, 'g');
                    lang = lang.replace(expReg, values[i]);
                }
                return lang;
            };
        else getText2 = () => { };
        try {
            const Obj = {};
            Obj.api = api
            Obj.event = event
            Obj.args = args
            Obj.models = models
            Obj.Users = Users
            Obj.Threads = Threads
            Obj.Currencies = Currencies
            Obj.permssion = permssion
            Obj.getText = getText2
            command.run(Obj);
            timestamps.set(senderID, dateNow);

            if (event.messageReply?.messageID)
                global.notWaitForPrefixs.push(event.messageReply.messageID);
            if (DeveloperMode == !![])
                logger(global.getText("handleCommand", "executeCommand", time, commandName, senderID, threadID, args.join(" "), (Date.now()) - dateNow), "[ MODE ]");
            return;
        } catch (e) {
            return api.sendMessage(global.getText("handleCommand", "commandError", commandName, e), threadID);
        }
    };
};