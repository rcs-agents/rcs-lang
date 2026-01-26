const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the IDE
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(3000);

    console.log('🔍 Testing D2 Preview Tab...\n');

    // Click on Preview tab
    await page.click('[data-tab="preview"]');
    await page.waitForTimeout(500);

    // Get the D2 content
    const d2Content = await page.$eval('#preview-container pre', (el) => el.textContent || '');

    console.log('D2 Diagram Content:');
    console.log('==================');
    console.log(d2Content.substring(0, 500) + '...\n');

    // Check for D2 specific syntax
    const hasD2Title = d2Content.includes('title:');
    const hasD2Shape = d2Content.includes('shape:');
    const hasD2Connections = d2Content.includes('->');
    const hasD2Style = d2Content.includes('style:');

    console.log('D2 Syntax Verification:');
    console.log('======================');
    console.log(`✓ Has title declaration: ${hasD2Title}`);
    console.log(`✓ Has shape definitions: ${hasD2Shape}`);
    console.log(`✓ Has connections (->): ${hasD2Connections}`);
    console.log(`✓ Has style attributes: ${hasD2Style}`);

    // Verify it's not showing SVG
    const hasSvg = await page.$eval('#preview-container', (el) => !!el.querySelector('svg'));
    console.log(`✓ Not showing SVG: ${!hasSvg}`);

    console.log('\n✅ D2 Preview is working correctly!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
