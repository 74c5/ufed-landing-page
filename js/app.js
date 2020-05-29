/**
 *
 * Manipulating the DOM exercise.
 * Exercise programmatically builds navigation,
 * scrolls to anchors from navigation,
 * and highlights section in viewport upon scrolling.
 *
 * Dependencies: None
 *
 * JS Version: ES2015/ES6
 *
 * JS Standard: ESlint
 *
 */

/**
 * Define Global Variables
 *
 */

const nav = {
    index: -1,          // index of current 'focused' element on page
    navbar: null,       // reference to top level navbar component
    elements: [],       // ref to dom elements for navigation
};

const tracker = {       // Configuration for active element tracking
    enabled: false,     // restricts focus updates while menu triggered scroll
    viewport: {},       // snapshot of viewport parameters, used by scroll to improve performance
}

// TODO : separate into maybe 3 objects/functions (and files) - or two but separate interfaces better
//  - nav      : builds menu - provides output for others
//  - tracker  : determines which element is active, provides functions for onscroll
//  - scroller : methods for scrolling - hooks for other functions, e.g. disabling tracker

/**
 * End Global Variables
 * Start Helper Functions
 *
 */

// scrolling using experimental scrollIntoView function
//   https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
//   does not allow for offset for menu
const scrollIntoView = (element) => {
    tracker.enabled = false;       //prevent scroll handler function from updating

    element.scrollIntoView({behavior: 'smooth', block: 'start'});

    tracker.enabled = true;  // todo: not sure this will work as well as I think, may need a timeout...
}


/**
 * Scroll to Element using window.scrollBy
 * 
 * @param {HTMLElement} element target element for scroll
 * @param {Number} offset       Number of pixels from top of frame that the element should be at end of scroll
 */
const scrollTo = (element, offset=0) => {
    tracker.enabled = false;      //prevent scroll handler function from updating

    const delta = element.getBoundingClientRect()["top"] - offset;

    window.scrollBy({left: 0, top: delta, behavior: 'smooth' });
    // update of focus must be delayed until scrolling has finished or request animation frame?
    setTimeout( () => { 
                tracker.enabled = true;
                determine_active();
    }, 500) //TODO: do better than guess-timate the duration of a menu scroll
}

/**
 * Custom scrolling function - uses easy in - out algorithm (i.e. accelerates faster over middle distances)
 * During the first frame distance to element is scrolled by start_inc, on each subsequent frame
 * scroll distance is increased by the multiplier until the halfway point; then it is decreased
 * 
 * @param {HTMLElement} element target element for scroll    
 * @param {Number} offset       Number of pixels from top of frame that the element should be at end of scroll
 * @param {Number} fps          Frames per second, used to calculate the update rate for scrolling
 * @param {Number} start_inc    scroll increment for the first frame
 * @param {Number} mult         Each subsequent frame should be this factor of the previous frame's scroll amount 
 */
