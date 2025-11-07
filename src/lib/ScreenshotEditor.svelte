<script>
  import { onMount } from 'svelte'
  import html2canvas from 'html2canvas'

  let uploadedImage = null
  let imagePreview = null
  let backgroundColor = '#f5f5f7'
  let deviceFrame = 'iphone'
  let textTop = ''
  let textBottom = ''
  let textColor = '#000000'
  let showDevice = true
  let canvasRef = null

  const deviceFrames = {
    iphone: {
      width: 390,
      height: 844,
      radius: 47
    },
    ipad: {
      width: 820,
      height: 1180,
      radius: 18
    },
    none: {
      width: 0,
      height: 0,
      radius: 0
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        imagePreview = e.target.result
        uploadedImage = e.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  async function downloadScreenshot() {
    if (!canvasRef) return

    try {
      const canvas = await html2canvas(canvasRef, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true
      })

      const link = document.createElement('a')
      link.download = `screenshot-${Date.now()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } catch (error) {
      console.error('Error generating screenshot:', error)
      alert('Error generating screenshot. Please try again.')
    }
  }

  function resetEditor() {
    uploadedImage = null
    imagePreview = null
    textTop = ''
    textBottom = ''
    backgroundColor = '#f5f5f7'
    deviceFrame = 'iphone'
    textColor = '#000000'
  }
</script>

<div class="editor-container">
  <div class="controls">
    <div class="control-group">
      <label for="image-upload">
        <span class="upload-btn">Choose Screenshot</span>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          on:change={handleImageUpload}
        />
      </label>
    </div>

    {#if uploadedImage}
      <div class="control-group">
        <label for="device-frame">Device Frame</label>
        <select id="device-frame" bind:value={deviceFrame}>
          <option value="iphone">iPhone</option>
          <option value="ipad">iPad</option>
          <option value="none">No Frame</option>
        </select>
      </div>

      <div class="control-group">
        <label for="bg-color">Background Color</label>
        <input id="bg-color" type="color" bind:value={backgroundColor} />
      </div>

      <div class="control-group">
        <label for="text-top">Top Text</label>
        <input id="text-top" type="text" bind:value={textTop} placeholder="Enter top text" />
      </div>

      <div class="control-group">
        <label for="text-bottom">Bottom Text</label>
        <input id="text-bottom" type="text" bind:value={textBottom} placeholder="Enter bottom text" />
      </div>

      <div class="control-group">
        <label for="text-color">Text Color</label>
        <input id="text-color" type="color" bind:value={textColor} />
      </div>

      <div class="action-buttons">
        <button on:click={downloadScreenshot} class="primary">Download Screenshot</button>
        <button on:click={resetEditor} class="secondary">Reset</button>
      </div>
    {/if}
  </div>

  <div class="preview">
    {#if uploadedImage}
      <div class="canvas-container" bind:this={canvasRef} style="background-color: {backgroundColor}">
        {#if textTop}
          <h2 class="text-overlay top" style="color: {textColor}">{textTop}</h2>
        {/if}

        <div class="device-wrapper">
          {#if deviceFrame !== 'none'}
            <div
              class="device-frame {deviceFrame}"
              style="border-radius: {deviceFrames[deviceFrame].radius}px"
            >
              <img src={imagePreview} alt="Screenshot preview" />
            </div>
          {:else}
            <img src={imagePreview} alt="Screenshot preview" class="no-frame" />
          {/if}
        </div>

        {#if textBottom}
          <h2 class="text-overlay bottom" style="color: {textColor}">{textBottom}</h2>
        {/if}
      </div>
    {:else}
      <div class="empty-state">
        <p>Upload a screenshot to get started</p>
      </div>
    {/if}
  </div>
</div>

<style>
  .editor-container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    align-items: start;
  }

  .controls {
    background: rgba(255, 255, 255, 0.05);
    padding: 1.5rem;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .control-group {
    margin-bottom: 1.5rem;
  }

  .control-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
  }

  .control-group input[type="text"],
  .control-group select {
    width: 100%;
    padding: 0.5rem;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.2);
    color: inherit;
    font-size: 1rem;
  }

  .control-group input[type="color"] {
    width: 100%;
    height: 40px;
    border-radius: 6px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    cursor: pointer;
  }

  input[type="file"] {
    display: none;
  }

  .upload-btn {
    display: block;
    width: 100%;
    padding: 0.8rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 8px;
    cursor: pointer;
    text-align: center;
    font-weight: 500;
    transition: transform 0.2s;
  }

  .upload-btn:hover {
    transform: translateY(-2px);
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 2rem;
  }

  .action-buttons button {
    width: 100%;
    padding: 0.8rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .action-buttons button:hover {
    transform: translateY(-2px);
  }

  .action-buttons .primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
  }

  .action-buttons .secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .preview {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 600px;
  }

  .canvas-container {
    padding: 3rem;
    border-radius: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2rem;
    min-width: 600px;
  }

  .text-overlay {
    font-size: 2rem;
    font-weight: bold;
    text-align: center;
    margin: 0;
  }

  .device-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .device-frame {
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    background: #000;
  }

  .device-frame.iphone {
    width: 390px;
    height: 844px;
  }

  .device-frame.ipad {
    width: 600px;
    height: 800px;
  }

  .device-frame img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .no-frame {
    max-width: 100%;
    max-height: 800px;
    border-radius: 8px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  }

  .empty-state {
    text-align: center;
    padding: 4rem;
    opacity: 0.5;
  }

  .empty-state p {
    font-size: 1.2rem;
  }

  @media (max-width: 968px) {
    .editor-container {
      grid-template-columns: 1fr;
    }

    .controls {
      order: 2;
    }

    .preview {
      order: 1;
    }
  }
</style>
