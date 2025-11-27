const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const session = require("express-session");
const flash = require("connect-flash");
const cookieParser = require('cookie-parser');
const ConnectDB = require('./app/config/db');

require('dotenv').config();

const app = express();
ConnectDB();

// ------------------------------
// GLOBAL MIDDLEWARES
// ------------------------------

// Cookie parser MUST be before session and routes
app.use(cookieParser());



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Sessions (used for flash or UI based pages)
app.use(
  session({
    secret: "yoursecretkey",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(flash());

// Flash messages middleware (UI only)
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

// Static folders
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static('uploads'));

// View Engine (UI)
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// ------------------------------
// ROUTES
// ------------------------------
app.use("/admin", require("./app/routes/admin/index"));
app.use("/", require("./app/routes/ui/index"));


// Global Error Handler for JSON APIs
app.use((err, req, res, next) => {
  console.error("API Error:", err);
  res.status(500).json({ message: "Internal Server Error" });
});

// ------------------------------
// SERVER START
// ------------------------------
app.listen(process.env.PORT || 3000, () => {
  console.log(`Server running at http://localhost:${process.env.PORT || 3000}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database Connected`);
});
