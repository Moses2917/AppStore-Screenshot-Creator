<script>
  import { createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()
  let isDragging = false
  let fileInput

  function handleDragOver(event) {
    event.preventDefault()
    isDragging = true
  }

  function handleDragLeave() {
    isDragging = false
  }

  function handleDrop(event) {
    event.preventDefault()
    isDragging = false

    const files = Array.from(event.dataTransfer.files).filter(file =>
      file.type.startsWith('image/')
    )

    if (files.length > 0) {
      handleFiles(files)
    }
  }

  function handleFileInput(event) {
    const files = Array.from(event.target.files)
    handleFiles(files)
  }

  function handleFiles(files) {
    const readers = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsDataURL(file)
      })
    })

    Promise.all(readers).then(images => {
      dispatch('upload', { images })
    })
  }

  function openFileDialog() {
    fileInput.click()
  }
</script>

<div
  class="upload-zone"
  class:dragging={isDragging}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={openFileDialog}
  role="button"
  tabindex="0"
>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    on:change={handleFileInput}
  />

  <div class="upload-content">
    <svg class="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>

    <h3>
      {#if isDragging}
        Drop your images here
      {:else}
        Drag & drop screenshots here
      {/if}
    </h3>
    <p>or click to browse</p>
    <span class="file-types">Supports: PNG, JPG, JPEG</span>
  </div>
</div>

<style>
  .upload-zone {
    border: 2px dashed rgba(255, 255, 255, 0.3);
    border-radius: 12px;
    padding: 3rem;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.02);
  }

  .upload-zone:hover,
  .upload-zone.dragging {
    border-color: #00d4ff;
    background: rgba(0, 153, 255, 0.1);
    transform: translateY(-2px);
  }

  .upload-zone input {
    display: none;
  }

  .upload-content {
    pointer-events: none;
  }

  .upload-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 1rem;
    opacity: 0.7;
  }

  .upload-zone.dragging .upload-icon {
    opacity: 1;
    transform: scale(1.1);
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  p {
    opacity: 0.7;
    margin-bottom: 0.5rem;
  }

  .file-types {
    display: inline-block;
    font-size: 0.85rem;
    padding: 0.25rem 0.75rem;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    opacity: 0.6;
  }
</style>
