import { test, expect } from '@playwright/test';

test.describe('Current Sprint Drag & Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
    
    // Fill in login credentials (you may need to adjust these based on your test data)
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard');
  });

  test('drag and drop persists issue status', async ({ page }) => {
    // Navigate to Current Sprint
    await page.click('a[href="/current"]');
    await page.waitForURL('/current');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="kanban-board"]');
    
    // Find an issue in the Todo column
    const todoColumn = page.locator('[data-testid="column-TODO"]');
    const issue = todoColumn.locator('[data-testid^="issue-"]').first();
    
    // Verify issue is in Todo column
    await expect(issue).toBeVisible();
    
    // Find the In Progress column
    const inProgressColumn = page.locator('[data-testid="column-IN_PROGRESS"]');
    
    // Drag issue from Todo to In Progress
    await issue.dragTo(inProgressColumn);
    
    // Wait for "Saving..." indicator to appear and disappear
    const savingIndicator = page.locator('[data-testid="saving-badge"]');
    await expect(savingIndicator).toBeVisible();
    await expect(savingIndicator).toBeHidden({ timeout: 5000 });
    
    // Verify issue moved to In Progress column
    await expect(inProgressColumn.locator('[data-testid^="issue-"]')).toContainText(await issue.textContent());
    
    // Reload page to verify persistence
    await page.reload();
    await page.waitForSelector('[data-testid="kanban-board"]');
    
    // Verify issue is still in In Progress column after reload
    const inProgressColumnAfterReload = page.locator('[data-testid="column-IN_PROGRESS"]');
    await expect(inProgressColumnAfterReload.locator('[data-testid^="issue-"]')).toContainText(await issue.textContent());
  });

  test('drag and drop works when dropping on items in target column', async ({ page }) => {
    // Navigate to Current Sprint
    await page.click('a[href="/current"]');
    await page.waitForURL('/current');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="kanban-board"]');
    
    // Find an issue in the Todo column
    const todoColumn = page.locator('[data-testid="column-TODO"]');
    const sourceIssue = todoColumn.locator('[data-testid^="issue-"]').first();
    
    // Verify source issue is in Todo column
    await expect(sourceIssue).toBeVisible();
    
    // Find the In Progress column and get an existing issue in it
    const inProgressColumn = page.locator('[data-testid="column-IN_PROGRESS"]');
    const targetIssue = inProgressColumn.locator('[data-testid^="issue-"]').first();
    
    // If there's an issue in In Progress column, drag over it
    if (await targetIssue.isVisible()) {
      // Drag source issue over the target issue in In Progress column
      await sourceIssue.dragTo(targetIssue);
    } else {
      // If no issues in In Progress, drag to empty space
      await sourceIssue.dragTo(inProgressColumn);
    }
    
    // Wait for "Saving..." indicator to appear and disappear
    const savingIndicator = page.locator('[data-testid="saving-badge"]');
    await expect(savingIndicator).toBeVisible();
    await expect(savingIndicator).toBeHidden({ timeout: 5000 });
    
    // Verify source issue moved to In Progress column
    await expect(inProgressColumn.locator('[data-testid^="issue-"]')).toContainText(await sourceIssue.textContent());
    
    // Verify the issue count in In Progress column increased
    const inProgressCount = inProgressColumn.locator('[data-testid="column-count"]');
    await expect(inProgressCount).toContainText(await inProgressColumn.locator('[data-testid^="issue-"]').count().toString());
  });

  test('filters work correctly', async ({ page }) => {
    // Navigate to Current Sprint
    await page.click('a[href="/current"]');
    await page.waitForURL('/current');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="kanban-board"]');
    
    // Test title filter
    const titleInput = page.locator('input[placeholder="Search title..."]');
    await titleInput.fill('test');
    
    // Wait for debounced filter to apply
    await page.waitForTimeout(400);
    
    // Verify filtered results
    const issueCount = page.locator('[data-testid="issue-count"]');
    await expect(issueCount).toContainText('issues');
    
    // Test clear filters
    const clearButton = page.locator('button:has-text("Clear filters")');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await expect(titleInput).toHaveValue('');
    }
  });

  test('sprint progress updates after drag and drop', async ({ page }) => {
    // Navigate to Current Sprint
    await page.click('a[href="/current"]');
    await page.waitForURL('/current');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="kanban-board"]');
    
    // Get initial progress
    const progressBar = page.locator('[data-testid="sprint-progress"]');
    const initialProgress = await progressBar.getAttribute('data-progress');
    
    // Move an issue to Done column
    const todoColumn = page.locator('[data-testid="column-TODO"]');
    const doneColumn = page.locator('[data-testid="column-DONE"]');
    const issue = todoColumn.locator('[data-testid^="issue-"]').first();
    
    await issue.dragTo(doneColumn);
    
    // Wait for saving to complete
    await page.waitForTimeout(1000);
    
    // Verify progress has updated
    const updatedProgress = await progressBar.getAttribute('data-progress');
    expect(parseInt(updatedProgress || '0')).toBeGreaterThan(parseInt(initialProgress || '0'));
  });
});
