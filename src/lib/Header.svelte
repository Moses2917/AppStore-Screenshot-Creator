<header>
  <div class="header-content">
    <div class="icon-wrapper">
      <span class="icon">📱</span>
    </div>
    <h1>App Store Screenshot Creator</h1>
    <p>Transform your iOS app screenshots into stunning, professional marketing images</p>
    <div class="feature-tags">
      <span class="tag">Easy to Use</span>
      <span class="tag">Professional Quality</span>
      <span class="tag">Instant Export</span>
    </div>
  </div>
</header>

<style>
  header {
    text-align: center;
    margin-bottom: 3rem;
    padding: 3rem 2rem 2rem;
    animation: fadeIn 0.6s ease;
  }

  .header-content {
    max-width: 800px;
    margin: 0 auto;
  }

  .icon-wrapper {
    display: inline-block;
    background: var(--primary-gradient);
    border-radius: 24px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
    box-shadow: var(--shadow-primary);
    animation: glow 3s ease-in-out infinite;
  }

  .icon {
    font-size: 3rem;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
  }

  h1 {
    font-size: 3rem;
    margin-bottom: 1rem;
    background: linear-gradient(135deg, #00d4ff 0%, #0099ff 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
    letter-spacing: -0.02em;
    line-height: 1.1;
  }

  p {
    font-size: 1.25rem;
    opacity: 0.85;
    line-height: 1.6;
    margin-bottom: 1.5rem;
    font-weight: 400;
  }

  .feature-tags {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .tag {
    display: inline-block;
    padding: 0.5rem 1rem;
    background: var(--glass-bg);
    backdrop-filter: blur(10px);
    border: 1px solid var(--glass-border);
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    opacity: 0.9;
    transition: all var(--transition-normal);
  }

  .tag:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-primary);
    opacity: 1;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 8px 24px rgba(0, 153, 255, 0.35);
    }
    50% {
      box-shadow: 0 12px 36px rgba(0, 212, 255, 0.5);
    }
  }

  @media (max-width: 768px) {
    header {
      padding: 2rem 1rem 1rem;
    }

    .icon-wrapper {
      padding: 0.75rem 1.25rem;
      margin-bottom: 1rem;
    }

    .icon {
      font-size: 2.5rem;
    }

    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 1rem;
    }

    .tag {
      font-size: 0.75rem;
      padding: 0.4rem 0.8rem;
    }
  }
</style>
