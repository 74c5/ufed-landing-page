import { Nav } from './nav.js';
import { Scroller, SCROLL_MODE } from './scroller.js';
import { Tracker } from './tracker.js';

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
//NOTE: 
//  hide these in event listener for production code.
//  kept here to enable debug in console.
let navvy   = null;
let scrolly = null;
let tracky  = null


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


    // trigger a focus refresh for page resizes
    // TODO: 
    //  this sort of works... sometimes results in two sections activated
    //  perhaps need to try deactivating scroll during a resize.
    window.addEventListener('resize', (event) => {
        tracky.reset();
    });

    // scroll selection code
    const select = document.querySelector("#scroll__select");
    const radios = document.querySelectorAll('input[name=scroll_type]');

    const formClick = (event) => {
        let selected = undefined;
        for (let i=0; i<radios.length; i++) {
            if (radios[i].checked) {
                selected = radios[i].value;
                break;
            }
        }
        switch (selected) {
            case 'auto':
                scrolly.mode = SCROLL_MODE.auto;
                break;
            case 'smooth':
                scrolly.mode = SCROLL_MODE.smooth;
                break;
            case 'custom':
                scrolly.mode = SCROLL_MODE.custom;
                break;
            case 'intoView':
                scrolly.mode = SCROLL_MODE.intoView;
                break;
            default:
                break;
        }
    };

    select.addEventListener('click', formClick);
    // call to select default method from html
    formClick();
});
