const express=require("express");
const bodyParser = require("body-parser");
const path = require("path");
const db = require("./utils/database");
const qbRoutes = require("./routes/qb");

const app = express();

app.use(bodyParser.json());

app.use("/", express.static(path.join(__dirname, "public")));
app.use("/img", express.static("public/img"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/product", (req, res) => {
    res.render("product", { title: "All Products"});
});
app.get("/category", (req, res) => {
    res.render("category", { title: "All Categories"});
});

// app.use(qbRoutes);

app.listen(6500, () => {
    console.log("Server running on http://localhost:6500");
});