const scrollCustom = (element, offset=0, fps=25, start_inc=10, mult=1.5) => {

    tracker.enabled = false;      //prevent scroll handler function from updating
    
    const delta     = element.getBoundingClientRect()["top"] - offset;
    const distance  = Math.abs(delta);
    const halfway   = distance/2;
    const direction = delta > 0 ? "up" : "down";

    // Calculate the scroll increments for each frame
    let increments = [];
    let traveled = 0;
    let increment = start_inc;
    let index = 0;

    while (traveled < distance) {
        // stops overshoot of the total distance, if calculated increment is greater than remaining distance
        const inc_delta = (increment > distance - traveled) ? distance - traveled : increment;

        // store the current increment amount
        traveled += inc_delta;
        increments.push(inc_delta);

        if (traveled > halfway) {          //decelerate
            // distance are defined while accelerating, we can just pop the
            // read the next one off the array
            index--;
            increment = increments[index] || increments[0];
        
        } else {        // accelerate
            const dist_to_half = halfway - traveled;
            const next_inc     = Math.ceil(increment*mult);

            if (dist_to_half > next_inc) {      // next increment will not overflow halfway
                increment = next_inc;       
                index++;

            } else {                             // next increment will overflow halfway
                // Make different adjustments depending on how much the next frame increment
                // will overlap the halfway mark.
                if (dist_to_half < increment ) {
                    // Even if we scrolled across the halfway to the identical point on the 
                    // decelerating side, the next frame scroll would be smaller than this one.
                    // Therefore, add the remaining distance to halfway onto this frame
                    increments[index] += dist_to_half;
                    // push the first frame on the descending edge
                    increments.push(increment+dist_to_half);

                    traveled += increment + dist_to_half*2;    // adjust traveled
                    // prep the first frame on descending side to be same as previous one
                    index--;
                    increment = increments[index] || 0;
                } else if (next_inc < dist_to_half*3/2) { 
                    // A single frame to opposite end would be too big, 
                    // it gets less than 1/2 way to opposite side
                    // Push two smaller steps
                    increments.push( dist_to_half );
                    increments.push( dist_to_half );
                    traveled+=dist_to_half*2;                // adjust traveled
                    // next used increment will be the same as this iteration
                    // so leave index unchanged
                } else {
                    // Push a slightly larger next increment onto queue
                    // between 50% and 125% of calculated value
                    increments.push( dist_to_half*2 );
                    
                    traveled+=dist_to_half*2;                // adjust traveled
                    // next used increment will be the same as this iteration
                }
            }
        }
    }
    
    // define scrolling frame function
    const frame_rate = 1000/fps;            //TODO: place a limiter on the frame_rate?
    const my_scroll = () => {
        const scroll_delta = (direction == "up") ? increments.pop() : -increments.pop();
        if (increments.length > 0) {
            setTimeout(my_scroll, frame_rate);
        } else {
            tracker.enabled = true;
        }
        window.scrollBy({left: 0, top: scroll_delta, behavior: 'auto' });
    };

    //trigger scrolling
    my_scroll();
}


/**
 * Returns the number of vertical pixels of an element withing the specified target zone.
 * 
 * @param {HTMLElement} element element to be evaluated
 * @param {Number} zone_top 
 * @param {Number} zone_bottom 
 * @returns {Number} Number of Pixels in the withing the target zone
 */
const get_pixels_in_zone = (element, zone_top=0, zone_bottom=document.documentElement.clientHeight) => {
    const box = element.getBoundingClientRect();

    if (box.top < zone_top) {                 // element starts above zone
        if (box.bottom > zone_bottom) {       // element spans entire zone
            return zone_bottom - zone_top;
        } else if (box.bottom > zone_top) {   // element partially in zone
            return box.bottom - zone_top;
        }
    } else if (box.top < zone_bottom) {       // starts between top and bottom
        if (box.bottom < zone_bottom) {       // element span within zone
            return box.bottom - pos.top;
        } else {
            return zone_bottom - box.top;     // element stretches past bottom
        } 
    }
    return 0;                                 // element not in zone
}


/**
 * End Helper Functions
 * Begin Main Functions (including event handlers)
 *
 */

 /**
  * Builds the navigation menu and populates the 'navigation' global object 
  */
 const build_navigation = () => {
    const navbar = document.querySelector(".navbar__menu");
    const nav_list = document.querySelector("#navbar__list");
    
    const hero = document.querySelector(".main__hero");
    const sections = document.getElementsByTagName("section");

    // buffer element references for scrolling and determining focus
    nav.elements = [hero, ...sections];

    // build nav as html string
    let nav_html = `<li><a href="#" data-index="0" class="menu__link">home</a></li>`;
    for (let i = 1; i < nav.elements.length; i++) {
        nav_html += `<li><a href="#${nav.elements[i].id}" data-index="${i}" class="menu__link">${nav.elements[i].dataset["nav"]}</a></li>`;
    }

    nav_list.innerHTML = nav_html;
    
    navbar.classList.remove("invisible");      // nav should be hidden until it is built

    nav.navbar = navbar;
};


