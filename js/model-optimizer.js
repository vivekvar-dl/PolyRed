// Import the meshoptimizer functions
import { MeshoptSimplifier } from './meshopt_simplifier.module.js';

export class ModelSimplifier {
    static async simplifyGeometry(geometry, targetRatio, errorThreshold) {
        try {
            // Clone the geometry to avoid modifying the original
            let workGeometry = geometry.clone();

            // Ensure the geometry is indexed
            if (!workGeometry.index) {
                console.log('Converting to indexed geometry');
                workGeometry = mergeVertices(workGeometry);
                if (!workGeometry.index) {
                    throw new Error('Failed to create index buffer');
                }
            }

            // Get vertex and index data
            const positions = workGeometry.attributes.position.array;
            const indices = workGeometry.index.array;

            // Validate indices
            const maxValidIndex = (positions.length / 3) - 1;
            for (let i = 0; i < indices.length; i++) {
                if (indices[i] > maxValidIndex || indices[i] < 0) {
                    throw new Error(`Invalid vertex index at position ${i}: ${indices[i]} (max valid: ${maxValidIndex})`);
                }
            }

            // Calculate target triangle count
            const targetCount = Math.max(12, Math.floor((indices.length / 3) * targetRatio)) * 3;

            // Run simplification
            const simplifiedIndices = MeshoptSimplifier.simplify(
                new Uint32Array(indices),
                new Float32Array(positions),
                3,
                targetCount,
                errorThreshold,
                []
            );

            if (!simplifiedIndices || simplifiedIndices.length === 0) {
                throw new Error('Simplification produced no indices');
            }

            // Create new geometry with simplified data
            const newGeometry = new THREE.BufferGeometry();
            
            // Copy all attributes from the original geometry
            for (const name in workGeometry.attributes) {
                newGeometry.setAttribute(name, workGeometry.attributes[name].clone());
            }

            // Set new indices
            newGeometry.setIndex(new THREE.BufferAttribute(new Uint32Array(simplifiedIndices), 1));

            return newGeometry;
        } catch (error) {
            console.error('Simplification error:', error);
            throw error;
        }
    }

    static async simplifyModel(model, targetRatio, errorThreshold) {
        const tasks = [];
        
        // Process each mesh in the model
        model.traverse(async (child) => {
            if (child.geometry) {
                tasks.push(
                    this.simplifyGeometry(child.geometry, targetRatio, errorThreshold)
                        .then(newGeometry => {
                            // Store the original geometry
                            const originalGeometry = child.geometry;
                            
                            // Update the mesh with new geometry
                            child.geometry = newGeometry;
                            
                            // Clean up the original geometry
                            originalGeometry.dispose();
                        })
                        .catch(error => {
                            console.error(`Failed to simplify mesh: ${error.message}`);
                            throw error;
                        })
                );
            }
        });

        // Wait for all simplification tasks to complete
        await Promise.all(tasks);
        
        return model;
    }
}
