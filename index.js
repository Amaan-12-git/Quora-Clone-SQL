const { faker } = require("@faker-js/faker");
const { uuid } = require("uuidv4");
const mysql = require("mysql2/promise");
const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
let connection;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
// let data = [];

let getRandomUser = () => {
  return [
    faker.string.uuid(),
    faker.internet.userName(),
    faker.internet.email(),
    faker.internet.password(),
  ];
};
app.get("/", (req, res) => {
  let count;
  (async () => {
    count = await main(`SELECT count(id) FROM user`);
    count = count[0];
    res.render("home.ejs", { count });
  })();
});
app.get("/users", (req, res) => {
  let user_list;
  (async () => {
    user_list = await main(`SELECT * FROM user`);
    res.render("show user.ejs", { user_list });
  })();
});
app.get("/users/:id/edit", (req, res) => {
  (async () => {
    let { id } = req.params;
    res.render("edit.ejs", { id });
  })();
});
app.patch("/users/:id", (req, res) => {
  (async () => {
    let newusername = req.body.user;
    let pass = req.body.pass;
    let id = req.params.id;
    let user = await main(`SELECT * FROM user WHERE id = '${id}'`);
    user = user[0];
    console.log(user.password);
    if (user.password == pass) {
      let change = await main(
        `UPDATE user SET username = '${newusername}' WHERE id = '${id}'`
      );
      console.log(change);
      res.redirect("/users");
    } else {
      res.send("<h1 style='color:red;'>Wrong Password...</h1>");
    }
  })();
});
app.get("/users/:id/delete", (req, res) => {
  (async () => {
    let { id } = req.params;
    res.render("delete.ejs", { id });
  })();
});
app.delete("/users/:id", (req, res) => {
  (async () => {
    let email = req.body.email;
    let pass = req.body.pass;
    let id = req.params.id;
    let user = await main(`SELECT * FROM user WHERE id = '${id}'`);
    user = user[0];
    console.log(user.email);
    console.log(user.password);
    if (user.password == pass && user.email == email) {
      let change = await main(`DELETE FROM user WHERE id = '${id}'`);
      console.log(change);
      res.redirect("/users");
    } else {
      res.send("<h1 style='color:red;'>Wrong Email or Wrong Password...</h1>");
    }
  })();
});
app.get("/users/new", (req, res) => {
  res.render("new.ejs");
});
app.post("/users", (req, res) => {
  (async () => {
    let { email, user, pass } = req.body;
    let id = uuid();
    let arr = [[id, user, email, pass]];
    let change = await main(
      "INSERT INTO user (id,username,email,password) VALUES ?",
      arr
    );
    res.redirect("/users");
  })();
});
// for (let i = 1; i <= 200; i++) {
//   data.push(getRandomUser()); ///           mysql -u root -p
// }
// main("INSERT INTO user (id,username,email,password) VALUES ?",data);
async function main(q, data) {
  // let q = "INSERT INTO user (id,username,email,password) VALUES ?";
  connection = await mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "practice",
    password: "Amaan9839@",
  });
  if (!data) {
    try {
      const [results, fields] = await connection.query(q);
      return results;
    } catch (err) {
      console.error(err);
    }
  } else {
    try {
      const [results, fields] = await connection.query(q, [data]);
      console.log(results);
    } catch (err) {
      console.error(err);
    }
  }
  connection.end();
}
app.listen("8080", () => {
  console.log("server is listening on 8080");
});
