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

/**
 * End Global Variables
 * Start Helper Functions
 *
 */
const navigation = {
    index: 0, // index of current element on page
    nodes: [], // ref to dom elements for navigation
    positions: [], // snapshot of position of each element, relative to window
};

/**
 * End Helper Functions
 * Begin Main Functions
 *
 */
/* Builds the navigation menu and populates the 'navigation' global object */
const build_navigation = () => {
    const hero = document.querySelector(".main__hero");
    const sections = document.getElementsByTagName("section");

    navigation.nodes = [hero, ...sections];
    // navigation.positions = Array(navigation.nodes.length);

    const nav = document.querySelector(".navbar__menu");
    const nav_list = document.querySelector("#navbar__list");

    let nav_html = `<li><a href="#" data-index="0" class="menu__link">home</a></li>`;
    navigation.positions.push({});
    for (let i = 1; i < navigation.nodes.length; i++) {
        nav_html += `<li><a href="#${navigation.nodes[i].id}" data-index="${i}" class="menu__link">${navigation.nodes[i].dataset["nav"]}</a></li>`;
        navigation.positions.push({});
    }

    nav_list.innerHTML = nav_html;
    nav.classList.remove("invisible");

    return nav;
};

/** call back for scroll event to determine which sections currently has focus */
// TOD0: alternate method... it's the component that spans middle 50% of screen that has focus.
//          This way we only need to trigger every 25% of screen scroll.
const determine_focus = (event) => {
    //The vertical window range is 0..vp_height
    const vp_height =
        window.clientHeight || document.documentElement.clientHeight;
    const zone_top = Math.floor(vp_height / 4);
    const zone_bottom = zone_top * 3;

    //  console.log(`frame: 0 to ${vp_height}`);

    let max = 0,
        max_index = 0;
    for (let i = 0; i < navigation.nodes.length; i++) {
        //getBoundingClientRect - returns x,y coords relative to the window
        const box = navigation.nodes[i].getBoundingClientRect();
        const pos = navigation.positions[i];

        [pos.top, pos.bottom, pos.px_in_zone] = [box.top, box.bottom, 0];
        // console.log(`pos[${i}] is ${pos.top}, ${pos.bottom}`);

        if (pos.top < zone_top) {
            if (pos.bottom > zone_bottom) {
                pos.px_in_zone = zone_bottom - zone_top;
            } else if (pos.bottom > 0) {
                pos.px_in_zone = pos.bottom - zone_top;
            }
        } else if (pos.top < zone_bottom) {
            // console.log(1);
            if (pos.bottom < zone_bottom) {
                // console.log(2);
                pos.px_in_zone = pos.bottom - pos.top;
            } else {
                // console.log(3);
                pos.px_in_zone = zone_bottom - pos.top;
            }
        }

        if (pos.px_in_zone > max) {
            max = pos.px_in_zone;
            max_index = i;
        }
        //Todo: optimise...
        //- step 1: exit 1. on 100% and on first 0% after percentages obtained...
        //- step 2: only check active element and element above and below... the others do not matter.
    }

    if (navigation.index != max_index) {
        // console.log("activate this: " + max_index);
        navigation.nodes[navigation.index].classList.remove(
            "your-active-class"
        );
        navigation.index = max_index;
        navigation.nodes[max_index].classList.add("your-active-class");
    }
    // console.log(navigation.positions);
};
//TODO: why don't I required this closure? so that callback has access to globals
const get_determine_focus = () => {
    return determine_focus;
};

const handle_nav_click = (event) => {

    //only process for clicks on anchors
    if (!event.target.classList.contains('menu__link')) return;
    event.preventDefault();

    // console.log(`nav has been clicked ${event.target}`);
    const node_index = event.target.dataset["index"];
    // console.log(`selects index: ${index}`);

    // navigation.nodes[index].scrollIntoView(false, {behavior: 'auto'});

    //hacky smooth scrolling 10 steps over 1 second
    const delta = navigation.nodes[node_index].getBoundingClientRect()["top"] - 52;
    console.log(navigation.nodes[node_index].getBoundingClientRect());
    const distance = Math.abs(delta);
    const direction = delta > 0 ? "up" : "down";
    
    console.log(`distance: ${distance} -> half: ${distance/2} :: ${direction}`);

    /** worked it out ... not really needed */
    // window.scrollBy({left: 0, top: delta, behavior: 'smooth' });
    // return;

    //TODO: build ease-in-out algorithm.
    let increments = [];
    let traveled = 0;
    const mult = 1.5; // theoretically, factors of 2 should be faster...

    // let index = 0;
    let increment = 10;
    let index = 0;
    while (traveled < distance) {
        const inc_delta = (increment > distance - traveled) ? distance - traveled : increment;
        traveled += inc_delta;
        increments.push(inc_delta);

        if (traveled < distance / 2) {          //still accelerating
            
            const dist_to_half = distance/2 - traveled;
            const next_inc   = Math.ceil(increment*mult);

            if (increment >= dist_to_half) {
                // Add to current index and traveled
                // next increment is the same, but decelerating. Keep increment unchanged
                increments[index]+=dist_to_half;
                increments.push(increment+dist_to_half);
                traveled+=increment + dist_to_half*2;
                increment = increments[index-1] || 0;
                index--;
            } else if (next_inc > dist_to_half) {
                if (0.75*next_inc < dist_to_half) {
                    // add 2 smaller steps to queue, keep increment unchanged
                    increments.push( dist_to_half );
                    increments.push( dist_to_half );
                } else {
                    // skip to opposite side - larger step, keep increment unchanged.
                    increments.push( dist_to_half*2 );
                }
                // add to traveled, index remains unchanged
                traveled+=dist_to_half*2;
            } else {
                increment = next_inc;
                index++;
            }
        } else {        //decelerate
            // increments are already defined on the accelerating end
            index--;
            increment = increments[index] || increments[0];
            
            //needed?
            if (increment < increments[0]) {
                increment = increments[0];
            }
        }
    }
    
    console.log(`distance: ${distance} -> half: ${distance/2} :: ${direction}`);
    console.log(`total: ${increments.reduce( (acc, cur) => acc + cur)}`);
    console.log(increments);

    const fps = 25;
    const interval = Math.floor(1000 / fps);

    index = 0;

    const smooth_scroll = () => {
        if (index < increments.length) {
            const scroll_delta = (direction == "up") ? increments[index] : -increments[index];
            window.scrollBy({left: 0, top: scroll_delta, behavior: 'auto' });
            setTimeout(smooth_scroll, interval);
            index++;
        }
    };

    smooth_scroll();
};

/**
 * End Main Functions
 * Begin Events
 *
 */

document.addEventListener("DOMContentLoaded", (event) => {
    // Build menu
    const nav = build_navigation();

    // Scroll to section on link click
    nav.addEventListener("click", handle_nav_click);

    // Set sections as active
    //TODO: optimise for performance
    window.addEventListener("scroll", determine_focus);
});
