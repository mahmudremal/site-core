const http = require('http');
const express = require('express');
const path = require('path');
const cron = require('node-cron');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const tasks = {};

app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create or update a task
app.post('/tasks/:id', (req, res) => {
    const { id } = req.params;
    const { cronTime, task } = req.body;

    // If id is '0', create a new task
    if (id === '0') {
        const taskId = Date.now();
        const job = cron.schedule(cronTime, () => {
            console.log(`Executing task: ${task}`);
            // Add your task logic here
        });
        tasks[taskId] = { cronTime, task, job };
        return res.status(201).json({ id: taskId });
    }

    // Update existing task
    if (tasks[id]) {
        tasks[id].job.stop();
        tasks[id].job = cron.schedule(cronTime, () => {
            console.log(`Executing task: ${task}`);
            // Add your task logic here
        });
        tasks[id].cronTime = cronTime;
        tasks[id].task = task;
        return res.status(200).json({ id });
    } else {
        return res.status(404).send('Task not found');
    }
});

// Get a task or all tasks
app.get('/tasks/:id', (req, res) => {
    const { id } = req.params;
    if (id === '0') {
        return res.json(tasks);
    }
    if (tasks[id]) {
        return res.json(tasks[id]);
    } else {
        return res.status(404).send('Task not found');
    }
});

// Delete a task
app.delete('/tasks/:id', (req, res) => {
    const { id } = req.params;
    if (tasks[id]) {
        tasks[id].job.stop();
        delete tasks[id];
        return res.status(200).send('Task deleted');
    } else {
        return res.status(404).send('Task not found');
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});