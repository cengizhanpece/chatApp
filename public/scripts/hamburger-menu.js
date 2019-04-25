let menuIcon = document.getElementById("hamburger-menu-icon");
let menu = document.getElementById("hamburger");
menuIcon.addEventListener("click", ()=>{
    if(menuIcon.className == ""){
        menuIcon.className = "opened";
        let span1 = document.getElementById("hamburger-1");
        let span2 = document.getElementById("hamburger-2");
        let span3 = document.getElementById("hamburger-3");
       

        span1.style.transform="rotate(50deg)";
        span1.style.marginTop="20px";
        span2.style.marginTop="10px";
        span1.style.backgroundColor="white";
        span2.style.backgroundColor="white";
        span2.style.transform="rotate(-50deg)";
        span3.style.opacity="0";
        menu.style.transform="translateX(0%)";
    }else{
        menuIcon.removeAttribute("class")
        document.getElementById("hamburger-1").removeAttribute("style");
        document.getElementById("hamburger-2").removeAttribute("style");
        document.getElementById("hamburger-3").removeAttribute("style");
        menu.removeAttribute("style");
    }
});

document.getElementById("getOnlineUsers").addEventListener("click", ()=>{
    let users = document.getElementById("users");
    let user =  document.getElementsByClassName("user");
    
   if(users.className == ""){
        users.className = "opened";
        for(var i = 0; i<user.length; i++){
            user[i].style.height = "40px";
        }
        

    }
    else{
        users.removeAttribute("class");
        for(var i = 0; i<user.length; i++){
            user[i].style.height = "0px";
        }
    }
})


document.getElementById("logout").addEventListener("click", ()=>{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace( window.location.protocol + "//" + window.location.host + '/signin');
        }
      };
    xhttp.open("GET", "/logout", true);
    xhttp.send();
})

document.getElementById("profile").addEventListener("click", ()=>{
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            window.location.replace(window.location.protocol + "//" + window.location.host + '/profile');
        }
      };
    xhttp.open("GET", "/profile", true);
    xhttp.send();
});