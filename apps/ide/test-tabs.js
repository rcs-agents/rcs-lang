const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the IDE
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(3000);

    console.log('Testing RCL IDE tabs...\n');

    // Test each tab
    const tabs = [
      { name: 'Preview', selector: '[data-tab="preview"]' },
      { name: 'Flow', selector: '[data-tab="flow"]' },
      { name: 'Code', selector: '[data-tab="code"]' },
      { name: 'Export', selector: '[data-tab="export"]' },
    ];

    for (const tab of tabs) {
      console.log(`\nTesting ${tab.name} tab...`);

      // Click the tab
      await page.click(tab.selector);
      await page.waitForTimeout(1000);

      // Get the active panel
      const activePanel = await page.$eval('.tab-panel.active', (el) => el.id);
      console.log(`Active panel: ${activePanel}`);

      // Get content preview
      const contentPreview = await page.$eval('.tab-panel.active', (el) => {
        const text = el.textContent || '';
        return text.substring(0, 100).replace(/\s+/g, ' ').trim();
      });
      console.log(`Content preview: ${contentPreview}...`);

      // Check for SVG in diagram tabs
      if (tab.name === 'Preview' || tab.name === 'Flow') {
        const hasSvg = await page.$eval('.tab-panel.active', (el) => {
          return !!el.querySelector('svg');
        });
        console.log(`Has SVG: ${hasSvg}`);
      }

      // Check for code content
      if (tab.name === 'Code') {
        const codeContent = await page.$eval('#code-content', (el) => {
          const text = el.textContent || '';
          return text.substring(0, 80).replace(/\s+/g, ' ').trim();
        });
        console.log(`Code content: ${codeContent}...`);
      }

      // Check for JSON content
      if (tab.name === 'Export') {
        const jsonContent = await page.$eval('#json-content', (el) => {
          const text = el.textContent || '';
          return text.substring(0, 50).replace(/\s+/g, ' ').trim();
        });
        console.log(`JSON content: ${jsonContent}...`);
      }
    }

    console.log('\n✅ Tab testing complete!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
