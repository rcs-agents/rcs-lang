// Type declaration for web-diagram.js

export class RCLWebDiagram {
  constructor(containerId: string, config?: any);
  initialize(): void;
  updateModel(data: any): void;
  dispose(): void;
  zoomToFit(): void;
}