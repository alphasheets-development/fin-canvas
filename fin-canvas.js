'use strict';
/* globals document, requestAnimationFrame, CustomEvent */

(function() {

    var charMap = [];
    var empty = ['', ''];
    for (var i = 0; i < 256; i++) {
        charMap[i] = empty;
    }

    charMap[27] = ['ESC', 'ESCSHIFT'];
    charMap[192] = ['`', '~'];
    charMap[49] = ['1', '!'];
    charMap[50] = ['2', '@'];
    charMap[51] = ['3', '#'];
    charMap[52] = ['4', '$'];
    charMap[53] = ['5', '%'];
    charMap[54] = ['6', '^'];
    charMap[55] = ['7', '&'];
    charMap[56] = ['8', '*'];
    charMap[57] = ['9', '('];
    charMap[48] = ['0', ')'];
    charMap[189] = ['-', '_'];
    charMap[187] = ['=', '+'];
    charMap[8] = ['DELETE', 'DELETESHIFT'];
    charMap[9] = ['TAB', 'TABSHIFT'];
    charMap[81] = ['q', 'Q'];
    charMap[87] = ['w', 'W'];
    charMap[69] = ['e', 'E'];
    charMap[82] = ['r', 'R'];
    charMap[84] = ['t', 'T'];
    charMap[89] = ['y', 'Y'];
    charMap[85] = ['u', 'U'];
    charMap[73] = ['i', 'I'];
    charMap[79] = ['o', 'O'];
    charMap[80] = ['p', 'P'];
    charMap[219] = ['[', '{'];
    charMap[221] = [']', '}'];
    charMap[220] = ['\\', '|'];
    charMap[220] = ['CAPSLOCK', 'CAPSLOCKSHIFT'];
    charMap[65] = ['a', 'A'];
    charMap[83] = ['s', 'S'];
    charMap[68] = ['d', 'D'];
    charMap[70] = ['f', 'F'];
    charMap[71] = ['g', 'G'];
    charMap[72] = ['h', 'H'];
    charMap[74] = ['j', 'J'];
    charMap[75] = ['k', 'K'];
    charMap[76] = ['l', 'L'];
    charMap[186] = [';', ':'];
    charMap[222] = ['\'', '|'];
    charMap[13] = ['RETURN', 'RETURNSHIFT'];
    charMap[16] = ['SHIFT', 'SHIFT'];
    charMap[90] = ['z', 'Z'];
    charMap[88] = ['x', 'X'];
    charMap[67] = ['c', 'C'];
    charMap[86] = ['v', 'V'];
    charMap[66] = ['b', 'B'];
    charMap[78] = ['n', 'N'];
    charMap[77] = ['m', 'M'];
    charMap[188] = [',', '<'];
    charMap[190] = ['.', '>'];
    charMap[191] = ['/', '?'];
    charMap[16] = ['SHIFT', 'SHIFT'];
    charMap[17] = ['CTRL', 'CTRLSHIFT'];
    charMap[18] = ['ALT', 'ALTSHIFT'];
    charMap[91] = ['COMMANDLEFT', 'COMMANDLEFTSHIFT'];
    charMap[32] = ['SPACE', 'SPACESHIFT'];
    charMap[93] = ['COMMANDRIGHT', 'COMMANDRIGHTSHIFT'];
    charMap[18] = ['ALT', 'ALTSHIFT'];
    charMap[38] = ['UP', 'UPSHIFT'];
    charMap[37] = ['LEFT', 'LEFTSHIFT'];
    charMap[40] = ['DOWN', 'DOWNSHIFT'];
    charMap[39] = ['RIGHT', 'RIGHTSHIFT'];

    Polymer('fin-canvas', { /* jshint ignore:line */
        ready: function() {

            this.g = document.createElement('fin-rectangle');
            var self = this;
            this.canvas = this.shadowRoot.querySelector('.canvas');
            this.focuser = this.shadowRoot.querySelector('button');
            this.canvasCTX = this.canvas.getContext('2d');

            this.buffer = document.createElement('canvas');
            this.ctx = this.buffer.getContext('2d');

            this.fps = this.getAttribute('fps') || 60;

            document.addEventListener('mousemove', function(e) {
                self.ofmousemove(e);
            });
            document.addEventListener('mouseup', function(e) {
                self.ofmouseup(e);
            });
            this.focuser.addEventListener('focus', function(e) {
                self.offocusgained(e);
            });
            this.focuser.addEventListener('blur', function(e) {
                self.offocuslost(e);
            });
            this.addEventListener('mousedown', function(e) {
                self.ofmousedown(e);
            });
            this.addEventListener('mouseout', function(e) {
                self.ofmouseout(e);
            });
            document.addEventListener('keydown', function(e) {
                self.ofkeydown(e);
            });
            document.addEventListener('keyup', function(e) {
                self.ofkeyup(e);
            });
            this.addEventListener('click', function(e) {
                self.ofclick(e);
            });
            this.addEventListener('dblclick', function(e) {
                self.ofdblclick(e);
            });

            this.addEventListener('of-focus-gained', function(e) {
                console.log('focus-gained', e);
            });

            this.mouseLocation = this.g.point.create(-1, -1);
            this.dragstart = this.g.point.create(-1, -1);
            this.origin = this.g.point.create(0, 0);
            this.bounds = this.g.rectangle.create(0, 0, 0, 0);

            this.resize();
            this.beginPainting();
        },


        repaintNow: false,
        size: null,

        mousedown: false,
        dragging: false,
        focused: false,
        repeatKeyCount: 0,
        repeatKey: null,
        repeatKeyStartTime: 0,
        currentKeys: [],

        getComponent: function() {
            var comp = this.children[0];
            return comp;
        },

        beginPainting: function() {
            var self = this;
            self.repaintNow = true;
            var interval = 1000 / this.fps;
            var lastRepaintTime = 0;
            var animate = function(now) {
                self.checksize();
                var delta = now - lastRepaintTime;
                if (delta > interval && self.repaintNow) {
                    lastRepaintTime = now - (delta % interval);
                    self.paintNow();
                }
                requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
        },

        checksize: function() {
            var sizeNow = this.getBoundingClientRect();
            if (sizeNow.width !== this.size.width || sizeNow.height !== this.size.height) {
                this.sizeChangedNotification();
            }
        },

        sizeChangedNotification: function() {
            this.resize();
        },

        resize: function() {
            this.size = this.getBoundingClientRect();

            this.canvas.width = this.clientWidth;
            this.buffer.width = this.clientWidth;

            this.canvas.height = this.clientHeight;
            this.buffer.height = this.clientHeight;

            this.origin = this.g.point.create(this.size.left, this.size.top);
            this.bounds = this.g.rectangle.create(0, 0, this.size.width, this.size.height);
            //setTimeout(function() {
            var comp = this.getComponent();
            if (comp) {
                comp.setBounds(this.bounds);
            }
            this.resizeNotification();
            this.paintNow();
            //});
        },

        resizeNotification: function() {
            //to be overridden
        },

        getBounds: function() {
            return this.bounds;
        },

        paintNow: function() {
            var gc = this.ctx;
            try {
                gc.save();
                gc.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.paint(gc);
            } finally {
                gc.restore();
            }
            this.flushBuffer();
            this.repaintNow = false;
        },

        flushBuffer: function() {
            if (this.buffer.width > 0 && this.buffer.height > 0) {
                this.canvasCTX.drawImage(this.buffer, 0, 0);
            }
        },

        paint: function(gc) {
            var comp = this.getComponent();
            if (comp) {
                comp._paint(gc);
            }
        },

        ofmousemove: function(e) {
            var o = this.getOrigin();
            if (!this.dragging && this.mousedown) {
                this.dragging = true;
                this.dispatchEvent(new CustomEvent('of-dragstart', {
                    detail: {
                        mouse: this.mouseLocation,
                        keys: this.currentKeys
                    }
                }));
                this.dragstart = this.g.point.create(this.mouseLocation.x, this.mouseLocation.y);
            }
            this.mouseLocation = this.g.point.create((e.x || e.layerX) - o.x, (e.y || e.layerY) - o.y);
            if (this.dragging) {
                this.dispatchEvent(new CustomEvent('of-drag', {
                    detail: {
                        mouse: this.mouseLocation,
                        dragstart: this.dragstart,
                        keys: this.currentKeys
                    }
                }));
            }
            if (this.bounds.contains(this.mouseLocation)) {
                this.dispatchEvent(new CustomEvent('of-mousemove', {
                    detail: {
                        mouse: this.mouseLocation,
                        keys: this.currentKeys
                    }
                }));
            }
        },

        ofmousedown: function(e) {

            this.mouseLocation = this.g.point.create((e.offsetX || e.layerX), (e.offsetY || e.layerY));
            this.mousedown = true;

            this.dispatchEvent(new CustomEvent('of-mousedown', {
                detail: {
                    mouse: this.g.point.create((e.offsetX || e.layerX), (e.offsetY || e.layerY)),
                    keys: this.currentKeys
                }
            }));
            this.takeFocus();

        },

        ofmouseup: function() {
            if (this.dragging) {
                this.dispatchEvent(new CustomEvent('of-dragend', {
                    detail: {
                        mouse: this.mouseLocation,
                        dragstart: this.dragstart,
                        keys: this.currentKeys
                    }
                }));
                this.dragging = false;
            }
            this.mousedown = false;
            this.mouseLocation = this.g.point.create(-1, -1);
            this.dispatchEvent(new CustomEvent('of-mouseup', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        ofmouseout: function() {
            if (!this.mousedown) {
                this.mouseLocation = this.g.point.create(-1, -1);
            }
            this.dispatchEvent(new CustomEvent('of-mouseout', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        ofclick: function(e) {
            this.mouseLocation = this.g.point.create((e.offsetX || e.layerX), (e.offsetY || e.layerY));
            this.dispatchEvent(new CustomEvent('of-click', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        ofdblclick: function(e) {
            this.mouseLocation = this.g.point.create((e.offsetX || e.layerX), (e.offsetY || e.layerY));
            this.dispatchEvent(new CustomEvent('of-dblclick', {
                detail: {
                    mouse: this.mouseLocation,
                    keys: this.currentKeys
                }
            }));
        },

        ofkeydown: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            e.preventDefault();
            var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
            if (e.repeat) {
                if (this.repeatKey === keyChar) {
                    this.repeatKeyCount++;
                } else {
                    this.repeatKey = keyChar;
                    this.repeatKeyStartTime = Date.now();
                }
            } else {
                this.repeatKey = null;
                this.repeatKeyCount = 0;
                this.repeatKeyStartTime = 0;
            }
            if (this.currentKeys.indexOf(keyChar) === -1) {
                this.currentKeys.push(keyChar);
            }
            this.dispatchEvent(new CustomEvent('of-keydown', {
                detail: {
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                    char: keyChar,
                    code: e.charCode,
                    key: e.keyCode,
                    meta: e.metaKey,
                    repeatCount: this.repeatKeyCount,
                    repeatStartTime: this.repeatKeyStartTime,
                    shift: e.shiftKey,
                    identifier: e.keyIdentifier
                }
            }));
        },

        ofkeyup: function(e) {
            if (!this.hasFocus()) {
                return;
            }
            var keyChar = e.shiftKey ? charMap[e.keyCode][1] : charMap[e.keyCode][0];
            this.repeatKeyCount = 0;
            this.repeatKey = null;
            this.repeatKeyStartTime = 0;
            this.currentKeys.splice(this.currentKeys.indexOf(keyChar), 1);
            this.dispatchEvent(new CustomEvent('of-keyup', {
                detail: {
                    alt: e.altKey,
                    ctrl: e.ctrlKey,
                    char: keyChar,
                    code: e.charCode,
                    key: e.keyCode,
                    meta: e.metaKey,
                    repeat: e.repeat,
                    shift: e.shiftKey,
                    identifier: e.keyIdentifier
                }
            }));
        },

        offocusgained: function(e) {
            this.focused = true;
            this.dispatchEvent(new CustomEvent('of-focus-gained', {
                detail: {
                    e: e
                }
            }));
        },

        offocuslost: function(e) {
            this.focused = false;
            this.dispatchEvent(new CustomEvent('of-focus-lost', {
                detail: {
                    e: e
                }
            }));
        },

        repaint: function() {
            this.repaintNow = true;
        },

        getMouseLocation: function() {
            return this.mouseLocation;
        },

        getOrigin: function() {
            return this.origin;
        },

        hasFocus: function() {
            return this.focused;
        },

        takeFocus: function() {
            var self = this;
            if (document.activeElement !== this.focuser) {
                setTimeout(function() {
                    self.focuser.focus();
                }, 10);
            }
        }

    });

})(); /* jslint ignore:line */
