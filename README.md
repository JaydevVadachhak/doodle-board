# DoodleBoard

A collaborative, real-time drawing application that allows multiple users to create, share, and save digital doodles directly in the browser.

## Features

### Drawing Tools
- **Multiple Drawing Tools**: Pencil, eraser, rectangle, line, and circle tools
- **Color Selection**: Choose any color for your drawings
- **Adjustable Brush Sizes**: Customize both pencil and eraser sizes
- **Magnifier Tool**: See a magnified view of your current drawing area

### Collaboration Features
- **Real-time Collaboration**: Draw together with others in the same room
- **Room Sharing**: Generate and share room links for collaborative drawing sessions
- **User Presence**: See how many users are currently in your drawing room

### Advanced Features
- **Undo/Redo**: Easily fix mistakes with undo and redo functionality
- **Save & Download**: Save drawings to the server and download as PNG images
- **Public Gallery**: Browse and join public drawings created by other users
- **View Mode**: View drawings without editing them
- **Responsive Design**: Works on desktop and mobile devices

## How to Use

### Setup
1. Install dependencies:
   ```
   npm install
   ```

2. Start the server:
   ```
   npm start
   ```

3. Open your browser and navigate to:
   ```
   http://localhost:3000
   ```

### Drawing
1. Select your preferred drawing tool from the dropdown menu
2. Choose a color and adjust brush size as needed
3. Start drawing on the canvas
4. Use the magnifier to see details of your work
5. Save your creation using the "Save Drawing" button

### Collaboration
1. Share your room link with others by clicking the "Share" button
2. Others can join your room and draw with you in real-time
3. All changes are synchronized across all connected users

### Gallery
1. Navigate to the Gallery page to see public drawings
2. View drawings in read-only mode or join to collaborate
3. Make your own drawings public by checking "Make Public" when saving

## Technologies Used

- HTML5 Canvas
- Vanilla JavaScript
- CSS3
- Node.js
- Express
- Socket.io for real-time communication

## Project Structure

- `index.html` - Main application interface
- `app.css` - Styling for the application
- `index.js` - Client-side JavaScript functionality
- `server.js` - Node.js server for hosting and collaboration
- `gallery.html` - Public gallery interface
- `view.html` - Read-only drawing viewer

## Development

To run the development server with auto-reload:

```
npm run dev
```

## License

MIT 