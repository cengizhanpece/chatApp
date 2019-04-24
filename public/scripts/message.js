
var socket = io();
var uniqueUsers = [];
var countTotal;
var countIndex = 40;
var ready = false;
var ismostOld = false;
socket.on('online users', function(users){
    uniqueUsers = [];
    users.forEach(element=>{
        if(uniqueUsers.findIndex(x => x == element.kullaniciId) == -1){
            uniqueUsers.push(element.kullaniciId);
        }
        let main = document.getElementById("users");

        while(main.firstChild){
            main.removeChild(main.firstChild);
        }

        uniqueUsers.forEach(element=>{
            let newUser = document.createElement("div");
            newUser.className = "user";
            newUser.innerHTML = element;
            main.appendChild(newUser);
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

document.getElementById("sendMessageTxt").addEventListener("keydown", function(event) {
    if (event.keyCode === 13) {
        var message = document.getElementById("sendMessageTxt");
        var messageValue = message.value.trim();
        if(messageValue != ""){
            socket.emit("new message", messageValue.replace(/<[^>]*>/g, ''));
            message.value = "";
        }
    }
  });

socket.on("oldMessages", (messages,count)=>{
    renderMassage(messages);
    countTotal = count;
    console.log(countTotal);
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

document.getElementById("allMessages").addEventListener("scroll", ()=>{
    var allMessages = document.getElementById("allMessages");
    if(allMessages.scrollTop == 0){
        socket.emit("ask older massage", countIndex,countTotal);
    }
})


socket.on("send older message", (messages)=>{
     
        messages.slice().reverse().forEach(element=> {
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
                allMessages.insertBefore(messageOutMain, allMessages.firstChild);
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
                allMessages.insertBefore(messageInMain, allMessages.firstChild);
            }
        });
        countIndex += 20;  
})



function renderMassage(messages){
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
}