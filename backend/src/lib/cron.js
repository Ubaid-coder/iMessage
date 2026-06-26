import https from 'node:https';
import {CronJob} from  'cron'
// every 14 minutes send a a GET request to the health endpoint
const job = new CronJob("*/14 * * * *", function(){
    const base = process.env.FRONTEND_URL;
    if(!base) return;
    const url = new URL("/health",base).href;
    const client = url.startsWith("https:") ? https: http;

    client
    .get(url, (res) => {
        if(res.statusCode == 200) console.log('GET request set successfully');
        else console.log("GET request failed");
    })
    .on("error", (e) => console.error("Error while sending request",e));

});

export default job;