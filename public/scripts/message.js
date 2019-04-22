
var socket = io();
var uniqueUsers = [];
var ready = false;
socket.on('online users', function(users){
    uniqueUsers = [];
    users.forEach(element=>{
        if(uniqueUsers.findIndex(x => x == element.kullaniciId) == -1){
            uniqueUsers.push(element.kullaniciId);
        }
        uniqueUsers.forEach(element=>{
            console.log(element);
        })
    })
});

document.getElementById("sendMessageBtn").addEventListener("click", function(){
    var message = document.getElementById("sendMessageTxt");
    var messageValue = message.value.trim();
    if(messageValue != ""){

        socket.emit("new message", messageValue.replace(/<[^>]*>/g, ''));
        message.value = "";
    }
});

socket.on("oldMessages", (messages)=>{
    if(ready==false){
        let allMessages = document.getElementById("allMessages");
    messages.forEach(element=>{
        if(element.owner == urself){
            let messageOutMain = document.createElement("div");
            messageOutMain.className = "message-out-main";
            let messageOut = document.createElement("div");
            messageOut.className = "message-out";
            let nameOut = document.createElement("div");
            nameOut.className = "name-out";
            let message = document.createElement("div");
            message.className = "message";

            nameOut.innerHTML = element.owner;
            message.innerHTML = element.message;

            messageOut.appendChild(nameOut);
            messageOut.appendChild(message);
            messageOutMain.appendChild(messageOut);
            allMessages.appendChild(messageOutMain);
        }
        else{
            let messageInMain = document.createElement("div");
            messageInMain.className = "message-in-main";
            let messageIn = document.createElement("div");
            messageIn.className = "message-in";
            let nameIn = document.createElement("div");
            nameIn.className = "name-in";
            let message = document.createElement("div");
            message.className = "message";

            nameIn.innerHTML = element.owner;
            message.innerHTML = element.message;

            messageIn.appendChild(nameIn);
            messageIn.appendChild(message);
            messageInMain.appendChild(messageIn);
            allMessages.appendChild(messageInMain);
        }
    })
    }
    ready=true;
    allMessages.scrollTop = allMessages.scrollHeight;
})

socket.on("new message", (messageContent,owner)=>{
    if(owner == urself){
        let messageOutMain = document.createElement("div");
        messageOutMain.className = "message-out-main";
        let messageOut = document.createElement("div");
        messageOut.className = "message-out";
        let nameOut = document.createElement("div");
        nameOut.className = "name-out";
        let message = document.createElement("div");
        message.className = "message";

        nameOut.innerHTML = owner;
        message.innerHTML = messageContent;

        messageOut.appendChild(nameOut);
        messageOut.appendChild(message);
        messageOutMain.appendChild(messageOut);
        allMessages.appendChild(messageOutMain);
    }
    else{
        let messageInMain = document.createElement("div");
        messageInMain.className = "message-in-main";
        let messageIn = document.createElement("div");
        messageIn.className = "message-in";
        let nameIn = document.createElement("div");
        nameIn.className = "name-in";
        let message = document.createElement("div");
        message.className = "message";

        nameIn.innerHTML = owner;
        message.innerHTML = messageContent;

        messageIn.appendChild(nameIn);
        messageIn.appendChild(message);
        messageInMain.appendChild(messageIn);
        allMessages.appendChild(messageInMain);
    }

    if(allMessages.scrollHeight - allMessages.scrollTop <= 1000){
        allMessages.scrollTop = allMessages.scrollHeight;
    }
})