/**
 * Triggers a hard reset of the page element give focus
 * Used for page resizes, but otherwise should not be needed
 * Also, keep for debug and maybe future features
 */
const reset_active = () => {
    // snap shot - viewport parameters
    tracker.viewport = {
        height: document.documentElement.clientHeight,
        top:    document.documentElement.scrollTop
    };

    nav.index = -1;

    determine_active();
    tracker.enabled = true;
}

/**
 * Determine the element currently occupying the main part of the viewport
 * Focus area is hard-coded to middle half of the viewport
 */
const determine_active = () => {

    const zone_top    = Math.floor(document.documentElement.clientHeight / 4);
    const zone_bottom = zone_top * 3;
    
    let max_index = nav.index;
    let max = 0;
    if (nav.elements[max_index]) {
        max = get_pixels_in_zone(nav.elements[max_index], zone_top, zone_bottom);
    }
    let i_up = max_index-1, i_down = max_index+1;
    
    const range = zone_bottom - zone_top;
    let total = max;    

    // Check elements up and down from the current position while...
    // - we have a reason to expect there will be an element that takes up a significant portion
    //   of the target zone
    // - there are still elements to evaluate
    while (total < 0.9*range && (i_up >= 0 || i_down < nav.elements.length)) {
        if (i_up >= 0) {
            const up_in_zone = get_pixels_in_zone(nav.elements[i_up], zone_top, zone_bottom);
            max_index = (up_in_zone > max) ? i_up : max_index;
            total += up_in_zone;
            i_up--;
        }

        if (i_down < nav.elements.length) {
            const down_in_zone = get_pixels_in_zone(nav.elements[i_down], zone_top, zone_bottom);
            max_index = (down_in_zone > max) ? i_down : max_index;
            total += down_in_zone;
            i_down++;
        }
    }

    // process a change in active element
    if (nav.index != max_index) {
        if (nav.elements[nav.index]) {
            nav.elements[nav.index].classList.remove("your-active-class");
        } 
        nav.elements[max_index].classList.add("your-active-class");
        nav.index = max_index;
    }
}



/**
 * End Main Functions
 * Begin Events Handlers
 *
 */

/** Handles the clicks on the nav menu */
const handle_nav_click = (event) => {
    
    // only clicks on menu links. i.e. ignore clicks on the parent div
    if (!event.target.classList.contains('menu__link')) return;
    
    event.preventDefault();         // prevent std link jump

    const index = Number(event.target.dataset["index"]);

    // TODO: selector of three options of scrolling
    // scrollIntoView(nav.elements[index]);      // uses experimental el.scrollIntoView - does not allow for height of nav
    const offset = nav.navbar.getBoundingClientRect()['height'];
    // scrollTo(nav.elements[index], offset);
    scrollCustom(nav.elements[index], offset);
}


/** 
 * call back for scroll event to determine which section is active 
 */
const handle_scroll = (event) => {

    if (!tracker.enabled) return;  // don't update if the navbar is auto scrolling

    //The vertical window range is 0..vp_height
    const height = document.documentElement.clientHeight;
    const top    = document.documentElement.scrollTop;
    const threshold = Math.floor(height / 4);

    if (height != tracker.viewport.height) {
        // viewport dimensions have changes since last scroll event, trigger reset
        reset_active();
        tracker.viewport.height = height;
        tracker.viewport.top    = top;
    } else if (Math.abs(top - tracker.viewport.top) > threshold ) {
        // threshold is exceeded re-calculate focus
        determine_active();
        tracker.viewport.top = top;
    }
}    



/**
 * End Event Handlers
 * Begin Events
 *
 */

document.addEventListener("DOMContentLoaded", (event) => {
    // Build menu
    build_navigation();

    // Scroll to section on link click
    nav.navbar.addEventListener("click", handle_nav_click);

    // Set sections as active
    window.addEventListener("scroll", handle_scroll);

    // Todo: add a listener for screen resize events....

    // force and update of the active element
    // TODO: is this needed?
    reset_active();
});
