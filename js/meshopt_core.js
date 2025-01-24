// Core mesh optimization functionality
class MeshOptCore {
    constructor() {
        this.VERTEX_CACHE_SIZE = 32;
        this.MAX_VALENCE = 8;
        this.POSITION_PRECISION = 1e-4;
        this.NORMAL_PRECISION = 1e-2;
        this.UV_PRECISION = 1e-4;
    }

    // Topology preservation and analysis
    analyzeTopology(geometry) {
        const positions = geometry.attributes.position;
        const indices = geometry.index.array;
        const vertexCount = positions.count;
        const indexCount = indices.length;

        // Build vertex adjacency information
        const vertexAdjacency = new Array(vertexCount).fill().map(() => new Set());
        for (let i = 0; i < indexCount; i += 3) {
            const a = indices[i], b = indices[i + 1], c = indices[i + 2];
            vertexAdjacency[a].add(b).add(c);
            vertexAdjacency[b].add(a).add(c);
            vertexAdjacency[c].add(a).add(b);
        }

        // Find boundary vertices
        const boundaryVertices = new Set();
        for (let i = 0; i < vertexCount; i++) {
            if (this.isBoundaryVertex(i, vertexAdjacency)) {
                boundaryVertices.add(i);
            }
        }

        return {
            vertexAdjacency,
            boundaryVertices,
            averageValence: this.calculateAverageValence(vertexAdjacency),
            boundaryEdges: this.findBoundaryEdges(indices, boundaryVertices)
        };
    }

    isBoundaryVertex(vertexIndex, adjacency) {
        const neighbors = Array.from(adjacency[vertexIndex]);
        if (neighbors.length < 2) return true;

        // Check if vertex forms a complete ring of triangles
        let currentVertex = neighbors[0];
        let visitedVertices = new Set([vertexIndex, currentVertex]);
        let edgeCount = 1;

        while (edgeCount < neighbors.length) {
            let found = false;
            for (const nextVertex of adjacency[currentVertex]) {
                if (adjacency[vertexIndex].has(nextVertex) && !visitedVertices.has(nextVertex)) {
                    visitedVertices.add(nextVertex);
                    currentVertex = nextVertex;
                    edgeCount++;
                    found = true;
                    break;
                }
            }
            if (!found) return true;
        }

        return false;
    }

    calculateAverageValence(adjacency) {
        let totalValence = 0;
        for (const neighbors of adjacency) {
            totalValence += neighbors.size;
        }
        return totalValence / adjacency.length;
    }

    findBoundaryEdges(indices, boundaryVertices) {
        const edges = new Set();
        for (let i = 0; i < indices.length; i += 3) {
            const a = indices[i], b = indices[i + 1], c = indices[i + 2];
            if (boundaryVertices.has(a) || boundaryVertices.has(b)) {
                edges.add(`${Math.min(a, b)}-${Math.max(a, b)}`);
            }
            if (boundaryVertices.has(b) || boundaryVertices.has(c)) {
                edges.add(`${Math.min(b, c)}-${Math.max(b, c)}`);
            }
            if (boundaryVertices.has(c) || boundaryVertices.has(a)) {
                edges.add(`${Math.min(c, a)}-${Math.max(c, a)}`);
            }
        }
        return edges;
    }

