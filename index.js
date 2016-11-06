//Pattern Match: A command line app with Node.js Transform stream
//Cecilia Tran
//CMPE 172
//Note: The command line application should take "what pattern to match"(i.e; '.' , ',' and so on) as argument flag  and hence split/splice or transform the input(sensor data shown below) using the pattern specified in the command line.

var program = require('commander');
var fileSystem = require('fs');
var util = require("util");
var Transform = require('stream').Transform;


///////////////////////////////////////////////////////
if (!Transform) {
      Transform = require('readable-stream/transform');
}

//Constructor logic includes Internal state logic. PatternMatch needs to consider it  because it has to parse chunks that gets transformed
//Switching on object mode so when stream reads sensordata it emits single pattern match.
function PatternMatch(pattern) {
    if (!(this instanceof PatternMatch)) {
        return (new PatternMatch(pattern));
    }
      this.pattern = pattern;
      Transform.call(this, { objectMode: true });
}

util.inherits(PatternMatch, Transform);
// Extend the Transform class.
// --
// NOTE: This only extends the class methods - not the internal properties. As such we
// have to make sure to call the Transform constructor(above). 

PatternMatch.prototype.pattern = function(pattern){
    var parts = pattern.toString().slice(1).split("/");
    var flag = (parts[1] || "g");
    var regex = parts[0];
    
    if (flag.indexOf("g") === -1){
        flag += "g";
    }
    return (new RegExp(regex, flags));
};


PatternMatch.prototype._flush = function(done){
    var match = null;
    
    //output
    console.log("<<<<<<<<<<<<< Output >>>>>>>>>>>>>\n", output);
    console.log("\nFlush: ", this._inputBuffer);
    
    this._inputBuffer = "";
    this.push(null);
    
    done();
};


PatternMatch.prototype._transform = function(chunk, encoding, getNextChunk){
    console.log(">>>>>>>>>>>> Input Chunk <<<<<<<<<<<<\n", chunk.toString("utf-8"));
    this._inputBuffer += chunk.toExponential("utf-8");
    
    var nextOffset = null;
    var match = null;
    
    while((match = this.pattern.exec(this._inputBuffer))!== null){
        var counter = 1;
        if(/^[a-zA-Z]+$/.test(match[0])){
			count = match[0].length;}
        if (this.pattern.lastIndex < this._inputBuffer.length){
            this.push(chunk.toString().substring(nextOffset, this.pattern.lastIndex - counter));
            nextOffset = this.pattern.lastIndex;
        } else {
            nextOffset = match.index;
        }
    }
    
    if (nextOffset !== null) {
        this._inputBuffer = this._inputBuffer.slice(nextOffset);
    } else {
        this._inputBuffer = "";
    }
    
    this.pattern.lastIndex = 0;
    getNextChunk();
};

//FILE STUFF
var inputStream = fileSystem.createReadStream('./input-sensor.txt');
program.option('-p, --pattern <pattern>', 'Input Pattern such as . or ,').parse(process.argv);

var regex = null;

if(program.pattern === ",") {
    regex = /\,+/i;
} else if(program.pattern === "."){ 
    regex = /\.+/i;
} else {
    regex = program.pattern;
}

//convert to string with regexp
var patternMatch = inputStream.pipe(new PatternMatch(regex));
var output = [];

patternMatch.on(
    "readable",
    function(){
        var content = null;
        while(content = this.read()){
            output.push(content.toString("utf8").trim());
        }
    }

);


