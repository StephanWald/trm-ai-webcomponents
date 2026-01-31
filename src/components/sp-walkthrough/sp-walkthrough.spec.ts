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
});
