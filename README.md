# Welcome to the CS2 sticker composer tool

You were able to use the tool from February 2024 to mid-March 2025 here cs-sticker.com. 
Now the domains have been sold to a new owner.


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
