const router = require("./routes/utils");
let setup = {
  //Once the app initializes
  onceInit: (s) => {
    s.app.use("/API/utils", s.ensureUser(), s.setContentType, router);
  },
  //Once the server starts
  onceStarted: (s) => {},
  //Once all tables sync
  onceSynced: (s) => {},
};

module.exports = setup;
