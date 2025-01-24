const { app } = require('@azure/functions');

const appInsights = require("applicationinsights");
appInsights.setup().start(); // assuming connection string is in environment variables. start() can be omitted to disable any non-custom data
const aiClient = appInsights.defaultClient;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.hook.appStart(async (context) => {
    aiClient.trackTrace({message: "appStartHook:start"});
    console.log("appStartHook:start");
    const _ = await wait(1000);
    aiClient.trackTrace({message: "appStartHook:end"});
    console.log("appStartHook:end");
});

app.hook.appTerminate(async (context) => {
    aiClient.trackTrace({message: "appTerminate:start"});
    console.log("appTerminate:start");
    const _ = await wait(1000);
    aiClient.trackTrace({message: "appTerminate:end"});
    console.log("appTerminate:end");
});

process.on('SIGTERM', async () => {
    aiClient.trackTrace({message: "procese.on.SIGTERM:start"});
    console.log("procese.on.SIGTERM:start");
    const _ = await wait(1000);
    aiClient.trackTrace({message: "procese.on.SIGTERM:end"});
    console.log("procese.on.SIGTERM:end");
})

process.on('exit', async () => {
    aiClient.trackTrace({message: "procese.on.exit:start"});
    console.log("procese.on.exit:start");
    const _ = await wait(1000);
    aiClient.trackTrace({message: "procese.on.exit:end"});
    console.log("procese.on.exit:end");
})

app.http('HttpExample', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);
        return {
            body: "Hi"
        };
    }
});

app.http('Crash', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Crash!"`);
        process.exit(1);
    }
});


app.http('Timeout', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`noop 10 sec"`); // see host.json "functionTimeout": "00:00:05",
        const _ = await wait(10000); // this will cause functionTimeout, node language worker will be recycled by FunctionsHost
        return {
            body: "Hi"
        };
    }
});
