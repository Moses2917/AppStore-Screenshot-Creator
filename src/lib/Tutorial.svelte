<script>
  import { showTutorial } from './stores'

  let currentStep = 0

  const steps = [
    {
      title: 'Welcome!',
      content: 'Create beautiful App Store screenshots in minutes. Let\'s get started!'
    },
    {
      title: 'Upload Screenshots',
      content: 'Drag and drop your screenshots or click to browse. You can upload multiple at once!'
    },
    {
      title: 'Choose Templates',
      content: 'Pick from pre-designed templates or customize every aspect of your screenshot.'
    },
    {
      title: 'Customize',
      content: 'Add text, choose device frames, adjust colors, and apply filters to make your screenshots stand out.'
    },
    {
      title: 'Export',
      content: 'Export individual screenshots or batch export all at once in various formats and sizes.'
    },
    {
      title: 'Keyboard Shortcuts',
      content: 'Press ? anytime to see all available keyboard shortcuts for faster workflow.'
    }
  ]

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++
    } else {
      completeTutorial()
    }
  }

  function skipTutorial() {
    completeTutorial()
  }

  function completeTutorial() {
    localStorage.setItem('tutorialCompleted', 'true')
    showTutorial.set(false)
  }
</script>

{#if $showTutorial}
  <div class="tutorial-overlay">
    <div class="tutorial-modal">
      <div class="tutorial-header">
        <h2>{steps[currentStep].title}</h2>
        <button class="close-btn" on:click={skipTutorial}>×</button>
      </div>

      <div class="tutorial-body">
        <p>{steps[currentStep].content}</p>

        <div class="tutorial-progress">
          {#each steps as _, index}
            <div class="progress-dot" class:active={index === currentStep} />
          {/each}
        </div>
      </div>

      <div class="tutorial-footer">
        <button class="secondary" on:click={skipTutorial}>Skip</button>
        <button class="primary" on:click={nextStep}>
          {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
        </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .tutorial-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    padding: 1rem;
  }

  .tutorial-modal {
    background: #1a1a1a;
    border-radius: 12px;
    max-width: 500px;
    width: 100%;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tutorial-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tutorial-header h2 {
    margin: 0;
    font-size: 1.8rem;
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

  .tutorial-body {
    padding: 2rem 1.5rem;
  }

  .tutorial-body p {
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2rem;
    opacity: 0.9;
  }

  .tutorial-progress {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }

  .progress-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transition: all 0.3s;
  }

  .progress-dot.active {
    background: #667eea;
    transform: scale(1.3);
  }

  .tutorial-footer {
    display: flex;
    justify-content: space-between;
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .tutorial-footer button {
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: transform 0.2s;
    border: none;
  }

  .tutorial-footer button:hover {
    transform: translateY(-2px);
  }

  .primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .secondary {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: inherit;
  }
</style>
