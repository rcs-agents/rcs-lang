# Stack Decision for RCS Agent Studio

## Project Context
**What we're building**: RCS Agent Studio - a visual tool where non-technical people can design conversation flows to demonstrate the potential of the RCS platform.

## Project Goals
1. ✅ Easy-to-use DSL that generates RBM-compatible JSON and XState FSM code
2. 🎯 WYSIWYG diagram editor with extremely polished UX, connected to RCL code
3. 📁 Support for multi-file agents with imports
4. 🖼️ Media upload, gallery, and management with easy inclusion
5. 📝 Complete message configuration via forms with validation
6. 📱 Phone emulator connected to XState machine for testing
7. 📚 Agent Library with ready-to-use templates

## Target Users
- **Non-technical users** (marketers, product managers, business analysts)
- Need simplicity and guidance
- Focus on conversation design, not coding

## Stack Analysis

### Option 1: Full Eclipse Stack (Theia + GLSP + EMF.cloud + Sprotty)
**Pros:**
- Professional-grade diagramming with GLSP/Sprotty
- Proper model-view separation
- Built-in undo/redo, validation
- Extensible architecture

**Cons:**
- **Overwhelming for non-technical users**
- Complex setup and maintenance
- Theia includes many IDE features users don't need
- Steep learning curve

### Option 2: Custom Focused Solution (Current approach with improvements)
**Pros:**
- **Tailored exactly for RCS agent design**
- Simpler, cleaner interface
- Faster development iteration
- Full control over UX

**Cons:**
- Need to implement features ourselves
- Less "battle-tested"

### Option 3: Hybrid Approach (GLSP + Sprotty without Theia)
**Pros:**
- Professional diagramming without IDE complexity
- Can integrate into custom UI
- Benefits of GLSP architecture
- Still focused on core use case

**Cons:**
- Still adds complexity
- GLSP might be overkill for this use case

## Recommendation: Enhanced Custom Solution

### Why NOT the full Eclipse stack:
1. **User Experience**: Non-technical users need a **studio**, not an IDE. Theia would overwhelm them with:
   - File explorers
   - Terminal access
   - Complex menus
   - Developer-focused features

2. **Maintenance Overhead**: The full stack requires managing multiple services and dependencies

3. **Customization Effort**: Stripping down Theia to be user-friendly would take significant effort

### Recommended Architecture:

```
┌─────────────────────────────────────────┐
│         RCS Agent Studio UI             │
│  ┌──────────┬──────────┬────────────┐  │
│  │ Diagram  │  Forms   │  Emulator  │  │
│  │ Editor   │  Editor  │            │  │
│  └──────────┴──────────┴────────────┘  │
└─────────────────────────────────────────┘
              │            │
┌─────────────▼────────────▼──────────────┐
│         Core Services Layer             │
│  ┌──────────┬──────────┬────────────┐  │
│  │   RCL    │ Diagram  │   XState   │  │
│  │ Compiler │ Engine   │   Runner   │  │
│  └──────────┴──────────┴────────────┘  │
└─────────────────────────────────────────┘
```

### Technology Choices:

1. **Diagram Editor**: 
   - Use **Sprotty directly** (without GLSP) for diagram rendering
   - Custom diagram logic tailored for conversation flows
   - Focus on polish: smooth animations, intuitive interactions

2. **Code Editor**:
   - Keep Monaco but **hide it by default**
   - Show only when users want "advanced mode"
   - Auto-generate code from visual editing

3. **UI Framework**:
   - Continue with current web-based approach
   - Consider React/Vue for complex UI components
   - Focus on responsive, intuitive design

4. **Backend**:
   - Simple Node.js/Express API
   - File-based or simple database storage
   - Media upload service
   - XState execution service

### Implementation Priority:

1. **Fix current Sprotty integration** properly
2. **Build visual message editor** with JSON Forms
3. **Connect phone emulator** to XState
4. **Add media management**
5. **Create agent library/templates**
6. **Polish UX throughout**

### Key Design Principles:

1. **Hide Complexity**: Generate code behind the scenes
2. **Guide Users**: Wizards and templates for common patterns  
3. **Visual First**: Diagram is primary, code is secondary
4. **Immediate Feedback**: Live preview in emulator
5. **Professional Output**: Generate production-ready RBM JSON

## Conclusion

For a tool targeting non-technical users, the full Eclipse stack would be overkill and potentially harmful to the user experience. A custom-built studio with carefully selected components (Sprotty for diagrams, Monaco hidden for code, custom UI for everything else) will better serve the goal of making RCS agent design accessible to everyone.

The focus should be on creating a **design studio**, not a development environment.