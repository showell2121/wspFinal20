
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
        if (doc.data()) {
          counter = 1;
          //console.log("/////////////////////////////if",doc.data())
          return counter
        } else {
          //console.log("/////////////////////////////",doc.data())
          counter = 0;
          return counter;
        }

        //console.log("/////////////////////////////",doc.data())

      }
    )

  } catch (err) {
    return "Could Not Read Semester";
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
      await collection.doc(name).set({ name: name})
      //return to page. 
      return "Semester Added";

    } catch (err) {
      console.log("/////////////////////////////////////////////////////")
      console.log(err)
      return "Could Not Add Semester";

    }

  } else {
    return "Semester Already Exist";
  }
}

async function getSemesters() {

  //create list
  const semest = [];

  //have to give where class to follow firebase DB security rule request.auth.uid == resource.data.uid;
  const snapshot = await admin.firestore().collection("semester").get();
  snapshot.forEach(doc => {
    semest.push(doc)
  })

  return semest;

}

async function getSemester(data) {

  //create list
  const semest = [];

  //have to give where class to follow firebase DB security rule request.auth.uid == resource.data.uid;
  const snapshot = await admin.firestore().collection("semester").doc(data.term).get()
  .then((doc) => {

    //console.log(doc.data())
    doc.data().programs.forEach((doc) => {

      if(doc.depart === data.program){
        semest.push(doc)
      }
    })

  });
  

  return semest;

}

async function deleteSemester(name) {

  try {
    await admin.firestore().collection("semester").doc(name).delete();
  } catch (err) {
    return "Could Not Delete Semester";
  }

  return "Semester Removed";

}

async function getClasses() {

  //create list
  const classList = [];

  //have to give where class to follow firebase DB security rule request.auth.uid == resource.data.uid;
  const snapshot = await admin.firestore().collection("classes").get();
  snapshot.forEach(doc => {
    //console.log("//////////////////////////////classlist", doc.data().class)
    classList.push(doc.data().class)
  })

  return classList;

}

async function addClass(object) {

  let counter = 0;

  try {
    //read from database to ensure semester does not exist. 
    counter = await admin.firestore().collection(Constants.COLL_CLASS).doc(object["name"]).get()
      .then((doc, counter = 0, values = 0) => {

        console.log("/////////////////////////////Before", doc, doc.data())
        if (doc.data() != undefined) {
          doc.data().class.forEach(data => {
            values++;
            console.log(data.crn)
            if (data.crn === object["crn"]) {
              counter++;
              //console.log("in IF", counter)                    
            }

          })
        }

        //console.log("/////////////////////////////After",doc.data().class[i].crn , object["crn"], i)
        return { counter, values }

      })

  } catch (err) {
    return "Could Not Read Semester";
  }

  //console.log("/////////////COUNTER", counter.counter, counter.values)
  if (counter.counter === 0) {
    try {
      //declare vairables
      const collection = admin.firestore().collection(Constants.COLL_CLASS);
      const collection2 = await admin.firestore().collection(Constants.COLL_CLASS).doc(object["name"]).get();

      //console.log("////////////////////", collection2.data().class)


      //create empty list
      const classInfo = [
        {
          name: object["name"],
          id: object["id"],           //Class ID, level of class e.g 4910, mulitple classes 
          crn: object["crn"],           //Class CRN, specific class
          department: object["depart"],
          classStart: object["start"],   //month class starts
          classEnd: object["end"],
          startTime: object["startTime"],    //Time class starts
          endTime: object["endTime"],
          daysOfClass: object["days"],   //What days of the week is class help
          classRoom: object["roomNum"],     //Room class is held in. 
          classProf: object["prof"],
        },
      ];

      if (counter.values > 0) {
        collection2.data().class.forEach(doc => {
          //console.log(doc)
          classInfo.push(doc)
        })
      }
      //classInfo.push(collection2.data().class)

      //create custom doc name
      await collection.doc(object["name"]).set({ class: classInfo })
      //return to page. 
      return "Class Added";

    } catch (err) {
      console.log("/////////////////////////////////////////////////////")
      console.log(err)
      return "Could Not Add Class";

    }

  } else {
    return "Class Already Exist";
  }

}



async function deleteClass(data) {
  //console.log(data.name, data.crn)

  let list = []

  try {
    const collection = await admin.firestore().collection("classes").doc(data.name).get()
      .then((doc) => {

        doc.data().class.forEach(inf => {

          //console.log("in IF", inf.name)  
          if (data.crn !== inf.crn) {
            list.push(inf)

          }
        })
        //console.log("doc", doc.data().class)

      });

    await admin.firestore().collection("classes").doc(data.name).set({ class: list })

  } catch (err) {
    return "Could Not Delete Class";
  }

  //console.log(list)
  return "Class Removed";
}

async function addClassSemester(data) {

  const list = [
    {
      name: data.name,
      id: data.id,
      crn: data.crn,
      depart: data.depart,
      classRoom: data.classRoom,
      classStart: data.classStart,
      classEnd: data.classEnd,
      startTime: data.startTime,
      endTime: data.endTime,
      days: data.days,
      prof: data.prof,
    },
  ]

  try {

    const collection = await admin.firestore().collection(Constants.COLL_SEMESTER).doc(data.semest).get()
      .then((doc) => {

        if (doc.data().programs) {
          doc.data().programs.forEach((val) => {
            list.push(val)
            console.log("///////////////val")
          })
        }

      });

    //list.push(data)

    //create custom doc name
    await admin.firestore().collection(Constants.COLL_SEMESTER).doc(data.semest).set({ name: data.semest, programs: list })

    return "Added Class To Semester"
  } catch (err) {
    return "Could Not Add Class"
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



module.exports = { createUser, verifyIdToken, checkOut, addSemester, getSemesters, deleteSemester, getClasses, addClass, deleteClass, addClassSemester, getSemester };