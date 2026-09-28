const express = require("express");
const session = require("express-session");

const app = express();
const PORT = 3001;

// Middleware to read form data
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
    session({
        secret: "mySecretKey123",
        resave: false,
        saveUninitialized: true,
        cookie: {
            maxAge: 600000,       // 10 minutes
            httpOnly: true
        }
    })
);

// ----------------------------------------------------
// HOME PAGE
// ----------------------------------------------------
app.get("/", (req, res) => {
    res.send(`
        <html>
        <head>
            <title>Session Management</title>
        </head>
        <body>
            <h1>Express Session Management</h1>

            <h2>Part A - Session Management</h2>

            <a href="/set-session">Set Session</a><br><br>
            <a href="/dashboard">View Session</a><br><br>
            <a href="/destroy-session">Destroy Session</a><br><br>

            <h2>Part B - User Authentication</h2>

            <a href="/login">Login</a>
        </body>
        </html>
    `);
});

// ----------------------------------------------------
// PART A - SET SESSION
// ----------------------------------------------------
app.get("/set-session", (req, res) => {

    req.session.username = "admin";

    // Initialize visitCount if it does not exist
    if (!req.session.visitCount) {
        req.session.visitCount = 1;
    } else {
        req.session.visitCount++;
    }

    res.send(`
        <h2>Session Created Successfully</h2>

        <p><b>Username:</b> ${req.session.username}</p>
        <p><b>Visit Count:</b> ${req.session.visitCount}</p>

        <a href="/dashboard">View Dashboard</a><br><br>
        <a href="/">Home</a>
    `);
});

// ----------------------------------------------------
// PART A - VIEW SESSION / DASHBOARD
// ----------------------------------------------------
app.get("/dashboard", (req, res) => {

    if (!req.session.username) {
        return res.send(`
            <h2>No Session Found</h2>
            <p>Please create a session first.</p>
            <a href="/set-session">Set Session</a>
        `);
    }

    res.send(`
        <html>
        <head>
            <title>Dashboard</title>
        </head>

        <body>
            <h1>Dashboard</h1>

            <h2>Welcome, ${req.session.username}!</h2>

            <p><b>Session ID:</b> ${req.sessionID}</p>

            <p>
                You have visited this page
                <b>${req.session.visitCount}</b>
                times during this session.
            </p>

            <br>

            <a href="/set-session">Update Session</a><br><br>

            <a href="/destroy-session">Destroy Session</a><br><br>

            <a href="/">Home</a>
        </body>
        </html>
    `);
});

// ----------------------------------------------------
// PART A - DESTROY SESSION
// ----------------------------------------------------
app.get("/destroy-session", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error destroying session.");
        }

        res.send(`
            <h2>Session Destroyed Successfully</h2>

            <p>All session data has been cleared.</p>

            <a href="/">Go to Home</a>
        `);
    });
});

// ----------------------------------------------------
// PART B - LOGIN PAGE
// ----------------------------------------------------
app.get("/login", (req, res) => {

    res.send(`
        <html>
        <head>
            <title>Login</title>
        </head>

        <body>

            <h1>User Login</h1>

            <form method="POST" action="/login">

                <label>Username:</label>
                <input type="text" name="username" required>

                <br><br>

                <label>Password:</label>
                <input type="password" name="password" required>

                <br><br>

                <button type="submit">Login</button>

            </form>

            <br>

            <a href="/">Home</a>

        </body>
        </html>
    `);
});

// ----------------------------------------------------
// PART B - LOGIN PROCESS
// ----------------------------------------------------
app.post("/login", (req, res) => {

    const { username, password } = req.body;

    // Hardcoded credentials for demonstration
    const validUsername = "admin";
    const validPassword = "1234";

    if (username === validUsername && password === validPassword) {

        // Store authenticated user in session
        req.session.user = username;

        // Initialize visit count
        req.session.visitCount = 1;

        res.redirect("/user-dashboard");

    } else {

        res.send(`
            <h2>Login Failed</h2>

            <p>Invalid username or password.</p>

            <a href="/login">Try Again</a>
        `);
    }
});

// ----------------------------------------------------
// AUTHENTICATION MIDDLEWARE
// ----------------------------------------------------
function isAuthenticated(req, res, next) {

    if (req.session.user) {
        return next();
    }

    res.redirect("/login");
}

// ----------------------------------------------------
// PROTECTED DASHBOARD
// ----------------------------------------------------
app.get("/user-dashboard", isAuthenticated, (req, res) => {

    // Increase visit count
    if (!req.session.visitCount) {
        req.session.visitCount = 1;
    } else {
        req.session.visitCount++;
    }

    res.send(`
        <html>

        <head>
            <title>User Dashboard</title>
        </head>

        <body>

            <h1>User Dashboard</h1>

            <h2>Welcome, ${req.session.user}!</h2>

            <p>
                <b>Session ID:</b>
                ${req.sessionID}
            </p>

            <p>
                You have visited this page
                <b>${req.session.visitCount}</b>
                times during this session.
            </p>

            <br>

            <a href="/user-dashboard">Refresh Dashboard</a>
            <br><br>

            <a href="/logout">Logout</a>

        </body>

        </html>
    `);
});

// ----------------------------------------------------
// LOGOUT
// ----------------------------------------------------
app.get("/logout", (req, res) => {

    req.session.destroy((err) => {

        if (err) {
            return res.send("Error logging out.");
        }

        res.redirect("/login");
    });
});

// ----------------------------------------------------
// START SERVER
// ----------------------------------------------------
app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});