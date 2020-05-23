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
    index: 0,           // index of current element on page
    nodes: [],          // ref to dom elements for navigation
    positions: []       // snapshot of position of each element, relative to window
};

/**
 * End Helper Functions
 * Begin Main Functions
 * 
*/
/* Builds the navigation menu and populates the 'navigation' global object */
const build_navigation = () => {

    const hero = document.querySelector('.main__hero');
    const sections = document.getElementsByTagName('section');
    
    navigation.nodes = [hero, ...sections];
    // navigation.positions = Array(navigation.nodes.length);
    
    const nav = document.querySelector('.navbar__menu');
    const nav_list = document.querySelector('#navbar__list');

    let nav_html = `<li><a href="#" data-index="0" class="menu__link">home</a></li>`;
    navigation.positions.push({});
    for (let i = 1; i < navigation.nodes.length; i++) {
        nav_html += `<li><a href="#${navigation.nodes[i].id}" data-index="i" class="menu__link">${navigation.nodes[i].dataset['nav']}</a></li>`;
        navigation.positions.push({});
    }

    nav_list.innerHTML = nav_html;
    nav.classList.remove('invisible');
};

/** call back for scroll event to determine which sections currently has focus */
// TOD0: alternate method... it's the component that spans middle 50% of screen that has focus.
//          This way we only need to trigger every 25% of screen scroll.
const determine_focus = (event) => {

    //The vertical window range is 0..vp_height
    const vp_height = window.clientHeight || document.documentElement.clientHeight;

    //  console.log(`frame: 0 to ${vp_height}`);

    let max = 0, max_index = 0;
    for (let i=0; i<navigation.nodes.length; i++) {
        
        //getBoundingClientRect - returns x,y coords relative to the window
        const box = navigation.nodes[i].getBoundingClientRect();
        const pos = navigation.positions[i];
        
        [pos.top, pos.bottom, pos.height_in_vp] = [box.top, box.bottom, 0];
        // console.log(`pos[${i}] is ${pos.top}, ${pos.bottom}`);
        
        if (pos.top < 0) {
            if (pos.bottom > vp_height) {
                pos.vp_factor = vp_height;
            } else if (pos.bottom > 0) {
                pos.height_in_vp = pos.bottom;
            }
        } else if (pos.top < vp_height) {
            // console.log(1);
            if (pos.bottom < vp_height) {
                // console.log(2);
                pos.height_in_vp = pos.bottom - pos.top;
            } else {
                // console.log(3);
                pos.height_in_vp = vp_height - pos.top;
            }
        }

        if (pos.height_in_vp > max) {
            max = pos.height_in_vp;
            max_index = i;
        }
        //Todo: optimise...
        //- step 1: exit 1. on 100% and on first 0% after percentages obtained...
        //- step 2: only check active element and element above and below... the others do not matter.
    }

    if (navigation.index != max_index) {
        console.log("activate this: " + max_index);
        navigation.nodes[navigation.index].classList.remove('your-active-class');
        navigation.index = max_index;
        navigation.nodes[max_index].classList.add('your-active-class')
    }
    // console.log(navigation.positions);
    
}
//TODO: why don't I required this closure? so that callback has access to globals
const get_determine_focus = () => {
    return determine_focus;
}

// Add class 'active' to section when near top of viewport


// Scroll to anchor ID using scrollTO event


/**
 * End Main Functions
 * Begin Events
 * 
*/

document.addEventListener('DOMContentLoaded', (event) => {
    
    // Build menu 
    build_navigation();

    // Scroll to section on link click

    // Set sections as active
    //TODO: optimise for performance
    window.addEventListener('scroll', determine_focus);
    
    
});