# DoodleBoard - Free Online Drawing Tool

A lightweight, browser-based drawing application that allows you to create, save, and view digital artwork directly in your web browser. DoodleBoard uses local storage to save your drawings, making it a completely client-side solution with no server dependencies.

## 🎨 Features

### Drawing Tools
- **Multiple Drawing Tools**: Create with pencil, eraser, rectangle, line, and circle tools
- **Color Selection**: Choose from unlimited colors with the color picker
- **Adjustable Brush Sizes**: Customize both pencil and eraser sizes for precise control
- **Magnifier Tool**: Get pixel-perfect precision with the built-in magnifier

### Storage Features
- **Local Storage**: All drawings are saved to your browser's local storage
- **Gallery View**: Browse, sort, and manage your saved drawings in a visual gallery
- **View Mode**: Display your drawings in a dedicated view page with download options
- **Download**: Export your creations as PNG images to share or save externally

### Advanced Features
- **Undo/Redo**: Easily fix mistakes with comprehensive undo and redo functionality
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **No Server Required**: Completely client-side application with zero dependencies

## 🚀 How to Use

### Getting Started
1. Simply open `index.html` in any modern web browser
2. No installation, server setup, or account creation required
3. Start drawing immediately with the default pencil tool

### Drawing
1. Select your preferred drawing tool from the dropdown menu
2. Choose a color and adjust brush size as needed
3. Draw directly on the canvas
4. Use the magnifier to see details of your work
5. Save your creation by naming it and clicking "Save Drawing"

### Managing Drawings
1. Navigate to the Gallery page to see all your saved drawings
2. View drawings in read-only mode
3. Edit existing drawings to continue your work
4. Download drawings as PNG files
5. Delete drawings you no longer want to keep

## 💻 Technologies Used

- **HTML5 Canvas API**: For drawing functionality
- **Vanilla JavaScript**: No frameworks or libraries required
- **CSS3**: For responsive and modern UI design
- **Local Storage API**: For saving and retrieving drawings

## 📁 Project Structure

- `index.html` - Main drawing interface
- `app.css` - Styling for the entire application
- `index.js` - Core JavaScript functionality for drawing and saving
- `gallery.html` - Gallery interface for browsing saved drawings
- `view.html` - Read-only drawing viewer with download options

## 🔧 Customization

DoodleBoard is designed to be easily customizable:

1. Modify `app.css` to change the look and feel
2. Add new tools by extending the tool selection in `index.js`
3. Customize storage options in the localStorage implementation

## 📱 Compatibility

- Works on all modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design adapts to desktop, tablet, and mobile screens
- No internet connection required after initial page load

## 📄 License

MIT

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/doodleboard)
- [Report Issues](https://github.com/yourusername/doodleboard/issues) 