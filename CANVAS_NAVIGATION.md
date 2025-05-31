# Canvas Navigation Features

## Overview
The graph editor now includes comprehensive canvas navigation capabilities, making it easy to work with graphs of any size. The navigation system includes zooming, panning, and node dragging functionality.

## Navigation Controls

### Zooming
- **Mouse Wheel**: Scroll up to zoom in, scroll down to zoom out
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + +` or `Ctrl/Cmd + =`: Zoom in
  - `Ctrl/Cmd + -`: Zoom out
  - `Ctrl/Cmd + 0`: Reset zoom to 100%
- **Zoom Buttons**: Use the zoom control buttons in the top-right corner
- **Zoom Range**: 10% to 300% for optimal usability
- **Smart Zooming**: Zoom centers on mouse position for intuitive navigation

### Panning
- **Ctrl + Click and Drag**: Hold Ctrl while clicking and dragging to pan the canvas
- **Middle Mouse Button**: Click and drag with the middle mouse button to pan
- **Keyboard Shortcut**: `Ctrl/Cmd + 0` resets the pan position

### Node Movement
- **Drag Nodes**: In Select mode, click and drag any node to reposition it
- **Real-time Updates**: Node positions update immediately as you drag
- **Coordinate Preservation**: New positions are saved in the graph data
- **Visual Feedback**: Cursor changes to indicate draggable nodes

### View Controls
- **Fit to Content**: Automatically adjusts zoom and pan to show all nodes
- **Reset View**: Returns to default zoom (100%) and center position
- **Zoom Indicator**: Shows current zoom percentage in the top-left corner
- **Visual Guides**: Help text shows available controls in the bottom-left

## Implementation Details

### Coordinate System
- **World Coordinates**: Graph nodes use consistent world coordinates
- **Screen Coordinates**: Display coordinates adjusted for viewport transformation
- **Coordinate Conversion**: Automatic conversion between world and screen coordinates

### Performance Optimizations
- **Canvas Transformation**: Uses native canvas transform for smooth rendering
- **Scale-Aware Rendering**: Line widths and font sizes adjust automatically with zoom
- **Event Handling**: Efficient mouse and keyboard event management
- **Memory Management**: Proper cleanup of event listeners

### Visual Feedback
- **Dynamic Cursors**: 
  - Grab cursor for panning
  - Move cursor when dragging nodes
  - Mode-specific cursors (crosshair, cell, etc.)
- **Zoom Indicator**: Real-time zoom percentage display
- **Help Text**: Context-sensitive control instructions

## User Experience Features

### Accessibility
- **Keyboard Support**: Full keyboard navigation support
- **Visual Indicators**: Clear visual feedback for all interactions
- **Progressive Disclosure**: Help text appears when relevant

### Intuitive Controls
- **Industry Standards**: Uses common navigation patterns (Ctrl+scroll, etc.)
- **Multi-input Support**: Mouse, keyboard, and button controls
- **Contextual Behavior**: Controls adapt to current editor mode

### Error Prevention
- **Bounds Checking**: Prevents extreme zoom levels
- **Smooth Transitions**: Gradual zoom and pan changes
- **State Preservation**: Navigation state maintained during mode changes

## Integration with Editor Modes

### Select Mode
- Node dragging enabled
- Pan and zoom available
- Click to select nodes/edges

### Add Node Mode
- Click to add nodes at correct world coordinates
- Pan and zoom to find placement location
- Visual cursor indicates add mode

### Add Edge Mode
- Pan and zoom to see source and target nodes
- Node selection works with viewport transformation
- Visual feedback for edge creation

### Delete Mode
- Pan and zoom to locate items to delete
- Precise clicking with coordinate transformation
- Clear visual feedback for delete operations

## Technical Architecture

### State Management
- Viewport state (x, y, scale) managed separately from graph data
- Dragging state for smooth interactions
- Event handling state for proper mouse behavior

### Coordinate Transformation
```typescript
// Screen to world coordinates
const worldPos = {
  x: (screenX - viewport.x) / viewport.scale,
  y: (screenY - viewport.y) / viewport.scale
};

// World to screen coordinates  
const screenPos = {
  x: worldX * viewport.scale + viewport.x,
  y: worldY * viewport.scale + viewport.y
};
```

### Canvas Rendering
- Viewport transformation applied to canvas context
- Scale-aware rendering for consistent visual appearance
- Efficient redraw with proper state dependencies 