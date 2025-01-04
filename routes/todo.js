const express = require('express');
const router = express.Router();

let todos = [
    {
    id : 1, task : "Belajar Node.JS", completed : false
    },
    {
    id : 2, task : "Membuat API", completed : false
    },
    {
        id: 3, 
        task: "Membuat API", 
        completed: false,
        priority: "Medium",
        dueDate: "2024-12-05" 
    },
];

// Endpoint untuk mendapatkan data todos 
router.get('/', (req, res) => {res.json(todos); });

router.post('/', (req, res) => {
    const newTodo = {
        id: todos.length + 1,
        task: req.body.task,
        completed: false,
        priority: req.body.priority || "Low", 
        dueDate: req.body.dueDate || null    
    };
    todos.push(newTodo);
    res.status(201).json(newTodo);
})

router.get('/new-object', (req, res) => {
    res.json(newObject);
});

// Endpoint untuk menghapus tugas
router.delete('/:id', (req, res) => {
    const todoIndex = todos.findIndex(t=>t.id === parseInt(req.params.id));
    if (todoIndex === 1) return res.status(404).json({message: 'Tugas tidak ditemukan'});

    const deletedTodo = todos.splice(todoIndex, 1)[0];  // Menghapus dan menyimpan todo yang dihapus
    res.status(200).json({message: `Tugas '${deletedTodo.task}' telah dihapus`});
});

router.put('/:id', (req, res) => {
    const todo = todos.find(t=>t.id === parseInt(req.params.id));
    if (!todo) return res.status(404).json({message: 'Tugas tidak ditemukan'});
    todo.task = req.body.task || todo.task;

    res.status(200).json({
        message: `Tugas dengan ID ${todo.id} telah diperbarui`,
        updatedTodo: todo
    })
})

module.exports = router;