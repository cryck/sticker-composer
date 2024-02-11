# Welcome to the CS2 sticker composer tool

You can use the tool here: https://cs-sticker.com/


## Run locally
1. Install wrangler locally with the following command

```
npm install wrangler --save-dev
```

2. Run the worker locally with this command

```
npx wrangler dev backend/worker.js
```

3. Adjust the `apiUrl` to your local server URL in the `script.js:6` file to make the frontend work. 

```
const apiUrl = `localhost:1234/?input=${encodeURIComponent(inputVal)}&isBackwards=${isBackwards}`;
```


If you wish to contribute, please use this repo.


Thanks to [@ByMykel](https://github.com/ByMykel/CSGO-API) on whos data the stickers.json file is based on. 
