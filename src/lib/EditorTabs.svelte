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
  }

  .tabs-header {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tab-button {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    background: transparent;
    border: 2px solid transparent;
    border-radius: 10px;
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .tab-button:hover {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.9);
    transform: translateY(-2px);
  }

  .tab-button.active {
    background: linear-gradient(135deg, rgba(0, 212, 255, 0.2) 0%, rgba(0, 153, 255, 0.2) 100%);
    border-color: #00d4ff;
    color: #00d4ff;
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.3);
  }

  .tab-icon {
    font-size: 1.5rem;
    line-height: 1;
  }

  .tab-label {
    font-size: 0.65rem;
  }

  .tabs-content {
    flex: 1;
    overflow-y: auto;
    padding-right: 0.5rem;
  }

  .tabs-content::-webkit-scrollbar {
    width: 6px;
  }

  .tabs-content::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }

  .tabs-content::-webkit-scrollbar-thumb {
    background: rgba(0, 212, 255, 0.3);
    border-radius: 3px;
  }

  .tabs-content::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 212, 255, 0.5);
  }
</style>
