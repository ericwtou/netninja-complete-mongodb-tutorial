const express = require('express')
const { ObjectId } = require('mongodb')
const { connectToDb, getDb } = require('./db')

// init app & middleware
const app = express()
app.use(express.json())

// db connection
let db

connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log('app listening on port 3000')
    })
    db = getDb()
  }

})

// routes
app.post('/books', (req, res) => {

  const book = req.body

  db.collection('books')
    .insertOne(book)
    .then(result => res.status(201).json(result))
    .catch(err => res.status(500).json({err: 'Could not create a new document'}))
})

app.get("/books", (req, res) => {

  // Pagination
  const booksPerPage = 3
  const page = req.query.page || 1

  let books = []

  db.collection('books')
    .find() // returns a cursor
    .sort({author: 1})
    .skip((page - 1) * booksPerPage)
    .limit(booksPerPage)
    .forEach(book => books.push(book))
    .then(() => res.status(200).json(books))
    .catch(() => res.status(500).json({error: 'Could not fetch the documents'}))
})

app.get('/books/:id', (req, res) => {

  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({error: 'Not a valid doc id'})
    return
  }

  db.collection('books')
    .findOne({_id: ObjectId(req.params.id)})
    .then(doc => res.status(200).json(doc))
    .catch(err => res.status(500).json({error: 'Could not fetch the document'}))
})

app.patch('/books/:id', (req, res) => {

  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({error: 'Not a valid doc id'})
    return
  }

  const updates = req.body

  db.collection('books')
    .updateOne({_id: ObjectId(req.params.id)}, {$set: updates})
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({error: 'Could not update the document'}))
})

app.delete('/books/:id', (req, res) => {

  if (!ObjectId.isValid(req.params.id)) {
    res.status(500).json({error: 'Not a valid doc id'})
    return
  }
  
  db.collection('books')
    .deleteOne({_id: ObjectId(req.params.id)})
    .then(result => res.status(200).json(result))
    .catch(err => res.status(500).json({error: 'Could not delete the document'}))
})

