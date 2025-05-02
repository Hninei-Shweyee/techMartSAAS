const express = require("express");
const mysqlConnection = require("../utils/database.js");
const Router = express.Router();
Router.use(express.json());
const bodyParser = require("body-parser");
Router.use(bodyParser.json());
Router.use(bodyParser.urlencoded({ extended: true }));
const methodOverride = require("method-override");
Router.use(methodOverride("_method"));
//const upload = require('./upload.js'); // Import upload.js

// Fetch all products
Router.get("/products", (req, res) => {
    const sql = `
    SELECT p.*, c.Category_Name 
    FROM Products p 
    JOIN Category c ON p.Category_ID = c.Category_ID
    ORDER BY p.Product_Name DESC
    `;


    mysqlConnection.query(sql, (err, results) => {
        if (!err) {
            console.log("Fetched Products:", results); // show fetched data
            res.render("products", { title: "Products", products: results });
        } else {
            console.log("Database error:", err); // show error
            res.status(404).json({ message: "Products not found." });
        }
    });
});


// Add New Product Form
Router.get("/products/add", (req, res) => {
    const sql = "SELECT * FROM Category"; // Fetch all categories

    mysqlConnection.query(sql, (err, result) => {
        if (!err) {
            res.render("addProducts", { title: "Add Product", categories: result });
        } else {
            console.log(err);
            res.status(500).send("Error fetching categories");
        }
    });
});


// Add New Product
// Router.post("/products/add", upload.single("Product_Image"), (req, res) => {
//     console.log("Uploaded file:", req.file);
//     const { Category_ID, Product_Name, Product_Description, Product_Price, Product_Price_Promotion, Discount } = req.body;
//     const Product_Image = req.file ? `/product/${req.file.filename}` : null;
//     const sql = `INSERT INTO Products (Category_ID, Product_Name, Product_Description, Product_Image, Product_Price, Product_Price_Promotion, Discount) 
//                  VALUES (?, ?, ?, ?, ?, ?, ?)`;

//     mysqlConnection.query(
//         sql,
//         [Category_ID, Product_Name, Product_Description, Product_Image, Product_Price, Product_Price_Promotion, Discount],
//         (err, result) => {
//             if (!err) {
//                 console.log("Product added successfully:", result);
//                 res.redirect("/products");
//             } else {
//                 console.log("Database error:", err);
//                 res.status(500).send("Error adding product");  // Show error message
//             }
//         }
//     );
// });

// Edit Product Form
// Router.get("/products/edit/:id", (req, res) => {
//     const productId = req.params.id;
//     const sqlProduct = `SELECT * FROM Products WHERE Product_ID = ?`;
//     const sqlCategories = `SELECT * FROM Category`;

//     mysqlConnection.query(sqlProduct, [productId], (err, productResults) => {
//         if (err || productResults.length === 0) {
//             return res.status(404).json({ message: "Product not found." });
//         }

//         mysqlConnection.query(sqlCategories, (err, categoryResults) => {
//             if (err) {
//                 return res.status(500).json({ message: "Error fetching categories" });
//             }
//             res.render("editProducts", {
//                 title: "Edit Product",
//                 product: productResults[0],
//                 categories: categoryResults
//             });
//         });
//     });
// });


// Update Product
// Router.post("/products/edit/:id", upload.single("Product_Image"), (req, res) => {
//     const productId = req.params.id;
//     const { Category_ID, Product_Name, Product_Description, Product_Price, Product_Price_Promotion, Discount } = req.body;

//     let Product_Image = req.file ? `/product/${req.file.filename}` : null;

//     // fetch the old image
//     const sqlSelect = `SELECT Product_Image FROM Products WHERE Product_ID = ?`;
//     mysqlConnection.query(sqlSelect, [productId], (err, results) => {
//         if (err || results.length === 0) {
//             return res.status(404).json({ message: "Product not found." });
//         }

//         // If no new image uploaded, use the old image
//         if (!Product_Image) {
//             Product_Image = results[0].Product_Image;
//         }

//         const sqlUpdate = `UPDATE Products 
//                            SET Category_ID = ?, Product_Name = ?, Product_Description = ?, Product_Image = ?, Product_Price = ?, Product_Price_Promotion = ?, Discount = ?
//                            WHERE Product_ID = ?`;

//         mysqlConnection.query(
//             sqlUpdate,
//             [Category_ID, Product_Name, Product_Description, Product_Image, Product_Price, Product_Price_Promotion, Discount, productId],
//             (err, result) => {
//                 if (err) {
//                     console.error("Database error:", err.sqlMessage);
//                     return res.status(500).json({ message: "Error updating product", error: err.sqlMessage });

//                 }
//                 console.log("Product updated successfully:", result);
//                 res.redirect("/products");
//             }
//         );
//     });
// });



// Delete Product
Router.get("/products/delete/:id", (req, res) => {
    const productId = req.params.id;
    const sql = `DELETE FROM Products WHERE Product_ID = ?`;

    mysqlConnection.query(sql, [productId], (err, result) => {
        if (!err) {
            res.redirect("/products");
        } else {
            console.log(err);
            res.status(500).json({ message: "Error deleting product" });
        }
    });
});

///CRUD for Category
// Fetch all Categories (READ)
Router.get("/category", (req, res) => {
    const sql = "SELECT * FROM CategoryView";

    mysqlConnection.query(sql, (err, results) => {
        if (!err) {
            res.render("category", {
                title: "Category List",
                categories: results
            });
        } else {
            console.error(err);
            res.status(500).json({ message: "Error fetching categories" });
        }
    });
});




