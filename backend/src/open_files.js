// open_files.js
import puppeteer from "puppeteer-core";

const formatURL = (url) => {
    if (!url.includes(".")) { 
        url += ".com";
    }
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        return `https://${url}`;
    }
    return url;
};

export const openRequiredWebsite = async (site) => {
    try {
        console.log(`Starting to open website: ${site}`);
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false
        });    
        
        console.log("Browser launched successfully");
        const formattedURL = formatURL(site);
        console.log(`Formatted URL: ${formattedURL}`);
        
        const newPage = await browser.newPage();
        console.log("New page created");
        
        await newPage.goto(formattedURL);
        console.log(`Successfully navigated to ${formattedURL}`);
        
        return { success: true, message: `Website ${site} opened successfully` };
    } catch (error) {
        console.error(`Error opening website ${site}:`, error);
        throw error;
    }
};

export const searchInRequiredWebsite = async (site, query) => {
    try {
        console.log(`Starting search on ${site} for query: ${query}`);
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false
        });

        const page = await browser.newPage();
        const formattedURL = formatURL(site);
        await page.goto(formattedURL);
        console.log(`Navigated to ${formattedURL}`);

        const searchSelectors = {
            "youtube.com": { input: "input#search", button: "button#search-icon-legacy" },
            "google.com": { input: "input[name='q']", button: "input[name='btnK']" },
            "bing.com": { input: "input[name='q']", button: "input[type='submit']" },
            "wikipedia.org": { input: "input[name='search']", button: "button[type='submit']" }
        };

        let selectorFound = false;
        for (const key in searchSelectors) {
            if (formattedURL.includes(key)) {
                selectorFound = true;
                const { input, button } = searchSelectors[key];
                console.log(`Found selectors for ${key}: input=${input}, button=${button}`);
                
                await page.waitForSelector(input);
                console.log("Search input found");
                
                await page.type(input, query, { delay: 100 });
                console.log(`Typed query: ${query}`);

                if (key === "google.com") {
                    await page.keyboard.press("Enter");
                    console.log("Pressed Enter for Google search");
                } else {
                    await page.click(button);
                    console.log("Clicked search button");
                }
                
                console.log("Search completed successfully");
                return { success: true, message: `Search on ${site} for "${query}" completed` };
            }
        }
        
        if (!selectorFound) {
            console.warn(`No search selectors found for website: ${site}`);
            throw new Error(`Search selectors not defined for ${site}`);
        }
    } catch (error) {
        console.error(`Error searching on ${site}:`, error);
        throw error;
    }
};

export const automateFilling = async (site, username, password) => {
    try {
        console.log(`Starting login automation for ${site}`);
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false
        });

        const page = await browser.newPage();
        const formattedURL = formatURL(site);
        await page.goto(formattedURL);
        console.log(`Navigated to ${formattedURL}`);

        await page.waitForSelector("input[name='username']");
        console.log("Username input found");
        await page.type("input[name='username']", username);
        
        await page.waitForSelector("input[name='password']");
        console.log("Password input found");
        await page.type("input[name='password']", password);
        
        await page.waitForSelector("button[type='submit']");
        console.log("Submit button found");
        await page.click("button[type='submit']");
        
        await page.waitForNavigation();
        console.log("Login completed successfully");
        
        return { success: true, message: `Login to ${site} completed` };
    } catch (error) {
        console.error(`Error logging in to ${site}:`, error);
        throw error;
    }
};

export const downloadFile = async (url) => {
    try {
        console.log(`Starting download from ${url}`);
        const browser = await puppeteer.launch({
            executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
            headless: false
        });

        const page = await browser.newPage();
        await page.goto(url);
        console.log(`Navigated to ${url}`);

        await page.waitForSelector("a#download-button");
        console.log("Download button found");
        
        const [download] = await Promise.all([
            page.waitForEvent("download"),
            page.click("a#download-button"),
        ]);

        const savePath = "/path/to/save/file.pdf";
        await download.saveAs(savePath);
        console.log(`✅ File downloaded to ${savePath}`);
        
        return { success: true, message: `File downloaded from ${url}` };
    } catch (error) {
        console.error(`Error downloading file from ${url}:`, error);
        throw error;
    }
};
