const scroller = {
    scrolling : false,
    distance  : 0,
    start_pos : 0,
    timeout   : 5000
}


const scroll_with_lock = (amount) => {
    scroller.start_pos = document.documentElement.getBoundingClientRect()['top'];
    scroller.distance  = Math.abs(amount);
    scroller.scrolling = true;
    
    //TODO: add limiter so that can't scroll past the end of page

    console.log(`starting from: ${scroller.start_pos}`);
    console.log(`scrolling for: ${scroller.distance}`);

    window.scrollBy({left: 0, top: amount, behavior: 'smooth'})
    
    //set a long time out to re-enable normal scroll handler
    // since user may interfere with auto scroll
    setTimeout(() => scroller.scrolling = false, scroller.timeout);
};


const scroll_handler = (event) => {
    
    console.log(event);

    if (scroller.scrolling) {
        const top = document.documentElement.getBoundingClientRect()['top'];
        const thresh = 0;
        const traveled = Math.abs(scroller.start_pos - top);
        if (traveled < scroller.distance - thresh) {
            return;
        } else {
            scroller.scrolling = false;
            console.log(`Scrolling block stopped at ${top} after ${traveled}`);
        }
    }
    
    console.log(`Normal scroll handler for pos: ${document.documentElement.getBoundingClientRect()['top']}`);

};


document.addEventListener('DOMContentLoaded', (event) => {
    console.log('Hello');

    document.addEventListener('scroll', scroll_handler);
});