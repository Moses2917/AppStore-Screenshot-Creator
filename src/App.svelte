<script>
  import { theme } from './lib/stores'
  import LayerEditor from './lib/LayerEditor.svelte'
  import ScreenshotEditor from './lib/ScreenshotEditor.svelte'
  import ThemeToggle from './lib/ThemeToggle.svelte'

  let useLayerEditor = true // Toggle between old and new editor
</script>

<div class="app" class:light={$theme === 'light'}>
  <!-- Theme Toggle moved to bottom right -->
  <div class="theme-toggle-wrapper">
    <ThemeToggle />
  </div>

  <!-- Editor Mode Toggle -->
  <div class="mode-toggle">
    <button
      class="mode-btn"
      class:active={!useLayerEditor}
      on:click={() => useLayerEditor = false}
    >
      Classic Editor
    </button>
    <button
      class="mode-btn"
      class:active={useLayerEditor}
      on:click={() => useLayerEditor = true}
    >
      Layer Editor (New!)
    </button>
  </div>

  {#if useLayerEditor}
    <LayerEditor />
  {:else}
    <main>
      <ScreenshotEditor />
    </main>
  {/if}
</div>

<style>
  .app {
    min-height: 100vh;
    transition: background-color 0.3s, color 0.3s;
    position: relative;
  }

  .theme-toggle-wrapper {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    z-index: 9999;
  }

  .mode-toggle {
    position: absolute;
    top: 1rem;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 0.5rem;
    background: rgba(0, 0, 0, 0.5);
    padding: 0.5rem;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    z-index: 1000;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .mode-btn {
    padding: 0.5rem 1rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid transparent;
    border-radius: 8px;
    color: #fff;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .mode-btn:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .mode-btn.active {
    background: linear-gradient(135deg, #0099ff, #0066cc);
    border-color: #0099ff;
  }

  main {
    max-width: 1400px;
    margin: 0 auto;
    padding: 2rem;
  }
</style>
