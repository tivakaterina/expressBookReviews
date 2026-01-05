const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.filter(user => user.username === username).length === 0
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password)
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"})
  }

  if(authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
        data: username
    }, 'access', { expiresIn: 60 * 60})

    req.session.authorization = {
        accessToken, username
    }

    return res.status(200).json({message: "User successfully logged in", accessToken: accessToken});
  }

  return res.status(401).json({message: "Invalid Login. Check username and password"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const username = req.session.authorization.username

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"})
  }

  if (!review) {
    return res.status(400).json({message: "Review is required"})
  }
  
  if(books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review

    return res.status(200).json({ message: "Review modified successfully"})
  }

  
    books[isbn].reviews[username] = review
    return res.status(200).json({ message: "Review added successfully"})
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn
  const username = req.session.authorization.username

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"})
  }

  if(books[isbn].reviews[username]) {
    delete books[isbn].reviews[username]

    return res.status(200).json({ message: "Review deleted successfully"})
  }

  return res.status(404).json({ message: "Review not found for this user"})
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
