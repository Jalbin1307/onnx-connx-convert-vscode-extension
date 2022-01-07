import * as vscode from 'vscode';
import { Uri,workspace } from 'vscode';
import FormData = require('form-data');
const fs = require('fs');
var request = require('request');

export function activate(context: vscode.ExtensionContext) {
	
	console.log('Congratulations, your extension "onnx2connx-convert" is now active!');

	const provide = new OnnxViewProvider(context.extensionUri);
	context.subscriptions.push(
		vscode.window.registerWebviewViewProvider(OnnxViewProvider.viewType, provide),

	);

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
		});		
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}


class OnnxViewProvider implements vscode.WebviewViewProvider {

	public static readonly viewType = 'opw';

	private _view?: vscode.WebviewView;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }
			

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

	}


	private _getHtmlForWebview(webview: vscode.Webview) {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'page.html'));
		const pathUri = scriptUri.with({scheme:'vscode-resource'});
		const html = fs.readFileSync(pathUri.fsPath,'utf-8');
		return html;
	}
}