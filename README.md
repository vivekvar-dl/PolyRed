# Advanced 3D Model Optimizer

A powerful web-based tool for optimizing and simplifying 3D models while preserving visual quality and topology. Built with Three.js and MeshOptimizer.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
any queries
mail to vivek(domainluther1234@gmail.com)


## Features

- **Real-time Preview**: Interactive 3D viewer with orbit controls
- **Multiple Format Support**: Import/Export FBX, GLB, GLTF, and OBJ files
- **Advanced Optimization Settings**:
  - Target ratio control (1-100%)
  - Error threshold adjustment
  - Normal weight preservation
  - Boundary weight control
  - Topology preservation
  - Vertex cache optimization
  - Vertex welding
  - Mesh quantization

## Technical Specifications

### Dependencies

- Three.js (v0.157.0)
- MeshOptimizer (v0.22)
- WebAssembly support

### Browser Requirements

- Modern browser with WebGL 2.0 support
- WebAssembly support
- Recommended: Chrome 90+, Firefox 88+, Safari 14+

### Performance

- Handles models up to:
  - 1M vertices
  - 2M triangles
  - 100MB file size
- Real-time optimization feedback
- Progressive optimization levels

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/advanced-model-optimizer.git
cd advanced-model-optimizer
```

2. Set up a local web server (e.g., using Python):
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

3. Open in browser:
```
http://localhost:8000/advanced-model-optimizer.html
```

## Usage

1. **Loading Models**:
   - Click "Choose File" to select your 3D model
   - Supported formats: .fbx, .glb, .gltf, .obj
   - Model is automatically displayed in the viewer

2. **Optimization Settings**:
   - **Target Ratio**: Controls the percentage of triangles to keep (1-100%)
   - **Error Threshold**: Maximum allowed geometric error (0.01-1.0)
   - **Normal Weight**: Importance of normal vector preservation (0-1)
   - **Boundary Weight**: Importance of boundary preservation (0-3)

3. **Advanced Options**:
   - **Lock Boundary Vertices**: Prevents modification of mesh boundaries
   - **Preserve Topology**: Maintains mesh connectivity
   - **Optimize Vertex Cache**: Improves rendering performance
   - **Weld Vertices**: Merges nearby vertices
   - **Generate LODs**: Creates multiple detail levels

4. **Export Settings**:
   - **Compress Normals**: Uses octahedral normal compression
   - **Compress UVs**: Quantizes texture coordinates
   - **Generate LODs**: Creates multiple detail levels

## API Reference

### Key Functions

```javascript
// Initialize the optimizer
const modelOptimizer = new AdvancedModelOptimizer();

// Optimization parameters
interface OptimizationSettings {
    normalWeight: number;      // 0.0 - 1.0
    boundaryWeight: number;    // 0.0 - 3.0
    lockBoundary: boolean;     // true/false
    preserveTopology: boolean; // true/false
    optimizeVertexCache: boolean;
    weldVertices: boolean;
    vertexCacheSize: number;   // 8-64
    weldThreshold: number;     // 0.0001 - 0.01
}
```

## Error Handling

The optimizer includes comprehensive error handling:
- Invalid geometry validation
- Non-manifold mesh detection
- Degenerate triangle prevention
- Numerical stability checks

## Performance Tips

1. **Optimal Settings**:
   - Start with 50% target ratio
   - Error threshold of 0.01
   - Normal weight of 0.5
   - Boundary weight of 2.0

2. **Large Models**:
   - Enable vertex cache optimization
   - Use mesh quantization
   - Consider enabling LOD generation

3. **Quality vs Performance**:
   - Higher normal weights preserve sharp features
   - Lower boundary weights allow more aggressive optimization
   - Enable topology preservation for animation-ready models

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Three.js team for the excellent 3D library
- Meshoptimizer library for core optimization algorithms
- Contributors and testers who helped improve the tool

## Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## Roadmap

- [ ] Support for more 3D file formats
- [ ] Batch processing capabilities
- [ ] Custom shader support
- [ ] Advanced texture optimization
- [ ] Animation preservation improvements
- [ ] WebGPU support when available 
