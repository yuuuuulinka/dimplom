# Algorithm Filtering Implementation

## Overview
The graph editor now includes intelligent algorithm filtering based on the selected graph type. Users can only apply algorithms that are compatible with their current graph configuration.

## Graph Type to Algorithm Mapping

### Directed Unweighted Graphs
- **Breadth-First Search (BFS)**: Graph traversal
- **Depth-First Search (DFS)**: Graph traversal

### Undirected Unweighted Graphs  
- **Breadth-First Search (BFS)**: Graph traversal
- **Depth-First Search (DFS)**: Graph traversal
- **Kruskal's Algorithm**: Minimum spanning tree (works on unweighted graphs by treating all edges as weight 1)

### Directed Weighted Graphs
- **Dijkstra's Algorithm**: Shortest path from single source
- **Bellman-Ford Algorithm**: Shortest path with negative weight detection

### Undirected Weighted Graphs
- **Dijkstra's Algorithm**: Shortest path from single source
- **Prim's Algorithm**: Minimum spanning tree (requires undirected weighted graphs)
- **Kruskal's Algorithm**: Minimum spanning tree
- **Bellman-Ford Algorithm**: Shortest path with negative weight detection

## Implementation Details

### Type System
- Extended `Algorithm` interface with `supportedGraphTypes: GraphType[]`
- Added `getAlgorithmsForGraphType()` function in `src/data/algorithms.ts`
- Updated `useAlgorithms` hook with `getFilteredAlgorithms()` method

### User Interface
- **Apply Algorithm Button**: Disabled when no compatible algorithms exist
- **Algorithm Selection Modal**: Shows filtered algorithms with helpful messages
- **Help Section**: Displays algorithm compatibility information for each graph type
- **Visual Feedback**: Button shows count and tooltip when disabled

### Error Prevention
- Prevents users from applying incompatible algorithms
- Clear messaging about why certain algorithms are unavailable
- Suggestions for switching to compatible graph types

## User Experience Features

1. **Smart Button States**: Apply Algorithm button is disabled with explanatory tooltip
2. **Contextual Help**: Help section shows which algorithms work with which graph types
3. **Clear Messaging**: Modal explains when no algorithms are available and suggests alternatives
4. **Algorithm Count**: Shows number of available algorithms for current graph type

## Technical Implementation

### Files Modified
- `src/types/algorithms.ts`: Added graph type requirements
- `src/data/algorithms.ts`: Added algorithm compatibility data and filtering function
- `src/hooks/useAlgorithms.ts`: Added filtered algorithm retrieval
- `src/components/editor/GraphEditor.tsx`: Implemented UI filtering and feedback
- `README.md`: Updated documentation

### Backward Compatibility
- Existing algorithm data structure maintained
- All existing functionality preserved
- New filtering is additive enhancement 