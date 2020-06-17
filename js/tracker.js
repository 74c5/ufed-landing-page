// I'm not sure where I first saw this design pattern.
// It seems a bit of a BLC of IIFEs (in way) and java factories.
// Use a self contained 'constructor' function - and closures for private data/methods. 
// Is appealing for front end design because it doesn't mess all over global state.
// - syntactic sugar for classes (new, this, prototype)
// - inheritance is somewhat tricker/more manual (incomplete).
// + no binding, when passing methods to other objects.

/**
 * Creates object to track which document element is active. Seed with the elements which you
 * wish to have tracked.
 * 
 * @param {[HTMLElement]} elements 
 * 
 * Initialization:
 *      const tracker = Tracker([...elements]);
 *
 * Usage:
 *      tracker.reset();
 *      tracker.update();
 *      
 */
export const Tracker = (elements) => {
    // private fields
    let   index    = -1;                  // index of currently active element
    const viewport = {top: 0, height: 0}; // snapshot of several viewport parameters, 
                                          //    used to improve performance during update
    const tracked  = elements;            // list of tracked elements

    /**
     * Returns the number of vertical pixels of an element withing the specified target zone.
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
                return box.bottom - box.top;
            } else {
                return zone_bottom - box.top;     // element stretches past bottom
            } 
        }
        return 0;                                 // element not in zone
    }


    /**
     * Triggers a hard reset of the page element give focus
     * Used for page resizes, but otherwise should not be needed
     * Also, keep for debug and maybe future features
     */
    const reset = () => {
        // snapshot the viewport parameters
        viewport.height = document.documentElement.clientHeight,
        viewport.top    = document.documentElement.scrollTop

        index = -1;
        update();
    }
    
    /**
     * Determine the element currently occupying the main part of the viewport
     * Focus area is hard-coded to middle half of the viewport
     */
    const update = () => {
        const zone_top    = Math.floor(document.documentElement.clientHeight / 4);
        const zone_bottom = zone_top * 3;
        
        let max_index = index;
        let max = 0;
        if (tracked[max_index]) {
            max = get_pixels_in_zone(tracked[max_index], zone_top, zone_bottom);
        }
        let i_up = max_index-1, i_down = max_index+1;
        
        const range = zone_bottom - zone_top;
        let total = max;    
        
        // Check elements up and down from the current position while...
        // - we have a reason to expect there will be an element that takes up a significant portion
        //   of the target zone
        // - there are still elements to evaluate
        while (total < 0.9*range && (i_up >= 0 || i_down < tracked.length)) {
            if (i_up >= 0) {
                const up_in_zone = get_pixels_in_zone(tracked[i_up], zone_top, zone_bottom);
                max_index = (up_in_zone > max) ? i_up : max_index;
                total += up_in_zone;
                i_up--;
            }
            
            if (i_down < tracked.length) {
                const down_in_zone = get_pixels_in_zone(tracked[i_down], zone_top, zone_bottom);
                max_index = (down_in_zone > max) ? i_down : max_index;
                total += down_in_zone;
                i_down++;
            }
        }
        
        // process a change in active element
        if (index != max_index) {
            if (tracked[index]) {
                tracked[index].classList.remove("your-active-class");
            } 
            tracked[max_index].classList.add("your-active-class");
            index = max_index;
        }
    }
    
    /**
     * First screen to see if we have moved a significant part of the viewport before triggering
     * an update
     */
    const screenAndUpdate = () => {
        // The vertical window range is 0..vp_height
        const height = document.documentElement.clientHeight;
        const top    = document.documentElement.scrollTop;    //todo: use getBoundingClientRect -- for actual top position
        const threshold = Math.floor(height / 4);
        
        if (height != viewport.height) {
            // viewport dimensions have changes since last scroll event, trigger reset
            reset();
        } else if (Math.abs(top - viewport.top) > threshold ) {
            // threshold is exceeded re-calculate focus
            viewport.top = top;
            update();
        }
    }

    /** Return public interface */
    return {
        // public fields methods
        reset  : reset,
        update : screenAndUpdate
    }
};