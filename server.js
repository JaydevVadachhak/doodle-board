const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(__dirname));
app.use(express.json());

// Store active rooms and their drawings
const rooms = {};
const savedDrawings = {};

// Load saved drawings if they exist
try {
    const data = fs.readFileSync('drawings.json');
    Object.assign(savedDrawings, JSON.parse(data));
} catch (err) {
    console.log('No saved drawings found, starting fresh');
}

// Save drawings periodically
setInterval(() => {
    fs.writeFile('drawings.json', JSON.stringify(savedDrawings), err => {
        if (err) console.error('Error saving drawings:', err);
    });
}, 60000); // Save every minute

// Socket.io connection handling
io.on('connection', socket => {
    console.log('New client connected:', socket.id);

    // Join a room (create or join existing)
    socket.on('joinRoom', roomId => {
        socket.join(roomId);

        if (!rooms[roomId]) {
            rooms[roomId] = {
                users: [],
                drawing: savedDrawings[roomId] || []
            };
        }

        rooms[roomId].users.push(socket.id);

        // Send existing drawing to new user
        socket.emit('initialDrawing', rooms[roomId].drawing);

        // Notify room about new user
        io.to(roomId).emit('userJoined', {
            userId: socket.id,
            userCount: rooms[roomId].users.length
        });
    });

    // Handle drawing events
    socket.on('drawEvent', data => {
        const { roomId, event } = data;

        if (rooms[roomId]) {
            // Store the drawing event
            rooms[roomId].drawing.push(event);

            // Broadcast to everyone else in the room
            socket.to(roomId).emit('drawEvent', event);
        }
    });

    // Handle clear canvas
    socket.on('clearCanvas', roomId => {
        if (rooms[roomId]) {
            rooms[roomId].drawing = [];
            socket.to(roomId).emit('clearCanvas');
        }
    });

    // Handle save drawing
    socket.on('saveDrawing', ({ roomId, name, public }) => {
        if (rooms[roomId]) {
            savedDrawings[roomId] = {
                drawing: rooms[roomId].drawing,
                name: name || `Drawing ${Object.keys(savedDrawings).length + 1}`,
                public: public || false,
                timestamp: Date.now(),
                creator: socket.id
            };

            socket.emit('drawingSaved', { success: true });
        }
    });

    // Handle disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);

        // Remove user from all rooms they were in
        Object.keys(rooms).forEach(roomId => {
            const room = rooms[roomId];
            const index = room.users.indexOf(socket.id);

            if (index !== -1) {
                room.users.splice(index, 1);

                // Notify room about user leaving
                io.to(roomId).emit('userLeft', {
                    userId: socket.id,
                    userCount: room.users.length
                });

                // Clean up empty rooms
                if (room.users.length === 0 && !savedDrawings[roomId]) {
                    delete rooms[roomId];
                }
            }
        });
    });
});

// Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, 'gallery.html'));
});

app.get('/api/drawings', (req, res) => {
    // Return only public drawings for the gallery
    const publicDrawings = Object.entries(savedDrawings)
        .filter(([_, data]) => data.public)
        .map(([id, data]) => ({
            id,
            name: data.name,
            timestamp: data.timestamp
        }));

    res.json(publicDrawings);
});

app.get('/api/drawing/:id', (req, res) => {
    const id = req.params.id;
    if (savedDrawings[id] && savedDrawings[id].public) {
        res.json(savedDrawings[id]);
    } else {
        res.status(404).json({ error: 'Drawing not found' });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} in your browser`);
}); 