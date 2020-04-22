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
///////////////////////////////////////////End firebase////////////// 


//////////////////////////////////////default Page
app.get('/', (req, res) => {
    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('class.ejs', { user: null, error: false });

});

//////////////////////////////////////////Signin
app.post("/signin", async (req, res) => {

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
        res.render('signin.ejs', { user: null, error: "Invalid User. Create Account" });
    }



    //gets first part of email for username
    for (let i = 0; email.charAt(i) !== "@"; i++) {

        displayName = displayName.concat(email.charAt(i));
    }

    //console.log("/////////email: ", email, "   /////////////// diaplyname: ", displayName)


    //Read from database
    await firebase.firestore().collection(Constants.COLL_USERINFO).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {


                //console.log("Before if statement. //////////////////////////////");
                //console.log("Email: ", email, " DocEmail: ", doc.data().email);
                if (doc.data().email === email) {
                    //console.log("////////////////////////////////////////////////Initialize Valuees" )

                    req.session.city = doc.data().city;
                    req.session.state = doc.data().state;
                    req.session.email = doc.data().email;
                    req.session.number = doc.data().phoneNumber;
                    req.session.terms = doc.data().terms;
                    req.session.displayName = displayName;

                }
                //console.log("////////////doc city", doc.city, '=>', doc.data());

            });

            //return value so deploye does not get error
            return;
        })
        .catch((e) => {
            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render('signin.ejs', { user: null, error: e + " :Could not read" });
        });

    //console.log("////////////////////////////////////////////////////////////////////////////////////")    


    //const currUser = firebase.auth().currentUser;

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.redirect('/home')

});

/////////////////////////////////////Register
app.get('/register', (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('register.ejs', { user: null, error: false });

});

app.post("/register", async (req, res) => {

    const email = req.body.email;
    const pass = req.body.password;
    const pass2 = req.body.password2;
    const phoneNumber = req.body.phoneNumber;
    const terms = req.body.terms;
    const state = req.body.state;
    const city = req.body.city;


    //console.log("city value: ", city);



    if (email.length < 4) {
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

    } else if (phoneNumber.length !== 10) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        //console.log(phoneNumber.length)
        res.render('register.ejs', { user: null, error: "Phone Number Must be 10 digits with Area Code" });

    } else if (city.length < 3) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        //console.log("Terms " , terms);
        res.render('register.ejs', { user: null, error: "Please Enter a Valid City" });

    } else if (state === "Select") {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        //console.log("Terms " , terms);
        res.render('register.ejs', { user: null, error: "Please Select a Valid State" });

    } else if (terms !== "on") {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        //console.log("Terms " , terms);
        res.render('register.ejs', { user: null, error: "Need to Check Box and Agree to Terms and Conditions" });
    }

    //save data to firestore
    try {

        const user = {
            email: email,
            phoneNumber: phoneNumber,
            city: city,
            state: state,
            terms: terms,
            timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        }


        //write data to database
        const collection = firebase.firestore().collection(Constants.COLL_USERINFO);
        await collection.doc().set(user);

        //res.render('signin.ejs', { user: false, error: 'Account Created! Please Signin' })

    } catch (e) {
        //set session for page
        res.setHeader('Cache-Control', 'private');
        res.render('register.ejs', { error: e + "firestore", user: false })
    }

    //double call back causes Error:   Can't set headers after they are sent. node js 
    return adminUtil.createUser(req, res);

});

//////////////////////////////////////Conditions
app.get("/conditions", (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render("conditions.ejs", { user: null, error: false })
})

//////////////////////////////////////Privacy
app.get("/privacy", (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render("privacy.ejs", { user: null, error: false })
})


/////////////////////////////////////////////Home Page
app.get('/home', authAndRedirectSignIn, (req, res) => {

    //console.log('////////////////////////////////////////////////////////////////////')
    //console.log(req.decodedIdToken)

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('home.ejs', { user: req.decodedIdToken, error: false });

});



////////////////////////////////////////////////request assistance
app.get('/request', authAndRedirectSignIn, (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render("request.ejs", { user: req.decodedIdToken, error: false })

});

//////////////////////////////////////////////////submit Item
app.post('/request', authAndRedirectSignIn, async (req, res) => {

    const user = {
        item: req.body.item,
        without: req.body.need,
        email: req.session.email,
        city: req.session.city,
        state: req.session.state
    }


    if (user.item === null || user.item < 2) {
        res.setHeader('Cache-Control', 'private');
        res.render("request.ejs", { user: req.decodedIdToken, error: "Item: Must Be Adleast 2 Characters" })
    }
    else if (user.without === "Select") {
        res.setHeader('Cache-Control', 'private');
        res.render("request.ejs", { user: req.decodedIdToken, error: "Need Level: Must Be Selected" })
    } else {

        //save data to firestore
        try {

            //write data to database
            const collection = firebase.firestore().collection(Constants.COLL_REQUEST);
            await collection.doc().set(user);


            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render("request.ejs", { user: req.decodedIdToken, error: "Item Was Successfully Added" });


        } catch (e) {
            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render("request.ejs", { user: req.decodedIdToken, error: e });
        }

    }

});

