import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const output = 'docs/qa/screenshots';
await mkdir(output, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const issues = [];
page.on('pageerror', (error) => issues.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (['error', 'warning'].includes(message.type())) issues.push(`console-${message.type()}: ${message.text()}`);
});
page.on('requestfailed', (request) => issues.push(`requestfailed: ${request.url()} ${request.failure()?.errorText ?? ''}`));
page.on('dialog', (dialog) => dialog.accept());

async function shot(name) {
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
}

async function clickText(text) {
  const target = page.getByText(text, { exact: true }).last();
  await target.waitFor({ state: 'visible', timeout: 60_000 });
  await target.click();
  await page.waitForTimeout(250);
}

try {
await page.goto('http://127.0.0.1:8081', { waitUntil: 'networkidle', timeout: 60_000 });
await page.waitForTimeout(1_000);
await shot('01-onboarding-welcome');

if (await page.getByText('Welcome to Athar', { exact: true }).count()) {
  await clickText('Next');
  await shot('02-onboarding-language');
  await clickText('Next');
  await shot('03-onboarding-location');
  await clickText('Next');
  await shot('04-onboarding-notifications');
  await clickText('Next');
  await shot('05-onboarding-focus');
  await clickText('Get started');
  await clickText('Skip tour');
}

await page.waitForTimeout(500);
await shot('06-prayer');

for (const tool of ['Athkar', 'Tasbīḥ', '99 Names', 'Witr']) {
  await page.getByLabel(tool, { exact: true }).click();
  await page.waitForTimeout(250);
  await shot(`tool-${tool.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);
  await page.getByLabel(/back/i).first().click();
  await page.waitForTimeout(200);
}

for (const tab of ['Salah', 'Hadith', 'Mosques', 'More']) {
  await clickText(tab);
  await shot(`tab-${tab.toLowerCase().replace(/\s+/g, '-')}`);
}

await clickText('Appearance');
await shot('06-more-appearance-open');
await clickText('Appearance');

await clickText('Prayer location');
await shot('07-location-setup');
await page.getByLabel(/back/i).first().click();
await page.waitForTimeout(300);

await clickText('Adhān voice, reciters & athkār');
await shot('08-reminder-settings');
await page.getByLabel(/back/i).first().click();
await page.waitForTimeout(300);

await clickText('Hadith');
const search = page.getByPlaceholder(/Search hadith/i).first();
if (await search.count()) {
  await search.fill('mercy');
  await page.waitForTimeout(400);
  await shot('09-hadith-search');
  await search.fill('');
}

const summary = {
  url: page.url(),
  title: await page.title(),
  issues: [...new Set(issues)],
  bodyText: (await page.locator('body').innerText()).slice(0, 1_500),
};
console.log(JSON.stringify(summary, null, 2));

const arabicContext = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
const arabicPage = await arabicContext.newPage();
arabicPage.on('dialog', (dialog) => dialog.accept());
await arabicPage.addInitScript(() => {
  localStorage.setItem('athar.prayer.place.v2', JSON.stringify({
    latitude: 45.4765,
    longitude: -75.7013,
    city: 'Gatineau',
    countryCode: 'CA',
    timezone: 'America/Toronto',
    source: 'manual',
    capturedAt: Date.now(),
    accuracyMeters: null,
  }));
  localStorage.setItem('athar.prayer.settings.v2', JSON.stringify({
    methodMode: 'automatic',
    method: 'NorthAmerica',
    madhab: 'standard',
    adjustments: { fajr: 0, sunrise: 0, dhuhr: 0, asr: 0, maghrib: 0, isha: 0 },
    hour12: true,
  }));
});
await arabicPage.goto('http://127.0.0.1:8081', { waitUntil: 'networkidle', timeout: 60_000 });
await arabicPage.getByText('Next', { exact: true }).click();
await arabicPage.getByText('العربية', { exact: true }).click();
await arabicPage.getByText('مرحبًا بك في أثر', { exact: true }).waitFor({ state: 'visible', timeout: 60_000 });
await arabicPage.screenshot({ path: `${output}/10-arabic-onboarding.png`, fullPage: true });
for (let step = 0; step < 4; step += 1) {
  await arabicPage.getByText('التالي', { exact: true }).click();
  await arabicPage.waitForTimeout(150);
}
await arabicPage.getByText('لنبدأ', { exact: true }).click();
await arabicPage.getByText('تخطّي الجولة', { exact: true }).click();
await arabicPage.getByText('المواقيت', { exact: true }).last().click();
await arabicPage.waitForTimeout(300);
await arabicPage.screenshot({ path: `${output}/11-arabic-prayer.png`, fullPage: true });
await arabicPage.getByText('صلواتي', { exact: true }).last().click();
await arabicPage.waitForTimeout(300);
await arabicPage.screenshot({ path: `${output}/12-arabic-salah.png`, fullPage: true });
await arabicPage.getByText('المزيد', { exact: true }).last().click();
await arabicPage.waitForTimeout(300);
await arabicPage.screenshot({ path: `${output}/13-arabic-more.png`, fullPage: true });
await arabicPage.getByText(/صوت الأذان.*الأذكار/).click();
await arabicPage.waitForTimeout(300);
await arabicPage.screenshot({ path: `${output}/14-arabic-notifications.png`, fullPage: true });
await arabicContext.close();
await browser.close();
} catch (error) {
  console.error(JSON.stringify({
    failure: String(error),
    url: page.url(),
    closed: page.isClosed(),
    issues: [...new Set(issues)],
    bodyText: await page.locator('body').innerText().catch(() => ''),
  }, null, 2));
  await browser.close();
  process.exitCode = 1;
}
