import { createSignal, onMount, createEffect, onCleanup } from 'solid-js';

// The ASCII text to be displayed and animated
export const rcsAscii = `
d8888b.  .o88b. .d8888.
88  \`8D d8P  Y8 88'  YP
88oobY' 8P      \`8bo.  
88\`8b   8b        \`Y8b.
88 \`88. Y8b  d8 db   8D
88   YD  \`Y88P' \`8888Y'
`;

// Define an interface for a single particle's state
interface Particle {
    id: number;          // Unique identifier for the particle
    symbol: string;      // The character symbol the particle displays
    color: string;       // The color of the particle
    row: number;         // Current row position on the grid
    col: number;         // Current column position on the grid
    mode: 'perimeter' | 'internal'; // Current movement mode
    // For 'perimeter' mode:
    pathIndex: number;   // 0:Right, 1:Down, 2:Left, 3:Up
    // For 'internal' mode:
    internalStepsRemaining: number; // Number of steps left in internal mode
    lastDx: number;      // Last horizontal movement for preventing immediate reversal in internal mode (internal mode only)
    lastDy: number;      // Last vertical movement for preventing immediate reversal in internal mode (internal mode only)

    // New properties to track consecutive moves in the same direction
    currentDx: number; // The dx of the currently moving direction (applies to both modes)
    currentDy: number; // The dy of the currently moving direction (applies to both modes)
    consecutiveMovesInSameDirection: number; // Counter for consecutive moves in the currentDx/currentDy (applies to both modes)

    lastMoveTime: number; // Timestamp of the last time this specific particle moved
}

/**
 * Animated banner which creates N particles, each particle is selected from the list of symbols in order of appearance.
 * The ascii string should be represented as a matrix, where in each pair row/column there is an original value.
 * The particles should be plotted initially in a particular row/column pair separated by a minimum of 3 rows and 3 columns.
 * The particles move at the same speed, replacing the original value of the row/column.
 * The particles have a color assigned from the colors array in the sequence of creation of the particles. 
 * The particles only move left-right and up-down. Never move back horizontally before a turn. Never move back vertically without a turn.
 * Once a particle leaves the position which was originally occupied by a non-empty character, replace its vacant space with the original value of that space.
 * @param {string} ascii - The ASCII string to animate.
 * @param {number} [particles=5] - The number of particles to display.
 */
