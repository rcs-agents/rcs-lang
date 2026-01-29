import { test, expect } from '@playwright/test';

/**
 * E2E tests for RCL Playground content verification
 *
 * These tests verify that the playground works correctly in the browser
 * without the node:fs externalization errors.
 */

test.describe('Playground Content Verification', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/playground');
		// Wait for the playground to be fully loaded
		await page.waitForSelector('.playground', { timeout: 10000 });

		// Wait for Monaco editor to initialize
		await page.waitForSelector('.monaco-editor', { timeout: 10000 });

		// Give some time for initial parsing
		await page.waitForTimeout(2000);
	});

	test('AST tab should contain parsed AST content', async ({ page }) => {
		// Click the AST tab
		await page.click('button:has-text("AST")');

		// Wait for AST panel to be visible
		const astPanel = page.locator('.ast-panel');
		await expect(astPanel).toBeVisible();

		// The AST panel itself contains the tree nodes directly
		// Should contain actual AST nodes (not just "No AST available")
		const content = await astPanel.textContent();
		expect(content).toBeTruthy();
		expect(content?.length).toBeGreaterThan(50); // Substantial content

		// Should contain typical AST node types
		expect(content).toMatch(/type|RclFile|Section/i);

		// Should NOT contain error messages about node:fs
		expect(content).not.toContain('Module "node:fs" has been externalized');
		expect(content).not.toContain('Cannot access');
	});

	test('Errors tab should show diagnostics for invalid code', async ({ page }) => {
		// Type invalid RCL code to trigger errors
		const editor = page.locator('.monaco-editor');
		await editor.click();

		// Clear editor and type invalid syntax
		await page.keyboard.press('Control+a');
		await page.keyboard.type('agent InvalidAgent {');

		// Wait for parsing
		await page.waitForTimeout(1000);

		// Click Errors tab
		await page.click('button:has-text("Errors")');

		// Should show errors panel
		const errorsPanel = page.locator('.errors-panel');
		await expect(errorsPanel).toBeVisible();

		// Should have diagnostic items
		const diagnosticItems = errorsPanel.locator('.diagnostic-item');
		await expect(diagnosticItems.first()).toBeVisible({ timeout: 5000 });

		// Error should contain diagnostic information
		const errorText = await diagnosticItems.first().textContent();
		expect(errorText).toBeTruthy();
		expect(errorText?.length).toBeGreaterThan(5);

		// Should NOT show the module externalization error
		expect(errorText).not.toContain('Module "node:fs" has been externalized');
	});

	test('Status bar should show parse statistics', async ({ page }) => {
		// Status bar should be visible
		const statusBar = page.locator('.status-bar');
		await expect(statusBar).toBeVisible();

		// Should show parse time
		const statusContent = await statusBar.textContent();
		expect(statusContent).toMatch(/\d+(\.\d+)?\s*ms/);
	});

	test('Console should not show module externalization errors', async ({ page }) => {
		// Capture console messages
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Wait for initial load and parsing
		await page.waitForTimeout(3000);

		// Click through all tabs to trigger any lazy loading
		await page.click('button:has-text("AST")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("Errors")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("Diagram")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("RBX JSON")');
		await page.waitForTimeout(500);
		await page.click('button:has-text("JavaScript")');
		await page.waitForTimeout(500);

		// Verify no module externalization errors
		const hasExternalizationError = consoleErrors.some(error =>
			error.includes('Module "node:fs" has been externalized') ||
			error.includes('Cannot access "node:fs')
		);

		expect(hasExternalizationError).toBe(false);

		// If there are errors, log them for debugging
		if (consoleErrors.length > 0) {
			console.log('Console errors found:', consoleErrors);
		}
	});

	test('Diagram tab should be accessible without node:fs errors', async ({ page }) => {
		// Click the Diagram tab
		await page.click('button:has-text("Diagram")');

		// Wait for the panel container to render something
		const panelContainer = page.locator('.panel-container');
		await expect(panelContainer).toBeVisible();

		// The panel should not show node:fs errors
		const panelContent = await panelContainer.textContent();
		expect(panelContent).not.toContain('Module "node:fs" has been externalized');
		expect(panelContent).not.toContain('Cannot access');
	});

	test('RBX JSON tab should be accessible without node:fs errors', async ({ page }) => {
		// Click the RBX JSON tab
		await page.click('button:has-text("RBX JSON")');

		// Wait for the panel container to render something
		const panelContainer = page.locator('.panel-container');
		await expect(panelContainer).toBeVisible();

		// The panel should not show node:fs errors
		const panelContent = await panelContainer.textContent();
		expect(panelContent).not.toContain('Module "node:fs" has been externalized');
		expect(panelContent).not.toContain('Cannot access');
	});

	test('JavaScript tab should be accessible without node:fs errors', async ({ page }) => {
		// Click the JavaScript tab
		await page.click('button:has-text("JavaScript")');

		// Wait for the panel container to render something
		const panelContainer = page.locator('.panel-container');
		await expect(panelContainer).toBeVisible();

		// The panel should not show node:fs errors
		const panelContent = await panelContainer.textContent();
		expect(panelContent).not.toContain('Module "node:fs" has been externalized');
		expect(panelContent).not.toContain('Cannot access');
	});

	test('Example loading should work without node:fs errors', async ({ page }) => {
		// Capture console messages
		const consoleErrors: string[] = [];
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				consoleErrors.push(msg.text());
			}
		});

		// Load an example
		await page.click('button:has-text("Examples")');
		await page.click('text=Hello World');

		// Wait for editor to update
		await page.waitForTimeout(1500);

		// Verify editor content changed
		const editorContent = await page.locator('.monaco-editor').textContent();
		expect(editorContent).toContain('HelloAgent');

		// Check that we didn't get node:fs errors
		const hasExternalizationError = consoleErrors.some(error =>
			error.includes('Module "node:fs" has been externalized') ||
			error.includes('Cannot access "node:fs')
		);
		expect(hasExternalizationError).toBe(false);

		// Check AST tab has content (parsing should work)
		await page.click('button:has-text("AST")');
		const astContent = await page.locator('.ast-panel').textContent();
		expect(astContent?.length).toBeGreaterThan(50);
	});

	test('URL sharing should work', async ({ page }) => {
		// Type some code
		const editor = page.locator('.monaco-editor');
		await editor.click();
		await page.keyboard.press('Control+a');
		await page.keyboard.type('agent TestAgent\n  displayName: "Test"');

		// Wait for parsing
		await page.waitForTimeout(1000);

		// Click share button
		await page.click('button:has-text("Share")');

		// Wait for URL to update
		await page.waitForTimeout(500);

		// Get the URL with hash
		const url = page.url();
		expect(url).toContain('#');

		// Navigate to the same URL in a new page context
		const newPage = await page.context().newPage();
		await newPage.goto(url);

		// Wait for playground to load
		await newPage.waitForSelector('.playground', { timeout: 10000 });
		await newPage.waitForTimeout(2000);

		// Verify AST tab has content (code was restored and parsed)
		await newPage.click('button:has-text("AST")');
		const astContent = await newPage.locator('.ast-panel').textContent();
		expect(astContent?.length).toBeGreaterThan(50);

		await newPage.close();
	});
});
