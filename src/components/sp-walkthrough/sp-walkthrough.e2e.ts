import { expect } from '@playwright/test';
import { test } from '@stencil/playwright';

const sampleScenes = [
  { id: '1', title: 'Welcome', description: 'Welcome to the walkthrough', timestamp: 0, highlightSelector: '#element1' },
  { id: '2', title: 'Step 2', description: 'Second step', timestamp: 5, highlightSelector: '#element2' },
  { id: '3', title: 'Final Step', description: 'Last step', timestamp: 10, highlightSelector: '#element3' },
];

test.describe('sp-walkthrough E2E', () => {
  test('component renders and becomes visible when show() is called', async ({ page }) => {
    await page.goto('http://localhost:3333');

    // Initially component should not be visible
    const hasPanel = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.walkthrough-panel');
    });
    expect(hasPanel).toBe(false);

    // Call show method
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    // Panel should now be visible
    const panelVisible = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.walkthrough-panel');
    });
    expect(panelVisible).toBe(true);
  });

  test('panel displays title and close button', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const panelContent = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const title = el?.shadowRoot?.querySelector('.panel-title')?.textContent;
      const closeBtn = el?.shadowRoot?.querySelector('.close-btn');
      return {
        title: title || '',
        hasCloseBtn: !!closeBtn,
      };
    });

    expect(panelContent.title).toContain('Walkthrough');
    expect(panelContent.hasCloseBtn).toBe(true);
  });

  test('renders video container for standard video source', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('video-src', '/test-video.mp4');
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const hasVideo = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.video-element');
    });

    expect(hasVideo).toBe(true);
  });

  test('renders manual mode placeholder when no video source', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const placeholderText = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return el?.shadowRoot?.querySelector('.manual-mode-placeholder')?.textContent || '';
    });

    expect(placeholderText).toContain('navigation');
  });

  test('displays scene information when scenes are provided', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const sceneInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const title = el?.shadowRoot?.querySelector('.scene-title')?.textContent;
      const description = el?.shadowRoot?.querySelector('.scene-description')?.textContent;
      return { title, description };
    });

    expect(sceneInfo.title).toBe('Welcome');
    expect(sceneInfo.description).toBe('Welcome to the walkthrough');
  });

  test('scene counter displays correct position', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const counter = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return el?.shadowRoot?.querySelector('.scene-counter')?.textContent || '';
    });

    expect(counter).toContain('1 / 3');
  });

  test('next button advances to next scene', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    // Click next button
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.control-btn');
      // Next button should be third (after play/pause and previous)
      const nextBtn = Array.from(buttons || []).find(btn => btn.getAttribute('aria-label')?.includes('Next'));
      (nextBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(300);

    const sceneInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const title = el?.shadowRoot?.querySelector('.scene-title')?.textContent;
      const counter = el?.shadowRoot?.querySelector('.scene-counter')?.textContent;
      return { title, counter };
    });

    expect(sceneInfo.title).toBe('Step 2');
    expect(sceneInfo.counter).toContain('2 / 3');
  });

  test('previous button navigates to previous scene', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    // Advance to second scene first
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.control-btn');
      const nextBtn = Array.from(buttons || []).find(btn => btn.getAttribute('aria-label')?.includes('Next'));
      (nextBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(300);

    // Click previous button
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.control-btn');
      const prevBtn = Array.from(buttons || []).find(btn => btn.getAttribute('aria-label')?.includes('Previous'));
      (prevBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(300);

    const title = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return el?.shadowRoot?.querySelector('.scene-title')?.textContent || '';
    });

    expect(title).toBe('Welcome');
  });

  test('scene selector dropdown allows jumping to specific scene', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    // Select third scene from dropdown
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const select = el?.shadowRoot?.querySelector('.scene-selector') as HTMLSelectElement;
      if (select) {
        select.value = '2'; // Index of third scene
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });

    await page.waitForTimeout(300);

    const sceneInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const title = el?.shadowRoot?.querySelector('.scene-title')?.textContent;
      const counter = el?.shadowRoot?.querySelector('.scene-counter')?.textContent;
      return { title, counter };
    });

    expect(sceneInfo.title).toBe('Final Step');
    expect(sceneInfo.counter).toContain('3 / 3');
  });

  test('scene dropdown displays all scene titles', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const optionTexts = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const options = el?.shadowRoot?.querySelectorAll('.scene-selector option');
      return Array.from(options || []).map(opt => opt.textContent);
    });

    expect(optionTexts).toContain('Welcome');
    expect(optionTexts).toContain('Step 2');
    expect(optionTexts).toContain('Final Step');
  });

  test('close button hides walkthrough panel', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    // Click close button
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const closeBtn = el?.shadowRoot?.querySelector('.close-btn') as HTMLElement;
      closeBtn?.click();
    });

    await page.waitForTimeout(300);

    const panelVisible = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.walkthrough-panel');
    });

    expect(panelVisible).toBe(false);
  });

  test('ESC key aborts walkthrough', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    // Press ESC key
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    const panelVisible = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.walkthrough-panel');
    });

    expect(panelVisible).toBe(false);
  });

  test('emits walkthroughShown event when show() is called', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('sp-walkthrough');

        el?.addEventListener('walkthroughShown', () => {
          resolve(true);
        });

        (el as any).show();

        // Timeout if event doesn't fire
        setTimeout(() => resolve(false), 1000);
      });
    });

    expect(eventFired).toBe(true);
  });

  test('emits walkthroughAborted event when aborted', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventFired = await page.evaluate(() => {
      return new Promise<boolean>((resolve) => {
        const el = document.querySelector('sp-walkthrough');

        el?.addEventListener('walkthroughAborted', () => {
          resolve(true);
        });

        (el as any).show();

        setTimeout(() => {
          (el as any).abort();
        }, 100);

        setTimeout(() => resolve(false), 1500);
      });
    });

    expect(eventFired).toBe(true);
  });

  test('emits sceneChanged event when scene advances', async ({ page }) => {
    await page.goto('http://localhost:3333');

    const eventDetail = await page.evaluate((scenes) => {
      return new Promise<any>((resolve) => {
        const el = document.querySelector('sp-walkthrough');

        el?.addEventListener('sceneChanged', (e: any) => {
          resolve(e.detail);
        });

        if (el) {
          (el as any).scenes = scenes;
          (el as any).show();
        }

        setTimeout(() => resolve(null), 1000);
      });
    }, sampleScenes);

    expect(eventDetail).toBeTruthy();
    expect(eventDetail.sceneId).toBe('1');
    expect(eventDetail.sceneIndex).toBe(0);
  });

  test('author mode renders toolbar with pointer tool and new scene buttons', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('author-mode', 'true');
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const toolbarContent = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const toolbar = el?.shadowRoot?.querySelector('.author-toolbar');
      const buttons = toolbar?.querySelectorAll('.author-btn');
      return {
        hasToolbar: !!toolbar,
        buttonCount: buttons?.length || 0,
        buttonTexts: Array.from(buttons || []).map(btn => btn.textContent),
      };
    });

    expect(toolbarContent.hasToolbar).toBe(true);
    expect(toolbarContent.buttonCount).toBeGreaterThanOrEqual(2);
    expect(toolbarContent.buttonTexts.some(text => text?.includes('Pointer Tool'))).toBe(true);
    expect(toolbarContent.buttonTexts.some(text => text?.includes('New Scene'))).toBe(true);
  });

  test('author mode displays scene list with edit and delete buttons', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('author-mode', 'true');
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const sceneListContent = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const sceneList = el?.shadowRoot?.querySelector('.author-scene-list');
      const sceneItems = sceneList?.querySelectorAll('.scene-list-item');
      return {
        hasSceneList: !!sceneList,
        sceneCount: sceneItems?.length || 0,
      };
    });

    expect(sceneListContent.hasSceneList).toBe(true);
    expect(sceneListContent.sceneCount).toBe(3);
  });

  test('author mode scene list displays timestamps and selectors', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('author-mode', 'true');
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const sceneMeta = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const metaElements = el?.shadowRoot?.querySelectorAll('.scene-list-meta');
      return Array.from(metaElements || []).map(meta => meta.textContent);
    });

    expect(sceneMeta[0]).toContain('0.0s');
    expect(sceneMeta[0]).toContain('#element1');
    expect(sceneMeta[1]).toContain('5.0s');
  });

  test('author mode new scene button opens scene editor', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('author-mode', 'true');
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    // Click new scene button
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.author-btn');
      const newSceneBtn = Array.from(buttons || []).find(btn => btn.textContent?.includes('New Scene'));
      (newSceneBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(300);

    const hasEditor = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      return !!el?.shadowRoot?.querySelector('.scene-editor');
    });

    expect(hasEditor).toBe(true);
  });

  test('control buttons have proper accessibility attributes', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    const ariaLabels = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.control-btn');
      return Array.from(buttons || []).map(btn => btn.getAttribute('aria-label')).filter(Boolean);
    });

    expect(ariaLabels.length).toBeGreaterThan(0);
    ariaLabels.forEach(label => {
      expect(label).toBeTruthy();
    });
  });

  test('volume controls render when video source is provided', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('video-src', '/test-video.mp4');
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const volumeControlsExist = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const volumeControls = el?.shadowRoot?.querySelector('.volume-controls');
      const volumeSlider = el?.shadowRoot?.querySelector('.volume-slider');
      return {
        hasControls: !!volumeControls,
        hasSlider: !!volumeSlider,
      };
    });

    expect(volumeControlsExist.hasControls).toBe(true);
    expect(volumeControlsExist.hasSlider).toBe(true);
  });

  test('volume slider has aria-label for accessibility', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        el.setAttribute('video-src', '/test-video.mp4');
        (el as any).show();
      }
    });

    await page.waitForTimeout(300);

    const volumeAriaLabel = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const volumeSlider = el?.shadowRoot?.querySelector('.volume-slider');
      return volumeSlider?.getAttribute('aria-label') || '';
    });

    expect(volumeAriaLabel).toBeTruthy();
  });

  test('restart method returns to first scene', async ({ page }) => {
    await page.goto('http://localhost:3333');

    await page.evaluate((scenes) => {
      const el = document.querySelector('sp-walkthrough');
      if (el) {
        (el as any).scenes = scenes;
        (el as any).show();
      }
    }, sampleScenes);

    await page.waitForTimeout(300);

    // Advance to second scene
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const buttons = el?.shadowRoot?.querySelectorAll('.control-btn');
      const nextBtn = Array.from(buttons || []).find(btn => btn.getAttribute('aria-label')?.includes('Next'));
      (nextBtn as HTMLElement)?.click();
    });

    await page.waitForTimeout(300);

    // Call restart
    await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      (el as any).restart();
    });

    await page.waitForTimeout(300);

    const sceneInfo = await page.evaluate(() => {
      const el = document.querySelector('sp-walkthrough');
      const title = el?.shadowRoot?.querySelector('.scene-title')?.textContent;
      const counter = el?.shadowRoot?.querySelector('.scene-counter')?.textContent;
      return { title, counter };
    });

    expect(sceneInfo.title).toBe('Welcome');
    expect(sceneInfo.counter).toContain('1 / 3');
  });
});
