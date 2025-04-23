const express=require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
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

const authMiddleware = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect("/");
    }
    next();
};

app.use("/",(req,res)=>{
    res.render("logIn", { title: "Login for admin",errorMessage:""});
});

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

