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
    index: 0,         // index of current 'focused' element on page
    scrolling: false, // restricts focus updates while menu triggered scroll
    vp_pos: {},       // used by on_scroll to improve performance
    elements: [],        // ref to dom elements for navigation
    //TODO: remove
    positions: [],    // snapshot of position of each element, relative to window
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

    navigation.elements = [hero, ...sections];

    const nav = document.querySelector(".navbar__menu");
    const nav_list = document.querySelector("#navbar__list");

    let nav_html = `<li><a href="#" data-index="0" class="menu__link">home</a></li>`;
    navigation.positions.push({});
    for (let i = 1; i < navigation.elements.length; i++) {
        nav_html += `<li><a href="#${navigation.elements[i].id}" data-index="${i}" class="menu__link">${navigation.elements[i].dataset["nav"]}</a></li>`;
        navigation.positions.push({});
    }

    nav_list.innerHTML = nav_html;
    nav.classList.remove("invisible");

    navigation.vp_pos = {
        height: window.clientHeight || document.documentElement.clientHeight,
        // force and update
        top:    window.clientHeight || document.documentElement.clientHeight,
        // top:    window.scrollY || document.documentElement.scrollTop
    };
    return nav;
};


const handle_nav_click = (event) => {
    console.log(navigation);
    //only process for clicks on anchors
    if (!event.target.classList.contains('menu__link')) return;
    event.preventDefault();

    // console.log(`nav has been clicked ${event.target}`);
    const node_index = event.target.dataset["index"];
    // console.log(`selects index: ${index}`);

    // experimental - also unable to add and offset for menu height
    // navigation.elements[node_index].scrollIntoView(false)
    // navigation.elements[node_index].scrollIntoView({behavior: 'smooth', block: 'start'});
    // return;

    const delta = navigation.elements[node_index].getBoundingClientRect()["top"] - 52;
    console.log(navigation.elements[node_index].getBoundingClientRect());
    const distance = Math.abs(delta);
    const direction = delta > 0 ? "up" : "down";
    
    console.log(`distance: ${distance} -> half: ${distance/2} :: ${direction}`);

    navigation.scrolling = true;
    //navigation.index = Number(node_index); - stops highlighting based on determine focus

    /** worked it out ... custom scroll is not really needed */
    // window.scrollBy({left: 0, top: delta, behavior: 'smooth' });
    // setTimeout( () => { 
    //     navigation.scrolling = false;
    //     window.scrollBy(0,-1);
    // }, 600) //guestimate how long scrolling will take?
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

    const smooth_scroll = () => {
        // console.log(`sc: ${index} -> ${navigation.scrolling}`)

        const scroll_delta = (direction == "up") ? increments.pop() : -increments.pop();
        if (increments.length > 0) {
            setTimeout(smooth_scroll, interval);
        } else {
            navigation.scrolling = false;
        }
        window.scrollBy({left: 0, top: scroll_delta, behavior: 'auto' });
    };

    smooth_scroll();
};


/** call back for scroll event to determine which sections currently has focus */
//  alternate method... the component that spans middle 50% of screen that has focus.
//  This way we only need to trigger every 25% of screen scroll.
const determine_focus = (event) => {

    if (navigation.scrolling) return;
    console.log(`df:? ${navigation.scrolling}`);

    //The vertical window range is 0..vp_height
    const vp_height = window.clientHeight || document.documentElement.clientHeight;
    const vp_top    = window.scrollY || document.documentElement.scrollTop;

    //console.log(event);

    const zone_top = Math.floor(vp_height / 4);
    const zone_bottom = zone_top * 3;

    if (vp_height == navigation.vp_pos.height) {
        if (Math.abs(vp_top - navigation.vp_pos.top) < zone_top ) {
            return;
        }
    }
    console.log(`df:? processing... ${Math.abs(vp_top - navigation.vp_pos.top)} > ${zone_top}`);
    navigation.vp_pos = {height: vp_height, top: vp_top};

    //  console.log(`frame: 0 to ${vp_height}`);


    const calculate_px_in_zone = (index, top, bottom) => {
        if (index >= 0 && index < navigation.elements.length) {
            const box = navigation.elements[index].getBoundingClientRect();

            if (box.top < top) {                 // element starts above zone
                if (box.bottom > bottom) {       // element spans entire zone
                    return bottom - top;
                } else if (box.bottom > top) {   // element partially in zone
                    return box.bottom - top;
                }
            } else if (box.top < bottom) {       // starts between top and bottom
                if (box.bottom < bottom) {       // element span within zone
                    return box.bottom - pos.top;
                } else {
                    return bottom - box.top;     // element stretches past bottom
                } 
            }
        }
        return 0;                                // element not in nav or zone
    }

    let max = calculate_px_in_zone(navigation.index, zone_top, zone_bottom);
    let max_index = navigation.index;
    let i_up = max_index-1, i_down = max_index+1;
    let total = max;
    const range = zone_bottom - zone_top;

    console.log(`df start: ${max_index} -> ${max} :: {range: ${range}, total: ${total}}`);
    let cnt = 0;

    while (total < 0.8*range && cnt < navigation.elements.length) {
        const up_in_zone = calculate_px_in_zone(i_up, zone_top, zone_bottom);
        max_index = (up_in_zone > max) ? i_up : max_index;
        const down_in_zone = calculate_px_in_zone(i_down, zone_top, zone_bottom);
        max_index = (down_in_zone > max) ? i_down : max_index;

        total = total + up_in_zone + down_in_zone;
        console.log(`df step: ${max_index} -> ${max} :: {range: ${range}, total: ${total}}`);
        console.log(`df step sup: {cnt: ${cnt}, up: ${i_up} -> ${up_in_zone}, down: ${i_down} -> ${down_in_zone}}`);
        i_up--;
        i_down++;
        cnt++;
    }

    // let max = 0, max_index = 0;
    // for (let i = 0; i < navigation.elements.length; i++) {
    //     //getBoundingClientRect - returns x,y coords relative to the window
    //     const box = navigation.elements[i].getBoundingClientRect();
    //     const pos = navigation.positions[i];

    //     [pos.top, pos.bottom, pos.px_in_zone] = [box.top, box.bottom, 0];
    //     // console.log(`pos[${i}] is ${pos.top}, ${pos.bottom}`);

    //     if (pos.top < zone_top) {
    //         if (pos.bottom > zone_bottom) {
    //             pos.px_in_zone = zone_bottom - zone_top;
    //         } else if (pos.bottom > 0) {
    //             pos.px_in_zone = pos.bottom - zone_top;
    //         }
    //     } else if (pos.top < zone_bottom) {
    //         // console.log(1);
    //         if (pos.bottom < zone_bottom) {
    //             // console.log(2);
    //             pos.px_in_zone = pos.bottom - pos.top;
    //         } else {
    //             // console.log(3);
    //             pos.px_in_zone = zone_bottom - pos.top;
    //         }
    //     }

    //     if (pos.px_in_zone > max) {
    //         max = pos.px_in_zone;
    //         max_index = i;
    //     }
    //     //Todo: optimise...
    //     //- step 1: exit 1. on 100% and on first 0% after percentages obtained...
    //     //- step 2: only check active element and element above and below... the others do not matter.
    // }

    if (navigation.index != max_index) {
        // console.log("activate this: " + max_index);
        navigation.elements[navigation.index].classList.remove(
            "your-active-class"
        );
        navigation.index = max_index;
        navigation.elements[max_index].classList.add("your-active-class");
    }
    // console.log(navigation.positions);
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
    window.scrollBy(0,1); // force an update (todo: remove hack after update)
});
