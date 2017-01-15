javascript: var iDiv = document.createElement('div');
iDiv.id = 'blockInaraCargoScript';
iDiv.style.top = '0px';
iDiv.style.width = '260px';
iDiv.style.display = 'inline-block';
//document.getElementsByTagName('body')[0].appendChild(iDiv);
$("div.menushortcuts").prepend($(iDiv));
var fileInput = document.createElement('input');
fileInput.id = 'fileinput';
fileInput.type = 'file';
iDiv.appendChild(fileInput);
var readSingleFile = function(evt) {
	var f = evt.target.files[0];
	if (f) {
		console.log("f.type " + f.type);
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result; /*alert(contents);*/
			var yoyo = JSON.parse(contents);
			if(yoyo.Commander){
				for(comm in yoyo.Commander){
					var cargo = yoyo.Commander[comm].cargo;
					console.log("CARGO : "+JSON.stringify(yoyo.Commander[comm].cargo));
					console.log("CARGO starting update");
					updateCargo(cargo);
					$($('h2.header')[0]).text(
						$($('h2.header')[0]).text() + " UPDATED !!!"
					);
					break; // we do only first commander ... easier :p
				}
			}
		};
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
};

function updateCargo(cargo){
	$.each($('input[name^="playerinv["]') , function(idx, value){
		var notFound = [];
		var name = $(value).siblings().find('a').text();
		name = name.replace(/\s/g,'');
		name = name.toLowerCase();
		if(cargo[name]){
			console.log("udpating "+name +" : "+ cargo[name]);
		var spinner = $(value).spinner();
		spinner.spinner( "value", cargo[name] );
		}
	});
}

fileInput.addEventListener('change', readSingleFile, false);