// NOTE:
//   deliberately written in prototype syntax for practice and comparison
//   with other methods.

/**
 * Scroller class
 *
 * Will scroll to targeted element and implements a handler for scroll events.
 *
 * Callbacks in the array will be blocked while a scroll is commanded, but will be triggered
 * at the end of the commanded scroll. Further optimization is up to the callback.
 *
 * Initialization:
 *      const scroller = new Scroller();
 *      scroller.callbacks = [...];
 *      scroller.register();
 *
 * Usage:
 *      scroller.scroll(targetElement, offsetElement)
 */
function Scroller() {
    this.mode = SCROLL_MODE.custom; // current mode of scroll
    this.target = 0; // destination value for commanded scroll
    this.threshold = 1; // Disable event blocking when within threshold of target
    this.timeout = 5000; // timeout before events will be handled again
    this.blockEvents = false; // a commanded scroll is in progress
    this.callbacks = []; // callback functions to execute in handler
}

const SCROLL_MODE = { auto: 1, smooth: 2, custom: 4, intoView: 8 };

/**
 * call back for scroll event to determine which section is active
 */
Scroller.prototype._handler = function (event) {
    const top = document.documentElement.getBoundingClientRect()["top"];
    if (this.blockEvents) {
        const remaining = Math.abs(top - this.target) - this.threshold;

        if (remaining > 0) return; // continue blocking events

        // disable blocking and resume normal processing
        this.blockEvents = false;
    }

    // console.log(`calling callback at ${top}`);

    this.callbacks.forEach((cb) => {
        cb(event);
    });
};

Scroller.prototype.register = function () {
    document.addEventListener("scroll", this._handler.bind(this));
};

/**
 * Scroll to a target element adding height of source element in pixels to top
 */
Scroller.prototype.scroll = function (target, source = null) {
    const top = document.documentElement.getBoundingClientRect()["top"];
    const offset = source ? source.getBoundingClientRect()["height"] : 0;
    const delta = target.getBoundingClientRect()["top"] - offset;

    this.target = top - delta;
    this.blockEvents = true; //prevent handler function from updating

    // console.log(`scrolling to ${this.target} from ${top}`);

    switch (this.mode) {
        case SCROLL_MODE.auto:
            window.scrollBy({ left: 0, top: delta, behavior: "auto" });
            break;

        case SCROLL_MODE.smooth:
            window.scrollBy({ left: 0, top: delta, behavior: "smooth" });
            break;

        case SCROLL_MODE.custom:
            this._scrollCustom(delta);
            break;

        case SCROLL_MODE.intoView:
            // scrolling using experimental scrollIntoView function
            //   https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollIntoView
            //   does not allow for offset at top for menu
            target.scrollIntoView({ behavior: "smooth", block: "start" });
            break;
    }
    // Safety: re-enable the scroll handler after timeout period.
    //         the user may disable auto-scroll by scrolling main window
    setTimeout(() => {
        this.blockEvents = false;
        // this._handler(null);
    }, this.timeout);
};

/**
 * Custom scrolling function - uses easy in - out algorithm (i.e. accelerates faster over middle distances)
 * During the first frame distance to element is scrolled by start_inc, on each subsequent frame
 * scroll distance is increased by the multiplier until the halfway point; then it is decreased
 *
 * @param {HTMLElement} element target element for scroll
 * @param {Number} offset       Number of pixels from top of frame that the element should be at end of scroll
 * @param {Number} fps          Frames per second, used to calculate the update rate for scrolling
 * @param {Number} start_inc    scroll increment for the first frame
 * @param {Number} multiplier   Each subsequent frame should be this factor of the previous frame's scroll amount
 */
Scroller.prototype._scrollCustom = function (
    delta,
    fps = 20,
    start_inc = 15,
    multiplier = 1.6
) {
    const halfway = Math.round(Math.abs(delta) / 2);
    const distance = halfway * 2;
    const direction = delta > 0 ? "up" : "down";

    // Calculate the scroll increments for each frame
    let increments = [];
    let traveled = 0;
    let increment = start_inc;
    let index = 0;

    while (traveled < distance) {
        // stops overshoot of the total distance, if calculated increment is greater than remaining distance
        const inc_delta =
            increment > distance - traveled ? distance - traveled : increment;

        // store the current increment amount
        traveled += inc_delta;
        increments.push(inc_delta);

        if (traveled > halfway) {
            //decelerate
            // distance are defined while accelerating, we can just pop the
            // read the next one off the array
            index--;
            increment = increments[index] || increments[0];
        } else {
            // accelerate
            const dist_to_half = Math.round(halfway - traveled);
            const next_inc = Math.ceil(increment * multiplier);

            if (dist_to_half > next_inc) {
                // next increment will not overflow halfway
                increment = next_inc;
                index++;
            } else {
                // next increment will overflow halfway
                // Make different adjustments depending on how much the next frame increment
                // will overlap the halfway mark.
                if (dist_to_half < increment) {
                    // Even if we scrolled across the halfway to the identical point on the
                    // decelerating side, the next frame scroll would be smaller than this one.
                    // Therefore, add the remaining distance to halfway onto this frame
                    increments[index] += dist_to_half;
                    // push the first frame on the descending edge
                    increments.push(increment + dist_to_half);

                    traveled += increment + dist_to_half * 2; // adjust traveled
                    // prep the first frame on descending side to be same as previous one
                    index--;
                    increment = increments[index] || 0;
                } else if (next_inc < (dist_to_half * 3) / 2) {
                    // A single frame to opposite end would be too big,
                    // it gets less than 1/2 way to opposite side
                    // Push two smaller steps
                    increments.push(dist_to_half);
                    increments.push(dist_to_half);
                    traveled += dist_to_half * 2; // adjust traveled
                    // next used increment will be the same as this iteration
                    // so leave index unchanged
                } else {
                    // Push a slightly larger next increment onto queue
                    // between 50% and 125% of calculated value
                    increments.push(dist_to_half * 2);

                    traveled += dist_to_half * 2; // adjust traveled
                    // next used increment will be the same as this iteration
                }
            }
        }
    }

    // console.log(`start custom scroll by ${delta} traveling ${distance} in: [${increments.length}]`);
    // console.log(`${increments}`);
    // let expected = document.documentElement.getBoundingClientRect()['top'];

    // define scrolling frame function
    const frame_rate = 1000 / fps; //TODO: place a limiter on the frame_rate?
    const my_scroll = () => {
        // console.log(`scrolling -> expected: ${expected} vs actual: ${document.documentElement.getBoundingClientRect()['top']}`);
        const scroll_delta =
            direction == "up" ? increments.pop() : -increments.pop() || 0; // 0 for scroll to same spot
        // expected -= scroll_delta;
        if (increments.length > 0) {
            setTimeout(my_scroll, frame_rate);
        }
        window.scrollBy({ left: 0, top: scroll_delta, behavior: "auto" });
    };

    //trigger scrolling
    my_scroll();
};

export { Scroller, SCROLL_MODE };
