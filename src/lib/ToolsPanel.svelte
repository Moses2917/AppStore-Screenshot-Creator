<script>
  import { activeTool, layerActions, Tool } from './layerStore'

  const tools = [
    { id: Tool.SELECT, icon: '↖️', name: 'Select', shortcut: 'V' },
    { id: Tool.MOVE, icon: '✋', name: 'Move', shortcut: 'M' },
    { id: Tool.TRANSFORM, icon: '↔️', name: 'Transform', shortcut: 'T' },
    { id: Tool.CROP, icon: '✂️', name: 'Crop', shortcut: 'C' },
    { id: Tool.TEXT, icon: 'T', name: 'Text', shortcut: 'T' },
    { id: Tool.SHAPE, icon: '□', name: 'Shape', shortcut: 'U' },
    { id: Tool.ZOOM, icon: '🔍', name: 'Zoom', shortcut: 'Z' },
    { id: Tool.PAN, icon: '🤚', name: 'Pan', shortcut: 'H' }
  ]

  function selectTool(toolId) {
    layerActions.setActiveTool(toolId)
  }
</script>

<div class="tools-panel">
  <div class="panel-header">
    <h3>Tools</h3>
  </div>

  <div class="tools-grid">
    {#each tools as tool}
      <button
        class="tool-btn"
        class:active={$activeTool === tool.id}
        on:click={() => selectTool(tool.id)}
        title="{tool.name} ({tool.shortcut})"
      >
        <span class="tool-icon">{tool.icon}</span>
        <span class="tool-name">{tool.name}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .tools-panel {
    display: flex;
    flex-direction: column;
    background: rgba(20, 20, 30, 0.95);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
  }

  .panel-header {
    padding: 1rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .panel-header h3 {
    margin: 0;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 1px;
    opacity: 0.9;
  }

  .tools-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
    padding: 1rem;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 8px;
    color: inherit;
    cursor: pointer;
    transition: all 0.2s;
  }

  .tool-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(0, 153, 255, 0.3);
  }

  .tool-btn.active {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
  }

  .tool-icon {
    font-size: 1.5rem;
  }

  .tool-name {
    font-size: 0.75rem;
    font-weight: 600;
  }
</style>
