<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let show = true

  const appStoreSizes = [
    {
      name: '6.9" Display',
      device: 'iPhone 16 Pro Max',
      width: 1320,
      height: 2868,
      recommended: true
    },
    {
      name: '6.7" Display',
      device: 'iPhone 15 Pro Max',
      width: 1290,
      height: 2796,
      recommended: false
    },
    {
      name: '6.5" Display',
      device: 'iPhone 14 Plus',
      width: 1284,
      height: 2778,
      recommended: false
    },
    {
      name: '6.1" Display',
      device: 'iPhone 15 Pro',
      width: 1179,
      height: 2556,
      recommended: false
    },
    {
      name: '5.5" Display',
      device: 'iPhone 8 Plus',
      width: 1242,
      height: 2208,
      recommended: false
    },
    {
      name: '12.9" iPad Pro',
      device: 'iPad Pro 12.9"',
      width: 2048,
      height: 2732,
      recommended: false
    },
    {
      name: '11" iPad Pro',
      device: 'iPad Pro 11"',
      width: 1668,
      height: 2388,
      recommended: false
    }
  ]

  let selectedSize = appStoreSizes[0]

  function handleSelect() {
    dispatch('select', selectedSize)
    show = false
  }
</script>

{#if show}
  <div class="modal-overlay">
    <div class="modal">
      <div class="modal-header">
        <h2>🍎 App Store Screenshot Size</h2>
        <p>Select the display size for your App Store screenshots</p>
      </div>

      <div class="size-grid">
        {#each appStoreSizes as size}
          <button
            class="size-card"
            class:selected={selectedSize === size}
            class:recommended={size.recommended}
            on:click={() => selectedSize = size}
          >
            {#if size.recommended}
              <div class="badge">Recommended</div>
            {/if}
            <div class="size-name">{size.name}</div>
            <div class="device-name">{size.device}</div>
            <div class="dimensions">{size.width} × {size.height}</div>
          </button>
        {/each}
      </div>

      <div class="modal-footer">
        <button class="btn-primary" on:click={handleSelect}>
          Create Project
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  .modal {
    background: linear-gradient(135deg, rgba(30, 30, 50, 0.98), rgba(20, 20, 40, 0.98));
    border-radius: 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
    max-width: 900px;
    width: 90%;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(30px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .modal-header {
    padding: 2.5rem 2.5rem 1.5rem;
    text-align: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .modal-header h2 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    background: linear-gradient(135deg, #00d4ff, #0099ff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .modal-header p {
    margin: 0;
    opacity: 0.7;
    font-size: 1rem;
  }

  .size-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
    padding: 2rem;
  }

  .size-card {
    position: relative;
    padding: 1.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: center;
  }

  .size-card:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(0, 153, 255, 0.4);
    transform: translateY(-2px);
  }

  .size-card.selected {
    background: rgba(0, 153, 255, 0.2);
    border-color: #0099ff;
    box-shadow: 0 0 20px rgba(0, 153, 255, 0.3);
  }

  .size-card.recommended {
    border-color: rgba(0, 212, 255, 0.5);
  }

  .badge {
    position: absolute;
    top: -10px;
    right: 10px;
    background: linear-gradient(135deg, #00ff88, #00cc66);
    color: #000;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .size-name {
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: #fff;
  }

  .device-name {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-bottom: 0.75rem;
  }

  .dimensions {
    font-size: 0.85rem;
    font-family: 'Courier New', monospace;
    opacity: 0.6;
    padding: 0.5rem;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 6px;
  }

  .modal-footer {
    padding: 1.5rem 2.5rem 2.5rem;
    text-align: center;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .btn-primary {
    padding: 1rem 3rem;
    background: linear-gradient(135deg, #0099ff, #0066cc);
    border: none;
    border-radius: 12px;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s;
    box-shadow: 0 4px 15px rgba(0, 153, 255, 0.3);
  }

  .btn-primary:hover {
    background: linear-gradient(135deg, #00bbff, #0088ee);
    box-shadow: 0 6px 25px rgba(0, 153, 255, 0.5);
    transform: translateY(-2px);
  }

  .btn-primary:active {
    transform: translateY(0);
  }
</style>
