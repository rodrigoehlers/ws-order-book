# Questions
#### 1. What would you add to your solution if you had more time?
- Add more unit tests to increase code testing coverage.
- Add and integrations tests since the application currently has none.

- Add an option to specify one or multiple `productId`'s in the UI rather than in an environment variable.
- Add actual support for viewing multiple `productId`'s in the UI.

- Maybe even make use of the interface based approach and try implementing the view with a completely different WebSocket based order book API.

- Find a more elegant solution for the controls and save the latest settings to the browser storage or provide them as query parameters.
- Make the number of lines in the tables adjustable instead of fixed to 7.

#### 2. What would you have done differently if you knew this page was going to get thousands of views per second vs per week?

If I would've had the same time to complete the task:

- Most likely spend less time on the actual UI design and more time on unit and integration tests.

If I would've had more time:

- Draw a draft version of the UI before starting to write code.
- Plan the architecture of the UI logic (WebSocket connection, updating in-memory data etc...) before writing any code. 
- Take some time and do performance tests, especially on mobile devices.

#### 3. What was the most useful feature that was added to the latest version of your chosen language? Please include a snippet of code that shows how you've used it.

I really enjoy optional-chaining although that isn't that new anymore and it doesn't come into use that often when using TypeScript in a structured way.

The only place I used it in this project:

```js
// integrations/crypto-facilities-order-book.ts
open() {
    const rs = this.ws?.readyState; // Optional Chaining!
    if (!rs || rs === 2 || rs === 3) {
        this.ws = new WebSocket(`wss://${this.endpoint}`);
        this.ws.onopen = this.onWebSocketOpen;
        this.ws.onmessage = this.onWebSocketMessage;
        this.ws.onerror = this.onWebSocketError;
        this.ws.onclose = this.onWebSocketClose;
    }
}
```

Other things I really enjoy are Interfaces, Enums, Tuples and Generics, though most of them have been in TypeScript for a long time now.
All of them were used in this project in various places.

#### 4. How would you track down a performance issue in production? Have you ever had to do this?

Start by finding what version of the application introduced the performance issue. 
Try tracking down the area of where the problematic code could lie by commenting out non-relevant parts of the UI (trial and error approach).
When found try looking at the code first to see whether there is something obviously wrong.

Last resort would be to use the Chrome Performance Tools which I'm only very little familiar with.
I've never found out much about a particular situation when using them. However, this could be due to no actual performance issue existing when I was using the Chrome Performance Tools.

Looking forward to hopefully use them more in the future.

I have little experience when it comes to very detailed performance issues/improvements. 
I definitely try to write my code as performant as possible though I have never actually measured it, only applied best practises learned while acquiring my bachelors degree or through experience. 

#### 5. Can you describe common security concerns to consider for a frontend developer?

- XSS attacks and input validation/sanitation. However, React for example already makes it very difficult to render potentially malicious content to the page.
- CSRF is also a thing to keep in mind, especially when dealing with forms.
- Generally making sure no sensitive data is displayed if not explicitly requested, whereas _displaying_ in this context means exposing in any way (network requests for example). (Might be more of a backend issue though.) 

#### 6. How would you improve the Kraken API that you just used?

I really like the format it uses since it saves bandwidth for each delta update compared to say a labelled JSON Object containing `"price": 45000` and `"amount": 10000` for each ask or bid update.

The only thing I personally would see as an improvement would be the addition of options of available feeds. 
However, those options are perfectly fine to come from another API or to even be hardcoded and require a new deployment to update if they're unlikely to change.

If you now completely ignore backend workload (which you shouldn't, given it's a high performance realtime API) it would obviously be very nice to include the calculated totals in the API responses, from a UI point of view, since most of the actually complex code in this project would then not be needed anymore.