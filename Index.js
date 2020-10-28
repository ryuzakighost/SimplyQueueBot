
//Imports
const discord = require('discord.js')
const queue = require('./queue.js')
const { token,prefix } = require('./config.json')
//require('dotenv-flow').config()

//Const + Var Values 
const bot = new discord.Client()
let playerQueue = new queue.Queue()
const permissionsError = "You have insufficient permissions to use this command"
var prevMessage = ""
var prevMessageChannel = ""
var guildID = null


bot.on('ready', () => {
console.info(`Logged in as ${bot.user.tag}!`)
//Sets the GuildID

//check for game room channel
//if one exists note channel ID, else make a game room channel

//check for mod role
//if mod role doesn't exist, create it  
})

bot.login(token)

bot.on('message', msg => {
    //checks to see if message begins with prefix
    if(msg.content.startsWith(prefix)){

        //if guildID isn't set, set it
        if(guildID === null){
            guildID = msg.guild.id
            console.log("Guild ID set: " + guildID)
        }
        /*Setup function
        This function is the setup for the voice chat function
        It does as follows:
        - Checks for a game room channel
             - if it doesn't exist create it
        - Checks for mod role
             - if it doesn't exist create it*/
        if (msg.content === prefix + 'setup'){
            
        }

        /*Enqueue function
        - adds user to the queue if they don't exist in it
        - removes user from the queue if they are already in it*/
        if (msg.content === prefix + 'q'||msg.content === prefix + 'queue') {
            user = msg.author
            status = playerQueue.enqueue(user.id)
            if(status === "added"){
                printQueue(msg.channel,'User: <@!' + user.id +'> has been added to the queue')
            }
            else if(status === "removed"){
                printQueue(msg.channel,'User: <@!' + user.id +'> has been removed from the queue')
            }
            else{
                console.error('something went wrong adding user to queue')
            }
            msg.delete()
            
        }

        /*Kick function
        - kicks user from the queue
        - This is a Mod Command*/
        else if(msg.content.startsWith(prefix + 'k ')) {
            if(msg.member.roles.cache.some(role => role.name === 'Mod')){
                id = msg.content.slice(3)
                kick(id,msg.channel)
                msg.delete()
            }
            else{
                console.error('permissions error for ' + msg.author.username)
                msg.reply(permissionsError)
                msg.delete()
            }
        }
        else if(msg.content.startsWith(prefix + 'kick ')) {
            if(msg.member.roles.cache.some(role => role.name === 'Mod')){
                id = msg.content.slice(6)
                kick(id,msg.channel)
                msg.delete()
            }
            else{
                console.error('permissions error for ' + msg.author.username)
                msg.reply(permissionsError)
                msg.delete()
            }
        }

        /*Next Function
        - Starts messaging down the queue - direct messaging
        - Each player gets 1 min to respond to the message before it moves onto the next
        - once a user joins if no space left stop

        /*Print Function
        - prints the current queue in chat*/
        else if(msg.content === prefix + 'p' || msg.content === prefix + 'print'){
            msg.delete()
            printQueue(msg.channel,"")
            console.log("Queue Printed")
            
        }
    }
})

bot.on("voiceStateUpdate", (oldMember, newMember)=> { 
    let oldVoice = oldMember.channelID
    let newVoice = newMember.channelID
    console.log(oldVoice)
    console.log(newVoice)
    if (oldVoice != newVoice) {
      if (oldVoice == null) {
        console.log("User joined!")
        //remove them from queue

      } else if (newVoice == null) {
        console.log("User left!")
        //find new user if list not empty

      } else {
        console.log("User switched channels!")
      }
    }
  })

function stripMention(id){
    id = id.replace(/<@!+/,'')
    id = id.replace(/>/,'')
    return id
}

//See Kick Function
async function kick(username,channel){
    id = stripMention(username)
    playerQueue.kick(id)
    printQueue(channel,'User: ' + username +' has been removed from the queue')
}

//See Print Function
async function printQueue(channel, msg = ""){
    printString = msg + "\n>>> Queue:\n"
    if(playerQueue.queue.length === 0){
        printString = msg + "\n>>> There is no-one here\n"
    }
    else{
        for(i=0;i<playerQueue.queue.length;i++){
            line = i+1 + ". <@!" + playerQueue.queue[i] + ">\n"
            printString = printString + line
        }
     }
    msgManager(printString,channel) 
}

//sends message and deletes previous message
async function msgManager(msg,channel) {
    if(prevMessage != ""){
        //delete previous message
        bot.channels.cache.get(prevMessageChannel).messages.fetch(prevMessage).then(message => message.delete())
    }
    channel.send(msg).then(sent => {
        prevMessage = sent.id
        prevMessageChannel = channel.id
    })
}
