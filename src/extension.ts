import * as vscode from 'vscode';
import { Uri,workspace } from 'vscode';
import FormData = require('form-data');
const fs = require('fs');
var request = require('request');

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "onnx2connx-convert" is now active!');

	// context menu command : ONNX to CONNX convert
	let disposable = vscode.commands.registerCommand('onnx2connx-convert.convert', (uri: Uri, items : Uri[]) => {
		var formData = new FormData();
		const workspacefolder = workspace.getWorkspaceFolder(Uri.file(items[0].path))?.uri.path;

		formData.append("file",fs.createReadStream(items[0].path));
		console.log(formData);

		//Local host :        http://127.0.0.1:8000/
		//ONNX-CONNX Server : https://mysite-tscvl.run.goorm.io/
		formData.submit('https://mysite-tscvl.run.goorm.io/rest_api_test/', function(err, res){
			if(err) throw err;
			if(res){			
				var wstream = fs.createWriteStream(workspacefolder + "/connx.zip");
				res.on('data',function(data){
					wstream.write(data);
				});
				res.on('end',function(){
					wstream.end();
				});
				res.on('error',function(err){
					console.log('Something is Wrong');
					wstream.close();
				});	
			}
			console.log('Done');
		});		
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
