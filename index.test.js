const process = require('process');


const cp = require('child_process');
const path = require('path');
const tools = require('./tools');

const cleanEnvs = function () {
    delete process.env['INPUT_MODE'];
    delete process.env['INPUT_OUTPUT'];
    delete process.env['INPUT_SCRIPTBEFORE'];
}

test('default mode', async () => {
    console.log("default mode");
    cleanEnvs();
    const mode = await tools.getMode();
    console.log("mode: " + mode);
    await expect(mode).toBe('wholePage');
});

test('non-default mode', async () => {
    console.log('non-default mode');
    cleanEnvs();
    process.env['INPUT_MODE'] = 'page';
    const mode = await tools.getMode();
    console.log("mode: " + mode);
    await expect(mode).not.toBe('wholePage');
});

test('malformed URL input', async () => {
    console.log('malformed URL input');
    cleanEnvs();
    process.env['INPUT_URL'] = 'malformed';
    const parameters = await tools.getParameters()
    await expect(tools.validateParameters(parameters)).rejects.toThrow('Please, provide a valid URL.');
});

test('Fail without URL', async () => {
    console.log("Fail without URL");
    cleanEnvs();
    const ip = path.join(__dirname, 'index.js');

    try {
        const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
        console.log(result);
        throw new Error('Should have failed');
    } catch (error) {
        console.info("Expected fail.");
    }
});

test('test parameter for element', () => {
    console.log('test parameter for element');
    cleanEnvs();
    process.env['INPUT_URL'] = 'https://google.com';
    process.env['INPUT_MODE'] = 'element';
    const ip = path.join(__dirname, 'index.js');

    try {
        const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
        console.log(result);
    } catch (error) {
        console.info("Expected fail.");
        console.log("Error: " + error.message);
    }
});

test('test given output name', async () => {
    console.log('test given output name');
    cleanEnvs();
    process.env['INPUT_URL'] = 'https://github.com/karol-brejna-i/webpage-screenshot-action/blob/main/README.md';
    process.env['INPUT_OUTPUT'] = 'readme-wholepage-screenshot.png';
    const ip = path.join(__dirname, 'index.js');

    const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
    console.log(result);
    await expect(result).toEqual(expect.stringContaining(
        '{"url":"https://github.com/karol-brejna-i/webpage-screenshot-action/blob/main/README.md","result":{"screenshot":"readme-wholepage-screenshot.png"}}'
    ));

});

test('test run without scriptBefore', async () => {
    console.log('test run without scriptBefore');
    cleanEnvs();
    process.env['INPUT_URL'] = 'https://google.com';
    const ip = path.join(__dirname, 'index.js');

    const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
    console.log(result);
    await expect(result).toEqual(expect.stringContaining('{"url":"https://google.com","result":{"screenshot":"screenshot.png"}}'));
});

test('test run with scriptBefore', async () => {
    console.log('test run with scriptBefore');
    cleanEnvs();
    process.env['INPUT_URL'] = 'https://google.com';
    process.env['INPUT_SCRIPTBEFORE'] = 'result = 42;';
    const ip = path.join(__dirname, 'index.js');

    const result = cp.execSync(`node ${ip}`, {env: process.env}).toString();
    console.log(result);
    await expect(result).toEqual(expect.stringContaining('{"url":"https://google.com","result":{"script":42,"screenshot":"screenshot.png"}}'));
});

test('test run with faulty scriptBefore', async () => {
    console.log('test run with faulty scriptBefore');
    cleanEnvs();
    process.env['INPUT_URL'] = 'https://google.com';
    process.env['INPUT_SCRIPTBEFORE'] = 'return 42;';
    delete process.env['INPUT_MODE']
    const ip = path.join(__dirname, 'index.js');

    try {
        cp.execSync(`node ${ip}`, {env: process.env}).toString();
        throw new Error('Should have failed');
    } catch (error) {
        console.info("Expected fail.");
        console.log("Error: " + error.message);

        await expect(error.stdout.toString()).toEqual(expect.stringContaining('::error::Error in scriptBefore'));
    }
});

const TIMEOUT = 10000;
test('test run with faulty url', async () => {
    console.log('test run with faulty url');
    cleanEnvs();

    // the URL is technically valid, but it's not reachable
    process.env['INPUT_URL'] = 'https://ąśćżź.pl';
    const ip = path.join(__dirname, 'index.js');

    const options = {
        timeout: TIMEOUT,
        killSignal: 'SIGKILL',
        env: process.env
    }

    cp.exec(`node ${ip}`, options, function (err, stout, stderr) {
        if (err) {
            console.log('Child process exited with error code', err);
            console.log('stderr: ' + stderr);
            console.log('stdout: ' + stout);

            if (err.killed) {
                throw new Error('Command failed. Probably timeouted.');
            } else {
                console.log(`Command failed. It should with this url ${process.env['INPUT_URL']}.`);
            }
        } else {
            console.log('Child process exited with success code!');
        }
    });
    console.log('waiting for timeout');

    await new Promise(resolve => setTimeout(resolve, TIMEOUT + 500));
}, TIMEOUT + 1000);
