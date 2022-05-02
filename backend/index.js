const functions = require("firebase-functions");

var admin = require("firebase-admin");
//Other files such as the service account key are not uploaded due to security reasons
var serviceAccount = require("./serviceAccountKey.json");
const app = require("express")();

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://smart-calendar-2c8ce.firebaseio.com",
});

const config = {
 //DELETED FOR SECURITY REASONS,
};

const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

const cors = require("cors");
app.use(cors());

//the part until here forms the connection to the firebase firestore and prepares the utilization of express.

//checks whether an entry is an email thx to regex, nice little function.
const isEmail = (email) => {
  const regEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return email.match(regEx);
};

//parses the period section of the ConAcc collection from the firebase database, turns the string into an array of objects with day minute and hour, the 1st, 3rd, 5th etc.
//objects in the resulting array mark the beginning of available time whereas the 2nd 4th etc mark the end.
function parsePer(St) {
  var arr = St.split(";");
  var result = [];
  var ar = [];
  arr.forEach((dat) => {
    ar.push(dat.split("-"));
  });
  ar.forEach((datt) => {
    datt.forEach((dat) => {
      var dayy = dat.substr(0, 3);
      var temp = dat.substr(3, dat.length - 3);
      var hourr = "00",
        minn = "00";
      if (temp.length > 2) {
        var array = temp.split(":");
        hourr = array[0];
        minn = array[1];
      } else {
        hourr = temp;
      }
      result.push({
        day: dayy,
        hour: hourr,
        minute: minn,
        getDay: function () {
          return day;
        },
        getHour: function () {
          return hour;
        },
        getMin: function () {
          return minute;
        },
      });
    });
  });
  return result;
}

