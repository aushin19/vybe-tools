# Cookie Extractor Chrome Extension

A simple Chrome extension that extracts cookies from http://localhost:3000 and displays them in both the browser console and extension popup.

## Features

- Extracts cookies from localhost:3000
- Displays cookies in the extension popup
- Logs cookies to the browser console
- Allows on-demand cookie extraction

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" at the top right
4. Click "Load unpacked" and select the extension folder
5. The Cookie Extractor extension should now appear in your extensions list

## Usage

There are three ways to extract cookies:

1. **Automatic extraction on installation**: Cookies are automatically extracted when the extension is first installed.

2. **Click the extension icon**: Click on the Cookie Extractor icon in the Chrome toolbar.

3. **Use the popup**: Click on the Cookie Extractor icon and then click the "Extract Cookies" button in the popup.

All extracted cookies will be displayed in the popup and logged to the browser console.

## Note

This extension requires that a web server is running on http://localhost:3000 with some cookies set for extraction to work.

## Permissions

This extension requires the following permissions:
- cookies: To access and read cookies
- storage: To store extracted cookies locally
- activeTab: To interact with the active tab
- scripting: To execute scripts in the context of web pages

## Icons

Please add your own icons in the images folder with sizes 16x16, 48x48, and 128x128 pixels. 