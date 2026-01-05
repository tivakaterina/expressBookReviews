const express = require('express');
const axios = require('axios'); 
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(400).json({message: "Username and password are required"})
  }

  if (isValid(username)) {
    return res.status(400).json({message: "Username already exists"})
  }

  users.push({username: username, password: password})
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',async function (req, res) {
    const getBooks = () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve(books);
          }, 0);
        });
      };

      const booksList = await getBooks();
  return res.status(200).type(json).send(JSON.stringify(booksList));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;

    const getBookByISBN = (isbn) => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            if (books[isbn]) {
              resolve(books[isbn]);
            } else {
              reject(new Error("Book not found"));
            }
          }, 0);
        });
      };

    const book = await getBookByISBN(isbn);  
    
    if (book) {
      res.status(200).json(book);
    } else {
      res.status(404).json({ message: "Book not found" });
    }
 });
  

public_users.get('/author/:author',async function (req, res) {
  const author = req.params.author;
  const getBooksByAuthor = (author) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matchingBooks = {};
        const bookKeys = Object.keys(books);
        
        for (let key of bookKeys) {
          if (books[key].author === author) {
            matchingBooks[key] = books[key];
          }
        }
        
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found for this author"));
        }
      }, 0);
    });
  };


  const matchedBooks = await getBooksByAuthor(author);

  if(Object.keys(matchedBooks).length === 0) {
    res.status(404).json({message: "No books found for this author"})
  }
  return res.status(200).json(matchedBooks);
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
  const title = req.params.title;
  const getBooksByTitle = (title) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const matchingBooks = {};
        const bookKeys = Object.keys(books);
        
        for (let key of bookKeys) {
          if (books[key].title === title) {
            matchingBooks[key] = books[key];
          }
        }
        
        if (Object.keys(matchingBooks).length > 0) {
          resolve(matchingBooks);
        } else {
          reject(new Error("No books found with this title"));
        }
      }, 0);
    });
  };

  const matchedBooks = await getBooksByTitle(title)
  return res.status(200).json(matchedBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn
  if(books[isbn]) {
    return res.status(200).json(books[isbn].reviews)
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
