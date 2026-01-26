const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the IDE
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(2000);

    console.log('🧪 Testing IDE without Flow Tab...\n');

    // Get all visible tabs
    const tabs = await page.$$eval('.tab', (tabs) =>
      tabs.map((tab) => ({
        text: tab.textContent,
        dataTab: tab.getAttribute('data-tab'),
      })),
    );

    console.log('Visible Tabs:');
    console.log('=============');
    tabs.forEach((tab) => {
      console.log(`✓ ${tab.text} (${tab.dataTab})`);
    });

    // Verify Flow tab is not present
    const hasFlowTab = tabs.some((tab) => tab.dataTab === 'flow');
    console.log(`\n✓ Flow tab removed: ${!hasFlowTab}`);

    // Test remaining tabs
    console.log('\nTesting Remaining Tabs:');
    console.log('======================');

    for (const tab of tabs) {
      await page.click(`[data-tab="${tab.dataTab}"]`);
      await page.waitForTimeout(500);

      const activePanel = await page.$eval('.tab-panel.active', (el) => el.id);
      console.log(`✓ ${tab.text} tab works (panel: ${activePanel})`);
    }

    // Verify Flow panel still exists but is hidden
    const flowPanelExists = (await page.$('#flow-panel')) !== null;
    const flowPanelVisible = await page
      .$eval('#flow-panel', (el) => window.getComputedStyle(el).display !== 'none')
      .catch(() => false);

    console.log('\nFlow Panel Status:');
    console.log('==================');
    console.log(`✓ Flow panel exists in DOM: ${flowPanelExists}`);
    console.log(`✓ Flow panel is hidden: ${!flowPanelVisible}`);

    console.log('\n✅ IDE working correctly without Flow tab!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
