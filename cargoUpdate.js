const fs = require('fs');
	Tail = require('tail').Tail,
	_ = require('underscore'),
	path = require('path');

var file = "";

var savedFileName = "yoyo.json";
var defaultSavedFile = {"lastFile": "","lastTS": "","Commander": {}};

/*************************************************/
// EDIT THIS to your journal's file path.
/*************************************************/
var journalDir = "C:/Users/***/Saved Games/Frontier Developments/Elite Dangerous";
var tail;

/*************************************************/
// YOU NEED TO EDIT THIS virginCargo. IT IS YOUR CARGO BEFORE JOURNALS. 
//summary : it takes this, and read journals, and gives the result. So adjust this to have the correct output.
//once done, you should not have to do it again, ever. not everything is here, you may have to add some things.
// after this, you shouldnt have to edit anything else in this file.
/*************************************************/
var virginCargo = {
	// materials
        "arsenic": 2, 
        "biotechconductors": 3,
        "cadmium": 2,
        "carbon": 10,
        "chemicaldistillery": 6,
        "chemicalmanipulators": 4,
        "chemicalprocessors": 5,
        "chromium": 4,
        "compoundshieldings": 2,
        "conductiveceramics": 3,
        "conductivecomponents": 4,
        "conductivepolymers": 1,
        "configurablecomponents": 2,
        "electrochemicalarrays" : 1,
        "exquisitefocuscrystals" : 1,
        "focuscrystals" : 15,
        "galvanisingalloys" : 26,
        "germanium" : 2,
        "gridresistors" : 7,
        "heatconductingwiring" : 7,
        "heatdispersionplate" : 4,
        "heatexchangers" :2,
        "heatvanes" :2,
        "highdensitycomposites" : 4,
        "hybridcapacitors" : 4,
        "iron" : 42,
        "maganese" : 21,
        "mechanicalcomponents" : 5,
        "mechanicalequipment" : 4,
        "mechanicalscrap" : 5,
        "molybdenum" : 3,
		"nickel": 39,
		"niobium": 1,
		"phasealloys":6,
		"phosphorus":13,
		"precipitatedalloys" : 10,
		"proprietarycomposites" : 1,
		"protolightalloys" : 5,
		"refinedfocuscrystals" : 14,
		"salvagedalloys" : 11,
		"selenium": 6,
		"shieldemitters": 19,
		"shieldingsensors":22,
		"sulphur":44,
		"tin":1,
		"vanadium":1,
		"wornshieldemitters":3,
		"zinc" :3,
		"zirconium" :2,

	//data
		"aberrantshieldpatternanalysis" : 27,
		"anomalousbulkscandata" : 24,
		"anomalousfsdtelemetry" : 9,
		"atypicaldisruptedwakeechoes" : 17,
		"classifiedscandatabanks" : 18,
		"classifiedscanfragment" : 2,
		"crackedindustrialfirmware" : 1,
        "decodedemissiondata": 38,
		"distordedshieldcyclerecordings":18,
		"divergentscandata" : 4,
		"exceptionalscrambledemissiondata" : 2,
		"inconsistentshieldsoakanalysis" : 33,
		"modifiedconsumerfirmware" : 4,
		"opensymmetrickeys" : 2,
		"securityfirmwarepatch" : 2,
		"specialisedlegacyfirmware" : 2,
		"taggedencryptioncodes" : 1,
		"unexpectedemissiondata" : 26,
		"unidentifiedscanarchives" : 23,
		"untypicalshieldscans" : 39,
		"unusualencryptedfiles" : 1,
	// commodities
        "articulationmotors": 2,
        "modularterminals": 0,
        "neofabricinsulation": 0,
        "telemetrysuite": 0,

        "legacyfirmware": 1,
        "emissiondata": 1,
        "manganese": 1,
        "hyperspacetrajectories": 1
      };
var virginShip = '{ "ShipID" : "", "Ship":"", "FSDJumps": 0 }';


var savedFile;
var currentCargo;
var currentCommander;
var currentShip;
var canContinue;

/*************************************************/
/********** START ********************************/
/*************************************************/
init();
refreshFile();

