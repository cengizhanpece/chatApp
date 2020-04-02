
var socket = io();
var uniqueUsers = [];
var countTotal;
var countIndex = 40;
var ready = false;
var ismostOld = false;
socket.on('online users', function(users){
    uniqueUsers = [];
    users.forEach(element=>{
        //Kullanıcı uniqueUsers listesinde yok ise yeni kullanıcıyı listeye ekle
        if(uniqueUsers.findIndex(x => x == element.kullaniciId) == -1){
            uniqueUsers.push(element.kullaniciId);
        }
        let main = document.getElementById("users");
        //Listeyi yenilemek için içini temizle var olan listeyi temizle
        while(main.firstChild){
            main.removeChild(main.firstChild);
        }
        //Tüm kullanıcıları online users sekmesine ekle
        uniqueUsers.forEach(element=>{
            let newUser = document.createElement("div");
            newUser.className = "user";
            newUser.innerHTML = element;
            main.appendChild(newUser);
        })
        //Eğer önceden online users sekmesine tıklanmışsa, yeni eklenen kullanıcıları da görünür yap
        if(main.className == "opened"){
            var user = document.getElementsByClassName("user");
            for(var i = 0; i<user.length; i++){
                user[i].style.height = "40px";
            }
        }
    })
});

//Mesaj gönderme butonuna tıklama eventi ekle
document.getElementById("sendMessageBtn").addEventListener("click", function(){
    //Mesajı al
    var message = document.getElementById("sendMessageTxt");
    //Mesajın başındaki ve sonundaki boşlukları sil
    var messageValue = message.value.trim();
    //Mesaj boş değil ise
    if(messageValue != ""){
        //Mesajı sunucuya gönder ve xss den korunmak için <html> <script> gibi yapıların mesaj olarak gönderilmesini engelle
        socket.emit("new message", messageValue.replace(/<[^>]*>/g, ''));
        //Mesaj çubuğunu temizle
        message.value = "";
    }
});
//Enter tuşu ile mesaj gönderebilmek için event ekle
document.getElementById("sendMessageTxt").addEventListener("keydown", function(event) {
    //Eğer tıklanan tuş enter ise
    if (event.keyCode === 13) {
        //Mesajı al
        var message = document.getElementById("sendMessageTxt");
        //Mesajın başındaki ve sonundaki boşlukları sil
        var messageValue = message.value.trim();
        //Mesaj boş değil ise
        if(messageValue != ""){
            //Mesajı sunucuya gönder ve xss den korunmak için <html> <script> gibi yapıların mesaj olarak gönderilmesini engelle
            socket.emit("new message", messageValue.replace(/<[^>]*>/g, ''));
            //Mesaj çubuğunu temizle
            message.value = "";
        }
    }
  });

//Sunucu ilk bağlandığımızda önceden atılmış mesajları gönderir
socket.on("oldMessages", (messages,count)=>{
    //Gelen mesajları ekrana doğru biçimde yazdırırız
    renderMassage(messages);
    //Toplam mesaj sayısı
    countTotal = count;
    console.log(countTotal);
})

//Sunucudan yeni mesaj geldiğinde tetiklenir
socket.on("new message", (messageContent,owner)=>{
    //Eğer mesaj bize ait ise
    if(owner == urself){
        //Doğru gösterme şekli için gerekli css ler ayarlanır
        let messageOutMain = document.createElement("div");
        messageOutMain.className = "message-out-main";
        let messageOut = document.createElement("div");
        messageOut.className = "message-out";
        let nameOut = document.createElement("div");
        nameOut.className = "name-out";
        let message = document.createElement("div");
        message.className = "message";

        //Mesaj eklenir
        nameOut.innerHTML = owner;
        message.innerHTML = messageContent;

        //Mesaj ekrana yazdırılır
        messageOut.appendChild(nameOut);
        messageOut.appendChild(message);
        messageOutMain.appendChild(messageOut);
        allMessages.appendChild(messageOutMain);
    }
    //Eğer mesaj bize ait değil ise
    else{
        //Doğru gösterme şekli için gerekli css ler ayarlanır
        let messageInMain = document.createElement("div");
        messageInMain.className = "message-in-main";
        let messageIn = document.createElement("div");
        messageIn.className = "message-in";
        let nameIn = document.createElement("div");
        nameIn.className = "name-in";
        let message = document.createElement("div");
        message.className = "message";

        //Mesaj eklenir
        nameIn.innerHTML = owner;
        message.innerHTML = messageContent;

        //Mesaj ekrana yazdırılır
        messageIn.appendChild(nameIn);
        messageIn.appendChild(message);
        messageInMain.appendChild(messageIn);
        allMessages.appendChild(messageInMain);
    }

    //Yeni mesaj atıldığında ekran yukarıda kalmasın diye aşağı çekilir
    if(allMessages.scrollHeight - allMessages.scrollTop <= 1000){
        allMessages.scrollTop = allMessages.scrollHeight;
    }  
})

//Mesajları scrollarken tetiklenir
document.getElementById("allMessages").addEventListener("scroll", ()=>{
    var allMessages = document.getElementById("allMessages");
    //Eğer gösterilen mesajların en tepesine ulaşırsan
    if(allMessages.scrollTop == 0){
        //Serverdan daha eski mesajlar istenir
        socket.emit("ask older massage", countIndex,countTotal);
    }
})

//Server daha eski mesajları gönderdiğinde tetiklenir
socket.on("send older message", (messages)=>{
        messages.slice().reverse().forEach(element=> {
            //Mesaj sana ait ise farklı renkte renderlanır
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
                //Mesaj sana ait değilse farklı renkle renderlanır
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
        //Şimdiye kadar istenilmiş eski mesaj sayısı
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