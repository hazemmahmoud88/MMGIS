const router = require("./routes/users");

let setup = {
  //Once the app initializes
  onceInit: (s) => {
    s.app.use("/API/users", s.checkHeadersCodeInjection, router);
  },
  //Once the server starts
  onceStarted: (s) => {},
  //Once all tables sync
  onceSynced: (s) => {},
};

module.exports = setup;
