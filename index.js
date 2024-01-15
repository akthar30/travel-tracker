import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "Jahir22011999.",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;

let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];

// creating function to get users from the database
async function getUsers(){
  let result = await db.query("SELECT * FROM users");
  console.log(result.rows);
  // updating users array 
  users = result.rows; 
  return users.find((user) => user.id == currentUserId);
}

// finding visited_countries code for particular user
async function checkVisisted() {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1",[currentUserId]);
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}

//rendering the home page(showing all the countries in visited_countries)
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const current_user = await getUsers();
  console.log(current_user);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: current_user.color,
  });
});

// To add new countries for the user
app.post("/add", async (req, res) => {
  const input = req.body["country"];

  try {
    const result = await db.query(
      "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );

    const data = result.rows[0];
    const countryCode = data.country_code;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_code) VALUES ($1)",
        [countryCode]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }
});

// To show the particular user visited countries
app.post("/user", async (req, res) => {
  const requestedUser_id = req.body.user;
  currentUserId = requestedUser_id;
  console.log(currentUserId);
  const current_user = await getUsers();
  const countries = await checkVisisted();
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users,
    color: current_user.color
  });
});


// Adding new user to the database
app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