export function Ascii({ ascii = rcsAscii, particles = 5 }: { ascii?: string; particles?: number }) {
    // Symbols available for particles
    const symbols = [',', '@', '+', '&', ';', '_'];
    // Colors available for particles (Google brand colors as an example)
    const colors = ['#4285F4', '#EA4335', '#FBBC04', '#34A853']; // blue, red, yellow, green

    // SolidJS signal to hold the current state of the ASCII grid being displayed.
    // This grid includes the original characters and the overlaid particles.
    const [asciiGrid, setAsciiGrid] = createSignal<string[][]>([]);

    // A non-reactive variable to store the original ASCII grid.
    // This is used to restore characters as particles move away from a spot.
    let originalAsciiGrid: string[][] = [];

    // SolidJS signal to hold the state of all particles.
    const [particleState, setParticleState] = createSignal<Particle[]>([]);

    // Variables to define the tightest bounding box of the non-empty ASCII characters.
    // Particles will move along the perimeter of this box.
    let minRow = Infinity, maxRow = -Infinity, minCol = Infinity, maxCol = -Infinity;
    // Dimensions of the overall grid (max width of any line, and total number of lines).
    let gridWidth = 0;
    let gridHeight = 0;

    // onMount is a SolidJS lifecycle hook that runs once after the component is first mounted.
    onMount(() => {
        // 1. Parse the input ASCII string into a 2D grid and determine its dimensions.
        const lines = ascii.trim().split('\n'); // Trim whitespace and split into lines
        gridHeight = lines.length; // Number of rows
        // Determine the maximum line length to ensure a uniform grid width
        gridWidth = Math.max(...lines.map(line => line.length));

        // Create the original ASCII grid, padding shorter lines with spaces to match gridWidth.
        originalAsciiGrid = lines.map(line => {
            const paddedLine = line.padEnd(gridWidth, ' ');
            return paddedLine.split('');
        });

        // Calculate the bounding box (min/max row/col) of the actual non-empty characters.
        for (let r = 0; r < gridHeight; r++) {
            for (let c = 0; c < gridWidth; c++) {
                if (originalAsciiGrid[r][c] !== ' ') {
                    minRow = Math.min(minRow, r);
                    maxRow = Math.max(maxRow, r);
                    minCol = Math.min(minCol, c);
                    maxCol = Math.max(maxCol, c);
                }
            }
        }

        // If no non-empty characters are found (e.g., empty ascii string),
        // default boundaries to the full grid dimensions.
        if (minRow === Infinity) {
            minRow = 0; maxRow = gridHeight - 1;
            minCol = 0; maxCol = gridWidth - 1;
        }

        // 2. Initialize particles: find valid starting positions and apply separation rules.
        const initialParticles: Particle[] = [];
        const availablePositions: { row: number, col: number }[] = [];

        // Collect all possible starting positions (all cells within the bounding box, including empty ones).
        for (let r = minRow; r <= maxRow; r++) {
            for (let c = minCol; c <= maxCol; c++) {
                // All cells within the calculated bounding box are now valid starting positions.
                availablePositions.push({ row: r, col: c });
            }
        }

        // Shuffle the collected positions to randomize particle starting points.
        for (let i = availablePositions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availablePositions[i], availablePositions[j]] = [availablePositions[j], availablePositions[i]];
        }

        let particleId = 0;
        let symbolIndex = 0;
        let colorIndex = 0;

        // Create particles up to the requested 'particles' count, using available positions.
        while (initialParticles.length < particles && availablePositions.length > 0) {
            const startPos = availablePositions.shift(); // Take the next random available position

            if (startPos) {
                initialParticles.push({
                    id: particleId,
                    symbol: symbols[symbolIndex % symbols.length], // Cycle through symbols
                    color: colors[colorIndex % colors.length],   // Cycle through colors
                    row: startPos.row,
                    col: startPos.col,
                    mode: 'perimeter', // Start all particles in perimeter mode
                    pathIndex: 0, // Start all particles moving Right initially
                    internalStepsRemaining: 0, // Not applicable initially
                    lastDx: 0, // Not applicable initially for internal mode
                    lastDy: 0, // Not applicable initially for internal mode
                    currentDx: 0, // Initialize current direction
                    currentDy: 0, // Initialize current direction
                    consecutiveMovesInSameDirection: 0, // Initialize consecutive moves counter
                    // Initialize lastMoveTime with an offset for staggered start.
                    // Particle 0 starts at t=0, Particle 1 at t=500ms, Particle 2 at t=1000ms, etc.
                    lastMoveTime: particleId * 700,
                });

                // Crucial step: Remove positions too close to the newly placed particle.
                // This ensures the "minimum of 3 rows and 3 columns" separation.
                // Filtering in reverse prevents issues with shifting indices after splice.
                for (let i = availablePositions.length - 1; i >= 0; i--) {
                    const pos = availablePositions[i];
                    if (Math.abs(pos.row - startPos.row) < 3 && Math.abs(pos.col - startPos.col) < 3) {
                        availablePositions.splice(i, 1);
                    }
                }
                particleId++;
                symbolIndex++;
                colorIndex++;
            }
        }

        // Set the initial particle state and display grid.
        setParticleState(initialParticles);
        // Create a deep copy of the original grid to start the display.
        const initialDisplayGrid = originalAsciiGrid.map(row => [...row]);
        setAsciiGrid(initialDisplayGrid);
    });

    // createEffect runs whenever its dependencies (signals) change.
    // Here, it's used to manage the animation loop.
    createEffect(() => {
        // Only start animation if particles have been initialized.
        if (particleState().length === 0) return;

        let animationFrameId: number; // ID for the requestAnimationFrame call
        const movementInterval = 1000; // Each particle moves every 1000ms (1 second)

        // The main animation function called by requestAnimationFrame
        const animate = (currentTime: DOMHighResTimeStamp) => {
            setAsciiGrid(prevGrid => {
                // Create a deep mutable copy of the current grid to prepare the next frame.
                const nextGrid = prevGrid.map(row => [...row]);

                // Step 1: Restore original characters at the particles' *previous* positions.
                particleState().forEach(p => {
                    // Ensure the particle's previous position is within the grid bounds before restoring.
                    if (p.row >= 0 && p.row < gridHeight && p.col >= 0 && p.col < gridWidth) {
                        nextGrid[p.row][p.col] = originalAsciiGrid[p.row][p.col];
                    }
                });

                // Step 2: Calculate new positions for all particles that are due to move.
                const updatedParticles = particleState().map(p => {
                    let currentParticle = { ...p }; // Create a mutable copy for this particle's update

                    if (currentTime - currentParticle.lastMoveTime >= movementInterval) {
                        let newRow = currentParticle.row;
                        let newCol = currentParticle.col;
                        let dx = 0;
                        let dy = 0;
                        let newConsecutiveMoves = currentParticle.consecutiveMovesInSameDirection;

                        if (currentParticle.mode === 'perimeter') {
                            // --- PERIMETER MOVEMENT LOGIC ---
                            switch (currentParticle.pathIndex) {
                                case 0: dx = 1; break; // Moving Right
                                case 1: dy = 1; break; // Moving Down
                                case 2: dx = -1; break; // Moving Left
                                case 3: dy = -1; break; // Moving Up
                            }

                            const potentialNewCol = currentParticle.col + dx;
                            const potentialNewRow = currentParticle.row + dy;

                            let turnNeeded = false;
                            if (currentParticle.pathIndex === 0 && potentialNewCol > maxCol) { turnNeeded = true; }
                            else if (currentParticle.pathIndex === 1 && potentialNewRow > maxRow) { turnNeeded = true; }
                            else if (currentParticle.pathIndex === 2 && potentialNewCol < minCol) { turnNeeded = true; }
                            else if (currentParticle.pathIndex === 3 && potentialNewRow < minRow) { turnNeeded = true; }

                            // Check for consecutive moves rule: if it's not a turn already and
                            // this move would exceed 3 consecutive moves in the same direction.
                            if (!turnNeeded &&
                                currentParticle.currentDx === dx && currentParticle.currentDy === dy &&
                                currentParticle.consecutiveMovesInSameDirection >= 3) {
                                turnNeeded = true; // Force a turn
                            }

                            if (turnNeeded) {
                                currentParticle.pathIndex = (currentParticle.pathIndex + 1) % 4;
                                newConsecutiveMoves = 0; // Reset consecutive moves on a turn

                                // Snap to corner first before moving in new direction
                                if (currentParticle.pathIndex === 1) { // Just turned from Right to Down
                                    newCol = maxCol;
                                } else if (currentParticle.pathIndex === 2) { // Just turned from Down to Left
                                    newRow = maxRow;
                                } else if (currentParticle.pathIndex === 3) { // Just turned from Left to Up
                                    newCol = minCol;
                                } else if (currentParticle.pathIndex === 0) { // Just turned from Up to Right
                                    newRow = minRow;
                                }

                                // Immediately take one step in the *new* direction
                                switch (currentParticle.pathIndex) {
                                    case 0: dx = 1; dy = 0; break;
                                    case 1: dx = 0; dy = 1; break;
                                    case 2: dx = -1; dy = 0; break;
                                    case 3: dx = 0; dy = -1; break;
                                }
                                newCol += dx;
                                newRow += dy;

                                // Chance to switch to internal mode after a turn (simulates completing a perimeter segment)
                                if (Math.random() < 0.25) { // 25% chance to go internal on a corner
                                    currentParticle.mode = 'internal';
                                    currentParticle.internalStepsRemaining = Math.floor(Math.random() * 5) + 3; // 3-7 random steps
                                    currentParticle.lastDx = 0; // Reset last direction for internal mode
                                    currentParticle.lastDy = 0;
                                }

                            } else {
                                // If no turn is needed, continue in the current perimeter direction.
                                newCol = potentialNewCol;
                                newRow = potentialNewRow;
                                newConsecutiveMoves++; // Increment if still moving in the same direction
                            }

                            currentParticle.currentDx = dx;
                            currentParticle.currentDy = dy;
                            currentParticle.consecutiveMovesInSameDirection = newConsecutiveMoves;


                        } else { // currentParticle.mode === 'internal'
                            // --- INTERNAL RANDOM MOVEMENT LOGIC ---
                            if (currentParticle.internalStepsRemaining > 0) {
                                let validMoveFound = false;
                                let attempts = 0;
                                // Possible directions: Right, Left, Down, Up
                                const directions = [{ dx: 1, dy: 0 }, { dx: -1, dy: 0 }, { dx: 0, dy: 1 }, { dx: 0, dy: -1 }];
                                // Shuffle directions for true randomness in choosing the next move
                                for (let i = directions.length - 1; i > 0; i--) {
                                    const j = Math.floor(Math.random() * (i + 1));
                                    [directions[i], directions[j]] = [directions[j], directions[i]];
                                }

                                // Try to find a valid random move
                                while (!validMoveFound && attempts < directions.length * 2) { // Allow a few attempts
                                    const dir = directions[attempts % directions.length];
                                    const nextRow = currentParticle.row + dir.dy;
                                    const nextCol = currentParticle.col + dir.dx;

                                    // Prevent immediate reversal (moving back to the cell it just came from)
                                    if (dir.dx === -currentParticle.lastDx && dir.dy === -currentParticle.lastDy && (currentParticle.lastDx !== 0 || currentParticle.lastDy !== 0)) {
                                        attempts++;
                                        continue;
                                    }

                                    // Prevent more than 3 consecutive moves in the same direction
                                    if (dir.dx === currentParticle.currentDx && dir.dy === currentParticle.currentDy && currentParticle.consecutiveMovesInSameDirection >= 3) {
                                        attempts++;
                                        continue;
                                    }

                                    // Check if the potential new position is within the ASCII art's bounding box
                                    if (nextRow >= minRow && nextRow <= maxRow &&
                                        nextCol >= minCol && nextCol <= maxCol) {
                                        dx = dir.dx;
                                        dy = dir.dy;
                                        validMoveFound = true;
                                        currentParticle.lastDx = dx; // Store current move as last move for next iteration
                                        currentParticle.lastDy = dy;
                                    }
                                    attempts++;
                                }

                                if (validMoveFound) {
                                    newRow = currentParticle.row + dy;
                                    newCol = currentParticle.col + dx;
                                    currentParticle.internalStepsRemaining--;

                                    // Update consecutive moves for internal mode
                                    if (dx === currentParticle.currentDx && dy === currentParticle.currentDy) {
                                        newConsecutiveMoves++;
                                    } else {
                                        newConsecutiveMoves = 1;
                                    }
                                    currentParticle.currentDx = dx;
                                    currentParticle.currentDy = dy;
                                    currentParticle.consecutiveMovesInSameDirection = newConsecutiveMoves;

                                } else {
                                    // If no valid random move can be found (e.g., boxed in), force transition back to perimeter
                                    currentParticle.internalStepsRemaining = 0;
                                }
                            }

                            // If internal steps are exhausted or particle got stuck, switch back to perimeter mode
                            if (currentParticle.internalStepsRemaining <= 0) {
                                currentParticle.mode = 'perimeter';
                                currentParticle.lastDx = 0; // Reset last internal direction
                                currentParticle.lastDy = 0;
                                currentParticle.currentDx = 0; // Reset current direction
                                currentParticle.currentDy = 0; // Reset current direction
                                currentParticle.consecutiveMovesInSameDirection = 0; // Reset consecutive moves

                                // Snap to nearest perimeter point and set its pathIndex
                                let closestPerimeterPoint = { row: minRow, col: minCol, pathIndex: 0 }; // Default to top-left, moving right
                                let minDist = Math.abs(currentParticle.row - minRow) + Math.abs(currentParticle.col - minCol);

                                // Check all 4 corners to find the closest point for snapping
                                const corners = [
                                    { row: minRow, col: minCol, pathIndex: 0 }, // Top-Left, starting Right
                                    { row: minRow, col: maxCol, pathIndex: 1 }, // Top-Right, starting Down
                                    { row: maxRow, col: maxCol, pathIndex: 2 }, // Bottom-Right, starting Left
                                    { row: maxRow, col: minCol, pathIndex: 3 }  // Bottom-Left, starting Up
                                ];

                                corners.forEach(corner => {
                                    const dist = Math.abs(currentParticle.row - corner.row) + Math.abs(currentParticle.col - corner.col);
                                    if (dist < minDist) {
                                        minDist = dist;
                                        closestPerimeterPoint = corner;
                                    }
                                });

                                newRow = closestPerimeterPoint.row;
                                newCol = closestPerimeterPoint.col;
                                currentParticle.pathIndex = closestPerimeterPoint.pathIndex;

                                // Take an immediate step in the new perimeter direction from the snapped point
                                switch (currentParticle.pathIndex) {
                                    case 0: dx = 1; dy = 0; break;
                                    case 1: dx = 0; dy = 1; break;
                                    case 2: dx = -1; dy = 0; break;
                                    case 3: dx = 0; dy = -1; break;
                                }
                                newRow += dy;
                                newCol += dx;

                                currentParticle.currentDx = dx; // Set initial direction after snapping to perimeter
                                currentParticle.currentDy = dy;
                                currentParticle.consecutiveMovesInSameDirection = 1; // Start counting from 1 for the first move on perimeter
                            }
                        }

                        // Ensure the new particle position always stays within the overall grid dimensions,
                        // this acts as a final safeguard against out-of-bounds errors.
                        newCol = Math.max(0, Math.min(newCol, gridWidth - 1));
                        newRow = Math.max(0, Math.min(newRow, gridHeight - 1));

                        // Update the particle's lastMoveTime only if it actually moved this frame.
                        return { ...currentParticle, row: newRow, col: newCol, lastMoveTime: currentTime };
                    } else {
                        // If the particle is not due to move yet, return its current state without changes.
                        return p;
                    }
                });

                // Update the signal holding all particle states for the next animation frame.
                setParticleState(updatedParticles);

                // Step 3: Plot the particles onto the `nextGrid` at their new positions.
                updatedParticles.forEach(p => {
                    // Ensure the particle's new position is within the grid bounds for display.
                    if (p.row >= 0 && p.row < gridHeight && p.col >= 0 && p.col < gridWidth) {
                        nextGrid[p.row][p.col] = p.symbol;
                    }
                });

                return nextGrid; // Return the fully updated grid for rendering.
            });
            // Request the next animation frame.
            animationFrameId = requestAnimationFrame(animate);
        };

        // Start the animation loop.
        animationFrameId = requestAnimationFrame(animate);

        // onCleanup runs when the component is unmounted, ensuring we stop the animation.
        onCleanup(() => {
            cancelAnimationFrame(animationFrameId);
        });
    });

    return (
        // Main container for the ASCII banner.
        // font-mono for monospaced font, text-xl for size, leading-none for tight line height.
        // white-space: pre-wrap preserves the original formatting of the ASCII string.
        <div class="font-mono text-sm leading-none text-gray-500 border border-gray-200 bg-gray-50 p-4 rounded-xl" style={{ 'white-space': 'pre-wrap' }}>
            {/* Render each row of the asciiGrid */}
            {asciiGrid().map((rowChars, rowIndex) => (
                // Each row is a flex container to keep characters horizontally aligned.
                // Explicit height helps control line spacing for consistent visual appearance.
                <div key={rowIndex} class="flex" style={{ height: '1.2em' }}>
                    {/* Render each character within the row */}
                    {rowChars.map((char, colIndex) => {
                        // Check if a particle is currently at this specific row/column.
                        const particle = particleState().find(p => p.row === rowIndex && p.col === colIndex);
                        // If a particle is found, apply its color; otherwise, no special style.
                        const style = particle ? { color: particle.color } : {};
                        return (
                            <span key={`${rowIndex}-${colIndex}`} style={style}>
                                {char}
                            </span>
                        );
                    })}
                </div>
            ))}
        </div>
    );
}
