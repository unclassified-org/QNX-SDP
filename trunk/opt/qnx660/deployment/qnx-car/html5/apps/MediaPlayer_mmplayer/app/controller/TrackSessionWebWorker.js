/*
 * The current track session length
 */
var trackSessionLength = 0,

    /*
     * The current index of loaded items in the track session
     */
    currentIndex = 0,

    /*
     * Config value the current maximum size that we will ask to be loaded
     */
    chunkLength = 25,

    /*
     * Config value how long we will wait before asking the Media Player controller to load more tracks
     * This has to be here otherwise we will continue to request loads and the ui will be come unresponsive
     */
    timeout = 200,

    /*
     * State variable which denotes if we are currently in the process of fetchign the items in the track session
     */
    fetchingChunk = false;

/*
 * Add event listener for messages being passed to the worker and delegate actions based on the command
 */
self.addEventListener('message', function(e) {
    switch (e.data.command) {
        case "Created":
            handleCreate(e.data);
            break;
        case "Append":
            handleAppend(e.data);
            break;
        case "Fetch_Complete":
            fetchComplete();
            break;
        case "Fetch_Failed":
            fetchFailed();
            break;
        case "Reset":
            reset();
            break;
        default:
            throw ("Unknown command received from the controller: '" + e.data.command + "'");
    }
}, false);
var handleCreate = function(e) {
    trackSessionLength = e.data.length;
    currentIndex = 0;
    fetchChunk(trackSessionLength);
};
/*
 * Function to handle an append event. Sets the trackSessionLength and fetching state
 * and begins the fetching process
 */
var handleAppend = function(e) {
    trackSessionLength += e.data.length - trackSessionLength;
    if (fetchingChunk === false) {
        fetchChunk(chunkLength);
    }
};

/*
 *  Function to prepare the values for the fetch request in the Media Player Controller
 */
var fetchChunk = function(length) {
    var chunk = (currentIndex + length) > trackSessionLength ? trackSessionLength - currentIndex : length;
    fetchingChunk = true;
    // Send the fetch request off to the Media Player Controller
    postMessage({
        command: "Fetch_Items",
        offset: currentIndex,
        limit: chunk
    });
    currentIndex += chunk;
};

/*
 * Function to handle a successful fetch result and determine if we have loaded the whole tracksession or not
 */
var fetchComplete = function() {
    if (currentIndex < trackSessionLength) {
        setTimeout(function() {
            fetchChunk(chunkLength);
        }, timeout);
    } else {
        fetchingChunk = false;
        postMessage({
            "command": "TrackSession_Loaded"
        });
    }
};

/*
 * Function to handle what happens when we fail to fetch a tracksession chunk
 * TODO: Determine what should happen in this case
 * Perhaps try again a few more times?
 */
var fetchFailed = function() {
    throw ("Critical Failure: Fetch operation failed, cannot continue loading TrackSession");
};
/*
 * Function to reset the state of the web worker for a new track session
 */
var reset = function() {
    trackSessionLength = 0;
    currentIndex = 0;
};