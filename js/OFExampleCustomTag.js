'use strict';

(function() {
    var root = this;


    var initInstance = function(self) {
        var OFCanvasComponent = root.fin.wc.canvas.OFCanvasComponent;
        var OFCanvasBorderComponent = root.fin.wc.canvas.OFCanvasBorderComponent;
        self.canvas = self.shadowRoot.querySelector('fin-canvas');

        var comp = new OFCanvasBorderComponent(new OFCanvasComponent());
        comp.setColor('red');
        var props = {
            top: [0, 0],
            right: [1, 0],
            bottom: [0.5, 0],
            left: [0, 0]
        };
        comp.setLayoutProperties(props);
        self.canvas.addComponent(comp);

        var comp2 = new OFCanvasBorderComponent(new OFCanvasComponent());
        comp2.setColor('green');
        var props2 = {
            top: [0.5, 0],
            right: [1, 0],
            bottom: [1, 0],
            left: [0, 0]
        };
        comp2.setLayoutProperties(props2);
        self.canvas.addComponent(comp2);

    };

    root.fin.wc.canvas.OFExampleCustomTag = initInstance;

}).call(this); /* jslint ignore:line */
