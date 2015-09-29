var MobileDragAndDropPolyfill;
(function (MobileDragAndDropPolyfill) {
    MobileDragAndDropPolyfill.Initialize = function (config) {
        DragAndDropInitializer.Initialize(config);
    };
    var DragAndDropInitializer = (function () {
        function DragAndDropInitializer() {
        }
        DragAndDropInitializer.Initialize = function (config) {
            Util.Merge(DragAndDropInitializer.config, config);
            var featureDetection = {};
            if (DragAndDropInitializer.IsDragAndDropSupportedNatively(featureDetection)) {
                return;
            }
            DragAndDropInitializer.config.log("Applying mobile drag and drop polyfill.");
            window.document.addEventListener("touchstart", DragAndDropInitializer.OnTouchstart);
        };
        DragAndDropInitializer.IsDragAndDropSupportedNatively = function (featureDetection) {
            featureDetection.draggable = 'draggable' in window.document.documentElement;
            featureDetection.dragEvents = ('ondragstart' in window.document.documentElement);
            featureDetection.touchEvents = ('ontouchstart' in window.document.documentElement);
            featureDetection.mouseEventConstructor = ('MouseEvent' in window);
            featureDetection.dragEventConstructor = ('DragEvent' in window);
            featureDetection.customEventConstructor = ('CustomEvent' in window);
            featureDetection.isBlinkEngine = !!(window.chrome) || /chrome/i.test(navigator.userAgent);
            featureDetection.isGeckoEngine = /firefox/i.test(navigator.userAgent);
            featureDetection.userAgentNotSupportingNativeDnD =
                (/iPad|iPhone|iPod|Android/.test(navigator.userAgent)
                    ||
                        featureDetection.touchEvents && (featureDetection.isBlinkEngine));
            Util.ForIn(featureDetection, function (value, key) {
                DragAndDropInitializer.config.log("feature '" + key + "' is '" + value + "'");
            });
            return (featureDetection.userAgentNotSupportingNativeDnD === false
                && featureDetection.draggable
                && featureDetection.dragEvents);
        };
        DragAndDropInitializer.OnTouchstart = function (e) {
            DragAndDropInitializer.config.log("global touchstart");
            if (DragAndDropInitializer.dragOperationActive) {
                DragAndDropInitializer.config.log("drag operation already active");
                return;
            }
            var dragTarget = DragAndDropInitializer.TryFindDraggableTarget(e, DragAndDropInitializer.config);
            if (!dragTarget) {
                return;
            }
            e.preventDefault();
            DragAndDropInitializer.dragOperationActive = true;
            try {
                new DragOperationController(DragAndDropInitializer.config, dragTarget, e, DragAndDropInitializer.DragOperationEnded);
            }
            catch (err) {
                DragAndDropInitializer.config.log(err);
                DragAndDropInitializer.DragOperationEnded(e, DragOperationState.CANCELLED);
            }
        };
        DragAndDropInitializer.TryFindDraggableTarget = function (event, config) {
            //1. Determine what is being dragged, as follows:
            var el = event.target;
            do {
                if (el.draggable === false) {
                    continue;
                }
                if (!el.getAttribute) {
                    continue;
                }
                if (el.getAttribute("draggable") === "true") {
                    return el;
                }
            } while ((el = el.parentNode) && el !== window.document.body);
        };
        DragAndDropInitializer.DragOperationEnded = function (event, state) {
            DragAndDropInitializer.dragOperationActive = false;
            if (state === DragOperationState.POTENTIAL) {
                var target = event.target;
                var targetTagName = target.tagName;
                var mouseEventType;
                switch (targetTagName) {
                    case "SELECT":
                        mouseEventType = "mousedown";
                        break;
                    case "INPUT":
                    case "TEXTAREA":
                        target.focus();
                    default:
                        mouseEventType = "click";
                }
                DragAndDropInitializer.config.log("No movement on draggable. Dispatching " + mouseEventType + " on " + targetTagName + " ..");
                var clickEvt = Util.CreateMouseEventFromTouch(target, event, mouseEventType);
                target.dispatchEvent(clickEvt);
            }
        };
        DragAndDropInitializer.dragOperationActive = false;
        DragAndDropInitializer.config = {
            log: function () {
            },
            dragImageClass: null,
            iterationInterval: 150,
            scrollThreshold: 50,
            scrollVelocity: 10,
            debug: false
        };
        return DragAndDropInitializer;
    })();
    var DragOperationState;
    (function (DragOperationState) {
        DragOperationState[DragOperationState["POTENTIAL"] = 0] = "POTENTIAL";
        DragOperationState[DragOperationState["STARTED"] = 1] = "STARTED";
        DragOperationState[DragOperationState["ENDED"] = 2] = "ENDED";
        DragOperationState[DragOperationState["CANCELLED"] = 3] = "CANCELLED";
    })(DragOperationState || (DragOperationState = {}));
    var DragOperationController = (function () {
        function DragOperationController(config, sourceNode, initialEvent, dragOperationEndedCb) {
            this.config = config;
            this.sourceNode = sourceNode;
            this.dragOperationEndedCb = dragOperationEndedCb;
            this.doc = window.document;
            this.dragImage = null;
            this.transformStyleMixins = {};
            this.currentHotspotCoordinates = null;
            this.immediateUserSelection = null;
            this.currentDropTarget = null;
            this.dragDataStore = null;
            this.dataTransfer = null;
            this.currentDragOperation = "none";
            this.iterationLock = false;
            this.intervalId = null;
            this.lastTouchEvent = null;
            this.initialDragTouchIdentifier = null;
            this.dragOperationState = DragOperationState.POTENTIAL;
            config.log("setting up potential drag operation..");
            this.touchMoveHandler = this.onTouchMove.bind(this);
            this.touchEndOrCancelHandler = this.onTouchEndOrCancel.bind(this);
            this.lastTouchEvent = initialEvent;
            this.initialDragTouchIdentifier = this.lastTouchEvent.changedTouches[0].identifier;
            document.addEventListener("touchmove", this.touchMoveHandler);
            document.addEventListener("touchend", this.touchEndOrCancelHandler);
            document.addEventListener("touchcancel", this.touchEndOrCancelHandler);
        }
        DragOperationController.prototype.setupDragAndDropOperation = function () {
            var _this = this;
            this.config.log("starting drag and drop operation");
            this.dragOperationState = DragOperationState.STARTED;
            this.dragDataStore = new DragDataStore();
            this.dataTransfer = new DataTransfer(this.dragDataStore);
            this.currentHotspotCoordinates = {
                x: null,
                y: null
            };
            this.createDragImage(this.lastTouchEvent);
            if (this.dragstart(this.sourceNode)) {
                this.config.log("dragstart cancelled");
                this.dragOperationState = DragOperationState.CANCELLED;
                this.cleanup();
                return;
            }
            this.snapbackEndedCb = this.snapbackTransitionEnded.bind(this);
            this.intervalId = setInterval(function () {
                if (_this.iterationLock) {
                    _this.config.log('iteration skipped because previous iteration hast not yet finished.');
                    return;
                }
                _this.iterationLock = true;
                _this.dragAndDropProcessModelIteration();
                _this.iterationLock = false;
            }, this.config.iterationInterval);
        };
        DragOperationController.prototype.cleanup = function () {
            this.config.log("cleanup");
            if (this.intervalId) {
                clearInterval(this.intervalId);
                this.intervalId = null;
            }
            document.removeEventListener("touchmove", this.touchMoveHandler);
            document.removeEventListener("touchend", this.touchEndOrCancelHandler);
            document.removeEventListener("touchcancel", this.touchEndOrCancelHandler);
            if (this.dragImage != null) {
                this.dragImage.parentNode.removeChild(this.dragImage);
                this.dragImage = null;
            }
            this.currentHotspotCoordinates = null;
            this.dataTransfer = null;
            this.dragDataStore = null;
            this.immediateUserSelection = null;
            this.currentDropTarget = null;
            this.touchEndOrCancelHandler = null;
            this.touchMoveHandler = null;
            this.snapbackEndedCb = null;
            this.dragOperationEndedCb(this.lastTouchEvent, this.dragOperationState);
            this.lastTouchEvent = null;
        };
        DragOperationController.prototype.onTouchMove = function (event) {
            if (Util.IsTouchIdentifierContainedInTouchEvent(event, this.initialDragTouchIdentifier) === false) {
                return;
            }
            if (this.dragOperationState === DragOperationState.POTENTIAL) {
                this.setupDragAndDropOperation();
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            this.lastTouchEvent = event;
            Util.SetCentroidCoordinatesOfTouchesInViewport(event, this.currentHotspotCoordinates);
            Util.SetCentroidCoordinatesOfTouchesInPage(event, this.dragImagePageCoordinates);
            this.calculateViewportScrollFactor(this.currentHotspotCoordinates.x, this.currentHotspotCoordinates.y);
            if (DragOperationController.HorizontalScrollEndReach(this.scrollIntention) === false
                || DragOperationController.VerticalScrollEndReach(this.scrollIntention) === false) {
                this.setupScrollAnimation();
            }
            else {
                this.teardownScrollAnimation();
            }
            if (this.scrollAnimationFrameId) {
                return;
            }
            this.translateDragImage(this.dragImagePageCoordinates.x, this.dragImagePageCoordinates.y);
        };
        DragOperationController.prototype.onTouchEndOrCancel = function (event) {
            if (Util.IsTouchIdentifierContainedInTouchEvent(event, this.initialDragTouchIdentifier) === false) {
                return;
            }
            this.teardownScrollAnimation();
            if (this.dragOperationState === DragOperationState.POTENTIAL) {
                this.cleanup();
                return;
            }
            event.preventDefault();
            event.stopImmediatePropagation();
            this.lastTouchEvent = event;
            this.dragOperationState = (event.type === "touchcancel") ? DragOperationState.CANCELLED : DragOperationState.ENDED;
        };
        DragOperationController.prototype.calculateViewportScrollFactor = function (x, y) {
            if (!this.scrollIntention) {
                this.scrollIntention = {};
            }
            if (x < this.config.scrollThreshold) {
                this.scrollIntention.x = -1;
            }
            else if (this.doc.documentElement.clientWidth - x < this.config.scrollThreshold) {
                this.scrollIntention.x = 1;
            }
            else {
                this.scrollIntention.x = 0;
            }
            if (y < this.config.scrollThreshold) {
                this.scrollIntention.y = -1;
            }
            else if (this.doc.documentElement.clientHeight - y < this.config.scrollThreshold) {
                this.scrollIntention.y = 1;
            }
            else {
                this.scrollIntention.y = 0;
            }
        };
        DragOperationController.prototype.setupScrollAnimation = function () {
            if (this.scrollAnimationFrameId) {
                return;
            }
            this.config.log("setting up scroll animation");
            this.scrollAnimationCb = this.performScroll.bind(this);
            this.scrollAnimationFrameId = window.requestAnimationFrame(this.scrollAnimationCb);
        };
        DragOperationController.prototype.teardownScrollAnimation = function () {
            if (!this.scrollAnimationFrameId) {
                return;
            }
            this.config.log("tearing down scroll animation");
            window.cancelAnimationFrame(this.scrollAnimationFrameId);
            this.scrollAnimationFrameId = null;
            this.scrollAnimationCb = null;
        };
        DragOperationController.prototype.performScroll = function (timestamp) {
            if (!this.scrollAnimationCb || !this.scrollAnimationFrameId) {
                return;
            }
            var horizontalScrollEndReached = DragOperationController.HorizontalScrollEndReach(this.scrollIntention);
            var verticalScrollEndReached = DragOperationController.VerticalScrollEndReach(this.scrollIntention);
            if (horizontalScrollEndReached && verticalScrollEndReached) {
                this.config.log("scroll end reached");
                this.teardownScrollAnimation();
                return;
            }
            if (!horizontalScrollEndReached) {
                var horizontalScroll = this.scrollIntention.x * this.config.scrollVelocity;
                DragOperationController.GetSetHorizontalScroll(this.doc, horizontalScroll);
                this.dragImagePageCoordinates.x += horizontalScroll;
            }
            if (!verticalScrollEndReached) {
                var verticalScroll = this.scrollIntention.y * this.config.scrollVelocity;
                DragOperationController.GetSetVerticalScroll(this.doc, verticalScroll);
                this.dragImagePageCoordinates.y += verticalScroll;
            }
            this.translateDragImage(this.dragImagePageCoordinates.x, this.dragImagePageCoordinates.y);
            this.scrollAnimationFrameId = window.requestAnimationFrame(this.scrollAnimationCb);
        };
        DragOperationController.GetSetHorizontalScroll = function (document, scroll) {
            if (arguments.length === 1) {
                return document.documentElement.scrollLeft || document.body.scrollLeft;
            }
            document.documentElement.scrollLeft += scroll;
            document.body.scrollLeft += scroll;
        };
        DragOperationController.GetSetVerticalScroll = function (document, scroll) {
            if (arguments.length === 1) {
                return document.documentElement.scrollTop || document.body.scrollTop;
            }
            document.documentElement.scrollTop += scroll;
            document.body.scrollTop += scroll;
        };
        DragOperationController.HorizontalScrollEndReach = function (scrollIntention) {
            var scrollLeft = DragOperationController.GetSetHorizontalScroll(document);
            if (scrollIntention.x > 0) {
                var scrollWidth = document.documentElement.scrollWidth || document.body.scrollWidth;
                return (scrollLeft + document.documentElement.clientWidth) >= (scrollWidth);
            }
            else if (scrollIntention.x < 0) {
                return scrollLeft <= 0;
            }
            else {
                return true;
            }
        };
        DragOperationController.VerticalScrollEndReach = function (scrollIntention) {
            var scrollTop = DragOperationController.GetSetVerticalScroll(document);
            if (scrollIntention.y > 0) {
                var scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
                return (scrollTop + document.documentElement.clientHeight) >= scrollHeight;
            }
            else if (scrollIntention.y < 0) {
                return scrollTop <= 0;
            }
            else {
                return true;
            }
        };
        DragOperationController.PrepareNodeCopyAsDragImage = function (srcNode, dstNode) {
            if (srcNode.nodeType === 1) {
                dstNode.removeAttribute("id");
                dstNode.removeAttribute("class");
                dstNode.removeAttribute("style");
                dstNode.removeAttribute("draggable");
                var cs = window.getComputedStyle(srcNode);
                for (var i = 0; i < cs.length; i++) {
                    var csName = cs[i];
                    dstNode.style.setProperty(csName, cs.getPropertyValue(csName), cs.getPropertyPriority(csName));
                }
                dstNode.style["pointer-events"] = "none";
            }
            if (srcNode.hasChildNodes()) {
                for (var i = 0; i < srcNode.childNodes.length; i++) {
                    DragOperationController.PrepareNodeCopyAsDragImage(srcNode.childNodes[i], dstNode.childNodes[i]);
                }
            }
        };
        DragOperationController.prototype.createDragImage = function (event) {
            var _this = this;
            this.dragImage = this.sourceNode.cloneNode(true);
            DragOperationController.PrepareNodeCopyAsDragImage(this.sourceNode, this.dragImage);
            this.dragImage.style["position"] = "absolute";
            this.dragImage.style["left"] = "0px";
            this.dragImage.style["top"] = "0px";
            this.dragImage.style["z-index"] = "999999";
            DragOperationController.transform_css_vendor_prefixes.forEach(function (vendor) {
                var transformProp = vendor + "transform";
                var transform = _this.dragImage.style[transformProp];
                if (typeof transform !== "undefined") {
                    if (transform !== "none") {
                        _this.transformStyleMixins[transformProp] = transform.replace(DragOperationController.transform_css_regex, '');
                    }
                    else {
                        _this.transformStyleMixins[transformProp] = "";
                    }
                }
            });
            this.dragImage.classList.add(DragOperationController.class_drag_image);
            this.dragImage.classList.add(DragOperationController.class_drag_operation_icon);
            if (this.config.dragImageClass) {
                this.dragImage.classList.add(this.config.dragImageClass);
            }
            this.dragImagePageCoordinates = {
                x: null,
                y: null
            };
            Util.SetCentroidCoordinatesOfTouchesInPage(event, this.dragImagePageCoordinates);
            this.translateDragImage(this.dragImagePageCoordinates.x, this.dragImagePageCoordinates.y);
            this.doc.body.appendChild(this.dragImage);
        };
        DragOperationController.prototype.translateDragImage = function (x, y, centerOnCoordinates) {
            var _this = this;
            if (centerOnCoordinates === void 0) { centerOnCoordinates = true; }
            if (centerOnCoordinates) {
                x -= (parseInt(this.dragImage.offsetWidth, 10) / 2);
                y -= (parseInt(this.dragImage.offsetHeight, 10) / 2);
            }
            var translate = " translate3d(" + x + "px," + y + "px, 0)";
            Util.ForIn(this.transformStyleMixins, function (value, key) {
                _this.dragImage.style[key] = value + translate;
            });
        };
        DragOperationController.prototype.snapbackDragImage = function () {
            var sourceEl = this.sourceNode;
            var visiblity = window.getComputedStyle(sourceEl, null).getPropertyValue('visibility');
            var display = window.getComputedStyle(sourceEl, null).getPropertyValue('display');
            if (visiblity === 'hidden' || display === 'none') {
                this.config.log("source node is not visible. skipping snapback transition.");
                this.snapbackTransitionEnded();
                return;
            }
            this.config.log("starting dragimage snap back");
            this.dragImage.addEventListener("transitionend", this.snapbackEndedCb);
            this.dragImage.addEventListener("webkitTransitionEnd", this.snapbackEndedCb);
            this.dragImage.classList.add(DragOperationController.class_drag_image_snapback);
            var rect = sourceEl.getBoundingClientRect();
            var elementLeft, elementTop;
            var scrollTop = document.documentElement.scrollTop ?
                document.documentElement.scrollTop : document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft ?
                document.documentElement.scrollLeft : document.body.scrollLeft;
            elementTop = rect.top + scrollTop;
            elementLeft = rect.left + scrollLeft;
            var cs = window.getComputedStyle(this.sourceNode, null);
            var leftPadding = parseInt(cs.getPropertyValue("padding-left"), 10);
            var topPadding = parseInt(cs.getPropertyValue("padding-top"), 10);
            elementLeft -= leftPadding;
            elementTop -= topPadding;
            this.translateDragImage(elementLeft, elementTop, false);
        };
        DragOperationController.prototype.snapbackTransitionEnded = function () {
            this.config.log("dragimage snap back transition ended");
            this.dragImage.removeEventListener("transitionend", this.snapbackEndedCb);
            this.dragImage.removeEventListener("webkitTransitionEnd", this.snapbackEndedCb);
            this.dragend(this.sourceNode);
            this.dragOperationState = DragOperationState.ENDED;
            this.cleanup();
        };
        DragOperationController.prototype.dragAndDropProcessModelIteration = function () {
            var dragCancelled = this.drag(this.sourceNode);
            if (dragCancelled) {
                this.config.log("drag event cancelled.");
                this.currentDragOperation = "none";
            }
            if (dragCancelled || this.dragOperationState === DragOperationState.ENDED || this.dragOperationState === DragOperationState.CANCELLED) {
                var dragFailed = this.DragOperationEnded(this.dragOperationState);
                if (dragFailed) {
                    this.snapbackDragImage();
                    return;
                }
                this.dragend(this.sourceNode);
                this.dragOperationState = DragOperationState.ENDED;
                this.cleanup();
                return;
            }
            var newUserSelection = this.doc.elementFromPoint(this.currentHotspotCoordinates.x, this.currentHotspotCoordinates.y);
            var previousTargetElement = this.currentDropTarget;
            if (newUserSelection !== this.immediateUserSelection && newUserSelection !== this.currentDropTarget) {
                if (this.config.debug && this.immediateUserSelection) {
                    this.immediateUserSelection.classList.remove(DragOperationController.debug_class_user_selection);
                }
                this.immediateUserSelection = newUserSelection;
                if (this.config.debug && this.immediateUserSelection) {
                    this.immediateUserSelection.classList.add(DragOperationController.debug_class);
                    this.immediateUserSelection.classList.add(DragOperationController.debug_class_user_selection);
                }
                if (this.currentDropTarget !== null) {
                    this.dragexit(this.currentDropTarget);
                }
                if (this.immediateUserSelection === null) {
                    this.currentDropTarget = this.immediateUserSelection;
                    this.config.log("current drop target changed to null");
                }
                else {
                    if (this.dragenter(this.immediateUserSelection)) {
                        this.config.log("dragenter default prevented");
                        this.currentDropTarget = this.immediateUserSelection;
                        this.currentDragOperation = DragOperationController.DetermineDragOperation(this.dataTransfer);
                    }
                    else {
                        this.config.log("dragenter not prevented, searching for dropzone..");
                        var newTarget = DragOperationController.FindDropzoneElement(this.immediateUserSelection);
                        if (newTarget === this.immediateUserSelection &&
                            DragOperationController.GetOperationForMatchingDropzone(this.immediateUserSelection, this.dragDataStore) !== "none") {
                            this.currentDropTarget = this.immediateUserSelection;
                        }
                        else if (newTarget !== null && DragOperationController.GetOperationForMatchingDropzone(newTarget, this.dragDataStore)) {
                            this.dragenter(newTarget, this.currentDropTarget);
                            this.currentDropTarget = newTarget;
                        }
                        else if (this.immediateUserSelection === this.doc.body) {
                        }
                        else {
                            this.currentDropTarget = this.doc.body;
                        }
                    }
                }
            }
            if (previousTargetElement !== this.currentDropTarget && (Util.IsDOMElement(previousTargetElement))) {
                if (this.config.debug) {
                    previousTargetElement.classList.remove(DragOperationController.debug_class_drop_target);
                }
                this.config.log("current drop target changed.");
                this.dragleave(previousTargetElement, this.currentDropTarget);
            }
            if (Util.IsDOMElement(this.currentDropTarget)) {
                if (this.config.debug) {
                    this.currentDropTarget.classList.add(DragOperationController.debug_class);
                    this.currentDropTarget.classList.add(DragOperationController.debug_class_drop_target);
                }
                if (this.dragover(this.currentDropTarget) === false) {
                    this.config.log("dragover not prevented. checking for dom element with dropzone-attr");
                    this.currentDragOperation = DragOperationController.GetOperationForMatchingDropzone(this.currentDropTarget, this.dragDataStore);
                }
                else {
                    this.config.log("dragover prevented -> valid drop target?");
                    this.currentDragOperation = DragOperationController.DetermineDragOperation(this.dataTransfer);
                    this.config.log("current drag operation after dragover: " + this.currentDragOperation);
                }
            }
            this.config.log("d'n'd iteration ended. current drag operation: " + this.currentDragOperation);
            for (var i = 0; i < DataTransfer.DropEffects.length; i++) {
                this.dragImage.classList.remove(DragOperationController.class_prefix + DataTransfer.DropEffects[i]);
            }
            this.dragImage.classList.add(DragOperationController.class_prefix + this.currentDragOperation);
        };
        DragOperationController.prototype.DragOperationEnded = function (state) {
            this.config.log("drag operation end detected. state: " + DragOperationState[state]);
            if (this.config.debug && this.currentDropTarget) {
                this.currentDropTarget.classList.remove(DragOperationController.debug_class_drop_target);
            }
            if (this.config.debug && this.immediateUserSelection) {
                this.immediateUserSelection.classList.remove(DragOperationController.debug_class_user_selection);
            }
            var dragFailed = (this.currentDragOperation === "none"
                || this.currentDropTarget === null
                || state === DragOperationState.CANCELLED);
            if (dragFailed) {
                if (Util.IsDOMElement(this.currentDropTarget)) {
                    this.dragleave(this.currentDropTarget);
                }
            }
            else {
                if (Util.IsDOMElement(this.currentDropTarget)) {
                    if (this.drop(this.currentDropTarget) === true) {
                        this.currentDragOperation = this.dataTransfer.dropEffect;
                    }
                    else {
                        this.currentDragOperation = "none";
                    }
                }
            }
            return dragFailed;
        };
        DragOperationController.DetermineDragOperation = function (dataTransfer) {
            if (dataTransfer.effectAllowed === "uninitialized" || dataTransfer.effectAllowed === "all") {
                return dataTransfer.dropEffect;
            }
            if (dataTransfer.dropEffect === "copy") {
                if (dataTransfer.effectAllowed.indexOf("copy") === 0) {
                    return "copy";
                }
            }
            else if (dataTransfer.dropEffect === "link") {
                if (dataTransfer.effectAllowed.indexOf("link") === 0 || dataTransfer.effectAllowed.indexOf("Link") > -1) {
                    return "link";
                }
            }
            else if (dataTransfer.dropEffect === "move") {
                if (dataTransfer.effectAllowed.indexOf("move") === 0 || dataTransfer.effectAllowed.indexOf("Move") > -1) {
                    return "move";
                }
            }
            return "none";
        };
        DragOperationController.DetermineDropEffect = function (effectAllowed, sourceNode) {
            if (effectAllowed === "none") {
                return "none";
            }
            if (effectAllowed.indexOf("copy") === 0 || effectAllowed === "all") {
                return "copy";
            }
            if (effectAllowed.indexOf("link") === 0) {
                return "link";
            }
            if (effectAllowed === "move") {
                return "move";
            }
            if (effectAllowed === "uninitialized") {
                if (sourceNode.nodeType === 3 && sourceNode.tagName === "A") {
                    return "link";
                }
            }
            return "copy";
        };
        DragOperationController.FindDropzoneElement = function (element) {
            if (!element || !element.hasAttribute || typeof element.hasAttribute !== "function") {
                return null;
            }
            if (element.hasAttribute("dropzone")) {
                return element;
            }
            if (element === window.document.body) {
                return null;
            }
            return DragOperationController.FindDropzoneElement(element.parentElement);
        };
        DragOperationController.GetOperationForMatchingDropzone = function (element, dragDataStore) {
            var value = element.getAttribute("dropzone");
            if (!value) {
                return "none";
            }
            var matched = false;
            var operation;
            var keywords = value.split(" ");
            for (var i = 0; i < keywords.length; i++) {
                var keyword = keywords[i];
                if (keyword === "copy" || keyword === "move" || keyword === "link") {
                    if (!operation) {
                        operation = keyword;
                    }
                    continue;
                }
                if (keyword.length < 3 || keyword[1] !== ":") {
                    continue;
                }
                var splitKeyword = keyword.split(":");
                var kind = splitKeyword[0].toLowerCase();
                var type = splitKeyword[1].toLowerCase();
                if (dragDataStore.types.indexOf(type) > -1) {
                    matched = true;
                }
            }
            if (!matched) {
                return "none";
            }
            if (!operation) {
                return "copy";
            }
            return operation;
        };
        DragOperationController.prototype.dragstart = function (targetElement) {
            this.config.log("dragstart");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.READWRITE;
            this.dataTransfer.dropEffect = "none";
            var evt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragstart", true, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(evt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.prototype.drag = function (targetElement) {
            this.config.log("drag");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = "none";
            var evt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "drag", true, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(evt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.prototype.dragenter = function (targetElement, relatedTarget) {
            if (relatedTarget === void 0) { relatedTarget = null; }
            this.config.log("dragenter");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
                if (relatedTarget) {
                    relatedTarget.classList.add(DragOperationController.debug_class_event_related_target);
                }
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = DragOperationController.DetermineDropEffect(this.dragDataStore.effectAllowed, this.sourceNode);
            var enterEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragenter", true, this.doc.defaultView, this.dataTransfer, relatedTarget);
            var cancelled = !targetElement.dispatchEvent(enterEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
                if (relatedTarget) {
                    relatedTarget.classList.remove(DragOperationController.debug_class_event_related_target);
                }
            }
            return cancelled;
        };
        DragOperationController.prototype.dragover = function (targetElement) {
            this.config.log("dragover");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = DragOperationController.DetermineDropEffect(this.dragDataStore.effectAllowed, this.sourceNode);
            var overEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragover", true, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(overEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.prototype.dragexit = function (targetElement) {
            this.config.log("dragexit");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = "none";
            var leaveEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragexit", false, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(leaveEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.prototype.dragleave = function (targetElement, relatedTarget) {
            if (relatedTarget === void 0) { relatedTarget = null; }
            this.config.log("dragleave");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
                if (relatedTarget) {
                    relatedTarget.classList.add(DragOperationController.debug_class);
                    relatedTarget.classList.add(DragOperationController.debug_class_event_related_target);
                }
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = "none";
            var leaveEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragleave", false, this.doc.defaultView, this.dataTransfer, relatedTarget);
            var cancelled = !targetElement.dispatchEvent(leaveEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
                if (relatedTarget) {
                    relatedTarget.classList.remove(DragOperationController.debug_class_event_related_target);
                }
            }
            return cancelled;
        };
        DragOperationController.prototype.dragend = function (targetElement) {
            this.config.log("dragend");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.PROTECTED;
            this.dataTransfer.dropEffect = this.currentDragOperation;
            var endEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "dragend", false, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(endEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.prototype.drop = function (targetElement) {
            this.config.log("drop");
            if (this.config.debug) {
                targetElement.classList.add(DragOperationController.debug_class);
                targetElement.classList.add(DragOperationController.debug_class_event_target);
            }
            this.dragDataStore.mode = DragDataStoreMode.READONLY;
            this.dataTransfer.dropEffect = this.currentDragOperation;
            var dropEvt = Util.CreateDragEventFromTouch(targetElement, this.lastTouchEvent, "drop", false, this.doc.defaultView, this.dataTransfer, null);
            var cancelled = !targetElement.dispatchEvent(dropEvt);
            this.dragDataStore.mode = DragDataStoreMode._DISCONNECTED;
            if (this.config.debug) {
                targetElement.classList.remove(DragOperationController.debug_class_event_target);
            }
            return cancelled;
        };
        DragOperationController.class_prefix = "dnd-poly-";
        DragOperationController.class_drag_image = DragOperationController.class_prefix + "drag-image";
        DragOperationController.class_drag_image_snapback = DragOperationController.class_prefix + "snapback";
        DragOperationController.class_drag_operation_icon = DragOperationController.class_prefix + "icon";
        DragOperationController.debug_class = DragOperationController.class_prefix + "debug";
        DragOperationController.debug_class_user_selection = DragOperationController.class_prefix + "immediate-user-selection";
        DragOperationController.debug_class_drop_target = DragOperationController.class_prefix + "current-drop-target";
        DragOperationController.debug_class_event_target = DragOperationController.class_prefix + "event-target";
        DragOperationController.debug_class_event_related_target = DragOperationController.class_prefix + "event-related-target";
        DragOperationController.transform_css_vendor_prefixes = ["", "-webkit-"];
        DragOperationController.transform_css_regex = /translate\(\D*\d+[^,]*,\D*\d+[^,]*\)\s*/g;
        return DragOperationController;
    })();
    var DataTransfer = (function () {
        function DataTransfer(dataStore) {
            this.dataStore = dataStore;
            this._dropEffect = "none";
        }
        Object.defineProperty(DataTransfer.prototype, "files", {
            get: function () {
                if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                    return null;
                }
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTransfer.prototype, "items", {
            get: function () {
                return null;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTransfer.prototype, "types", {
            get: function () {
                if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                    return null;
                }
                return Object.freeze(this.dataStore.types);
            },
            enumerable: true,
            configurable: true
        });
        DataTransfer.prototype.setData = function (type, data) {
            if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                return;
            }
            if (this.dataStore.mode !== DragDataStoreMode.READWRITE) {
                return;
            }
            if (type.indexOf(" ") > -1) {
                throw new Error("Space character not allowed in drag data item type string");
            }
            this.dataStore.data[type] = data;
            var index = this.dataStore.types.indexOf(type);
            if (index === -1) {
                this.dataStore.types.push(type);
            }
        };
        DataTransfer.prototype.getData = function (type) {
            if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                return null;
            }
            if (this.dataStore.mode === DragDataStoreMode.PROTECTED) {
                return null;
            }
            return this.dataStore.data[type] || "";
        };
        DataTransfer.prototype.clearData = function (format) {
            if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                return;
            }
            if (format && this.dataStore.data[format]) {
                delete this.dataStore.data[format];
                var index = this.dataStore.types.indexOf(format);
                if (index > -1) {
                    this.dataStore.types.splice(index, 1);
                }
                return;
            }
            this.dataStore.data = {};
            this.dataStore.types = [];
        };
        DataTransfer.prototype.setDragImage = function (image, x, y) {
            if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                return null;
            }
        };
        Object.defineProperty(DataTransfer.prototype, "effectAllowed", {
            get: function () {
                return this.dataStore.effectAllowed;
            },
            set: function (value) {
                if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                    return;
                }
                if (DataTransfer.AllowedEffects.indexOf(value) === -1) {
                    return;
                }
                this.dataStore.effectAllowed = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(DataTransfer.prototype, "dropEffect", {
            get: function () {
                return this._dropEffect;
            },
            set: function (value) {
                if (this.dataStore.mode === DragDataStoreMode._DISCONNECTED) {
                    return;
                }
                if (DataTransfer.DropEffects.indexOf(value) === -1) {
                    return;
                }
                this._dropEffect = value;
            },
            enumerable: true,
            configurable: true
        });
        DataTransfer.AllowedEffects = ["none", "copy", "copyLink", "copyMove", "link", "linkMove", "move", "all"];
        DataTransfer.DropEffects = ["none", "copy", "move", "link"];
        return DataTransfer;
    })();
    var DragDataStoreMode;
    (function (DragDataStoreMode) {
        DragDataStoreMode[DragDataStoreMode["_DISCONNECTED"] = 0] = "_DISCONNECTED";
        DragDataStoreMode[DragDataStoreMode["READONLY"] = 1] = "READONLY";
        DragDataStoreMode[DragDataStoreMode["READWRITE"] = 2] = "READWRITE";
        DragDataStoreMode[DragDataStoreMode["PROTECTED"] = 3] = "PROTECTED";
    })(DragDataStoreMode || (DragDataStoreMode = {}));
    var DragDataStore = (function () {
        function DragDataStore() {
            this.mode = DragDataStoreMode.PROTECTED;
            this.data = {};
            this.types = [];
            this.effectAllowed = "uninitialized";
        }
        return DragDataStore;
    })();
    var Util = (function () {
        function Util() {
        }
        Util.ForIn = function (obj, cb) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key) === false) {
                    continue;
                }
                cb(obj[key], key);
            }
        };
        Util.Merge = function (target, obj) {
            if (!obj) {
                return;
            }
            for (var key in obj) {
                if (obj.hasOwnProperty(key) === false) {
                    continue;
                }
                target[key] = obj[key];
            }
        };
        Util.Average = function (array) {
            if (array.length === 0) {
                return 0;
            }
            return array.reduce((function (s, v) {
                return v + s;
            }), 0) / array.length;
        };
        Util.IsDOMElement = function (object) {
            return object && object.tagName;
        };
        Util.IsTouchIdentifierContainedInTouchEvent = function (newTouch, touchIdentifier) {
            for (var i = 0; i < newTouch.changedTouches.length; i++) {
                var touch = newTouch.changedTouches[i];
                if (touch.identifier === touchIdentifier) {
                    return true;
                }
            }
            return false;
        };
        Util.GetTouchContainedInTouchEventByIdentifier = function (newTouch, touchIdentifier) {
            for (var i = 0; i < newTouch.changedTouches.length; i++) {
                var touch = newTouch.changedTouches[i];
                if (touch.identifier === touchIdentifier) {
                    return touch;
                }
            }
            return null;
        };
        Util.CreateMouseEventFromTouch = function (targetElement, e, typeArg, cancelable, window, relatedTarget) {
            if (cancelable === void 0) { cancelable = true; }
            if (window === void 0) { window = document.defaultView; }
            if (relatedTarget === void 0) { relatedTarget = null; }
            var mouseEvent = document.createEvent("MouseEvents");
            var touch = e.changedTouches[0];
            mouseEvent.initMouseEvent(typeArg, true, cancelable, window, 1, touch.screenX, touch.screenY, touch.clientX, touch.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, relatedTarget);
            var targetRect = targetElement.getBoundingClientRect();
            mouseEvent.offsetX = mouseEvent.clientX - targetRect.left;
            mouseEvent.offsetY = mouseEvent.clientY - targetRect.top;
            return mouseEvent;
        };
        Util.CreateDragEventFromTouch = function (targetElement, e, typeArg, cancelable, window, dataTransfer, relatedTarget) {
            if (relatedTarget === void 0) { relatedTarget = null; }
            var touch = e.changedTouches[0];
            var dndEvent = document.createEvent("Event");
            dndEvent.initEvent(typeArg, true, cancelable);
            dndEvent.dataTransfer = dataTransfer;
            dndEvent.relatedTarget = relatedTarget;
            dndEvent.screenX = touch.screenX;
            dndEvent.screenY = touch.screenY;
            dndEvent.clientX = touch.clientX;
            dndEvent.clientY = touch.clientY;
            var targetRect = targetElement.getBoundingClientRect();
            dndEvent.offsetX = dndEvent.clientX - targetRect.left;
            dndEvent.offsetY = dndEvent.clientY - targetRect.top;
            return dndEvent;
        };
        Util.ElementFromTouch = function (doc, touch) {
            var target = doc.elementFromPoint(touch.clientX, touch.clientY);
            return target;
        };
        Util.SetCentroidCoordinatesOfTouchesInPage = function (event, outPoint) {
            var pageXs = [], pageYs = [];
            [].forEach.call(event.touches, function (touch) {
                pageXs.push(touch.pageX);
                pageYs.push(touch.pageY);
            });
            outPoint.x = Util.Average(pageXs);
            outPoint.y = Util.Average(pageYs);
        };
        Util.SetCentroidCoordinatesOfTouchesInViewport = function (event, outPoint) {
            var clientXs = [], clientYs = [];
            [].forEach.call(event.touches, function (touch) {
                clientXs.push(touch.clientX);
                clientYs.push(touch.clientY);
            });
            outPoint.x = Util.Average(clientXs);
            outPoint.y = Util.Average(clientYs);
        };
        return Util;
    })();
})(MobileDragAndDropPolyfill || (MobileDragAndDropPolyfill = {}));
//# sourceMappingURL=mobile-drag-and-drop-polyfill.js.map