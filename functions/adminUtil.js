
var admin = require("firebase-admin");

var serviceAccount = require("./sethh-wsp20-firebase-adminsdk-lffz9-849cfa531b.json");

var classObject = require("./model/class.js")

//requires constants file
const Constants = require("./myconstants.js");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://sethh-wsp20.firebaseio.com"
});


async function createUser(req, res, user) {

  //get values from signup from
  //needed to create a user
  const email = user.email;
  const password = req.body.password;

  console.log("////////////////////user and pass ", email, password)

  try {

    //creates user
    await admin.auth().createUser(
      { email, password }
    )
    collection = admin.firestore().collection(Constants.COLL_USERS);
    await collection.doc().set(user);

  } catch (e) {
    res.render('login.ejs', { error: e, user: false, page: 'login' })

    //res.send(JSON.stringify(e));    
  }
  //redirect to login page
  res.redirect("/login");

}

async function verifyIdToken(idToken) {
  try {

    //verfies id token with firebase
    const decodedIdToken = await admin.auth().verifyIdToken(idToken);

    //retunr decoded token
    return decodedIdToken;

  } catch (e) {
    return null;
  }
}

async function addSemester(req, res, name) {



  let counter = 0;

  try {
    //read from database to ensure semester does not exist. 
    counter = await admin.firestore().collection(Constants.COLL_SEMESTER).doc(name).get().then(
      function (doc) {
        var counter = 0;
        if(doc.data()){
          counter = 1;
          //console.log("/////////////////////////////if",doc.data())
          return counter
        }else{
          //console.log("/////////////////////////////",doc.data())
          counter = 0;
          return counter;
        } 

        //console.log("/////////////////////////////",doc.data())
        
      }
    )

  } catch (err) {
    res.render('addSemester.ejs', { user: req.decodedIdToken, error: "Could Not Read Semester", classify: req.session.status });
  }

  console.log("/////////////COUNTER", counter)
  if (counter === 0) {
    try {
      //declare vairables
      const collection = admin.firestore().collection(Constants.COLL_SEMESTER);
      //create empty list
      const programs = [
        {
          name: "Start",
          id: "",           //Class ID, level of class e.g 4910, mulitple classes 
          crn: "",           //Class CRN, specific class
          department: "",
          classStart: "",   //month class starts
          classEnd: "",
          startTime: "",    //Time class starts
          endTime: "",
          daysOfClass: "",   //What days of the week is class help
          classRoom: "",     //Room class is held in. 
          classProf: "",
        },
      ];

      //create custom doc name
      await collection.doc(name).set({ programs: programs })
      //return to page. 
      res.render('addSemester.ejs', { user: req.decodedIdToken, error: "Semester Added", classify: req.session.status });

    } catch (err) {
      console.log("/////////////////////////////////////////////////////")
      console.log(err)
      res.render('addSemester.ejs', { user: req.decodedIdToken, error: "Could Not Add Semester", classify: req.session.status });

    }

  } else {
    res.render('addSemester.ejs', { user: req.decodedIdToken, error: "Semester Already Exist", classify: req.session.status });
  }



}






///////////////////////////////////////////////////////////Not Being used
async function listUsers(req, res) {

  try {

    //gets records from firebase
    const userRecord = await admin.auth().listUsers();
    //renders page and passes users 
    res.render('admin/listUsers.ejs', { users: userRecord.users, error: false, user: res.user })

  } catch (e) {
    res.render('admin/listUsers.ejs', { users: false, error: e, user: null })

  }

}



async function getOrderHistory(decodedIdToken) {

  try {

    //console.log("///////////////////////IN ORDER HISTORY///////////")
    const collection = admin.firestore().collection(Constants.COLL_ORDERS);
    let orders = [];
    //have to give where class to follow firebase DB security rule request.auth.uid == resource.data.uid;
    const snapshot = await collection.where("uid", "==", decodedIdToken.uid).orderBy("timestamp").get();
    snapshot.forEach(doc => {
      orders.push(doc.data());
    })
    //retunr decoded token
    return orders;

  } catch (e) {
    return null;
  }
}

async function checkOut(data) {

  data.timestamp = admin.firestore.Timestamp.fromDate(new Date());

  // const collection = admin.firestore().collection(Constants.COLL_ORDERS);
  // await collection.doc().set(data);  
  //throws error / basically returns an error and teh caller will catch the error    

}



module.exports = { createUser, addSemester, verifyIdToken, checkOut };