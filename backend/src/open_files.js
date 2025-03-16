import puppeteer from "puppeteer-core"

openRequiredWebsite=async(site)=>{
    const browser=await puppeteer.launch(
        {
            executablePath: "/path/to/chrome-or-chromium", 
            headless: false
        }
    )

    const newPage=await browser.newPage();
    newPage.goto(site);
}

searchInRequiredWebsite=async(site,query)=>{
    const browser = await puppeteer.launch({
        executablePath: "/path/to/chrome-or-chromium",
        headless: false
    });

    const searchSelectors = {
        "youtube.com": { input: "input#search", button: "button#search-icon-legacy" },
        "google.com": { input: "input[name='q']", button: "input[name='btnK']" },
        "bing.com": { input: "input[name='q']", button: "input[type='submit']" },
        "wikipedia.org": { input: "input[name='search']", button: "button[type='submit']" }
    };

    for (const key in searchSelectors) {
        if (site.includes(key)) {
            const { input, button } = searchSelectors[key];
            await page.waitForSelector(input);
            await page.type(input, query, { delay: 100 });

            if (key === "google.com") {
                await page.keyboard.press("Enter"); 
            } else {
                await page.click(button);
            }
            return;
        }
    }
}

automateFilling=async(site,username,password)=>{
    const browser=await puppeteer.launch({
        executablePath: "/path/to/chrome-or-chromium",
        headless: false
    });

    const newPage=await browser.newPage(site);

    await page.type("input[name='username']", username);
    await page.type("input[name='password']", password);
    await page.click("button[type='submit']");
    await page.waitForNavigation();

}

downloadFile=async(url)=> {
    const browser = await puppeteer.launch({
        executablePath: "/path/to/chrome-or-chromium",
        headless: false
    });

    const page = await browser.newPage();
    await page.goto(url);

    const [download] = await Promise.all([
        page.waitForEvent("download"),
        page.click("a#download-button"),
    ]);

    await download.saveAs("/path/to/save/file.pdf");
    console.log("✅ File downloaded!");
};
