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

let navvy   = null;
let scrolly = null;
let tracky  = null;


/**
 * Instantiate and hookup functionality
 */
document.addEventListener("DOMContentLoaded", (event) => {
    // instantiate objects
    navvy   = new Nav();
    scrolly = new Scroller();
    
    const elements = navvy.build();
    tracky  = Tracker(elements);    // see file for why new is not used

    // wire them up
    navvy.onClick = scrolly.scroll.bind(scrolly);
    scrolly.callbacks.push(tracky.update);          // note: bind not required, Tracker has no this. syntax

    // enable event handlers
    navvy.register();
    scrolly.register();

    // resets
    tracky.reset();
});