// Add Category Page
Router.get("/category/add", (req, res) => {
    res.render("addCategory", { title: "Add Category" });
});

// Add Category (CREATE)
Router.post("/category/add", (req, res) => {
    const { categoryName } = req.body;

    const sqlInsertCategory = "INSERT INTO Category (Category_Name) VALUES (?)";

    mysqlConnection.query(sqlInsertCategory, [categoryName], (err, result) => {
        if (err) {
            console.error("Error adding category:", err);
            return res.status(500).json({ message: "Failed to add category" });
        }

        console.log("Category Added:", result.insertId);
        res.redirect("/category");
    });
});




// Edit Category Page
Router.get("/category/edit/:id", (req, res) => {
    const categoryId = req.params.id;
    console.log("Editing category ID:", categoryId);

    const sql = `
        SELECT c.*, 
               (SELECT COUNT(*) FROM Products p WHERE p.Category_ID = c.Category_ID) AS Quantity
        FROM Category c 
        WHERE c.Category_ID = ?`;

    mysqlConnection.query(sql, [categoryId], (err, result) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Failed to fetch category" });
        }

        if (result.length === 0) {
            console.error("Category not found!");
            return res.status(404).send("Category not found");
        }

        console.log("Category Data:", result[0]);
        res.render("editCategory", { title: "Edit Category", category: result[0] });
    });
});



// Update Category (EDIT)
Router.post("/category/edit/:id", (req, res) => {
    const categoryId = req.params.id;
    const { categoryName } = req.body;

    const sqlUpdate = "UPDATE Category SET Category_Name = ? WHERE Category_ID = ?";

    mysqlConnection.query(sqlUpdate, [categoryName, categoryId], (err, result) => {
        if (err) {
            console.error("Error updating category:", err);
            return res.status(500).json({ message: "Failed to update category" });
        }

        console.log("Category Updated:", categoryId);
        res.redirect("/category");  // Redirect to category page
    });
});



// Delete Category (DELETE)
Router.get("/category/delete/:id", (req, res) => {
    const categoryId = req.params.id;
    const sql = "DELETE FROM Category WHERE Category_ID = ?";

    mysqlConnection.query(sql, [categoryId], (err, result) => {
        if (!err) {
            console.log("Category Deleted:", result.affectedRows);
            res.redirect("/category");
        } else {
            console.error(err);
            res.status(500).json({ message: "Failed to delete category" });
        }
    });
});

// CRUD for Orders
// Fetch all Orders (READ)
Router.get("/orders", (req, res) => {
    mysqlConnection.query("SELECT * FROM Orders", (err, results) => {
        if (!err) {
            console.log(results);
            res.render("orders", { title: "ORDERS", orders: results });
        } else {
            console.log(err);
            res.status(500).json({ message: "Failed to fetch orders" });
        }
    });
});

// Add Order Page
Router.get("/order/add", (req, res) => {
    res.render("addOrder", { title: "Add Order" });
});

// Add Order (CREATE)
Router.post("/order/add", (req, res) => {
    const { orderDate, customerName, total, items, orderStatus, productId, categoryId } = req.body;
    const sql = "INSERT INTO Orders (Order_Date, Customer_Name, Total, Items, Order_Status, Product_ID, Category_ID) VALUES (?, ?, ?, ?, ?, ?, ?)";

    mysqlConnection.query(sql, [orderDate, customerName, total, items, orderStatus, productId, categoryId], (err, result) => {
        if (!err) {
            console.log("Order Added:", result.insertId);
            res.redirect("/orders");
        } else {
            console.error(err);
            res.status(500).json({ message: "Failed to add order" });
        }
    });
});

// Edit Order Page
Router.get("/orders/edit/:id", (req, res) => {
    const orderId = req.params.id;
    const sql = "SELECT * FROM Orders WHERE Order_ID = ?";

    mysqlConnection.query(sql, [orderId], (err, result) => {
        if (!err) {
            res.render("editOrder", { title: "Edit Order", order: result[0] });
        } else {
            console.error(err);
            res.status(500).json({ message: "Failed to fetch order" });
        }
    });
});

// Update Order (EDIT)
Router.put("/orders/edit/:id", (req, res) => {
    const orderId = req.params.id;
    const { orderDate, customerName, total, items, orderStatus, productId, categoryId } = req.body;

    const sql = "UPDATE Orders SET Order_Date = ?, Customer_Name = ?, Total = ?, Items = ?, Order_Status = ?, Product_ID = ?, Category_ID = ? WHERE Order_ID = ?";
    mysqlConnection.query(sql, [orderDate, customerName, total, items, orderStatus, productId, categoryId, orderId], (err, result) => {
        if (!err) {
            console.log("Order Updated:", result.affectedRows);
            res.redirect("/orders");
        } else {
            console.error(err);
            res.status(500).json({ message: "Failed to update order" });
        }
    });
});

// Delete Order (DELETE)
Router.get("/orders/delete/:id", (req, res) => {
    const orderId = req.params.id;
    const sql = "DELETE FROM Orders WHERE Order_ID = ?";

    mysqlConnection.query(sql, [orderId], (err, result) => {
        if (!err) {
            console.log("Order Deleted:", result.affectedRows);
            res.redirect("/orders");
        } else {
            console.error(err);
            res.status(500).json({ message: "Failed to delete order" });
        }
    });
});

module.exports = Router;