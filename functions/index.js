const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { firestore } = require("firebase-admin");
admin.initializeApp();

exports.removeExpiredDocuments = functions.pubsub
  .schedule("every 1 hours")
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = firestore.Timestamp.now();
    const ts = firestore.Timestamp.fromMillis(now.toMillis() - 86400000); // 24 hours in milliseconds = 86400000

    const snap = await db
      .collection("users")
      .where("storyPhotoUrl", "<", ts)
      .get();
    let promises = [];
    snap.forEach((snap) => {
      promises.push(snap.ref.delete());
    });
    return Promise.all(promises);
  });

exports.deleteUserByEmail = functions.https.onRequest(async (req, res) => {
  const userEmail = req.body.userEmail;
  admin
    .auth()
    .getUserByEmail(userEmail)
    .then((userRecord) => {
      const uid = userRecord.uid;
      return admin
        .auth()
        .deleteUser(uid)
        .then(() => {
          res.send("User deleted successfully");
          return;
        })
        .catch((error) => {
          res.send("Error deleting user:", error);
        });
    });
});
