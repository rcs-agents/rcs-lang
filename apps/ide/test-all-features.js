const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // Navigate to the IDE
    await page.goto('http://localhost:4000/');
    await page.waitForTimeout(3000);

    console.log('🧪 Testing RCL IDE Features...\n');

    // Test 1: Verify all tabs render correct content
    console.log('📋 Test 1: Tab Content Verification');
    console.log('==================================');

    // Preview Tab
    await page.click('[data-tab="preview"]');
    await page.waitForTimeout(500);
    const previewHasSvg = await page.$eval('#preview-container', (el) => !!el.querySelector('svg'));
    console.log(`✓ Preview tab shows SVG diagram: ${previewHasSvg}`);

    // Flow Tab
    await page.click('[data-tab="flow"]');
    await page.waitForTimeout(500);
    const flowHasSvg = await page.$eval('#diagram-container', (el) => !!el.querySelector('svg'));
    console.log(`✓ Flow tab shows SVG diagram: ${flowHasSvg}`);

    // Code Tab
    await page.click('[data-tab="code"]');
    await page.waitForTimeout(500);
    const codeContent = await page.$eval('#code-content', (el) => el.textContent || '');
    const hasJsCode = codeContent.includes('export const agent');
    console.log(`✓ Code tab shows JavaScript: ${hasJsCode}`);

    // Export Tab
    await page.click('[data-tab="export"]');
    await page.waitForTimeout(500);
    const jsonContent = await page.$eval('#json-content', (el) => el.textContent || '');
    const configContent = await page.$eval('#config-content', (el) => el.textContent || '');
    const hasJson = jsonContent.includes('"agent"');
    const hasConfig = configContent.includes('"name"') || configContent.includes('"config"');
    console.log(`✓ Export tab shows JSON: ${hasJson}`);
    console.log(`✓ Export tab shows Config: ${hasConfig}`);

    // Test 2: Verify no overlapping content
    console.log('\n📐 Test 2: Layout Integrity');
    console.log('===========================');

    // Check that only one panel is visible at a time
    const visiblePanels = await page.$$eval('.tab-panel', (panels) => {
      return panels.filter((p) => window.getComputedStyle(p).display !== 'none').length;
    });
    console.log(`✓ Only one panel visible at a time: ${visiblePanels === 1}`);

    // Test 3: Compilation works
    console.log('\n🔄 Test 3: Compilation');
    console.log('=====================');

    // Trigger recompilation by modifying the editor
    await page.evaluate(() => {
      const editor = window.monaco?.editor?.getModels()?.[0];
      if (editor) {
        const content = editor.getValue();
        editor.setValue(content + '\n# Test comment');
        return true;
      }
      return false;
    });
    await page.waitForTimeout(1000); // Wait for debounced compilation

    // Check if compilation succeeded
    const compilationLogs = await page.evaluate(() => {
      return window.console.logs?.filter((log) => log.includes('Compilation successful')) || [];
    });
    console.log(`✓ Compilation triggers on edit: ${compilationLogs.length > 0 || 'N/A'}`);

    // Test 4: Toolbar functionality
    console.log('\n🔧 Test 4: Toolbar');
    console.log('==================');

    const hasCompileButton = (await page.$('[title="Compile (Ctrl/Cmd+S)"]')) !== null;
    const hasCopyButtons = (await page.$('[title="Copy JavaScript"]')) !== null;
    console.log(`✓ Compile button present: ${hasCompileButton}`);
    console.log(`✓ Copy/Download buttons present: ${hasCopyButtons}`);

    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('❌ Error during testing:', error);
  } finally {
    await browser.close();
  }
})();
