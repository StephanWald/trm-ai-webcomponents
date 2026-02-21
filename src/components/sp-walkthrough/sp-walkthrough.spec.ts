import { newSpecPage } from '@stencil/core/testing';
import { SpWalkthrough } from './sp-walkthrough';
import { Scene } from './types/walkthrough.types';

describe('sp-walkthrough', () => {
  const sampleScenes: Scene[] = [
    { id: '1', title: 'Scene 1', timestamp: 0, highlightSelector: '#element1', description: 'First scene' },
    { id: '2', title: 'Scene 2', timestamp: 5, highlightSelector: '#element2', description: 'Second scene' },
    { id: '3', title: 'Scene 3', timestamp: 10, highlightSelector: '#element3' },
  ];

  describe('rendering', () => {
    it('does not render when not visible', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      expect(page.root).toBeTruthy();
      const panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeFalsy();
    });

    it('renders panel when visible', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeTruthy();
    });

    it('displays panel title', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const title = page.root?.shadowRoot?.querySelector('.panel-title');
      expect(title?.textContent).toContain('Walkthrough');
    });

    it('displays author mode title when in author mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const title = page.root?.shadowRoot?.querySelector('.panel-title');
      expect(title?.textContent).toContain('Author Mode');
    });

    it('renders close button', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const closeBtn = page.root?.shadowRoot?.querySelector('.close-btn');
      expect(closeBtn).toBeTruthy();
    });

    it('renders manual mode placeholder when no video source', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const placeholder = page.root?.shadowRoot?.querySelector('.manual-mode-placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.textContent).toContain('navigation');
    });

    it('renders video element for standard video source', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const video = page.root?.shadowRoot?.querySelector('.video-element');
      expect(video).toBeTruthy();
    });

    it('renders scene info when scene is active', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const sceneInfo = page.root?.shadowRoot?.querySelector('.scene-info');
      expect(sceneInfo).toBeTruthy();

      const sceneTitle = page.root?.shadowRoot?.querySelector('.scene-title');
      expect(sceneTitle?.textContent).toBe('Scene 1');
    });

    it('displays scene description when present', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const description = page.root?.shadowRoot?.querySelector('.scene-description');
      expect(description?.textContent).toBe('First scene');
    });

    it('renders controls bar', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const controlsBar = page.root?.shadowRoot?.querySelector('.controls-bar');
      expect(controlsBar).toBeTruthy();
    });

    it('renders previous and next buttons', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const buttons = page.root?.shadowRoot?.querySelectorAll('.control-btn');
      expect(buttons!.length).toBeGreaterThanOrEqual(2);
    });

    it('renders scene selector dropdown when scenes exist', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const selector = page.root?.shadowRoot?.querySelector('.scene-selector');
      expect(selector).toBeTruthy();

      const options = selector?.querySelectorAll('option');
      expect(options?.length).toBe(3);
    });

    it('renders scene counter', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const counter = page.root?.shadowRoot?.querySelector('.scene-counter');
      expect(counter?.textContent).toContain('1 / 3');
    });

    it('renders volume controls when video source exists', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const volumeControls = page.root?.shadowRoot?.querySelector('.volume-controls');
      expect(volumeControls).toBeTruthy();

      const volumeSlider = page.root?.shadowRoot?.querySelector('.volume-slider');
      expect(volumeSlider).toBeTruthy();
    });
  });

  describe('props', () => {
    it('accepts scenes prop', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.waitForChanges();

      expect(page.rootInstance.scenes.length).toBe(3);
    });

    it('accepts videoSrc prop', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      expect(page.rootInstance.videoSrc).toBe('/video.mp4');
    });

    it('accepts autoPlay prop', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough auto-play="true"></sp-walkthrough>',
      });

      expect(page.rootInstance.autoPlay).toBe(true);
    });

    it('accepts authorMode prop', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      expect(page.rootInstance.authorMode).toBe(true);
    });

    it('defaults autoPlay to false', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      expect(page.rootInstance.autoPlay).toBe(false);
    });

    it('defaults authorMode to false', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      expect(page.rootInstance.authorMode).toBe(false);
    });
  });

  describe('theme', () => {
    it('applies theme-light class when theme is light', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough theme="light"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.root).toHaveClass('theme-light');
    });

    it('applies theme-dark class when theme is dark', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough theme="dark"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.root).toHaveClass('theme-dark');
    });

    it('does not apply theme class when theme is auto', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.root).not.toHaveClass('theme-light');
      expect(page.root).not.toHaveClass('theme-dark');
    });

    it('applies author-mode class when authorMode is true', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.root).toHaveClass('author-mode');
    });
  });

  describe('public methods', () => {
    it('show() makes component visible and emits event', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughShown', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.rootInstance['isVisible']).toBe(true);
      expect(eventSpy).toHaveBeenCalled();

      const panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeTruthy();
    });

    it('hide() makes component invisible and emits event', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughHidden', eventSpy);

      await page.rootInstance.show();
      await page.rootInstance.hide();
      await page.waitForChanges();

      expect(page.rootInstance['isVisible']).toBe(false);
      expect(eventSpy).toHaveBeenCalled();

      const panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeFalsy();
    });

    it('abort() hides component and emits event', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughAborted', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.rootInstance.abort();
      await page.waitForChanges();

      expect(page.rootInstance['isVisible']).toBe(false);
      expect(eventSpy).toHaveBeenCalled();
    });

    it('restart() resets to first scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Manually advance to second scene
      page.rootInstance['currentSceneIndex'] = 1;
      await page.waitForChanges();

      await page.rootInstance.restart();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(0);
    });
  });

  describe('events', () => {
    it('emits sceneChanged when scene advances', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('sceneChanged', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.sceneId).toBe('1');
      expect(eventSpy.mock.calls[0][0].detail.sceneIndex).toBe(0);
    });
  });

  describe('author mode', () => {
    it('renders author toolbar when authorMode is true', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const toolbar = page.root?.shadowRoot?.querySelector('.author-toolbar');
      expect(toolbar).toBeTruthy();
    });

    it('does not render author toolbar when authorMode is false', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const toolbar = page.root?.shadowRoot?.querySelector('.author-toolbar');
      expect(toolbar).toBeFalsy();
    });

    it('renders pointer tool button in author mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const pointerBtn = page.root?.shadowRoot?.querySelector('.author-btn');
      expect(pointerBtn?.textContent).toContain('Pointer Tool');
    });

    it('renders new scene button in author mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const buttons = page.root?.shadowRoot?.querySelectorAll('.author-btn');
      const newSceneBtn = Array.from(buttons || []).find(btn => btn.textContent?.includes('New Scene'));
      expect(newSceneBtn).toBeTruthy();
    });

    it('renders scene list in author mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const sceneList = page.root?.shadowRoot?.querySelector('.author-scene-list');
      expect(sceneList).toBeTruthy();

      const sceneItems = page.root?.shadowRoot?.querySelectorAll('.scene-list-item');
      expect(sceneItems?.length).toBe(3);
    });

    it('displays scene metadata in author scene list', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const sceneMeta = page.root?.shadowRoot?.querySelector('.scene-list-meta');
      expect(sceneMeta?.textContent).toContain('0.0s');
      expect(sceneMeta?.textContent).toContain('#element1');
    });
  });

  describe('accessibility', () => {
    it('close button has aria-label', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const closeBtn = page.root?.shadowRoot?.querySelector('.close-btn');
      expect(closeBtn?.getAttribute('aria-label')).toBeTruthy();
    });

    it('control buttons have aria-labels', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const controlBtns = page.root?.shadowRoot?.querySelectorAll('.control-btn');
      controlBtns?.forEach(btn => {
        expect(btn.getAttribute('aria-label')).toBeTruthy();
      });
    });

    it('volume slider has aria-label', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const volumeSlider = page.root?.shadowRoot?.querySelector('.volume-slider');
      expect(volumeSlider?.getAttribute('aria-label')).toBeTruthy();
    });
  });

  describe('navigation methods', () => {
    it('handleNext advances to next scene in manual mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(0);

      // Click the Next button
      const nextBtn = page.root?.shadowRoot?.querySelector('[aria-label="Next scene"]') as HTMLButtonElement;
      nextBtn?.click();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(1);
    });

    it('handlePrevious goes to previous scene in manual mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Start at scene 1
      page.rootInstance['currentSceneIndex'] = 1;
      await page.waitForChanges();

      // Click Previous button
      const prevBtn = page.root?.shadowRoot?.querySelector('[aria-label="Previous scene"]') as HTMLButtonElement;
      prevBtn?.click();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(0);
    });

    it('handleNext does nothing when already at last scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Jump to last scene
      page.rootInstance['currentSceneIndex'] = 2;
      await page.waitForChanges();

      const nextBtn = page.root?.shadowRoot?.querySelector('[aria-label="Next scene"]') as HTMLButtonElement;
      nextBtn?.click();
      await page.waitForChanges();

      // Should still be at last scene
      expect(page.rootInstance['currentSceneIndex']).toBe(2);
    });

    it('handlePrevious does nothing when at first scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(0);

      const prevBtn = page.root?.shadowRoot?.querySelector('[aria-label="Previous scene"]') as HTMLButtonElement;
      prevBtn?.click();
      await page.waitForChanges();

      // Should still be at first scene
      expect(page.rootInstance['currentSceneIndex']).toBe(0);
    });

    it('emits sceneChanged on next navigation', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('sceneChanged', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const nextBtn = page.root?.shadowRoot?.querySelector('[aria-label="Next scene"]') as HTMLButtonElement;
      nextBtn?.click();
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalledTimes(2); // Once on show, once on next
    });

    it('handleSceneSelect jumps to selected scene in manual mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Simulate selecting scene at index 2
      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'target', {
        value: { value: '2' },
        writable: false,
      });
      page.rootInstance['handleSceneSelect'](changeEvent);
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(2);
    });

    it('handleSceneSelect ignores NaN index', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const originalIndex = page.rootInstance['currentSceneIndex'];

      const changeEvent = new Event('change');
      Object.defineProperty(changeEvent, 'target', {
        value: { value: 'invalid' },
        writable: false,
      });
      page.rootInstance['handleSceneSelect'](changeEvent);
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(originalIndex);
    });
  });

  describe('video controls', () => {
    it('handlePlayPause toggles play/pause state', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      // Mock video element play/pause
      const mockVideoElement = {
        play: jest.fn().mockResolvedValue(undefined),
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      // Initially not playing
      expect(page.rootInstance['isPlaying']).toBe(false);

      // Call handlePlayPause directly (avoids click-triggered render issues)
      await page.rootInstance['handlePlayPause']();
      await page.waitForChanges();

      expect(page.rootInstance['isPlaying']).toBe(true);
      expect(mockVideoElement.play).toHaveBeenCalled();
    });

    it('handleMuteToggle toggles mute state', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const mockVideoElement = {
        muted: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      expect(page.rootInstance['isMuted']).toBe(false);

      // Call handleMuteToggle directly
      page.rootInstance['handleMuteToggle']();
      await page.waitForChanges();

      expect(page.rootInstance['isMuted']).toBe(true);
      expect(mockVideoElement.muted).toBe(true);
    });

    it('handleVolumeChange updates volume', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const mockVideoElement = {
        volume: 1.0,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', {
        value: { value: '0.5' },
        writable: false,
      });
      page.rootInstance['handleVolumeChange'](inputEvent);
      await page.waitForChanges();

      expect(page.rootInstance['volume']).toBe(0.5);
    });

    it('handleVolumeChange unmutes when volume increased from 0', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const mockVideoElement = {
        volume: 0,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;
      page.rootInstance['isMuted'] = true;

      const inputEvent = new Event('input');
      Object.defineProperty(inputEvent, 'target', {
        value: { value: '0.5' },
        writable: false,
      });
      page.rootInstance['handleVolumeChange'](inputEvent);
      await page.waitForChanges();

      expect(page.rootInstance['isMuted']).toBe(false);
    });

    it('handlePlayPause calls pause() when currently playing', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      // Directly call pause via the public method instead of clicking button
      const mockVideoElement = {
        pause: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      // Set playing state first
      page.rootInstance['isPlaying'] = true;

      // Call handlePlayPause directly
      await page.rootInstance['handlePlayPause']();
      await page.waitForChanges();

      expect(page.rootInstance['isPlaying']).toBe(false);
      expect(mockVideoElement.pause).toHaveBeenCalled();
    });
  });

  describe('keyboard events', () => {
    it('ESC key triggers abort when walkthrough is visible', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughAborted', eventSpy);

      await page.rootInstance.show();
      await page.waitForChanges();

      // Simulate ESC key press
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(page.rootInstance['isVisible']).toBe(false);
    });

    it('ESC key does nothing when walkthrough is hidden', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughAborted', eventSpy);

      // Don't show - just setup the handler via show() then hide()
      await page.rootInstance.show();
      await page.rootInstance.hide();
      await page.waitForChanges();

      // Simulate ESC key press (walkthrough is hidden)
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escEvent);
      await page.waitForChanges();

      // abort should NOT have been called since isVisible is false
      // walkthroughAborted should only be from if abort() was called
      expect(page.rootInstance['isVisible']).toBe(false);
    });

    it('Non-ESC key does not abort walkthrough', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughAborted', eventSpy);

      await page.rootInstance.show();
      await page.waitForChanges();

      const arrowEvent = new KeyboardEvent('keydown', { key: 'ArrowRight' });
      document.dispatchEvent(arrowEvent);
      await page.waitForChanges();

      expect(eventSpy).not.toHaveBeenCalled();
    });
  });

  describe('disconnectedCallback', () => {
    it('cleans up overlayManager on disconnect', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const cleanupSpy = jest.fn();
      page.rootInstance['overlayManager'] = { cleanup: cleanupSpy, clearHighlights: jest.fn() };

      page.rootInstance.disconnectedCallback();

      expect(cleanupSpy).toHaveBeenCalled();
    });

    it('calls cleanupDraggable on disconnect', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const cleanupDraggableSpy = jest.fn();
      page.rootInstance['cleanupDraggable'] = cleanupDraggableSpy;

      page.rootInstance.disconnectedCallback();

      expect(cleanupDraggableSpy).toHaveBeenCalled();
    });

    it('calls youtubeWrapper.destroy on disconnect', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const destroySpy = jest.fn();
      page.rootInstance['youtubeWrapper'] = { destroy: destroySpy };

      page.rootInstance.disconnectedCallback();

      expect(destroySpy).toHaveBeenCalled();
    });

    it('cleans up pointer tool handler on disconnect', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
      const mockHandler = jest.fn();
      page.rootInstance['pointerToolHandler'] = mockHandler;

      page.rootInstance.disconnectedCallback();

      expect(removeEventListenerSpy).toHaveBeenCalledWith('click', mockHandler, true);
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('handleScenesChange watcher', () => {
    it('updates timelineEngine when scenes prop changes', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const setScenesSpy = jest.fn();
      page.rootInstance['timelineEngine'] = {
        setScenes: setScenesSpy,
        getSceneCount: jest.fn().mockReturnValue(0),
        getScene: jest.fn(),
        getAllScenes: jest.fn().mockReturnValue([]),
        getCurrentSceneIndex: jest.fn().mockReturnValue(-1),
      };

      page.rootInstance.handleScenesChange();

      expect(setScenesSpy).toHaveBeenCalled();
    });
  });

  describe('video event handlers', () => {
    it('handlePlay sets isPlaying to true', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance['isPlaying'] = false;
      page.rootInstance['handlePlay']();
      await page.waitForChanges();

      expect(page.rootInstance['isPlaying']).toBe(true);
    });

    it('handlePause sets isPlaying to false', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance['isPlaying'] = true;
      page.rootInstance['handlePause']();
      await page.waitForChanges();

      expect(page.rootInstance['isPlaying']).toBe(false);
    });

    it('handleTimeUpdate advances scene when time matches', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Mock timelineEngine to return index 1 at current time
      const originalEngine = page.rootInstance['timelineEngine'];
      page.rootInstance['timelineEngine'] = {
        ...originalEngine,
        getCurrentSceneIndex: jest.fn().mockReturnValue(1),
        getSceneCount: jest.fn().mockReturnValue(3),
        getScene: (idx: number) => sampleScenes[idx],
        getAllScenes: jest.fn().mockReturnValue(sampleScenes),
      };
      page.rootInstance['currentSceneIndex'] = 0;

      const mockVideoElement = {
        currentTime: 5.0,
        addEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      page.rootInstance['handleTimeUpdate']();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(1);
    });

    it('handleLoadedMetadata sets duration from video element', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const mockVideoElement = {
        duration: 120,
        addEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      page.rootInstance['handleLoadedMetadata']();
      await page.waitForChanges();

      expect(page.rootInstance['duration']).toBe(120);
    });
  });

  describe('render paths', () => {
    it('renders YouTube container when YouTube URL is provided', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"></sp-walkthrough>',
      });

      // Mock YouTubePlayerWrapper to prevent actual API loading
      const mockWrapper = { on: jest.fn(), destroy: jest.fn(), play: jest.fn(), pause: jest.fn() };
      const YoutubeWrapperMock = jest.fn().mockReturnValue(mockWrapper);
      (page.rootInstance as any)['YouTubePlayerWrapper'] = YoutubeWrapperMock;

      await page.rootInstance.show();
      await page.waitForChanges();

      const videoContainer = page.root?.shadowRoot?.querySelector('.video-container');
      expect(videoContainer).toBeTruthy();
    });

    it('renders scene info with no active scene when no scenes provided', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const sceneInfo = page.root?.shadowRoot?.querySelector('.scene-info');
      expect(sceneInfo?.textContent).toContain('No active scene');
    });

    it('next button is disabled at last scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Jump to last scene
      page.rootInstance['currentSceneIndex'] = 2;
      await page.waitForChanges();

      const nextBtn = page.root?.shadowRoot?.querySelector('[aria-label="Next scene"]') as HTMLButtonElement;
      // In mock-doc, disabled is set as attribute
      expect(nextBtn?.getAttribute('disabled')).not.toBeNull();
    });

    it('previous button is disabled at first scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // At scene index 0 - previous should be disabled
      const prevBtn = page.root?.shadowRoot?.querySelector('[aria-label="Previous scene"]') as HTMLButtonElement;
      // In mock-doc, disabled is set as attribute
      expect(prevBtn?.getAttribute('disabled')).not.toBeNull();
    });
  });

  describe('author mode operations', () => {
    it('createScene sets editingSceneId and editingSceneData', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['createScene']();
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneId']).not.toBeNull();
      expect(page.rootInstance['editingSceneData']).not.toBeNull();
      expect(page.rootInstance['editingSceneData']?.title).toBe('New Scene');
    });

    it('editScene sets editingSceneData to matching scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editScene']('1');
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneId']).toBe('1');
      expect(page.rootInstance['editingSceneData']?.title).toBe('Scene 1');
    });

    it('editScene does nothing for non-existent scene ID', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editScene']('non-existent-id');
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneId']).toBeNull();
    });

    it('saveScene creates a new scene and emits timelineUpdated', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('timelineUpdated', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Set up a new scene for editing
      page.rootInstance['editingSceneId'] = 'new-scene-id';
      page.rootInstance['editingSceneData'] = {
        id: 'new-scene-id',
        title: 'New Test Scene',
        timestamp: 15,
        highlightSelector: '#new-element',
        description: 'Test',
      };

      page.rootInstance['saveScene']();
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.changeType).toBe('create');
    });

    it('saveScene updates existing scene and emits timelineUpdated', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('timelineUpdated', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Edit existing scene '1'
      page.rootInstance['editingSceneId'] = '1';
      page.rootInstance['editingSceneData'] = {
        id: '1',
        title: 'Updated Scene 1',
        timestamp: 0,
        highlightSelector: '#element1',
      };

      page.rootInstance['saveScene']();
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.changeType).toBe('update');
    });

    it('saveScene does nothing when editingSceneData is null', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('timelineUpdated', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editingSceneData'] = null;
      page.rootInstance['saveScene']();
      await page.waitForChanges();

      expect(eventSpy).not.toHaveBeenCalled();
    });

    it('cancelSceneEdit resets editing state and clears highlights', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const clearHighlightsSpy = jest.fn();
      page.rootInstance['overlayManager'] = {
        clearHighlights: clearHighlightsSpy,
        highlightElement: jest.fn(),
        cleanup: jest.fn(),
      };

      page.rootInstance['editingSceneId'] = '1';
      page.rootInstance['editingSceneData'] = { id: '1', title: 'test', timestamp: 0 };

      page.rootInstance['cancelSceneEdit']();
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneId']).toBeNull();
      expect(page.rootInstance['editingSceneData']).toBeNull();
      expect(clearHighlightsSpy).toHaveBeenCalled();
    });

    it('deleteScene removes scene and emits timelineUpdated', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('timelineUpdated', eventSpy);

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['deleteScene']('2');
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(eventSpy.mock.calls[0][0].detail.changeType).toBe('delete');
      expect(eventSpy.mock.calls[0][0].detail.affectedSceneId).toBe('2');
    });

    it('deleteScene clears editingSceneId when deleting currently editing scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editingSceneId'] = '2';
      page.rootInstance['editingSceneData'] = { id: '2', title: 'Scene 2', timestamp: 5 };

      page.rootInstance['deleteScene']('2');
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneId']).toBeNull();
      expect(page.rootInstance['editingSceneData']).toBeNull();
    });

    it('updateSceneField updates a specific field in editingSceneData', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editingSceneData'] = {
        id: '1',
        title: 'Old Title',
        timestamp: 0,
      };

      page.rootInstance['updateSceneField']('title', 'New Title');
      await page.waitForChanges();

      expect(page.rootInstance['editingSceneData']?.title).toBe('New Title');
    });

    it('updateSceneField does nothing when editingSceneData is null', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      page.rootInstance['editingSceneData'] = null;

      // Should not throw
      expect(() => page.rootInstance['updateSceneField']('title', 'New Title')).not.toThrow();
    });

    it('togglePointerTool activates pointer tool mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      expect(page.rootInstance['pointerToolActive']).toBe(false);

      page.rootInstance['togglePointerTool']();
      await page.waitForChanges();

      expect(page.rootInstance['pointerToolActive']).toBe(true);
      expect(document.body.style.cursor).toBe('crosshair');
    });

    it('togglePointerTool deactivates pointer tool mode', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      // Activate first
      page.rootInstance['togglePointerTool']();
      await page.waitForChanges();

      expect(page.rootInstance['pointerToolActive']).toBe(true);

      // Deactivate
      page.rootInstance['togglePointerTool']();
      await page.waitForChanges();

      expect(page.rootInstance['pointerToolActive']).toBe(false);
      expect(document.body.style.cursor).toBe('');
    });

    it('renders scene editor when editing scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Start editing
      page.rootInstance['editingSceneId'] = '1';
      page.rootInstance['editingSceneData'] = { ...sampleScenes[0] };
      await page.waitForChanges();

      const editor = page.root?.shadowRoot?.querySelector('.scene-editor');
      expect(editor).toBeTruthy();
    });

    it('renders scene editor with "Edit Scene" header for existing scene', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough author-mode="true"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      // Edit existing scene with non-temp ID
      page.rootInstance['editingSceneId'] = 'existing-id-not-temp';
      page.rootInstance['editingSceneData'] = {
        id: 'existing-id-not-temp',
        title: 'Test',
        timestamp: 5,
      };
      await page.waitForChanges();

      const editorHeader = page.root?.shadowRoot?.querySelector('.scene-editor-header');
      expect(editorHeader?.textContent).toBe('Edit Scene');
    });
  });

  describe('restart method', () => {
    it('restart resets to first scene with video element', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const mockVideoElement = {
        currentTime: 10,
        addEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;
      page.rootInstance['currentSceneIndex'] = 2;

      await page.rootInstance.restart();
      await page.waitForChanges();

      expect(page.rootInstance['currentSceneIndex']).toBe(0);
      expect(mockVideoElement.currentTime).toBe(0);
    });
  });

  describe('captions toggle', () => {
    it('handleCaptionsToggle does nothing when video has no text tracks', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const mockVideoElement = {
        textTracks: { length: 0 },
        addEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      page.rootInstance['captionsEnabled'] = false;
      page.rootInstance['handleCaptionsToggle']();
      await page.waitForChanges();

      // Should remain false since no text tracks
      expect(page.rootInstance['captionsEnabled']).toBe(false);
    });

    it('handleCaptionsToggle toggles captions when text tracks exist', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough video-src="/video.mp4"></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      const mockTrack = { mode: 'hidden' };
      const mockVideoElement = {
        textTracks: { length: 1, 0: mockTrack },
        addEventListener: jest.fn(),
      };
      page.rootInstance['videoElement'] = mockVideoElement as any;

      page.rootInstance['handleCaptionsToggle']();
      await page.waitForChanges();

      expect(page.rootInstance['captionsEnabled']).toBe(true);
      expect(mockTrack.mode).toBe('showing');
    });
  });

  describe('advanceToScene bounds', () => {
    it('advanceToScene does nothing when index is out of bounds', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const initialIndex = page.rootInstance['currentSceneIndex'];

      // Call with out-of-bounds index
      page.rootInstance['advanceToScene'](-1);
      expect(page.rootInstance['currentSceneIndex']).toBe(initialIndex);

      page.rootInstance['advanceToScene'](100);
      expect(page.rootInstance['currentSceneIndex']).toBe(initialIndex);
    });

    it('advanceToScene clears highlights when scene has no highlightSelector', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const scenesNoHighlight: Scene[] = [
        { id: 'a', title: 'A', timestamp: 0 }, // no highlightSelector
        { id: 'b', title: 'B', timestamp: 5 },
      ];

      page.rootInstance.scenes = scenesNoHighlight;
      await page.rootInstance.show();
      await page.waitForChanges();

      const clearHighlightsSpy = jest.fn();
      page.rootInstance['overlayManager'] = {
        clearHighlights: clearHighlightsSpy,
        highlightElement: jest.fn(),
        cleanup: jest.fn(),
      };

      page.rootInstance['advanceToScene'](0);
      await page.waitForChanges();

      expect(clearHighlightsSpy).toHaveBeenCalled();
    });
  });

  describe('fallback rendering without DWC theme', () => {
    it('renders panel container without DWC theme loaded', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      // Verify the walkthrough panel renders even without DWC theme tokens
      const panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeTruthy();
    });

    it('scene content area renders correctly without DWC theme', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const panelContent = page.root?.shadowRoot?.querySelector('.panel-content');
      expect(panelContent).toBeTruthy();
    });

    it('navigation controls are present and functional without DWC theme', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const controlsBar = page.root?.shadowRoot?.querySelector('.controls-bar');
      expect(controlsBar).toBeTruthy();

      const prevBtn = page.root?.shadowRoot?.querySelector('[aria-label="Previous scene"]');
      const nextBtn = page.root?.shadowRoot?.querySelector('[aria-label="Next scene"]');
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
    });

    it('close button is present and functional without DWC theme', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      const eventSpy = jest.fn();
      page.root?.addEventListener('walkthroughAborted', eventSpy);

      await page.rootInstance.show();
      await page.waitForChanges();

      const closeBtn = page.root?.shadowRoot?.querySelector('.close-btn') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();

      closeBtn.click();
      await page.waitForChanges();

      expect(eventSpy).toHaveBeenCalled();
      expect(page.rootInstance['isVisible']).toBe(false);
    });

    it('scene title and description display without DWC theme', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const sceneTitle = page.root?.shadowRoot?.querySelector('.scene-title');
      const sceneDesc = page.root?.shadowRoot?.querySelector('.scene-description');
      expect(sceneTitle?.textContent).toBe('Scene 1');
      expect(sceneDesc?.textContent).toBe('First scene');
    });

    it('walkthrough is not visible when hide() is called', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      await page.rootInstance.show();
      await page.waitForChanges();

      let panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeTruthy();

      await page.rootInstance.hide();
      await page.waitForChanges();

      panel = page.root?.shadowRoot?.querySelector('.walkthrough-panel');
      expect(panel).toBeFalsy();
    });

    it('manual navigation mode renders placeholder text without DWC theme', async () => {
      const page = await newSpecPage({
        components: [SpWalkthrough],
        html: '<sp-walkthrough></sp-walkthrough>',
      });

      page.rootInstance.scenes = sampleScenes;
      await page.rootInstance.show();
      await page.waitForChanges();

      const placeholder = page.root?.shadowRoot?.querySelector('.manual-mode-placeholder');
      expect(placeholder).toBeTruthy();
      expect(placeholder?.textContent).toContain('navigation');
    });
  });
});
