//Require imports library
const functions = require('firebase-functions');
//Helps with the routing of http request
const express = require('express');
const app = express();
//path is used for concat  of two strings
const path = require('path')
//uses methods from library varible
exports.httpReq = functions.https.onRequest(app);

//send Email
const nodemailer = require('nodemailer');
var email = require('./js/email.js');

var email2 = require('./js/email2.js');

//set template engine with JS
app.set('view engine', 'ejs');
//location of ejs files
app.set('views', 'ejsViews');

//admin account
const adminUtil = require('./adminUtil');

//////////////creates new user for session
const user2 = require('./model/newUser.js');

//allow user session
const session = require('express-session');
//session values
app.use(session(
    {
        secret: 'anysecrestring.fjkdlsaj!!!',
        name: "__session",
        saveUninitialized: false,
        resave: false,
        secure: true, //http protocal for secure https
        maxAge: 1000 * 60 * 60, // 1000 ms * 60 = 1mins * 60  = 1h
        rolling: true, //reset maxAge at every response
    }
))


/////////////////////////////////////////////////Firebase ////////////////////////////
const firebase = require('firebase');

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBu8wFkkrlP9RsptbusnAI5tcUKhaLUROU",
    authDomain: "sethh-wsp20.firebaseapp.com",
    databaseURL: "https://sethh-wsp20.firebaseio.com",
    projectId: "sethh-wsp20",
    storageBucket: "sethh-wsp20.appspot.com",
    messagingSenderId: "674197318819",
    appId: "1:674197318819:web:4b2256f671fd1ca3b5e316"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

//requires constants file
const Constants = require("./myconstants.js");
///////////////////////////////////////End firebase


//////////////////////////////////////default Page
app.get('/', (req, res) => {
    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('class.ejs', { user: null, error: false });

});


//////////////////////////////////////////Login
app.get('/login', (req, res) => {

    res.setHeader('Cache-Control', 'private');
    res.render('login.ejs', { user: null, error: false });
})


app.post("/login", async (req, res) => {

    //variables
    const email = req.body.email;
    const pass = req.body.pass;
    let displayName = "";
    const auth = firebase.auth();

    try {

        // As httpOnly cookies are to be used, do not persist any state client side.
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE);

        //signin wiht username and password
        const userRecord = await auth.signInWithEmailAndPassword(email, pass);

        //Get id token for signin
        const idToken = await userRecord.user.getIdToken();

        //best practice is to signout so another browser can signin 
        await auth.signOut();

        //save session cookie
        req.session.idToken = idToken;


    } catch (e) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('login.ejs', { user: null, error: "Invalid Email or Password" + e });
    }



    //gets first part of email for username
    for (let i = 0; email.charAt(i) !== "@"; i++) {

        displayName = displayName.concat(email.charAt(i));
    }    

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.redirect('/home')

});

app.get("/resetPass", (req, res) => {

    res.render("passReset.ejs", { user: null, error: false })
})
app.post("/resetPass", async (req, res) => {

    var email = req.body.email;

    if (email.length < 6 || !email.includes(".")) {

        res.render('passReset.ejs', { user: null, error: "Email Must Contain @ and Domain Name e.g .com" });
    } else {

        try {
            await firebase.auth().sendPasswordResetEmail(email);
            res.render("login.ejs", { user: null, error: "Check Email To Reset Password" });
        } catch (err) {
            res.render('passReset.ejs', { user: null, error: "User Email Does Not Exist" });
        }
    }


})

/////////////////////////////////////Register
app.get('/register', (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('register.ejs', { user: null, error: false });

});

app.post("/register", async (req, res) => {

    const classify = req.body.classification;
    const email = req.body.email;
    const pass = req.body.password;
    const pass2 = req.body.password2;
    const id = req.body.id;

    //checks for validation
    if (email.length < 6) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('register.ejs', { user: null, error: "Email Must Contain @ and Domain Name e.g .com" });

    } else if (pass.length < 8) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('register.ejs', { user: null, error: "Password Must be Atleast 8 Characters" });

    } else if (pass !== pass2) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('register.ejs', { user: null, error: "Passwords Do Not Match" });

    } else if (id.length < 2) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        //console.log(phoneNumber.length)
        res.render('register.ejs', { user: null, error: "Invalid Id" });

    }

    //create user
    const user = {
        email: email,
        classify: classify,
        id: id,
    }

    //double call back causes Error:   Can't set headers after they are sent. node js 
    return adminUtil.createUser(req, res, user);

});

