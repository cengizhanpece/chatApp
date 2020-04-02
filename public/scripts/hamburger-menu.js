let menuIcon = document.getElementById("hamburger-menu-icon");
let menu = document.getElementById("hamburger");
//Menu iconuna click eventi ata
menuIcon.addEventListener("click", ()=>{
    //Eğer classı yoksa kapalı demektir
    if(menuIcon.className == ""){
        //Class ekleyerek açtığını belirt
        menuIcon.className = "opened";
        let span1 = document.getElementById("hamburger-1");
        let span2 = document.getElementById("hamburger-2");
        let span3 = document.getElementById("hamburger-3");
       
        //Css özellikleri ekleyerek animasyon gerçekleştir
        span1.style.transform="rotate(50deg)";
        span1.style.marginTop="20px";
        span2.style.marginTop="10px";
        span1.style.backgroundColor="white";
        span2.style.backgroundColor="white";
        span2.style.transform="rotate(-50deg)";
        span3.style.opacity="0";
        menu.style.transform="translateX(0%)";
    }
    //Eğer açıksa
    else{
        //Classı silerek kapattığını belirt
        menuIcon.removeAttribute("class")
        //Animasyon için atanmış cssleri silerek eski haline getir
        document.getElementById("hamburger-1").removeAttribute("style");
        document.getElementById("hamburger-2").removeAttribute("style");
        document.getElementById("hamburger-3").removeAttribute("style");
        menu.removeAttribute("style");
    }
});

//Online Users tıklama eventi
document.getElementById("getOnlineUsers").addEventListener("click", ()=>{
    let users = document.getElementById("users");
    let user =  document.getElementsByClassName("user");
    //Eğer classı yoksa kapalı demektir
   if(users.className == ""){
       //Class ekle
        users.className = "opened";
        //Listedeki tüm kullanıcılara yükseklik vererek görünür yap
        for(var i = 0; i<user.length; i++){
            user[i].style.height = "40px";
        }
        

    }
    //Online users görünür durumdaysa
    else{
        //Classı silerek kapalı olduğunu belirt
        users.removeAttribute("class");
        //Listedeki tüm kullanıcıları gizle
        for(var i = 0; i<user.length; i++){
            user[i].style.height = "0px";
        }
    }
})

//Logout butonu click eventi
document.getElementById("logout").addEventListener("click", ()=>{
    //Yeni bir asenkron istek oluştur
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //Çıkış yaparak giriş sayfasına git
            window.location.replace( window.location.protocol + "//" + window.location.host + '/signin');
        }
      };
      //Logout endpointine get isteği oluştur
    xhttp.open("GET", "/logout", true);
    xhttp.send();
})
//Profile butonu click eventi
document.getElementById("profile").addEventListener("click", ()=>{
    //Yeni bir asenkron istek oluştur
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //Profil sayfasına yönlendir
            window.location.replace(window.location.protocol + "//" + window.location.host + '/profile');
        }
      };
    //Profile endpointine get isteği oluştur
    xhttp.open("GET", "/profile", true);
    xhttp.send();
});