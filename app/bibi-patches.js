() => {
    "use strict";

    if (window.self === window.top) {
        return;
    }

    var fakeFunction = function() {};
    var fakeElement = document.createElement("div");

    C.createArrows = fakeFunction;
    C.Arrows = fakeElement;
    C.Arrows.Forward = fakeElement;
    C.Arrows.Back = fakeElement;
    C.createSwitches = fakeFunction;
    C.Switches = fakeElement;
    C.Switches.Panel = fakeElement;
    C.Switches.Panel.toggleState = fakeFunction;
    self.addEventListener("message", event => {
        switch(event.data) {
        case "forward":
            R.page(+1);
            break;
        case "back":
            R.page(-1);
            break;
        case "menu":
            C.Panel.toggle();
            break;
        }
    });
    P["spread-layout-axis"] = "vertical";

    // allow fetch book from url other than bookshelf directory
}();