function init(){
	//test if savedFileExists
	try{
		fs.accessSync(savedFileName, fs.constants.R_OK | fs.constants.W_OK);	
	
		//read saved file yoyo.json
		fs.readFile(savedFileName,'utf8', (err, data) => {
		 	if (err) throw err;
		 	if(data.length === 0){
		 		newSavedFile();
		 	}
		 	else{
				// init var from saved file.
				console.log("readSavedFile :"+data);
				savedFile = JSON.parse(data);
				updateCargo();
		 	}
		});
	
	}catch (err){
		newSavedFile();
	}
}

function newSavedFile(){
	console.log("something wring with savedFile...rebuilding");
	savedFile = defaultSavedFile;
	saveSavedFile();
	updateCargo();
}

function updateCargo(){
	console.log("updateCargo " );
	var files = getFilesInOrder(journalDir);
	for (var i = 0; i < files.length; i++) {
		if(savedFile.lastFile === "" || files[i] >= savedFile.lastFile){
			//work now
			var currentFile = files[i];
			analyseFile(currentFile);
			savedFile.lastFile = currentFile;
			saveSavedFile();
		}
		else{
			console.log();
		}
	}
}

function analyseFile(currentFile){
	console.log("                    ----analyseFile---- " +currentFile );
	var data = fs.readFileSync(journalDir+"/"+currentFile,'utf8');
	var dataS;
	if(data.indexOf("\r\n") != -1){
		dataS = data.split("\r\n");
	}
	else{
		dataS = data.split("\n");
	}
	var skipped = 0;
	for (var i = 0; i < dataS.length; i++) {
		try{
			if(dataS[i] === ""){
				console.log("EndOfFile");
				break;
			}
			var entry = JSON.parse(dataS[i]);
			if(entry.timestamp > savedFile.lastTS 
				|| entry.event === "LoadGame"){
				analyseEntry(entry);
			}
			else{
				skipped++;
			}
		}
		catch(err){console.log("ERR "+err)}
	}
}

function refreshFile(){
	console.log(".");
	var temp = getMostRecentFileName(journalDir);
	if (temp !== file){
		file = temp;
		console.log("file : "+temp);
		if(tail){
			tail.unwatch();
		}
		tail = new Tail("C:/Users/chboing/Saved Games/Frontier Developments/Elite Dangerous/"+file);

		tail.on("line", function(data) {
		  analyseEntry(JSON.parse(data));
		});

		tail.on("error", function(error) {
		  console.log('ERROR: ', error);
		});
	}
	setTimeout(refreshFile,5000);
}

