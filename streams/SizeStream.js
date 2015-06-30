define(function(require, exports, module) {
    var EventHandler = require('famous/core/EventHandler');
    var Timer = require('famous/utilities/Timer');
    var dirtyQueue = require('famous/core/queues/dirtyQueue');
    var Stream = require('famous/streams/Stream');

    var DEBOUNCE_FRAME_LIMIT = 10;

    function SizeStream(){
        this._eventInput = new EventHandler();
        this._eventOutput = new EventHandler();
        EventHandler.setInputHandler(this, this._eventInput);
        EventHandler.setOutputHandler(this, this._eventOutput);

        var resizeFired = false;

        var debouncedResize = Timer.frameDebounce(function(size){
            dirtyQueue.push(function(){
                this.emit('end', size);
                resizeFired = false;
            }.bind(this));
        }.bind(this), DEBOUNCE_FRAME_LIMIT);

        //TODO: last resize should win if multiple are fired
        this._eventInput.on('resize', function(size){
            this.emit('resize', size);

            if (!resizeFired) {
                this.emit('start', size);

                resizeFired = true;
                debouncedResize(size);
            }
            else {
                this.emit('update', size);
                debouncedResize(size);
            }
        }.bind(this));

//        this._eventInput.on('start', function(size){
//            this._eventInput.trigger('resize', size)
//        }.bind(this));
//
//        this._eventInput.on('update', function(size){
//            this._eventInput.trigger('resize', size)
//        }.bind(this));
//
//        this._eventInput.on('end', function(size){
//            this._eventInput.trigger('resize', size)
//        }.bind(this));

        this._eventOutput.subscribe(this._eventInput);
    }

    SizeStream.prototype = Object.create(Stream.prototype);
    SizeStream.prototype.constructor = SizeStream;

    module.exports = SizeStream;
});