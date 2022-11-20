# Webpage Screenshot Action

This action takes a screenshot of a webpage. 
It also allows to run some arbitrary JavaScript code on the 
page before taking the screenshot (for example for navigation, DOM validation, etc.). 

It's initial purpose was to help ensuring PR quality
(by  attaching a screenshot of the contributed documentation and doing some basic HTML checks), 
but there may be much more applications of this action. 

## Usage

Here are the inputs you can use to configure the action:

| Name         | Description                                                                                               | Default            |
|--------------|-----------------------------------------------------------------------------------------------------------|--------------------|
| url          | The URL of the webpage to screenshot                                                                      | required parameter |
| output       | The output file name                                                                                      | `screenshot.png`   |
| mode         | The operating mode for the action. Possible values are: 'page', 'wholePage', 'scrollToElement', 'element' | `wholePage`        |
| selector     | The CSS selector of the element to screenshot. Only used if mode is 'element' or 'scrollToElement'        |                    |
| xpath        | The XPath selector of the element to screenshot. Only used if mode is 'element' or 'scrollToElement'      |                    |
| scriptBefore | A script to execute before taking the screenshot. Only used if mode is 'element' or 'scrollToElement'     |                    |

<!--
Not implemented yet:
| width | The width of the screenshot | `1920` |
| height | The height of the screenshot | `1080` |
-->

### url
Required parameter. A fully qualified URL of the webpage to screenshot.
It can be external web page, it can be a file from a PR, it can be a page served by your workflow (served in locally, on GitHub action runner).

### output
The path of the output file (including the name). It can be relative to the current working directory, or absolute.
If not provided, the screenshot will be written to `./screenshot.png`.

### mode
The operating mode for the action. Possible values are:
- `page`: takes a screenshot of the page in a browser window
- `wholePage`: takes a screenshot of the whole page( default)
- `scrollToElement`: scrolls the page to the element specified by `selector` or `xpath`
   and takes a screenshot of the page in a browser window
- `element`: takes a screenshot of the DOM element specified by `selector` or `xpath`

Please, take a look at the [examples](#examples) below for more details.

### selector
CSS selector of an HTML page element, i.e. `#www-wikipedia-org > div.search-container` (see [CSS selector syntax](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors)). 

Only used if mode is `element` or `scrollToElement`.

### xpath
XPath selector of an HTML page element, i.e. `//*[@id="www-wikipedia-org"]/div[1]` (see [XPath syntax](https://developer.mozilla.org/en-US/docs/Web/XPath)).

Only used if mode is `element` or `scrollToElement`.

## Examples