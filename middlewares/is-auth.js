//middleware to check if a user is logged in
module.exports = (req, res, next) => {
  // Check if the 'isLoggedIn' property is set to 'true' in the session
  if (!req.session.isLoggedIn) {
    // If not logged in, redirect the user to the login page
    return res.redirect("/login");
  }
  // If logged in, proceed to the next middleware/route handler
  next();
};