    // Vertex cache optimization
    optimizeVertexCache(indices, vertexCount) {
        const vertexCache = new Array(this.VERTEX_CACHE_SIZE).fill(-1);
        const vertexCacheTimestamps = new Array(vertexCount).fill(-1);
        const vertexCacheCounts = new Array(vertexCount).fill(0);
        let timestamp = 0;

        // Calculate vertex cache scores
        for (let i = 0; i < indices.length; i++) {
            const vertex = indices[i];
            vertexCacheCounts[vertex]++;
        }

        // Optimize triangle order
        const optimizedIndices = new Array(indices.length);
        let writeIndex = 0;

        while (writeIndex < indices.length) {
            let bestScore = -1;
            let bestTriangle = -1;

            // Find triangle with best score
            for (let i = 0; i < indices.length; i += 3) {
                if (indices[i] === -1) continue;
                const score = this.calculateTriangleScore(
                    indices[i], indices[i + 1], indices[i + 2],
                    vertexCache, vertexCacheTimestamps, vertexCacheCounts,
                    timestamp
                );
                if (score > bestScore) {
                    bestScore = score;
                    bestTriangle = i;
                }
            }

            if (bestTriangle === -1) break;

            // Add triangle to optimized order
            for (let i = 0; i < 3; i++) {
                const vertex = indices[bestTriangle + i];
                optimizedIndices[writeIndex++] = vertex;
                this.updateVertexCache(vertex, vertexCache, vertexCacheTimestamps, timestamp++);
                vertexCacheCounts[vertex]--;
            }

            // Mark triangle as processed
            indices[bestTriangle] = -1;
            indices[bestTriangle + 1] = -1;
            indices[bestTriangle + 2] = -1;
        }

        return optimizedIndices;
    }

    calculateTriangleScore(a, b, c, cache, timestamps, counts, currentTime) {
        return this.getVertexScore(a, cache, timestamps, counts, currentTime) +
               this.getVertexScore(b, cache, timestamps, counts, currentTime) +
               this.getVertexScore(c, cache, timestamps, counts, currentTime);
    }

    getVertexScore(vertex, cache, timestamps, counts, currentTime) {
        const cachePosition = cache.indexOf(vertex);

        // Vertex is not used anymore
        if (counts[vertex] === 0) return 0;

        // Vertex is not in cache
        if (cachePosition === -1) return 0.75;

        const cacheAge = currentTime - timestamps[vertex];

        // Prefer vertices that are already in cache
        if (cacheAge < this.VERTEX_CACHE_SIZE) {
            const score = 1.0 - cacheAge / this.VERTEX_CACHE_SIZE;
            return score * score * score;
        }

        return 0.75;
    }

    updateVertexCache(vertex, cache, timestamps, currentTime) {
        const position = cache.indexOf(vertex);
        if (position !== -1) {
            // Remove vertex from current position
            cache.splice(position, 1);
        }

        // Add vertex to front of cache
        cache.unshift(vertex);
        if (cache.length > this.VERTEX_CACHE_SIZE) {
            cache.pop();
        }

        timestamps[vertex] = currentTime;
    }

    // Vertex quantization for compression
    quantizeVertices(positions, precision = this.POSITION_PRECISION) {
        const quantized = new Float32Array(positions.length);
        for (let i = 0; i < positions.length; i++) {
            quantized[i] = Math.round(positions[i] / precision) * precision;
        }
        return quantized;
    }

    // Normal vector compression
    compressNormals(normals) {
        const compressed = new Float32Array(normals.length);
        for (let i = 0; i < normals.length; i += 3) {
            const x = normals[i];
            const y = normals[i + 1];
            const z = normals[i + 2];
            const length = Math.sqrt(x * x + y * y + z * z);

            if (length > 0) {
                compressed[i] = Math.round(x / length / this.NORMAL_PRECISION) * this.NORMAL_PRECISION;
                compressed[i + 1] = Math.round(y / length / this.NORMAL_PRECISION) * this.NORMAL_PRECISION;
                compressed[i + 2] = Math.round(z / length / this.NORMAL_PRECISION) * this.NORMAL_PRECISION;
            }
        }
        return compressed;
    }

    // UV coordinate compression
    compressUVs(uvs) {
        const compressed = new Float32Array(uvs.length);
        for (let i = 0; i < uvs.length; i++) {
            compressed[i] = Math.round(uvs[i] / this.UV_PRECISION) * this.UV_PRECISION;
        }
        return compressed;
    }
}

export default MeshOptCore; 