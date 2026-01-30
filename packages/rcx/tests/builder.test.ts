import { describe, expect, it } from 'bun:test'
import { RCXBuilder } from '../src/builder'
import type { ReactFlowDiagramData } from '../src/diagram'

describe('RCXBuilder', () => {
  it('should build a simple bundle from diagram data', () => {
    const builder = new RCXBuilder({
      name: 'Test Agent',
      bundleId: 'test-bundle-123',
    })

    const diagramData: ReactFlowDiagramData = {
      nodes: [
        {
          id: 'node_1',
          type: 'start',
          position: { x: 0, y: 0 },
          data: {
            label: 'Start',
          },
        },
        {
          id: 'node_2',
          type: 'textMessage',
          position: { x: 100, y: 0 },
          data: {
            label: 'Welcome Message',
            text: 'Hello, world!',
          },
        },
      ],
      edges: [
        {
          id: 'edge_1',
          source: 'node_1',
          target: 'node_2',
          type: 'transition',
        },
      ],
    }

    const result = builder.buildBundle(diagramData)

    expect(result.success).toBe(true)
    expect(result.bundle).toBeDefined()
    expect(result.bundle?.manifest.bundleId).toBe('test-bundle-123')
    expect(result.bundle?.agent.displayName).toBe('Test Agent')
    expect(result.bundle?.diagram.nodes.length).toBe(2)
    // node_2 is a message node, so it should be in messages collection
    expect(Object.keys(result.bundle?.messages.messages || {}).length).toBe(1)
  })

  it('should validate empty diagram', () => {
    const builder = new RCXBuilder()
    const result = builder.buildBundle({ nodes: [], edges: [] })

    expect(result.success).toBe(false)
    expect(result.error).toContain('No nodes found')
  })
})
