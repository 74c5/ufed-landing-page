const scroller = {
    scrolling : false,
    scrolling_to: false,
    distance  : 0,
    start_pos : 0,
    target_pos: 0,
    timeout   : 5000
}


const scroll_to_with_lock = (target) => {
    scroller.start_pos  = document.documentElement.getBoundingClientRect()['top'];
    scroller.target_pos = -target; // calculate from provided element
    scroller.scrolling_to = true;
    
    //TODO: add limiter so that can't scroll past the end of page

    console.log(`starting from: ${scroller.start_pos}`);
    console.log(`scrolling to: ${scroller.target_pos}`);

    window.scrollTo({left: 0, top: target, behavior: 'smooth'})
    
    //set a long time out to re-enable normal scroll handler
    // since user may interfere with auto scroll
    setTimeout(() => scroller.scrolling_to = false, scroller.timeout);
};

const scroll_to_handler = (event) => {

    if (scroller.scrolling_to) {
        const top = document.documentElement.getBoundingClientRect()['top'];
        const thresh = 2;
        const remaining = Math.abs(top - scroller.target_pos);
        console.log(`eh: ${remaining} > ${thresh} ?`)
        if (remaining > thresh) {
            return;
        } else {
            scroller.scrolling_to = false;
            console.log(`Stopped blocking scroll handler at ${top}`);
        }
    }
    
    console.log(`Normal scroll handler for pos: ${document.documentElement.getBoundingClientRect()['top']}`);

};

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

    document.addEventListener('scroll', scroll_to_handler);
});