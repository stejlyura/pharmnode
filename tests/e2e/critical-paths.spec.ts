import { test, expect } from '@playwright/test';
import { prisma } from '../../src/lib/prisma';
import { decryptJson } from '../../src/lib/encryption';

test.describe('PharmNode Critical Paths E2E', () => {
  const testEmail = `e2e-user-${Date.now()}@example.com`;

  test.afterAll(async () => {
    // Teardown: Delete the created test user to keep the database clean
    try {
      const user = await prisma.user.findUnique({
        where: { email: testEmail },
      });
      if (user) {
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log(`[TEARDOWN] Cleaned up test user: ${testEmail}`);
      }
    } catch (err) {
      console.error('[TEARDOWN] Error cleaning up test user:', err);
    } finally {
      await prisma.$disconnect();
    }
  });

  test('Registration -> Email Verification -> Recipe Creation & Canvas Autosave -> Pro Plan Upgrade', async ({ page }) => {
    // Inject localStorage keys to disable onboarding tour, disclaimer modal, and cookie consent overlays
    await page.addInitScript(() => {
      window.localStorage.setItem('pharmnode-onboarding-done', 'true');
      window.localStorage.setItem('pharmnode_dss_accepted', 'true');
      window.localStorage.setItem('pharmnode_cookie_consent', 'accepted');
    });

    // 1. User Registration
    console.log('[E2E] Navigating to /login...');
    await page.goto('/login');
    await expect(page).toHaveTitle(/PharmNode|System Authorization|Авторизация/i);

    console.log('[E2E] Switching to "Create Account" tab...');
    await page.locator('button', { hasText: /Create Account|Создать аккаунт/ }).click();

    console.log('[E2E] Filling registration form...');
    await page.locator('input[placeholder*="Fleming"], input[placeholder*="Флеминг"]').fill('E2E Test User');
    await page.locator('input[type="email"]').fill(testEmail);
    await page.locator('input[type="password"]').fill('Password123!');
    await page.locator('#disclaimer-checkbox').check();

    console.log('[E2E] Submitting registration form...');
    await page.locator('button[type="submit"]').click();

    // 2. Email Verification Bypass
    console.log('[E2E] Waiting for redirection to /verify-email...');
    await page.waitForURL('**/verify-email**', { timeout: 10000 });
    await expect(page.locator('h1')).toHaveText(/PharmNode/i);

    console.log('[E2E] Clicking Dev Mode Bypass to verify email...');
    const bypassButton = page.locator('button:has-text("Подтвердить email локально")');
    await expect(bypassButton).toBeVisible();
    await bypassButton.click();

    // 3. Project Creation
    console.log('[E2E] Waiting for redirection to /projects dashboard...');
    await page.waitForURL('**/projects', { timeout: 10000 });
    
    // Check that the dashboard contains user's name
    await expect(page.locator('header')).toContainText('E2E Test User');

    console.log('[E2E] Creating a new project...');
    await page.locator('button', { hasText: /New Project|Новый проект/ }).click();

    // 4. Canvas Interactions & Autosave Verification
    console.log('[E2E] Waiting for redirection to configurator studio...');
    await page.waitForURL('**/configurator?recipeId=*', { timeout: 15000 });
    
    const recipeId = new URL(page.url()).searchParams.get('recipeId');
    expect(recipeId).not.toBeNull();
    console.log(`[E2E] Project created with recipeId: ${recipeId}`);

    // Wait for nodes to load in the DOM
    const pressNode = page.locator('#node-card-node-press');
    await expect(pressNode).toBeVisible({ timeout: 10000 });

    // Click the node card to expand it if it's collapsed (checked by checking if slider is visible)
    const depthSlider = pressNode.locator('input[type="range"]').nth(1);
    if (!(await depthSlider.isVisible())) {
      console.log('[E2E] Press Equipment node is collapsed. Clicking to expand...');
      await pressNode.click();
    }

    console.log('[E2E] Modifying fill depth slider in Press Equipment node...');
    await expect(depthSlider).toBeVisible();
    await depthSlider.fill('1.25');
    await depthSlider.dispatchEvent('change');

    console.log('[E2E] Waiting 3.5 seconds for debounced autosave...');
    await page.waitForTimeout(3500);

    console.log('[E2E] Fetching recipe from database to verify autosave...');
    const dbRecipe = await prisma.recipe.findUnique({
      where: { id: recipeId! },
    });
    expect(dbRecipe).not.toBeNull();

    const decryptedNodes = decryptJson(dbRecipe!.nodes) as any[];
    const savedPressNode = decryptedNodes.find((n) => n.id === 'node-press');
    expect(savedPressNode).toBeDefined();
    expect(savedPressNode.data.depthCm).toBe(1.25);
    console.log('[E2E] Database autosave verified successfully!');

    // 5. Paddle Subscription Upgrade
    console.log('[E2E] Clicking Pro selector in the header...');
    const proHeaderTab = page.locator('button', { hasText: 'Pro' }).first();
    await proHeaderTab.click();

    console.log('[E2E] Clicking "Upgrade to Pro" in the pricing modal...');
    const upgradeButton = page.locator('button', { hasText: /Upgrade to Pro|Выбрать Pro/ });
    await expect(upgradeButton).toBeVisible();
    await upgradeButton.click();

    console.log('[E2E] Emulating client-side Paddle completion event...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('paddle:checkout:completed'));
    });

    console.log('[E2E] Querying user ID from database for webhook simulation...');
    const dbUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(dbUser).not.toBeNull();

    console.log('[E2E] Invoking backend Paddle webhook simulator...');
    const webhookResponse = await page.request.post('/api/dev/simulate-webhook', {
      data: { userId: dbUser!.id },
    });
    const webhookResult = await webhookResponse.json();
    expect(webhookResult.success).toBe(true);
    console.log('[E2E] Webhook simulation succeeded!');

    console.log('[E2E] Verifying UI tariff badge shows active Pro...');
    await expect(proHeaderTab).toHaveClass(/text-indigo-400/);

    console.log('[E2E] Verifying user tariff field in DB updated to professional...');
    const updatedUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });
    expect(updatedUser!.tariff).toBe('professional');
    expect(updatedUser!.isSubscribed).toBe(true);
    console.log('[E2E] Paddle billing transition verified successfully!');
  });
});
