declare module 'mermaid' {
  export interface MermaidRenderResult {
    svg: string;
  }

  export interface MermaidConfig {
    startOnLoad?: boolean;
    theme?: 'dark' | 'default' | string;
    [key: string]: unknown;
  }

  // Mermaid's runtime API is JS; we keep types minimal to satisfy strict TS.
  export function initialize(config?: MermaidConfig): void;
  export function render(id: string, code: string): MermaidRenderResult;

  const mermaid: {
    initialize: typeof initialize;
    render: typeof render;
  };

  export default mermaid;
}

