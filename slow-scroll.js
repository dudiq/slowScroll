/**
 * jQuery Simple Grid
 * @version: 0.1 - 2012.07.30
 * @author: dudiq
 * @licence: MIT http://www.opensource.org/licenses/mit-license.php
 **/
(function(window, document, $, undefined){
    var
        $doc = $(document),
        $html = $("html"),
        evTarget,
        scSpeed = 1.05,
        isMobile = new RegExp("mobile", "i").test(navigator.userAgent),
        start_ev = ((isMobile) ? "touchstart" : "mousedown") + ".slowScroll",
        move_ev = ((isMobile) ? "touchmove" : "mousemove") + ".slowScroll",
        end_ev = ((isMobile) ? "touchend" : "mouseup") + ".slowScroll",
        topDiv = $("<div class='slow-scroll-lib-top' style='display: none;'></div>"),
        leftDiv = $("<div class='slow-scroll-lib-left' style='display: none;'></div>");

    var nativeOverflow = (function(){
        //detect native overflow touch getting from Overthrow v.0.1.0
        //http://filamentgroup.github.com/Overthrow

        // The following attempts to determine whether the browser has native overflow support
        // so we can enable it but not polyfill
        var w = window,
            doc = document,
            docElem = doc.documentElement,
            // Touch events are used in the polyfill, and thus are a prerequisite
            canBeFilledWithPoly = "ontouchmove" in doc,
            overflowProbablyAlreadyWorks =
            // Features-first. iOS5 overflow scrolling property check - no UA needed here. thanks Apple :)
            "WebkitOverflowScrolling" in docElem.style ||
                // Touch events aren't supported and screen width is greater than X
                // ...basically, this is a loose "desktop browser" check.
                // It may wrongly opt-in very large tablets with no touch support.
                ( !canBeFilledWithPoly && w.screen.width > 1200 ) ||
                // Hang on to your hats.
                // Whitelist some popular, overflow-supporting mobile browsers for now and the future
                // These browsers are known to get overlow support right, but give us no way of detecting it.
                (function(){
                    var ua = w.navigator.userAgent,
                        // Webkit crosses platforms, and the browsers on our list run at least version 534
                        webkit = ua.match( /AppleWebKit\/([0-9]+)/ ),
                        wkversion = webkit && webkit[1],
                        wkLte534 = webkit && wkversion >= 534;

                    return (
                        /* Android 3+ with webkit gte 534
                         ~: Mozilla/5.0 (Linux; U; Android 3.0; en-us; Xoom Build/HRI39) AppleWebKit/534.13 (KHTML, like Gecko) Version/4.0 Safari/534.13 */
                        ua.match( /Android ([0-9]+)/ ) && RegExp.$1 >= 3 && wkLte534 ||
                            /* Blackberry 7+ with webkit gte 534
                             ~: Mozilla/5.0 (BlackBerry; U; BlackBerry 9900; en-US) AppleWebKit/534.11+ (KHTML, like Gecko) Version/7.0.0 Mobile Safari/534.11+ */
                            ua.match( / Version\/([0-9]+)/ ) && RegExp.$1 >= 0 && w.blackberry && wkLte534 ||
                            /* Blackberry Playbook with webkit gte 534
                             ~: Mozilla/5.0 (PlayBook; U; RIM Tablet OS 1.0.0; en-US) AppleWebKit/534.8+ (KHTML, like Gecko) Version/0.0.1 Safari/534.8+ */
                            ua.indexOf( /PlayBook/ ) > -1 && RegExp.$1 >= 0 && wkLte534 ||
                            /* Firefox Mobile (Fennec) 4 and up
                             ~: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.7; rv:2.1.1) Gecko/ Firefox/4.0.2pre Fennec/4.0. */
                            ua.match( /Fennec\/([0-9]+)/ ) && RegExp.$1 >= 4 ||
                            /* WebOS 3 and up (TouchPad too)
                             ~: Mozilla/5.0 (hp-tablet; Linux; hpwOS/3.0.0; U; en-US) AppleWebKit/534.6 (KHTML, like Gecko) wOSBrowser/233.48 Safari/534.6 TouchPad/1.0 */
                            ua.match( /wOSBrowser\/([0-9]+)/ ) && RegExp.$1 >= 233 && wkLte534 ||
                            /* Nokia Browser N8
                             ~: Mozilla/5.0 (Symbian/3; Series60/5.2 NokiaN8-00/012.002; Profile/MIDP-2.1 Configuration/CLDC-1.1 ) AppleWebKit/533.4 (KHTML, like Gecko) NokiaBrowser/7.3.0 Mobile Safari/533.4 3gpp-gba
                             ~: Note: the N9 doesn't have native overflow with one-finger touch. wtf */
                            ua.match( /NokiaBrowser\/([0-9\.]+)/ ) && parseFloat(RegExp.$1) === 7.3 && webkit && wkversion >= 533
                        );
                })();
            return overflowProbablyAlreadyWorks;
        }()),
            showHelpers = (nativeOverflow) ? true : false;

    {
        var docStartTouch = false,
            canCallOnMove = false,
            libObject;
        $doc.bind(start_ev, function(ev){
            docStartTouch = false;
            libObject && libObject.stopAnim();
            libObject = $(ev.target).closest('.slow-scroll-lib').data("slowScroll");
            if (libObject && libObject.enable()) {
                if (libObject.isOverflowNative()){
                    //drop simulate scrolling
                } else {
                    docStartTouch = true;
                }
            }
        });
        $doc.bind(move_ev, function(ev){
            if (docStartTouch && !canCallOnMove){
                //:ac fix for second click
                ($ && $.vmouse) && ($.vmouse.preventRealEvents = true);
                $html.addClass("slow-scroll-lib-moving");
                libObject && libObject["onStart"].call(libObject, ev);
                canCallOnMove = true;
            }
            if (canCallOnMove){
                libObject["onMove"].call(libObject, ev);
                ev.preventDefault();
            }
        });
        $doc.bind(end_ev, function(ev){
            if (docStartTouch && canCallOnMove){
                $html.removeClass("slow-scroll-lib-moving");
                docStartTouch && libObject && libObject["onEnd"].call(libObject, ev);
                if ($ && $.vmouse){
                    //:ac fix for second click
                    setTimeout(function(){
                        $.vmouse.preventRealEvents = false;
                    },10);
                }
            }
            docStartTouch = false;
            canCallOnMove = false;
            libObject = null;
        });
    }

var slowScroll = function (pEl, opt){

    var el = $(pEl),
        divHeight = 0, visibleHeight = 0, scrollHeight = 0, maxScrollHeight = 0, subScrollHeight = 0, usedHeight = 0,
        divWidth = 0, visibleWidth = 0, scrollWidth = 0, maxScrollWidth = 0, subScrollWidth = 0, usedWidth = 0,
        touchObj = {},
        useWrap = (!opt || opt.useWrap !== false), //by default wrap is TRUE
        div = (useWrap) ? el.children().eq(0) : el,
        timerId,
        isOverflowNative = false,
        requestAnimationFrame =
            window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame;

    div.addClass("slow-scroll-lib");
    div.data("slowScroll", this);

    this.scrollTo = function(x, y){
        el.scrollTop(y);
        el.scrollLeft(x);
    };

    function checkOverflow(){
        isOverflowNative = (nativeOverflow && (opt.vertical !== false) && (opt.horizontal !== false));
        if (isOverflowNative){
            el.css("overflow", "auto");
            el.css("-webkit-overflow-scrolling", "touch");
        } else {
            el.css("overflow", "hidden");
            el.css("-webkit-overflow-scrolling", "");
        }
    }

    checkOverflow();

    this.isOverflowNative = function(){
        return isOverflowNative;
    };

    function setHelpers(){
        el.append(topDiv, leftDiv);

        if (useWrap){
            divHeight = div.outerHeight();
            divWidth = div.outerWidth();
            topDiv.css("height", "100%");
            visibleHeight = topDiv.height();
            leftDiv.css("width", "100%");
            visibleWidth = leftDiv.width();
        } else {
            divHeight = div[0].scrollHeight;
            divWidth = div[0].scrollWidth;
            visibleHeight = div.height();
            visibleWidth = div.width();
        }
        scrollHeight = visibleHeight * 100 / divHeight;
        topDiv.css("height", scrollHeight);
        maxScrollHeight = divHeight - scrollHeight;
        subScrollHeight = divHeight - visibleHeight;
        usedHeight = visibleHeight - scrollHeight;

        scrollWidth = visibleWidth * 100 / divWidth;
        leftDiv.css("width", scrollWidth);
        maxScrollWidth = divWidth - scrollWidth;
        subScrollWidth = divWidth - visibleWidth;
        usedWidth = visibleWidth - scrollWidth;

        moveHelpers(touchObj.scrollTop, touchObj.scrollLeft);
        if (showHelpers){
            opt.vertical !== false && topDiv.show();
            opt.horizontal !== false && leftDiv.show();
        }

    }

    function moveHelpers(topVal, leftVal){
        var lVal, tVal, tdLeft, ldTop, dx;


        //problems...
        tVal = topVal + (topVal / subScrollHeight) * (usedHeight);
        tVal = (tVal > maxScrollHeight) ? maxScrollHeight : (tVal < 0) ? 0 : tVal;

        lVal = leftVal + (leftVal / subScrollWidth) * (usedWidth);
        lVal = (lVal > maxScrollWidth) ? maxScrollWidth : (lVal < 0) ? 0 : lVal;

        //works
        tdLeft = leftVal + visibleWidth;
        tdLeft = (tdLeft < visibleWidth) ? visibleWidth : (tdLeft > divWidth) ? divWidth : tdLeft;

        ldTop = topVal + visibleHeight;
        ldTop = (ldTop < visibleHeight) ? visibleHeight : (ldTop > divHeight) ? divHeight : ldTop;

        //opt.log.text("leftVal = " + leftVal + "| lVal = " + Math.round(lVal) + "| dx = " + dx + "| h3 = " + h3 + "| visibleWidth = " + visibleWidth + "| divWidth = " + divWidth + "| maxScrollWidth = " + maxScrollWidth);
        //set values
        if (showHelpers){
            opt.vertical !== false && topDiv.css({left: tdLeft - 10, top: tVal});
            opt.horizontal !== false && leftDiv.css({left: lVal, top: ldTop - 10});
        }
    }

    function getTouchEvent(ev){
        var e;
        if (ev.originalEvent.touches && ev.originalEvent.touches.length) {
            e = ev.originalEvent.touches[0];
        } else if (ev.originalEvent.changedTouches && ev.originalEvent.changedTouches.length) {
            e = ev.originalEvent.changedTouches[0];
        } else {
            e = ev;
        }
        return e;
    }

    function stopAnim(){
        clearTimeout(timerId);
        timerId = null;
        if (showHelpers){
            topDiv.hide();
            leftDiv.hide();
        }
    }

    function slowDown(t){

        var YspeedStart,
            Yspeed = YspeedStart = touchObj.Yspeed,
            Xspeed = touchObj.Xspeed,
            raf,
            duration = 1.06,
            to = 0,
            canStopX = false,
            canStopY = false,
            scrollTop = el.scrollTop(),
            scrollLeft = el.scrollLeft();


        function moving(){
            if (opt.vertical === false || scrollTop <= 0 || scrollTop >= maxScrollHeight - 1
                || (Yspeed <= 1.7 && Yspeed>= -1.7)){
                canStopY = true;
            } else {
                scrollTop = scrollTop + Yspeed;
                el.scrollTop(scrollTop);
                Yspeed = Yspeed/scSpeed;
            }

            if (opt.horizontal || scrollLeft <= 0 || scrollLeft >= maxScrollWidth -1
                || (Xspeed <= 1.7 && Xspeed>= -1.7)){
                canStopX = true;
            } else {
                scrollLeft = scrollLeft + Xspeed;
                el.scrollLeft(scrollLeft);
                Xspeed = Xspeed/scSpeed;
            }
            moveHelpers(scrollTop, scrollLeft);
            if (canStopX && canStopY){
                stopAnim();
            }
        }

        if (requestAnimationFrame) {
            timerId = true;
            raf = function() {
                if ( timerId ) {
                    moving();
                    requestAnimationFrame( raf );
                }
            };
            requestAnimationFrame( raf );
        } else {
            clearInterval(timerId);
            timerId = setInterval( function(){
                moving();
            }, 30 );
        }

    }


    this.stopAnim = function(){
        stopAnim();
    };

    this.onStart = function(ev){
        stopAnim();
        var t = getTouchEvent(ev);

        touchObj.Yspeed2 =  touchObj.Yspeed1 = touchObj.Y = t.clientY;
        touchObj.scrollTop = el.scrollTop();
        touchObj.Yspeed = 0;

        touchObj.Xspeed2 =  touchObj.Xspeed1 = touchObj.X = t.clientX;
        touchObj.scrollLeft = el.scrollLeft();
        touchObj.Xspeed = 0;

        setHelpers();
        if (opt.onTouchStart){
            opt.onTouchStart();
        }
    };

    this.onMove = function(ev){
        var t = getTouchEvent(ev),
            dx = touchObj.X - t.clientX,
            dy = touchObj.Y - t.clientY,
            topVal, leftVal;
        topVal = touchObj.scrollTop;
        if (opt.vertical !== false){
            topVal += dy;
            el.scrollTop(topVal);
        }
        touchObj.Yspeed2 = touchObj.Yspeed1;
        touchObj.Yspeed1 = t.clientY;
        touchObj.Yspeed = touchObj.Yspeed2 - touchObj.Yspeed1;

        leftVal = touchObj.scrollLeft;
        if (opt.horizontal !== false){
            leftVal += dx;
            el.scrollLeft(leftVal);
        }
        touchObj.Xspeed2 = touchObj.Xspeed1;
        touchObj.Xspeed1 = t.clientX;
        touchObj.Xspeed = touchObj.Xspeed2 - touchObj.Xspeed1;
        moveHelpers(topVal, leftVal);
    };

    this.onEnd = function(ev){
        slowDown(getTouchEvent(ev));
        if (opt.onTouchEnd){
            opt.onTouchEnd();
        }
    };

    this.options = function(key, value){
        if (value === undefined){
            return opt[key];
        } else {
            opt[key] = value;
            if (key == "vertical" || key == "horizontal"){
                checkOverflow();
            }
        }
    };

    this.enable = function(val){
        if (val !== undefined){
            opt.enable = val;
        }
        return (opt.enable !== false);   //return true, if enable == undefined
    };

    this.destroy = function(){
        div.data("slowScroll", null);
        div.removeClass("slow-scroll-lib");
        $(this).unbind();
    }
};
    var p = slowScroll.prototype;
    p.refresh = function(){
        //it's a cap
    };

    window['slowScroll'] = slowScroll;
})(window,document, jQuery);