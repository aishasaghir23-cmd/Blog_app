// server.js
const express = require('express');
const app = express();

app.use(express.json());

// Logger Middleware (Q8)
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Data Stores
let todos = [{ id: 1, task: 'Learn Express' }];
let books = [{ id: 1, title: 'Clean Code' }];
let users = [];

// Routes
app.get('/home', (req, res) => res.send('This is the Home Page')); // Q4
app.get('/about', (req, res) => res.send('Name: Your Name')); // Q5
app.get('/contact', (req, res) => res.send('Email: your.email@example.com')); // Q5

app.get('/students', (req, res) => { // Q7
    res.json([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' }
    ]);
});

app.post('/login', (req, res) => { // Q6
    const { username, password } = req.body;
    console.log(`Username: ${username}, Password: ${password}`);
    res.send('Credentials received');
});

// Todos API (Q9, Q11, Q14)
app.get('/todos', (req, res) => res.json(todos));
app.get('/todos/:id', (req, res) => {
    const todo = todos.find(t => t.id === parseInt(req.params.id));
    todo ? res.json(todo) : res.status(404).json({ message: 'Not found' });
});
app.post('/todos', (req, res) => {
    const newTodo = { id: Date.now(), task: req.body.task };
    todos.push(newTodo);
    res.status(201).json(newTodo);
});
app.delete('/todos/:id', (req, res) => {
    todos = todos.filter(t => t.id !== parseInt(req.params.id));
    res.json({ message: 'Deleted' });
});

// Books API (Q10)
app.get('/books', (req, res) => res.json(books));
app.post('/books', (req, res) => {
    const newBook = { id: Date.now(), title: req.body.title };
    books.push(newBook);
    res.status(201).json(newBook);
});
app.delete('/books/:id', (req, res) => {
    books = books.filter(b => b.id !== parseInt(req.params.id));
    res.json({ message: 'Book deleted' });
});

// Users API (Q12)
app.post('/users', (req, res) => {
    const newUser = { id: users.length + 1, name: req.body.name };
    users.push(newUser);
    res.status(201).json(users);
});

app.listen(3000, () => console.log('Server running on port 3000'));
