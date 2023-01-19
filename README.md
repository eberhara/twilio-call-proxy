# twilio-call-proxy

Nodejs service to proxy an incoming Twilio Call to other services

## Overview

**Twilio -> twilio-call-proxy -> Internal backends**

This service works as a proxy which receives the stream of Twilio ongoing phone calls and pipe them to one or more backends so they handle it properly.

The following requirements are supported:
- Proxy ongoing calls to one or more internal backends
- Pin validation so only trusted callers can connect to your service
- Block caller id after if fails to validate the pin after some attempts


## Installation
```
nvm use
npm i
```

## Local development

You can run this server with live reload by:
```
npm run dev
```


### Testing proxy to speaker integration

**Test client (Working as a "Twilio" origin) -> twilio-call-proxy -> Local Speaker**
It is also possible to test on local environment how the data flows through twilio-call-proxy. In order to do that, you will need to start a couple of processes.

First of all, follow the steps described in [Local development section](#local-development).

After that, open a new tab and run the following command (which will open a websocket that mimics a backend that plays a base 64 audio encoded using 'mulaw' - just like Twilio's):
```
npm i speaker
npm run local-speaker
```

After that, you need to mimic Twilio's audio streaming. In order to do that, open another tab and run the following command:
```
npm run client-test
```

It will start a websocket every 10 seconds, send to local twilio-call-proxy the same messages that Twilio does in order to start to broadcast a phone call and finally streams a pre-recorded audio (which mimics the actual phone call). If everything works, you will hear some pre-recorded audio every 10 seconds (test-client -> audio-proxy -> local-speaker, which mimics what would happen in a production flow: twilio -> twilio-call-proxy -> internal-backend).

Done! You can keep working on twilio-call-proxy and feel safe because an integration test will run every 10s against your changes!


### Local development + external phone calls integration

**You must have a Twilio account, a test number and a backend that can handle a Twilio phone call.** If you are not in the mood of setting everything up but still want to see it working, check the [Testing audio-proxy client -> speaker integration](#testing-proxy-to-speaker-integration)

In order to integrate your local twilio-call-proxy with Twilio, you must condigure your Twilio number to trigger a "Studio Flow".
In Studio Flow, you must:
1) Create new Flow
2) Import from JSON - Use [twilio-flow-sample.json](twilio-flow-sample.json)

In order to connect twilio studio flow (external source of phone calls) to your local twilio-call-proxy server, you must expose the websocket port on a public address and update twilio's flow.

After running your server as described in [Local development section](#local-development), expose the socket port using [ngrok](https://ngrok.com/download).

```
ngrok http 8999
```

This will outputs a public address (ex: a6dc-2804-7f4-c780-3941-8d3f-1388-1d0c-66d2.ngrok.io) which can be used by any application to connect to your machine at the given port.

After that, open the Twilio Studio Flow that you just created and look for the `set_variables` widget and update the following properties:
```
WS_PROXY_HOST=<<NGROK_GENERATED_HOST>>
API_HOST=<<NGROK_GENERATED_HOST>>
```

*Do not forget to save the changes on the widget and to save and publish your flow.*

That is pretty much it. Your twilio flow is connected to ngrok host, which points to your local server and you can start to test the integration with your local machine.


### Testing Twilio Integration

You can test twilio integration using two different approaches. Before running any of them, you need to add your personal number as [Twilio's verified called IDs](https://console.twilio.com/us1/develop/phone-numbers/manage/verified?frameUrl=%2Fconsole%2Fphone-numbers%2Fverified%3Fx-target-region%3Dus1).

#### Phone call

You can call directly the phone number that is attached to the desired flow.
To verify active numbers, go to Phone Numbers > Manage > [Active Numbers](https://console.twilio.com/us1/develop/phone-numbers/manage/active?frameUrl=%2Fconsole%2Fphone-numbers%2Fincoming%3Fx-target-region%3Dus1).
*The active number needs to be configured to start the Studio Flow you just created whenever a Voice Call is received*

#### API call

It is also possible to trigger twilio flow by calling an API endpoint. To do that, you'll need a couple of information:
- Flow SID (found at the [list of studio flows](https://console.twilio.com/us1/develop/studio/flows?frameUrl=%2Fconsole%2Fstudio%2Fflows%3Fx-target-region%3Dus1))
- Twilio phone number (the one that you are using for testing purposes - often a trial number)
- Account SID (found at [Twilio console home page](https://www.twilio.com/console))
- Account Secret (found at Twilio console home page](https://www.twilio.com/console))

After gathering all the info, call the API:

```
export FLOW_SID=<<FLOW_SID>>
export TWILIO_NUMBER=<<TWILIO_NUMBER>>
export YOUR_PERSONAL_NUMBER=<<YOUR_PERSONAL_NUMBER>>
export TWILIO_ACCOUNT_SID=<<TWILIO_ACCOUNT_SID>>
export TWILIO_ACCOUNT_SECRET=<<TWILIO_ACCOUNT_SECRET>>
curl -X POST "https://studio.twilio.com/v2/Flows/$FLOW_SID/Executions" --data-urlencode "From=+$TWILIO_NUMBER" --data-urlencode "To=+$YOUR_PERSONAL_NUMBER" -u "$TWILIO_ACCOUNT_SID:$TWILIO_ACCOUNT_SECRET"
```

This call will trigger twilio integration which will call your personal number and then follow all the steps described in the flow - and eventually connect you to this service.


## Validating twilio requests

In order to improve security of this server we implemented a middleware that validates incoming calls to verify whether it is coming from twilio or not.
For **local development it is disabled by default**. To enable external calls validation on local environment, start the server using the following command:
```
VALIDATE_EXTERNAL_CALLS=true npm run dev
```

**IMPORTANT!**: To validate the requests the webserver uses an environment variable TWILIO_AUTH_TOKEN. The value of the auth token can be found at [Twilio Console](https://www.twilio.com/console).
