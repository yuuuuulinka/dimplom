# Graph Theory Learning Platform

A React-based interactive platform for learning graph theory concepts with visualization, practice problems, and comprehensive testing.

## Features

### Learning Materials
- Interactive materials covering fundamental graph theory concepts
- Material-to-test linking system for knowledge assessment
- Detailed explanations with examples

### Practice Section
- Tab-based navigation between problems and tests
- 9 comprehensive tests corresponding to learning materials
- Timer functionality with auto-submit
- Detailed results and answer review

### Graph Editor
Interactive graph editor with multiple graph type support:

#### Supported Graph Types
- **Directed Weighted**: Edges have direction (arrows) and weights. Used for shortest path algorithms, network flow.
- **Directed Unweighted**: Edges have direction but no weights. Used for dependency graphs, state machines.
- **Undirected Weighted**: Edges have weights but no direction. Used for minimum spanning trees, weighted connectivity.
- **Undirected Unweighted**: Simple graphs with no direction or weights. Used for social networks, basic connectivity.

#### Editor Features
- Graph type selection with automatic adaptation
- Visual representation changes based on graph type
- Conditional weight display and input
- Node and edge creation, editing, and deletion
- Save/load functionality with backward compatibility
- **Algorithm filtering based on graph type**
- Integration with algorithm visualizer
- **Interactive canvas navigation with pan, zoom, and node dragging**

#### Canvas Navigation
- **Zooming**: Mouse wheel or keyboard shortcuts (Ctrl/Cmd + +/-)
- **Panning**: Ctrl+Click and drag or middle mouse button drag
- **Node Movement**: Drag nodes in Select mode to reposition them
- **View Controls**: Zoom buttons, reset view (Ctrl/Cmd + 0), and fit-to-content
- **Visual Feedback**: Dynamic cursor states and zoom indicator
- **Keyboard Shortcuts**: Full support for common navigation shortcuts

#### Algorithm Compatibility
The editor intelligently filters available algorithms based on the selected graph type:

- **Directed Unweighted**: BFS, DFS
- **Undirected Unweighted**: BFS, DFS, Kruskal's Algorithm
- **Directed Weighted**: Dijkstra's Algorithm, Bellman-Ford Algorithm  
- **Undirected Weighted**: Dijkstra's Algorithm, Prim's Algorithm, Kruskal's Algorithm, Bellman-Ford Algorithm

The "Apply Algorithm" button is automatically disabled when no compatible algorithms are available for the current graph type.

### Graph Visualizer
- Algorithm visualization with step-by-step execution
- Support for various graph algorithms (BFS, DFS, Dijkstra's, etc.)
- Interactive controls and parameter adjustment

## Technical Implementation

### Graph Type System
The platform uses a flexible type system defined in `src/types/graph.ts`:
- `GraphType`: Union type for all supported graph types
- `GraphTypeConfig`: Configuration interface with display properties
- `GraphData`: Main interface including type property

### Components
- **GraphEditor**: Main editor component with type selection
- **EditorCanvas**: Canvas rendering with type-aware drawing
- **EditorToolbar**: Mode selection tools
- **TestDetail/TestCard**: Test-taking interface
- **MaterialDetail**: Learning materials with test integration

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to access the platform.

## Navigation
- **Home**: Platform overview and quick access
- **Learning**: Browse and study materials
- **Visualizer**: Interactive algorithm demonstrations
- **Editor**: Create and edit custom graphs
- **Practice**: Solve problems and take tests
- **Profile**: User progress and achievements 