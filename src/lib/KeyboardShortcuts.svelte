<script>
  import { shortcuts } from './utils'

  export let show = false

  function close() {
    show = false
  }

  function formatKey(shortcut) {
    return shortcut
      .replace('ctrl+', '⌘/Ctrl + ')
      .replace('shift+', '⇧ + ')
      .replace('arrowleft', '←')
      .replace('arrowright', '→')
      .toUpperCase()
  }
</script>

{#if show}
  <div class="modal-overlay" on:click={close}>
    <div class="modal" on:click|stopPropagation>
      <div class="modal-header">
        <h2>⌨️ Keyboard Shortcuts</h2>
        <button class="close-btn" on:click={close}>×</button>
      </div>

      <div class="modal-body">
        <div class="shortcuts-list">
          {#each Object.entries(shortcuts) as [key, description]}
            <div class="shortcut-row">
              <kbd class="shortcut-key">{formatKey(key)}</kbd>
              <span class="shortcut-description">{description}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="modal-footer">
        <button class="primary" on:click={close}>Got it!</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: #1a1a1a;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  .close-btn {
    background: none;
    border: none;
    font-size: 2rem;
    cursor: pointer;
    color: inherit;
    line-height: 1;
    padding: 0;
    width: 32px;
    height: 32px;
  }

  .modal-body {
    padding: 1.5rem;
  }

  .shortcuts-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .shortcut-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .shortcut-key {
    font-family: monospace;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    font-size: 0.9rem;
  }

  .shortcut-description {
    opacity: 0.8;
  }

  .modal-footer {
    display: flex;
    justify-content: center;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-footer button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    border: none;
  }

  .modal-footer button:hover {
    transform: translateY(-2px);
  }

  .primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
</style>
