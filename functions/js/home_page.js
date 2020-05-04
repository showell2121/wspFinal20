function home_page() {

  //calls auth function and forward accordingly. 
  auth('showell2121@gmail.com', home_page_secured, '/login' ) 
}


  let Module = require('module') ;
  let fs = require('fs');

function home_page_secured() {


  //gets current user information
  //let user = firebase.auth().currentUser;

  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      // User is signed in.
      //alert(user.email)

      let i = 0;
      let name = "";
      //gets just the username, elminates the @ and .com
      while(user.email[i] !== "@"){
        name += user.email[i];
        i++;
      } 
      
      
     //creats random number
      let ranNumber = parseInt(getRandomArbitrary(0,4));

      let pic = ['http://localhost:5000/images/image0.jpeg', 'http://localhost:5000/images/image1.png', 'http://localhost:5000/images/image2.png', 'http://localhost:5000/images/image3.png']

      glPageContent.innerHTML = `
      
      <div class="container">
      <table class="table">
                    <thead>
                    </thead>
                    <tbody>                        
                        <tr>
                            <th align="left" style="border:0 none;"><h1 style="font-family: cursive;">Welcome ${name}</th>
                            <td align="left" style="border:0 none;"></td>
                            <td align="right" style="border:0 none;"><button class="btn btn-outline-danger" type="button" onclick="logOut()">Log Out</button></td>                        
                            <td style="border:0 none;"> </td>
                        </tr>
                        <tr>
                            <th style="border:0 none;"><img alt="Image result for uco logo&quot;" src="${pic[ranNumber]}" style="width: 350px; height: 400px;border-radius:10px;"></th>
                            <td align="center" style="border:0 none;">
                            
                            </td>
                            <td align="right" style="border:0 none;"></td>                 
                            <td style="border:0 none;"> </td>
                        </tr>                           
                    </tbody>
                </table>  
      
      </div>      
      `
    
      glPageContent.innerHTML += ``        
    } else {
      
      // No user is signed in.
      window.location.href = '/login'
    }
  });





}

function logOut() { 

  firebase.auth().signOut().then(function () {
    // Sign-out successful.   
    window.location.href = '/login'
  }).catch(function (error) {
    
    // An error happened.
    window.location.href = '/login'
  });

}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

