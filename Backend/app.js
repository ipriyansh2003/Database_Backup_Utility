const express = require("express");
const apiRoutes = require("./routes/apiRoutes");
const path = require("path");

const app = express();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "../frontend/views"));

app.use(express.static(path.join(__dirname, "../frontend/public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Backend API routes
app.use("/api", apiRoutes);

// Frontend routes
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/nosql", (req, res) => {
  res.render("nosql");
});

app.get("/backup", (req, res) => {
  res.render("backup");
});

app.get("/nosql", (req, res) => {
  res.render("nosql");
});

app.get("/success", (req, res) => {
  const pdf = req.query.pdf;  // Get the PDF file name from the query parameter
  res.render("succesfull", { pdf });
});
app.get("/failure", (req, res) => {
  res.render('failure');
});
module.exports = app;