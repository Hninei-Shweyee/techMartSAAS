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

app.get("/product", authMiddleware, (req, res) => {
    res.render("product", { title: "All Products"});
});
app.get("/category",authMiddleware, (req, res) => {
    res.render("category", { title: "All Categories"});
});
app.get("/add-admin", (req, res) => {
    res.render("addAdmin", { title: "Add New Admin", errorMessage: "" });
});

app.use(qbRoutes);

app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const query = "SELECT * FROM users WHERE username = ? AND pass = ?";

    db.query(query, [username, password], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Server error. Please try again." });
        }

        if (results.length === 0) {
            return res.status(401).json({ message: "Username or password is incorrect" });
        }

        // 🔹 Save User Session
        req.session.user = {
            id: results[0].id,
            username: results[0].username,
            sessionID: req.sessionID
        };

        console.log("Login Success:", req.session.user);

        // 🔹 Redirect after login
        res.json({ message: "Login successful", redirect: "/product" });
    });
});


app.post("/api/add-admin",(req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Please fill in all the required information." });
    }

    const query = "INSERT INTO users (username, password) VALUES (?, ?)";
    db.query(query, [username, password], (err, result) => {
        if (err) {
            console.error("Database connection error:", err);
            return res.status(500).json({ message: "Database connection error" });
        }
        res.json({ message: "New admin added successfully!" });
    });
});

// 🔹 Logout API
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Logout error:", err);
        }
        res.redirect("/");
    });
});

// 🔹 404 Page
app.use((req, res) => {
    res.status(404).render("404", { title: "404 Not Found" });
});

app.listen(6500, () => {
    console.log("Server running on http://localhost:6500");
});