app.get("/work", authAndRedirectSignIn, async (req, res) => {

    let workers = [];

    //read from database
    var collection = await readDB(Constants.COLL_WORK);

    collection.forEach((doc) => {
        console.log("//////////////////////////////////////// ", doc.data().name)
        workers.push({ name: doc.data().name, phone: doc.data().phone, work: doc.data().workType })

    });

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render("work.ejs", { user: req.decodedIdToken, error: false, workers });

});

app.post("/work", authAndRedirectSignIn, async (req, res) => {

    let workers = [];
    var collection;

    const user = {
        name: req.body.name,
        phone: req.body.phone,
        workType: req.body.workType,
    }


    if (user.name < 3) {        

        //read from database
        collection = await readDB(Constants.COLL_WORK);

        collection.forEach((doc) => {
            console.log("//////////////////////////////////////// ", doc.data().name)
            workers.push({ name: doc.data().name, phone: doc.data().phone, work: doc.data().workType })

        });

        res.setHeader('Cache-Control', 'private');
        res.render("work.ejs", { user: req.decodedIdToken, error: "Name Must Have 3 Characters", workers });

    } else if (user.phone.length !== 10) {

        

        //read from database
        collection = await readDB(Constants.COLL_WORK);

        collection.forEach((doc) => {
            console.log("//////////////////////////////////////// ", doc.data().name)
            workers.push({ name: doc.data().name, phone: doc.data().phone, work: doc.data().workType })

        });

        res.setHeader('Cache-Control', 'private');
        res.render("work.ejs", { user: req.decodedIdToken, error: "Phone Must Be 10 Digits", workers });

    } else if (user.workType.length < 5) {       

        //read from database
        collection = await readDB(Constants.COLL_WORK);

        collection.forEach((doc) => {
            console.log("//////////////////////////////////////// ", doc.data().name)
            workers.push({ name: doc.data().name, phone: doc.data().phone, work: doc.data().workType })

        });
        res.setHeader('Cache-Control', 'private');
        res.render("work.ejs", { user: req.decodedIdToken, error: "Occupation Must Be 5 Characters", workers });

    } else {
        //save data to firestore
        try {

            //write data to database
            collection = firebase.firestore().collection(Constants.COLL_WORK);
            await collection.doc().set(user);           

            //read from database
            collection = await readDB(Constants.COLL_WORK);
            collection.forEach((doc) => {
                //console.log("//////////////////////////////////////// ", doc.data().name)
                workers.push({ name: doc.data().name, phone: doc.data().phone, work: doc.data().workType })

            });


            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render("work.ejs", { user: req.decodedIdToken, error: "Occupation Added", workers });


        } catch (e) {
            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render("work.ejs", { user: req.decodedIdToken, error: "Error Adding Occupation", workers });
        }
    } F

})

async function readDB(coll) {


    //Read from database
    var collection = await firebase.firestore().collection(coll).get();

    return collection;
}

app.get('/provide', authAndRedirectSignIn, async (req, res) => {

    //create empty list
    const dataList = [];


    //Read from database
    await firebase.firestore().collection(Constants.COLL_REQUEST).get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {

                dataList.push({ item: doc.data().item, without: doc.data().without, email: doc.data().email, city: doc.data().city, state: doc.data().state });

                //console.log("///////////////////////////: " , doc.data().item)
            });

            //return value so deploye does not get error
            return null;
        })
        .catch((e) => {
            //set session for page
            res.setHeader('Cache-Control', 'private');
            res.render('signin.ejs', { user: null, error: e + " :Could not read" });
        });

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('provide.ejs', { user: req.decodedIdToken, error: false, data: dataList, userPhone: req.session.number });

});

app.get('/about', authRedirect, (req, res) => {

    //set session for page
    res.setHeader('Cache-Control', 'private');
    res.render('signin.ejs', { user: req.decodedIdToken, error: false });

});

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
////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Middle ware, if true continues next else reports error/ /////////////////
async function authAndRedirectSignIn(req, res, next) {

    try {
        //checks if valid user
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if (decodedIdToken.uid) {
            req.decodedIdToken = decodedIdToken;
            return next();
        }
    } catch (e) {
        console.log("Error authandRedirect: ", e);

    }

    //set session for page
    res.setHeader('Cache-Control', 'private');
    return res.redirect("/b/signin");

}
////////////////////////////////////////////////////////////////////////////////////////////////////////