/////////////////////////////////////////////Home Page
app.get('/home', authAndRedirectSignIn, async (req, res) => {

    //console.log('////////////////////////////////////////////////////////////////////' , req.decodedIdToken.email)
    //console.log(req.decodedIdToken)

    //declare variables. 
    req.session.status = "";

    const collection = await readDB(Constants.COLL_USERS)
        .then((snapshot) => {
            snapshot.forEach((doc) => {

                if (req.decodedIdToken.email === doc.data().email) {
                    //console.log("///////////// IN IF")                    
                    req.session.status = doc.data().classify
                }

                //console.log("///////////////////////////: ", doc.data().email, req.decodedIdToken.email)
            });

            //return value so deployer does not get error
            return null;
        })
        .catch((e) => {
            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render('login.ejs', { user: null, error: e + " :Could not read" , classify: null });
        });


    console.log("/////////////status", req.session.status)

    if (req.session.status === "prof") {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('homeProf.ejs', { user: req.decodedIdToken, error: false, classify: req.session.status});
    } else {

        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('homeStud.ejs', { user: req.decodedIdToken, error: false, classify: req.session.status });

    }

});

app.get("/addSemester", profAuthRedirect, async (req,res) =>{    
    
    const list = await adminUtil.getSemesters();    


    console.log("///////////////LIST?", list[0].data().name)
    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('addSemester.ejs', { user: req.session.decodedIdToken, error: false, classify: req.session.status, data: list });


})

app.post("/addSemester", profAuthRedirect, async (req,res)=>{

    const name = req.body.semester;

    const message = await adminUtil.addSemester(req, res, name);
    const list = await adminUtil.getSemesters();  

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('addSemester.ejs', { user: req.session.decodedIdToken, error: message, classify: req.session.status, data: list });
})

app.post("/deleteSemester", profAuthRedirect, async (req,res)=>{

    const name = req.body.delName;
    const obj = req.body.delObject;   

    const message = await adminUtil.deleteSemester(name);
    const list = await adminUtil.getSemesters();  

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('addSemester.ejs', { user: req.session.decodedIdToken, error: message, classify: req.session.status, data: list });
})

app.get("/addClass", profAuthRedirect, async (req , res) => {

    const list = await adminUtil.getClasses();    


    console.log("///////////////LIST?", list[0].data().name)
    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('addClass.ejs', { user: req.session.decodedIdToken, error: false, classify: req.session.status, data: list });

})

app.post("/addClass", profAuthRedirect, async (req,res)=>{

    
    data = {
        name: req.body.name,
        id: req.body.id,
        crn: req.body.crn,
        depart: req.body.depart,
        roomNum: req.body.roomNum,
        start: req.body.start,
        end: req.body.end,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        days: req.body.days,        
        prof: req.body.prof,
        }

    //console.log("///////////////////////", data["name"],data["id"],data["crn"],data["roomNum"],data["depart"] )

    const message = await adminUtil.addClass(data);
    //const list = await adminUtil.getSemesters();  

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('addClass.ejs', { user: req.session.decodedIdToken, error: message, classify: req.session.status, data: [] });
})



//Test pages without having to change code
app.get("/test", (req,res) => {

    req.session.status = 'prof'
    res.setHeader('Cache-Control', 'private');
    res.render('homeProf.ejs', { user: true, error: false, classify: "prof"});

})










//////////////////////////////////////Conditions
// app.get("/conditions", (req, res) => {

//     //set session for page
//     res.setHeader('Cache-Control', 'private');
//     res.render("conditions.ejs", { user: null, error: false })
// })

// //////////////////////////////////////Privacy
// app.get("/privacy", (req, res) => {

//     //set session for page
//     res.setHeader('Cache-Control', 'private');
//     res.render("privacy.ejs", { user: null, error: false })
// })


async function readDB(coll) {


    //Read from database
    var collection = await firebase.firestore().collection(coll).get();

    return collection;
}

/////////////////////////////////////////SignOut
app.get('/signout', async (req, res) => {

    //destroy current session
    req.session.destroy(err => {
        if (err) {
            //manully reset session
            req.session = null;
            res.send(`Error signing out with destroy ${err} `)
        } else {
            res.redirect('/signin');
        }
    });

});

//handles all other cases to redirect to index.html ///////////////////////////////Last////////////////////////////
app.get('**', (req, res) => {
    res.redirect("/");
});

//////////////////////////////////////////Middle ware, if true continues next else reports error/ /////////////////
function authRedirect(req, res, next) {

    const user = firebase.auth().currentUser;

    if (!user) {
        res.redirect("/")
    } else {
        req.decodedIdToken = user;
        next();
        //return to eleminate error for deploy
        return;
    }
}

function profAuthRedirect(req, res, next) {    

    if (req.session.status === 'prof') {
        return next()
    } else {
        res.redirect("/")
    }
}
////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Middle ware, if true continues next else reports error/ /////////////////
async function authAndRedirectSignIn(req, res, next) {

    try {
        //checks if valid user
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if (decodedIdToken.uid) {
            req.session.decodedIdToken = decodedIdToken;
            req.decodedIdToken = decodedIdToken;
            return next();
        }
    } catch (e) {
        console.log("Error authandRedirect: ", e);
    }

    //set session for page
    res.setHeader('Cache-Control', 'private');
    return res.redirect("/login");

}
////////////////////////////////////////////////////////////////////////////////////////////////////////


