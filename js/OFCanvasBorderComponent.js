'use strict';
(function() {

    var root = this;
    var OFCanvasComponent = root.fin.wc.canvas.OFCanvasComponent;

    function OFCanvasBorderComponent(comp) {

        var g = document.createElement('fin-rectangle');
        OFCanvasComponent.call(this);
        var supr = {};
        var component = comp;

        this.paint = function(gc) {

            try {
                gc.save();
                var rect = this.getBounds();
                var lw = this.getBorderThickness();
                gc.beginPath();
                gc.lineWidth = lw;
                gc.strokeStyle = this.getColor();
                gc.rect(lw / 2, lw / 2, rect.width() - lw, rect.height() - lw);
                gc.stroke();
            } finally {
                gc.restore();
            }

            if (component) {
                component._paint(gc);
            }
        };

        this.setComponent = function(comp) {
            component = comp;
        };

        this.getBorderThickness = function() {
            return 5;
        };

        supr.setBounds = this.setBounds;
        this.setBounds = function(rectangle) {
            supr.setBounds(rectangle);
            var lw = this.getBorderThickness();
            var extent = rectangle.extent;
            var rect = g.rectangle.create(lw, lw, extent.x - 2 * lw, extent.y - 2 * lw);
            component.setBounds(rect);
        };

    }

    var proto = OFCanvasBorderComponent.prototype = Object.create(OFCanvasComponent.prototype);

    root.fin.wc.canvas.OFCanvasBorderComponent = proto.constructor = OFCanvasBorderComponent;

}).call(this); /* jshint ignore:line */
