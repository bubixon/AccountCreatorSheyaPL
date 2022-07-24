const generator =  require('nickname-generator');
const { chromium } = require('playwright-extra')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const stealth = require('puppeteer-extra-plugin-stealth')()
const clipboardy = require('node-clipboardy');
const random = require('random-node');
const colors = require('colors');

const nickname = generator.randomNickname({ includes: [], locale: 'en', suffixLength: 4, numberOfWords: 1, separator: '', prefix: ''});
const password = generator.randomNickname({ includes: [], locale: 'en', suffixLength: 3, numberOfWords: 1, separator: '', prefix: ''}) + '@';
const pin = random.int(4, 4)
const email = nickname + '@gmail.com';

chromium.use(stealth)

chromium.use(
    RecaptchaPlugin({

        provider: {
            id: '2captcha',
            token: 'tu-podaj-token-2captcha'
        },

        visualFeedback: true
    })
)

chromium.launch({ headless: true }).then(async browser => {

    const page_1 = await browser.newPage()

    await page_1.goto('https://sheya.pl/register', { waitUntil: 'networkidle' })

    await page_1.waitForSelector('input[type="checkbox"]');

    await page_1.locator('text=Login * Hasło * Powtórz hasło * E-mail * PIN: * Kod usunięcia postaci * Zabezpie >> [placeholder="Podaj login\\.\\.\\."]').fill(nickname);

    await page_1.locator('text=Login * Hasło * Powtórz hasło * E-mail * PIN: * Kod usunięcia postaci * Zabezpie >> [placeholder="Podaj hasło\\.\\.\\."]').fill(password);

    await page_1.locator('[placeholder="Powtórz hasło\\.\\.\\."]').fill(password);

    await page_1.locator('[placeholder="Podaj email\\.\\.\\."]').fill(email);

    await page_1.locator('text=Login * Hasło * Powtórz hasło * E-mail * PIN: * Kod usunięcia postaci * Zabezpie >> [placeholder="Podaj PIN\\.\\.\\."]').fill(pin);

    await page_1.locator('[placeholder="Podaj kod\\.\\.\\."]').fill('1234567');

    await page_1.locator('input[type="checkbox"]').check();

    await page_1.solveRecaptchas();

    await page_1.locator('button:has-text("Zarejestruj")').click();

    await page_1.waitForSelector('text=Rejestracja przebiegła pomyślnie. Teraz możesz się zalogować!', { timeout: 10000  }).then(async () => {
        console.log('Zarejestrowano oto dane do twojego konta'.green);
        console.log('Login: '.yellow + nickname);
        console.log('Password: '.yellow + password);
        console.log('PIN: '.yellow + pin);
    }).catch(async () => {
        console.log('Podczas tworzenia konta wystąpił problem'.red);
    });

    await browser.close()
})