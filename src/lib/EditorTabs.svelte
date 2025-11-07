<script>
  export let activeTab = 'design'

  const tabs = [
    { id: 'design', label: 'Design', icon: '🎨' },
    { id: 'text', label: 'Text', icon: '📝' },
    { id: 'effects', label: 'Effects', icon: '✨' },
    { id: 'decorations', label: 'Decor', icon: '🖼️' },
    { id: 'projects', label: 'Projects', icon: '💾' }
  ]

  function selectTab(tabId) {
    activeTab = tabId
  }
</script>

<div class="tabs-container">
  <div class="tabs-header">
    {#each tabs as tab}
      <button
        class="tab-button"
        class:active={activeTab === tab.id}
        on:click={() => selectTab(tab.id)}
      >
        <span class="tab-icon">{tab.icon}</span>
        <span class="tab-label">{tab.label}</span>
      </button>
    {/each}
  </div>

  <div class="tabs-content">
    <slot />
  </div>
</div>

<style>
  .tabs-container {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
  }

  .tabs-header {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 0;
    padding: 0;
    background: transparent;
    flex-shrink: 0;
    border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  }

  .tab-button {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.25rem;
    background: rgba(0, 0, 0, 0.2);
    border: none;
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.85rem;
    font-weight: 600;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
  }

  .tab-button:hover:not(.active) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }

  .tab-button.active {
    background: var(--glass-bg);
    backdrop-filter: blur(20px);
    color: #00d4ff;
    border-bottom: 2px solid #00d4ff;
    box-shadow: 0 -2px 8px rgba(0, 212, 255, 0.2);
  }

  .tab-button.active::before {
    content: '';
    position: absolute;
    bottom: -2px;
    left: 0;
    right: 0;
    height: 2px;
    background: #00d4ff;
    box-shadow: 0 0 10px rgba(0, 212, 255, 0.6);
  }

  .tab-icon {
    font-size: 1.2rem;
    line-height: 1;
  }

  .tab-label {
    font-size: 0.85rem;
    white-space: nowrap;
  }

  .tabs-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 1.5rem 0.5rem 0 0;
    min-height: 0;
  }

  .tabs-content::-webkit-scrollbar {
    width: 8px;
  }

  .tabs-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 4px;
  }

  .tabs-content::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 4px;
    border: 2px solid transparent;
    background-clip: padding-box;
  }

  .tabs-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.5);
    background-clip: padding-box;
  }
</style>
