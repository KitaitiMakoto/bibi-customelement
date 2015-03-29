(global) => {
    "use strict";

    //TODO: Use import clause
    var aria = require("reflected-aria-attributes/old-lib/reflected-aria-attributes.js");

    var ownerDocument = document.currentScript.ownerDocument;
    var holderTemplateContent = ownerDocument.getElementById("holder-template").content;
    var controlsTemplateContent = ownerDocument.getElementById("controls-template-original").content;

    var urlNormalizer = document.createElement("a");
    function normalizeUrl(url) {
        urlNormalizer.href = url;
        return urlNormalizer.href;
    }
    function extractOrigin(url) {
        urlNormalizer.href = url;
        return urlNormalizer.origin;
    }
    function extractBasename(url) {
        urlNormalizer.href = url;
        var pathname = urlNormalizer.pathname;
        var i = pathname.lastIndexOf("/");
        if (i === -1) {
            return;
        }
        return pathname.slice(i + 1);
    }
    function extractExtension(url) {
        urlNormalizer.href = url;
        var pathname = urlNormalizer.pathname;
        var i = pathname.lastIndexOf(".");
        if (i === -1) {
            return;
        }
        return pathname.slice(i);
    }

    function defineReflectedAttributes(proto, attrs) {
        attrs.forEach(attrName => {
            var propName = attrName.replace(/-(\w)/g, (match, letter) => {
                return letter.toUpperCase();
            });
            Object.defineProperty(proto, propName, {
                get: function() {
                    return this.getAttribute(attrName) || "";
                },
                set: function(value) {
                    this.setAttribute(attrName, value);
                }
            })
        });
    };

    function defineReflectedBooleanAttributes(proto, attrs) {
        attrs.forEach(attrName => {
            var propName = attrName.replace(/-(\w)/, (match, letter) => {
                return letter.toUpperCase();
            });
            Object.defineProperty(proto, propName, {
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

    function determineResource(element) {
        var resource = {src: null, type: null};
        if (element.hasAttribute("src")) {
            resource.type = guessTypeFromSrc(element.src);
            if (resource.type === "application/epub+zip") {
                resource.src = urlToBibiBookshelf(element.src);
            }
            return resource;
        }
        var sources = element.getElementsByTagName("source");
        for (var i = 0, l = sources.length; i < l; sources) {
            let source = sources[i];
            if (! source.src) {
                continue;
            }
            let type = source.type;
            if (! type) {
                type = guessTypeFromSrc(source.src);
            }
            resource.type = type;
            if (resource.type === "application/epub+zip") {
                resource.src = urlToBibiBookshelf(source.src);
            }
            break;
        }
        return resource;
    }

    function urlToBibiBookshelf(url) {
        var urlParser = document.createElement("a");
        urlParser.href = url;
        var basename = extractBasename(url);
        urlParser.pathname += "/../../bibi.html";
        urlParser.search = "?book=" + basename;
        return urlParser.href;
    }

    function enableButtons(element, resource) {
        var root = element.shadowRoot;
        var backButton = root.querySelector(".back");
        var forwardButton = root.querySelector(".forward");
        var menuButton = root.querySelector(".menu");
        [backButton, forwardButton, menuButton].forEach(button => {
            aria.attachRole(button, "button");
        });
        if (resource.type === "application/epub+zip") {
            var app = root.querySelector("iframe").contentWindow;
            var origin = extractOrigin(resource.src);
            // TODO: use app.R directly when the same origin
            // TODO: name functions to remove when src changed
            backButton.onclick = function(event) {
                app.postMessage("back", origin);
            };
            backButton.ariaDisabled = false;// TODO:enable on ebook loaded
            forwardButton.onclick = function(eppvent) {
                app.postMessage("forward", origin);
            };
            forwardButton.ariaDisabled = false;// TODO:enable on ebook loaded
            menuButton.onclick = function(event) {
                app.postMessage("menu", origin);
                var button = event.target;
                if (button.ariaPressed) {
                    button.ariaPressed = false;
                } else {
                    button.ariaPressed = true;
                }
            };
            menuButton.ariaDisabled = false;// TODO:enable on ebook loaded
        }
    }

    function guessTypeFromSrc(src) {
        var ext = extractExtension(src);
        if (ext === ".pdf") {
            return "application/pdf";
        }
        // FIXME
        return "application/epub+zip";
    }

    class HTMLEBookElement extends HTMLElement {
        get target() {
            return this.shadowRoot.querySelector(".switch-newwindow").getAttribute("target");
        }

        set target(value) {
            this.setAttribute("target", value);
            this.shadowRoot.querySelector(".switch-newwindow").setAttribute("target", value);
        }

        load() {
            return new Promise((resolve, reject) => {
                var resource = determineResource(this);
                if (! resource.src) {
                    resolve(resource);
                    return;
                }
                //TODO: show text content when type not supported
                var root = this.shadowRoot;
                var frame = root.querySelector("iframe");
                var object = root.querySelector("object");
                switch (resource.type) {
                case "application/epub+zip":
                    object.hidden = true;
                    var frameSrc = resource.src;
                    if (this.autostart) {
                        frameSrc += (/#/.test(frameSrc) ? "," : "#") + "pipi(autostart:true)";
                    } else if(this.poster) {
                        var posterUrl = normalizeUrl(this.poster);
                        frameSrc += (/#/.test(frameSrc) ? "," : "#") + "pipi(poster:" + encodeURIComponent(posterUrl).replace("(", "_BibiKakkoOpen_").replace(")", "_BibiKakkoClose_") + ")";
                    }
                    frame.onload = event => {
                        // TODO: use appropriate event name like e-book:readingsystemload and CustomEvent
                        // TODO: erorr handling
                        resolve(resource);
                        this.dispatchEvent(new event.constructor(event.type, event));
                    };
                    frame.src = frameSrc;
                    frame.hidden = false;
                    break;
                case "application/pdf":
                    frame.hidden = true;
                    object.data = resource.src;
                    object.hidden = false;
                    resolve(resource);// object element doesn't dispatch load event
                    break;
                default:
                    reject(new Error(`Unknown type ${resource.type}`));
                }
            });
        }

        createdCallback() {
            var root = this.createShadowRoot();
            var container = document.importNode(holderTemplateContent, true)
            var holder = container.querySelector(".holder");
            holder.querySelector(".controls").appendChild(document.importNode(controlsTemplateContent, true));
            root.appendChild(container);
            var switchFullscreen = root.querySelector(".switch-fullscreen");
            aria.attachRole(switchFullscreen, "button");
            switchFullscreen.ariaPressed = false;
            switchFullscreen.onclick = function(event) {
                if (document.fullscreenEnabled) {
                    document.exitFullscreen();
                    switchFullscreen.ariaPressed = false;
                    switchFullscreen.setAttribute("title", "Enter Fullscreen");
                } else {
                    holder.requestFullscreen();
                    switchFullscreen.ariaPressed = true;
                    switchFullscreen.setAttribute("title", "Exit Fullscreen");
                }
            };
            var switchNewwindow = root.querySelector(".switch-newwindow");
            switchNewwindow.href = this.src;
            if (! this.src) {
                return;
            }
            this.load().then(resource => {
                enableButtons(this, resource);
            }).catch(error => console.error(error));
        }

        attachedCallback() {
            if (this.src) {
                return;
            }
            this.load().then(resource => {
                enableButtons(this, resource);
            }).catch(error => console.error(error));
        }

        attributeChangedCallback(name, oldValue, newValue, namespace) {
            if (name === "src") {
                this.load().catch(error => console.error(error));
                // TODO: add event lisnters to controls
                //       for the case that event listener not attached
                //       because of invalid src attribute
            }
        }
    }

    defineReflectedAttributes(HTMLEBookElement.prototype, ["src", "poster"]);
    defineReflectedBooleanAttributes(HTMLEBookElement.prototype, ["autostart"]);

    global.HTMLEBookElement = document.registerElement("e-book", HTMLEBookElement);
}(self);
