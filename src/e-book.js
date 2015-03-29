(global) => {
    "use strict";

    var templateContent = document.currentScript.ownerDocument.getElementsByTagName("template")[0].content;
    var uri = document.createElement("link");

    function defineValueAttributes(proto, attrs) {
        attrs.forEach(attrName => {
            Object.defineProperty(proto, attrName, {
                enumerable: true,
                get: function() {
                    return this.getAttribute(attrName);
                },
                set: function(value) {
                    this.setAttribute(attrName, value);
                }
            })
        });
    };

    function definePredicateAttributes(proto, attrs) {
        attrs.forEach(attrName => {
            Object.defineProperty(proto, attrName, {
                enumerable: true,
                get: function() {
                    return this.hasAttribute(attrName);
                },
                set: function(value) {
                    if (value) {
                        this.setAttribute(attrName, "");
                    } else {
                        this.removeAttribute(attrName);
                    }
                }
            });
        });
    };

    function loadEbook(element, src) {
        console.warn(`${element.tagName.toLowerCase()}'s src attributes's format will be changed in the future`);
        if (! src) {
            return;
        }
        var root = element.shadowRoot;
        var holder = root.querySelector(".holder")
        var frame = root.querySelector("iframe");
        var frameSrc = src;
        var switchFullscreen = root.querySelector(".switch-fullscreen");
        var switchNewwindow = root.querySelector(".switch-newwindow");
        var poster = element.poster;
        if (element.autostart) {
            frameSrc += (/#/.test(frameSrc) ? "," : "#") + "pipi(autostart:true)";
        } else if(poster) {
            uri.href = poster;
            if (poster !== uri.href) {
                element.poster = uri.href;
            }
            frameSrc += (/#/.test(frameSrc) ? "," : "#") + "pipi(poster:" + encodeURIComponent(poster).replace("(", "_BibiKakkoOpen_").replace(")", "_BibiKakkoClose_") + ")";
        }
        frame.addEventListener("load", function(event) {
            element.dispatchEvent(new event.constructor(event.type, event));
            var iframe = event.target;
            var waiting = false;
            var observer = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.attributeName !== "class") {
                        return;
                    }
                    if (mutation.target.classList.contains("wait-please") && (! waiting)) {
                        waiting = true;
                    }
                    if (! mutation.target.classList.contains("wait-please") && waiting) {
                        waiting = undefined;
                        ["canplay", "canplaythrough", "play"].forEach(eventName => {
                            element.dispatchEvent(new CustomEvent(eventName));
                        });
                        observer.disconnect();
                    }
                });
            });
            observer.observe(iframe.contentWindow.document.getElementsByTagName("html")[0], {attributes: true});
        });
        frame.src = frameSrc;
        switchNewwindow.href = src;
    }

    class HTMLEBookElement extends HTMLElement {
        set target(value) {
            console.warn("TODO: change target window");
        }

        createdCallback() {
            var root = this.createShadowRoot();
            root.appendChild(document.importNode(templateContent, true));
            if (this.src) {
                loadEbook(this, this.src);
            }

        }

        attributeChangedCallback(name, oldValue, newValue, namespace) {
            if ((name === "src") && (oldValue !== newValue)) {
                loadEbook(this, newValue);
            }
        }
    }
    for (let prop of ["requestFullscreen", "msRequestFullscreen", "mozRequestFullscreen", "webkitRequestFullscreen"]) {
        var requestFullscreen = HTMLEBookElement.prototype[prop];
        if (requestFullscreen) {
            HTMLEBookElement.prototype.requestFullscreen = requestFullscreen;
            break;
        }
    };

    defineValueAttributes(HTMLEBookElement.prototype, ["src", "poster", "type"]);
    definePredicateAttributes(HTMLEBookElement.prototype, ["autostart"]);

    global.HTMLEBookElement = document.registerElement("e-book", HTMLEBookElement);
}(self);
