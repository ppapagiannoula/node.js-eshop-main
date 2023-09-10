const User = require("../models/user");
const bcrypt = require("bcryptjs");
const mailgun = require("mailgun-js")({
  apiKey: "68df38b9ddbfc4022cbc8e23811aa17b-db4df449-f23867ae",
  domain: "sandbox4f1120d5f54a4ad4812d89274a3cda83.mailgun.org",
});
const crypto = require("crypto");

// Display login form
exports.getLogin = (req, res, next) => {
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

// Display signup form
exports.getSignup = (req, res, next) => {
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
  });
};

// Handle login form submission
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }
      bcrypt.compare(password, user.password).then((doMatch) => {
        if (doMatch) {
          // Set session variables to mark the user as logged in
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            console.log(err);
            res.redirect("/");
          });
        }
        res.redirect("/login");
      });
    })
    .catch((err) => console.log(err));
};

// Handle signup form submission
exports.postSignup = (req, res, next) => {
  const name = req.body.name.trim();
  const email = req.body.email.trim();
  const password = req.body.password.trim();
  const emails = {
    gmail: /@gmail.com$/,
    hotmail: /@hotmail.com$/,
    outlook: /@outlook.com$/,
    yahoo: /@yahoo.com$/,
  };
  const mailisvalid = Object.values(emails).some((value) => {
    return value.test(email);
  });
  console.log(mailisvalid);
  // Check if the email is valid and password meets the criteria
  mailisvalid && !/ /.test(email) && password.length > 7
    ? User.findOne({ email: email })
        .then((user) => {
          if (user) {
            return res.redirect("/signup");
          }
          return bcrypt
            .hash(password, 12)
            .then((hashedPassword) => {
              const user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [] },
              });
              return user.save();
            })
            .then((result) => {
              res.redirect("/login");
              var data = {
                //tempmail
                from: "Backend-NodeJS-User <pparaskevi16@gmail.com>",
                to: email,
                subject: "Welcome to our site!",
                html: "<h1>You successfully signed up! Welcome to our site!</h1>",
              };
              return mailgun.messages().send(data, function (error, body) {
                console.log(body);
              });
            })
            .catch((err) => {
              console.log(err);
            });
        })
        .catch((err) => {
          console.log(err);
        })
     // If email or password doesn't meet the criteria, redirect to signup page with the validity check result
      :res.redirect("/signup");

};

// Handle logout request
exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/login");
  });
};

// Display reset password form
exports.getReset = (req, res, next) => {
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    isAuthenticated: false,
  });
};

// Handle reset password form submission
exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          console.log("No user found!");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        //user.resetTokenExpiration = Date.now() + 3600000; //ms
        user.resetTokenExpiration = new Date(); //ms
        user.save();
      })
      .then((result) => {
        var data = {
          from: "Backend-NodeJS-User <pparaskevi16@gmail.com>",
          to: email,
          subject: "Password Reset!",
          html: `
          <p>Your requested for a password reset</p>
          <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to set a new password</p>
          `,
        };
        return mailgun.messages().send(data, function (error, body) {
          console.log(body);
        });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};
