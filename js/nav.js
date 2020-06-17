// ES6 Class Syntax

/**
 * Builds a basic nav based on data in section attributes
 * Calls external onClick function when it detects a click on a link.
 *
 * Initialisation:
 *      const nav = Nav();
 *      nav.build();
 *      nav.onClick = some_func;
 *      nav.register;
 *
 * Usage;
 *      (none)
 */
export class Nav {
    constructor() {
        // reference to top level nav element
        this.navbar = null;
        // list of page elements referenced by the nav
        this.elements = [];
        // function called on a click
        //   signature 'function(target: htmlElement, navbar: htmlElement)'
        this.onClick = null;
        // TODO: could be separated into onClickScroll, onClickOpen,
        // onClickDisplay for multi-page/multifunction menu
    }

    /**
     * Builds the navigation menu and populates the 'navigation' global object
     */
    build() {
        this.navbar = document.querySelector(".navbar__menu");
        this.navbar.classList.add("invisible"); // nav should be hidden until it is built

        const nav_list = document.querySelector("#navbar__list");
        const hero = document.querySelector(".main__hero");
        const sections = document.getElementsByTagName("section");

        // buffer element references for scrolling and determining focus
        this.elements = [hero, ...sections];

        // build nav as html string
        let nav_html = `<li><a href="#" data-index="0" class="menu__link">home</a></li>`;
        for (let i = 1; i < this.elements.length; i++) {
            nav_html += `<li><a href="#${this.elements[i].id}" data-index="${i}" class="menu__link">${this.elements[i].dataset["nav"]}</a></li>`;
        }

        nav_list.innerHTML = nav_html;

        this.navbar.classList.remove("invisible"); // nav should be hidden until it is built

        return this.elements;
    }

    /** Handles the clicks on the nav menu */
    //      hacky private instance method - ES2019 #handler
    _handler() {
        // only clicks on menu links. i.e. ignore clicks on the parent div
        if (!event.target.classList.contains("menu__link")) return;

        event.preventDefault(); // prevent std link jump

        const index = Number(event.target.dataset["index"]);
        if (this.onClick) {
            this.onClick(this.elements[index], this.navbar);
        } else {
            console.warn(`Navigation .onClick callback has not been set.`);
        }
    }

    register() {
        document.addEventListener("click", this._handler.bind(this));
    }
}