//login authorization
const FBAuth = (req, res, next) => {
  let idToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
  ) {
    idToken = req.headers.authorization.split("Bearer ")[1];
  } else {
    console.error("No token found");
    return res.status(403).json({ error: "Unauthorized" });
  }

  admin
    .auth()
    .verifyIdToken(idToken)
    .then((decodedToken) => {
      req.userr = decodedToken;

      return db
        .collection("TempAcc")
        .where("userId", "==", req.userr.uid)
        .limit(1)
        .get();
    })
    .then((data) => {
      req.userr.handle = data.docs[0].data().handle;
      return next();
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

//host account authorization
const FBHost = (req, res, next) => {
  db.doc(`/TempAcc/${req.userr.handle}`)
    .get()
    .then((user) => {
      if (!user.data().con2) {
        console.log("This account was not authorized for this action.");
        return res
          .status(400)
          .json("Your account was not authorized for the requested action.");
      } else {
        return next();
      }
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

//admin authorization
const FBAdmin = (req, res, next) => {
  db.doc(`/TempAcc/${req.userr.handle}`)
    .get()
    .then((user) => {
      if (!user.data().con2 || !user.data().isAdmin) {
        console.log("This account is not an administrator.");
        return res.status(400).json("You are not an administrator.");
      } else {
        return next();
      }
    })
    .catch((err) => {
      console.error("Error while verifying token", err);
      return res.status(403).json(err);
    });
};

//get all the dates, designed for future use/ admin use.
app.get("/termine", (req, res) => {
  db.collection("Dates")
    .orderBy("StartsAt", "desc")
    .get()
    .then((data) => {
      let dates = [];
      data.forEach((doc) => {
        dates.push({
          StartsAt: doc.data().StartsAt,
          EndsAt: doc.data().EndsAt,
          chef: doc.data().chef,
          content: doc.data().content,
          parties: doc.data().parts,
          awaitingid: doc.data().awaitingid,
          Title: doc.data().Title,
          id: doc.id,
        });
      });
      return res.json(dates);
    })
    .catch((err) => console.error(err));
});

app.get("/hosts", FBAuth, (req, res) => {
  let result = [];
  db.collection("TempAcc")
    .where("con2", "==", true)
    .get()
    .then((qsnap) => {
      qsnap.forEach((user) => {
        result.push(user.data().handle);
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json();
    });
});

//post a date
app.post("/termin", FBAuth, FBHost, (req, res) => {
  const newDate = {
    EndsAt: req.body.EndsAt,
    StartsAt: req.body.StartsAt,
    Title: req.body.Title,
    chef: req.userr.handle,
    content: req.body.content,
    parts: req.body.parts,
    awaitingid: req.body.awaitingid,
  };
  let errors = {};

  req.body.parts.forEach((party) => {
    if (!db.doc(`/TempAcc/${party}`).get().exists) {
      res.status(403).json({ user: `${party} does not exist.` });
    }
  });

  db.collection("Dates")
    .add(newDate)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something bad happened" });
      console.error(err);
    });
});

//get somebody's available time, the request is formed like { "user": "user_name_pretty"} in raw json.
app.post("/period", FBAuth, (req, res) => {
  db.collection("TempAcc")
    .doc(req.body.user)
    .get()
    .then((doc) => {
      if (doc.get("con2") == true) {
        res.json(parsePer(doc.get("period")));
      } else {
        res.status(400).json({
          error:
            "Temporary accounts cannot declare a time period where they can be active",
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not access user data" });
      console.error(err);
    });
});

//get all the appointments of someone, the request is formed like { "user": "user_name_pretty"} in raw json.
app.post("/onesdates", FBAuth, (req, res) => {
  var result = [];
  db.collection("Dates")
    .where("parts", "array-contains", req.body.user)
    .get()
    .then((qsnap) => {
      qsnap.forEach((dat) => {
        result.push({
          start: dat.data().StartsAt,
          end: dat.data().EndsAt,
          part: req.body.user,
        });
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not access user data" });
      console.error(err);
    });
});

//returns the user's own appointments, request is empty. {}
app.get("/mydates", FBAuth, (req, res) => {
  var result = [];
  db.collection("Dates")
    .where("parts", "array-contains", req.userr.handle)
    .get()
    .then((qsnap) => {
      qsnap.forEach((doc) => {
        result.push({
          StartsAt: doc.data().StartsAt,
          EndsAt: doc.data().EndsAt,
          chef: doc.data().chef,
          content: doc.data().content,
          parties: doc.data().parts,
          awaitingid: doc.data().awaitingid,
          Title: doc.data().Title,
          id: doc.id,
        });
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not access user data" });
      console.error(err);
    });
});

//get all the unconfirmed appointment requests to someone, the request is formed like {} in raw json.
app.get("/awaitingme", FBAuth, FBHost, (req, res) => {
  var result = [];
  db.collection("Awaiting")
    .where("stillwaiting", "array-contains", req.userr.handle)
    .where("rejected", "==", false)
    .get()
    .then((qsnap) => {
      qsnap.forEach((doc) => {
        result.push({
          StartsAt: doc.data().StartsAt,
          EndsAt: doc.data().EndsAt,
          chef: doc.data().chef,
          content: doc.data().content,
          directedto: doc.data().directedto,
          Title: doc.data().Title,
          id: doc.id,
          createdBy: doc.data().createdBy,
          rejected: doc.data().rejected,
          rejectedby: doc.data().rejectedby,
          stillwaiting: doc.data().stillwaiting,
        });
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not access apoointment data" });
      console.error(err);
    });
});

//get all the appointment requests created by someone, the request is formed like { } in raw json.

app.get("/icreated", FBAuth, (req, res) => {
  var result = [];
  db.collection("Awaiting")
    .where("createdBy", "==", req.userr.handle)
    .get()
    .then((qsnap) => {
      qsnap.forEach((doc) => {
        result.push({
          StartsAt: doc.data().StartsAt,
          EndsAt: doc.data().EndsAt,
          chef: doc.data().chef,
          content: doc.data().content,
          directedto: doc.data().directedto,
          Title: doc.data().Title,
          id: doc.id,
          createdBy: doc.data().createdBy,
          rejected: doc.data().rejected,
          rejectedby: doc.data().rejectedby,
          stillwaiting: doc.data().stillwaiting,
        });
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: "Could not access apoointment data" });
      console.error(err);
    });
});

//confirm an appointment request, req is formed like {id: "Meeting", action: "confirm/reject"}

app.post("/confirmdate", FBAuth, FBHost, (req, res) => {
  var result = [];
  var tempp = [];
  db.collection("Awaiting")
    .doc(req.body.id)
    .get()
    .then((docc) => {
      docc.data().stillwaiting.forEach((user) => {
        if (user !== req.userr.handle) {
          tempp.push(user);
        }
      });
      db.collection("Awaiting")
        .doc(req.body.id)
        .update({ stillwaiting: tempp })
        .then(() => {})
        .catch((err) => {
          res.status(500).json({ general: "Something went wrong" });
        });
      if (req.body.action == "reject") {
        db.collection("Awaiting")
          .doc(req.body.id)
          .update({ rejectedby: req.userr.handle, rejected: true })
          .then(() => {
            res.json("request has been successfully rejected");
          });
      } else {
        if (tempp != null && tempp.length > 0) {
          res.json("request has been successfully approved");
        } else {
          const newDate = {
            EndsAt: docc.data().EndsAt,
            StartsAt: docc.data().StartsAt,
            Title: docc.data().Title,
            chef: docc.data().chef,
            content: docc.data().content,
            parts: docc.data().directedto,
            awaitingid: docc.id,
          };
          db.collection("Dates")
            .add(newDate)
            .then((doc) => {
              res.json({ message: `document ${doc.id} created successfully` });
            })
            .catch((err) => {
              res.status(500).json({ error: "Something bad happened" });
              console.error(err);
            });
        }
      }
    });
});

//post a date request, the directedto part in the request must be split with ":", such as "Hans:Angela".
// here is an example:
// {
//   "EndsAt": "1595935000",
//   "StartsAt": "1595835000",
//   "Title": "Some Lab Work Invitation",
//   "chef": "Hans",
//   "content": "We should do some lab work",
//   "directedto": "Hans:User:User2",
//

// }

app.post("/request", FBAuth, (req, res) => {
  const newRequest = {
    EndsAt: req.body.EndsAt,
    StartsAt: req.body.StartsAt,
    Title: req.body.Title,
    chef: req.body.chef,
    content: req.body.content,
    directedto: req.body.directedto,
    createdBy: req.userr.handle,
    rejected: false,
    rejectedby: "",
    stillwaiting: req.body.stillwaiting,
  };

  db.collection("Awaiting")
    .add(newRequest)
    .then((doc) => {
      if (
        req.body.directedto.length === 1 &&
        req.body.directedto[0] === req.userr.handle
      ) {
        const newDate = {
          EndsAt: req.body.EndsAt,
          StartsAt: req.body.StartsAt,
          Title: req.body.Title,
          chef: req.body.chef,
          content: req.body.content,
          parts: req.body.directedto,
          awaitingid: doc.id,
        };
        db.collection("Dates")
          .add(newDate)
          .then((docc) => {
            res.json({ message: `document ${docc.id} created successfully` });
          })
          .catch((err) => {
            res.status(500).json({ error: "Something bad happened" });
            console.error(err);
          });
      }
      res.json({ message: `Request ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something bad happened" });
      console.error(err);
    });
});

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

//everything selfexplanatory about this function, req:
// {
//   "email" :"bestmail@worstmail.com",
//   "password": "1985AaAa",
//   "confirmPassword": "1985AaAa",
//   "handle": "BetterThanTheBest"
// }

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
    confirmedby: "",
    confirmed: false,
    con2: false,
    con2by: "",
    period: "",
    isAdmin: false,
  };

  let errors = {};

  if (isEmpty(newUser.email)) {
    errors.email = "May not be empty";
  } else if (!isEmail(newUser.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(newUser.password)) {
    errors.password = "May not be empty";
  }
  if (newUser.password !== newUser.confirmPassword)
    errors.confirmPassword = "Passwords must match";
  if (isEmpty(newUser.handle)) {
    errors.handle = "May not be empty";
  }

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  let token, userIdd;
  db.doc(`/TempAcc/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
      newUser.userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((tokenn) => {
      token = tokenn;

      db.doc(`/TempAcc/${newUser.handle}`).set(newUser);
    })
    .then(() => {
      return res.status(201).json({ token });
    })
    .catch((err) => {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        return res.status(400).json({ email: "Email is already in use" });
      } else if (err.code === "auth/weak-password") {
        return res.status(400).json({ general: "Password is too weak" });
      } else {
        return res.status(500).json({ error: err.code });
      }
    });
});

// so this is login
//obv handle: and password: format request

app.post("/login", (req, res) => {
  const user = {
    handle: req.body.handle,
    password: req.body.password,
  };

  let errors = {};

  if (isEmpty(user.handle)) errors.username = "Must not be empty";
  if (isEmpty(user.password)) errors.password = "Must not be empty";

  if (Object.keys(errors).length > 0) return res.status(400).json(errors);

  db.doc(`/TempAcc/${user.handle}`)
    .get()
    .then((doc) => {
      if (doc.data().confirmed == false)
        return res.status(400).json({
          general: "This account has not been confirmed by the hosts yet",
        });
      firebase
        .auth()
        .signInWithEmailAndPassword(doc.data().email, user.password)
        .then((data) => {
          return data.user.getIdToken();
        })
        .then((token) => {
          return res.json({ token });
        })
        .catch((err) => {
          console.error(err);

          return res
            .status(403)
            .json({ general: "Wrong credentials, please try again" });
        });
    })
    .catch((err) => {
      console.error(err);

      return res
        .status(403)
        .json({ general: "Wrong credentials, please try again" });
    });
});

//confirm a newly created account, req user: ""

app.post("/confirmtemp", FBAuth, FBHost, (req, res) => {
  db.doc(`/TempAcc/${req.body.user}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(403).json({ usernameguest: "User does not exist" });
      } else if (doc.data().confirmed) {
        res.status(403).json({ usernameguest: "User was already confirmed." });
      } else {
        db.doc(`/TempAcc/${req.body.user}`)
          .update({ confirmed: true, confirmedby: req.userr.handle })
          .then(() => {
            res.json("Account successfully confirmed.");
          })
          .catch((err) => {
            res.status(500).json({
              error: err.code,
            });
          });
      }
    });
});

//deactivate an account

app.post("/deactivateacc", FBAuth, FBHost, (req, res) => {
  db.doc(`/TempAcc/${req.body.user}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(403).json({ usernamedeacc: "User does not exist" });
      } else if (!doc.data().confirmed) {
        res.status(403).json({ usernamedeacc: "Account already inactive." });
      } else {
        db.doc(`/TempAcc/${req.body.user}`)
          .update({
            confirmed: false,
            confirmedby: req.userr.handle,
            con2: false,
            con2by: "",
          })
          .then(() => {
            res.json("Account successfully deactivated.");
          })
          .catch((err) => {
            res.status(500).json({
              error: err.code,
            });
          });
      }
    });
});

//promote a temp to a host

app.post("/confirm2", FBAuth, FBHost, (req, res) => {
  db.doc(`/TempAcc/${req.body.user}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(403).json({ username: "User does not exist." });
      } else if (!doc.data().confirmed) {
        res.status(403).json({ username: "User was not yet confirmed." });
      } else if (doc.data().con2) {
        res.status(403).json({ username: "User was already promoted." });
      } else {
        db.doc(`/TempAcc/${req.body.user}`)
          .update({ con2: true, con2by: req.userr.handle })
          .then(() => {
            res.json("Account successfully promoted.");
          })
          .catch((err) => {
            res.status(500).json({
              error: err.code,
            });
          });
      }
    });
});

app.get("/tempacc", FBAuth, (req, res) => {
  var result = [];
  db.collection("TempAcc")
    .where("con2", "==", false)
    .get()
    .then((qsnap) => {
      qsnap.forEach((doc) => {
        if (doc.data().confirmed) result.push(doc.data().handle);
      });
      res.json(result);
    })
    .catch((err) => {
      res.status(500).json({ error: err.code });
    });
});

//demote a host to guest

app.post("/demote", FBAuth, FBHost, (req, res) => {
  db.doc(`/TempAcc/${req.body.user}`)
    .get()
    .then((doc) => {
      if (!doc.exists) {
        res.status(403).json({ usernamedemote: "User does not exist." });
      } else if (!doc.data().con2) {
        res.status(403).json({ usernamedemote: "User is not a host." });
      } else {
        db.doc(`/TempAcc/${req.body.user}`)
          .update({ con2: false, con2by: req.userr.handle })
          .then(() => {
            res.json("Account successfully demoted.");
          })
          .catch((err) => {
            res.status(500).json({
              error: err.code,
            });
          });
      }
    });
});

//get your own details, no request

app.get("/user", FBAuth, (req, res) => {
  db.doc(`/TempAcc/${req.userr.handle}`)
    .get()
    .then((doc) => {
      res.json(doc.data());
    })
    .catch((err) => {
      res.status(400).json({ general: err });
    });
});

//update your time period, req formed like { period: "DDDHH:mm-DDDHH:mm;DDDHH:mm-DDDHH:mm; ..."}

app.post("/updateperiod", FBAuth, FBHost, (req, res) => {
  db.doc(`/TempAcc/${req.userr.handle}`)
    .update({ period: req.body.period.trim() })
    .then(() => {
      res.json("Period successfully updated.");
    })
    .catch((err) => {
      res.status(500).json({
        error: err.code,
      });
    });
});

exports.api = functions.region("europe-west3").https.onRequest(app);