function analyseEntry(entry){
	//console.log("analyseEntry "+JSON.stringify(entry));

	switch(entry.event){
		case "LoadGame":
			console.log("LoadGame "+JSON.stringify(entry.Ship));
			loadGame(entry);
			break;
		case "FSDJump":
			FSDJump(entry);
			break;
		case "MarketSell":
			MarketSell(entry);
			break;
		case "MarketBuy":
			MarketBuy(entry);
			break;
		case "MiningRefined":
			MiningRefined(entry);
			break;
		case "ShipyardNew":
			console.log("ShipyardNew "+JSON.stringify(entry.ShipType));
			ShipyardNew(entry);
			break;
		case "ShipyardSwap":
			console.log("ShipyardSwap -> "+JSON.stringify(entry.ShipType));
			ShipyardSwap(entry);
			break;
		case "CollectCargo":
			CollectCargo(entry);
			break;
		case "EjectCargo":
			EjectCargo(entry);
			break;
		case "MissionCompleted":
			MissionCompleted(entry);
			break;
		case "MaterialCollected":
			MaterialCollected(entry);
			break;
		case "MaterialDiscarded":
			MaterialDiscarded(entry);
			break;
		case "EngineerCraft":
			EngineerCraft(entry);
			break;
		default:
			//console.log("ignoring event "+entry.event);
	}
	if(entry.event !== "LoadGame"){
		savedFile.lastTS = entry.timestamp;
	}
	saveSavedFile();
}
/********************************/
/******** EVENTS ****************/
/********************************/
function loadGame (entry){
	if(savedFile.Commander[entry.Commander]){
		currentCommander = savedFile.Commander[entry.Commander];
		currentCargo = savedFile.Commander[entry.Commander].cargo;
		for (var i = 0; i < savedFile.Commander[entry.Commander].ships.length; i++) {
			var curShip = savedFile.Commander[entry.Commander].ships[i];
			if(curShip.ShipID === entry.ShipID){
				currentShip = curShip;
			}
		}
		if(!currentShip){
			//no ship found -> -> new ship 
			var newShipThen = JSON.parse(virginShip);
			newShipThen.ShipID = entry.ShipID;
			newShipThen.Ship = entry.Ship;
			savedFile.Commander[entry.Commander] = {ships :[ newShipThen ] };	
			currentShip = newShipThen;
		}
	}
	else{ // new commander -> new ship 
		var newShipThen = JSON.parse(virginShip);
		newShipThen.ShipID = entry.ShipID;
		newShipThen.Ship = entry.Ship;
		savedFile.Commander[entry.Commander] = {ships :[ newShipThen ], cargo : virginCargo };
		currentShip = newShipThen;
		currentCommander = savedFile.Commander[entry.Commander];
		currentCargo = currentCommander.cargo;
	}
}
function FSDJump(entry){
	currentShip.FSDJumps++;
}
function MarketSell(entry){
	removeFromCargo(entry.Type,entry.Count);
}
function MarketBuy(entry){
	addToCargo(entry.Type,entry.Count);	
}
function MiningRefined(entry){
	addToCargo(entry.Type,1);	
}
function CollectCargo(entry){
	addToCargo(entry.Type,1);	
}
function EjectCargo(entry){
	removeFromCargo(entry.Type,1);	
}
function MaterialCollected(entry){
	addToCargo(entry.Name,entry.Count);	
}
function MaterialDiscarded(entry){
	removeFromCargo(entry.Name,entry.Count);	
}
function MissionCompleted(entry){
	if(entry.CommodityReward){
		for (var i = 0; i < entry.CommodityReward.length; i++) {
			addToCargo(entry.CommodityReward[i].Name,entry.CommodityReward[i].Count);	
		}
	}
}
function ShipyardNew(entry){
	var testAlreadyExists = null;
	try{
		for (var i = 0; i < currentCommander.ships.length; i++) {
				var curShip = currentCommander.ships[i];
				if(curShip.ShipID === entry.NewShipID){
					throw "DATA CORRUPTED ShipyardNew : ship already exists "+curShip.Ship+"("+curShip.ShipID+")";
				}
			}
		var newShipThen = JSON.parse(virginShip);
		newShipThen.ShipID = entry.NewShipID;
		newShipThen.Ship = entry.ShipType;
		currentShip = newShipThen;
		currentCommander.ships.push(newShipThen);
	}catch(err){console.log(err);}
}
function ShipyardSwap(entry){
	currentShip = null;
	for (var i = 0; i < currentCommander.ships.length; i++) {
			var curShip = currentCommander.ships[i];
			if(curShip.ShipID === entry.ShipID){
				currentShip = curShip;
			}
		}
	if(currentShip == null){
		ShipyardNew(entry);
		currentShip.ShipID = entry.ShipID;
	}
}
function EngineerCraft(entry){
	for(ingredient in entry.Ingredients){
		removeFromCargo(ingredient,entry.Ingredients[ingredient]);
	}
}


/********************************/
/******** UTILS *****************/
/********************************/

function removeFromCargo(thing,quantity){
	if(!currentCargo[thing.toLowerCase()]){
		currentCargo[thing.toLowerCase()] = 0;
	}
	currentCargo[thing.toLowerCase()] -= quantity;
}
function addToCargo(thing,quantity){
	if(!currentCargo[thing.toLowerCase()]){
		currentCargo[thing.toLowerCase()] = 0;
	}
	currentCargo[thing.toLowerCase()] += quantity;
}
function saveSavedFile(){
	fs.writeFile(savedFileName, JSON.stringify(savedFile,null,2) , (err) => {
	  if (err) throw err;
	});
}

// Return only base file name without dir
function getMostRecentFileName(dir) {
    var files = fs.readdirSync(dir);

    // use underscore for max()
    return _.max(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).mtime;
    });
}

// Return only base file name without dir
function getFilesInOrder(dir) {
    var files = fs.readdirSync(dir);

    // use underscore for max()
    files =  _.sortBy(files, function (f) {
        var fullpath = path.join(dir, f);

        // ctime = creation time is used
        // replace with mtime for modification time
        return fs.statSync(fullpath).ctime;
    });
    console.log("ordered Files :" + JSON.stringify(files, null, 2));
    return files;
}
