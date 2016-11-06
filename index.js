//Pattern Match: A command line app with Node.js Transform stream
//Cecilia Tran
//CMPE 172
//Note: The command line application should take "what onepattern to match"(i.e; '.' , ',' and so on) as argument flag  and hence split/splice or transform the input(sensor data shown below) using the onepattern specified in the command line.

var program = require('commander');
var fileSystem = require('fs');
var util = require("util");
var Transform = require('stream').Transform;


////////////////////////////////////////////////s///////
//if (!Transform) {
//      Transform = require('readable-stream/transform');
//}

//Constructor logic includes Internal state logic. PatternMatch needs to consider it  because it has to parse chunks that gets transformed
//Switching on object mode so when stream reads sensordata it emits single onepattern match.
function PatternMatch(pattern) {
    
    if (!(this instanceof PatternMatch)) {
        return (new PatternMatch(pattern));
    }
    Transform.call(this, { objectMode: true });
    if(!(pattern instanceof RegExp)){
		pattern = new RegExp(pattern, "g");
    }
    this.onepattern = this._pattern(pattern);
    this.bufferInput = "";
}

util.inherits(PatternMatch, Transform);
// Extend the Transform class.
// --
// NOTE: This only extends the class methods - not the internal properties. As such we
// have to make sure to call the Transform constructor(above). 

PatternMatch.prototype._pattern = function(pattern){
    var parts = pattern.toString().slice(1).split("/");
    var flag = (parts[1] || "g");
    var regex = parts[0];
    
    if (flag.indexOf("g") === -1){
        flag += "g";
    }
    return (new RegExp(regex, flag));
};


PatternMatch.prototype._flush = function(done){
    var match = null;
    
    //output
    console.log("<<<<<<<<<<<<< Output >>>>>>>>>>>>>\n", output);
    console.log("\nFlush: ", this.bufferInput);
    
    this.bufferInput = "";
    this.push(null);
    
    done();
};


PatternMatch.prototype._transform = function(chunk, encoding, getNextChunk){
    console.log(">>>>>>>>>>>> Input Chunk <<<<<<<<<<<<\n", chunk.toString("utf8"));
    this.bufferInput += chunk.toString("utf8");
    
    var nextOffset = null;
    var match = null;
    
    while((match = this.onepattern.exec(this.bufferInput))!== null){
        var counter = 1;
        if(/^[a-zA-Z]+$/.test(match[0])){
			count = match[0].length;}
        
        if (this.onepattern.lastIndex < this.bufferInput.length){
            this.push(chunk.toString().substring(nextOffset, this.onepattern.lastIndex - counter));
            nextOffset = this.onepattern.lastIndex;
        } else {
            nextOffset = match.index;
        }
    }
    
    if (nextOffset !== null) {
        this.bufferInput = this.bufferInput.slice(nextOffset);
    } else {
        this.bufferInput = "";
    }
    
    this.onepattern.lastIndex = 0;
    getNextChunk();
};

//FILE STUFF
var filename = './textinput.txt';
var inputStream = fileSystem.createReadStream(filename);
program.option('-p, --onepattern <onepattern>', 'Input Pattern such as . or ,').parse(process.argv);

var regex = null;

if(program.onepattern === ",") {
    regex = /\,+/i;
} else if(program.onepattern === "."){ 
    regex = /\.+/i;
} else {
    regex = program.onepattern;
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


