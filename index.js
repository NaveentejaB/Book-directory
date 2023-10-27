const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")

// to connect to local database
mongoose.connect("mongodb://localhost:27017/booksDB",{
    useNewUrlParser: true, 
    useUnifiedTopology: true,
    family: 4,
})

const app = express()
app.use(bodyParser.urlencoded({extended:true}))
app.use(express.json());

// define structure of the book details
const bookSchema = new mongoose.Schema({
    bookTitle:{
        type:String,
        unique:true, 
        required:true },
    bookAuthor:{
        type:String,
        required:true },
    bookPrice :{
        type:Number, 
        required:true },
})

// creating model for the book
const Book = mongoose.model("Book",bookSchema)

// to get all the books
app.get("/books",async(req,res)=>{
    try{
        const books =await Book.find()
        res.status(200).json({
            books:books,
            message:"successfully sent all books",
            success:true
        })
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
})

//to get specific book by its unique title
app.get("/book/:title",async(req,res)=>{
    try{
        const name = req.params.title
        const book =await Book.findOne({ bookTitle : req.params.title })
        res.status(200).json({
            book:book,
            message:`book with title ${name} fetched`,
            success:true
        })
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
})

//to add new book
app.post("/book/add",async(req,res)=>{
    const { title, author, price } = req.body
    try{
        const newBook = new Book({
            bookTitle : title,
            bookAuthor : author,
            bookPrice : price
        })
        const bookExist = await Book.findOne({bookTitle : title})
        if(bookExist){
            res.status(200).json({
                message:`book with title ${title} already exists, add new unique title`,
                success:false
            })
        }else{
            newBook.save()
            const book = await Book.findOne({bookTitle : title})
            res.status(200).json({
                newBook : book,
                message:`book with title ${title} added`,
                success:false
            })
        }  
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
})

//update the existing book
app.put("/book/edit/:id",async(req,res)=>{
    const { title, author, price } = req.body
    try{
        const newBook = {
            bookTitle : title,
            bookAuthor : author,
            bookPrice : price
        }
        const findBookTitle = await Book.findOne({bookTitle:title})
        if(findBookTitle){
            res.status(500).json({
                message:`book with the title ${title} exists. Please try different title`,
                success:false
            })
        }else{
            const updatedBook =await Book.findOneAndUpdate({bookTitle : req.params.id} ,newBook)
            res.status(200).json({
                updatedBook : newBook,
                success:true,
                message:`successfully updated the book details with title ${title}`
            })
        }
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
})

//to delete the book
app.delete("/book/delete/:title",async(req,res)=>{
    try{
        const name = req.params.title
        const deletedBook =await Book.findOneAndDelete({bookTitle : req.params.title})
        res.status(200).json({
            deletedBook:deletedBook,
            message:`book with title ${name} deleted`,
            success:true
        })
    }catch(err){
        res.status(500).json({
            message:err.message,
            success:false
        })
    }
})

app.listen(3000,()=>{
    console.log("Running on port 3000")
})