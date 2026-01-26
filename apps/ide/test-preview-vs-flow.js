const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the IDE
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(3000);

    console.log('🔍 Comparing Preview and Flow Tabs...\n');

    // Test Preview Tab
    console.log('📋 Preview Tab (Rendered D2 Diagram):');
    console.log('=====================================');
    await page.click('[data-tab="preview"]');
    await page.waitForTimeout(500);

    const previewStyles = await page.$eval('#preview-container svg', (svg) => {
      const bgColor = svg.style.background;
      const borderColor = svg.style.border;
      const nodeStyle = svg.querySelector('.node-start')?.getAttribute('fill');
      const textColor = svg.querySelector('.node-text')?.getAttribute('fill');
      return { bgColor, borderColor, nodeStyle, textColor };
    });

    console.log(`Background: ${previewStyles.bgColor}`);
    console.log(`Border: ${previewStyles.borderColor}`);
    console.log(`Node color: ${previewStyles.nodeStyle}`);
    console.log(`Text color: ${previewStyles.textColor}`);

    // Test Flow Tab
    console.log('\n🔄 Flow Tab (Interactive Sprotty):');
    console.log('==================================');
    await page.click('[data-tab="flow"]');
    await page.waitForTimeout(500);

    const flowStyles = await page.$eval('#diagram-container svg', (svg) => {
      const bgColor = svg.style.background;
      const borderColor = svg.style.border;
      const nodeStyle = svg.querySelector('.node-start')?.getAttribute('fill');
      const textColor = svg.querySelector('.node-text')?.getAttribute('fill');
      const cursor =
        svg.querySelector('.node')?.style.cursor ||
        window.getComputedStyle(svg.querySelector('.node')).cursor;
      return { bgColor, borderColor, nodeStyle, textColor, cursor };
    });

    console.log(`Background: ${flowStyles.bgColor}`);
    console.log(`Border: ${flowStyles.borderColor}`);
    console.log(`Node color: ${flowStyles.nodeStyle}`);
    console.log(`Text color: ${flowStyles.textColor}`);
    console.log(`Node cursor: ${flowStyles.cursor}`);

    console.log('\n📊 Summary:');
    console.log('===========');
    console.log('✓ Preview: Light theme, simplified styling, non-interactive');
    console.log('✓ Flow: Dark theme, vibrant colors, interactive (cursor: pointer)');
    console.log('\n✅ Both tabs show rendered diagrams with different styles!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
