var ACCEPTABLE_EXTENSIONS = [".js", ".json"],
	DEFAULT_EXTENSION = ".js",
	DEFAULT_SERVICE = "default",
	DEFAULT_ACTION = "exec";

function hasValidExtension(moduleName) {
	return ACCEPTABLE_EXTENSIONS.some(function (element, index, array) {
		return moduleName.match("\\" + element + "$");
	});
}

function rebuildRequest(req) {
	var originalURL = req.params.service + "/" +
			req.params.action +
			(req.params.ext ? "/" + req.params.ext  : "") +
			(req.params.method ? "/" + req.params.method : "") +
			(req.params.args ? "?" + req.params.args : ""),
		tokens = originalURL.split('/'),
		//Handle the case where the method is multi-level
		finalToken = (tokens[1] && tokens.length > 2) ? tokens.slice(1).join('/') : tokens[1],
		args = null;

	// set args
	if (finalToken && finalToken.indexOf("?") >= 0) {
		// Re-split args
		args = finalToken.split("?")[1];
	}

	return {
		params : {
			service : DEFAULT_SERVICE,
			action : DEFAULT_ACTION,
			ext : tokens[0],
			method : (finalToken && finalToken.indexOf("?") >= 0) ? finalToken.split("?")[0] : finalToken,
			args : args
		},
		body : req.body,
		origin : req.origin
	};
}

function parseArgs(req) {
	var args = null,
		params;
	// set args
	if (req.params.args && typeof req.params.args === "string") {
		// GET querystring to json
		params = req.params.args.split("&");
		if (params) {
			args = {};
			params.forEach(function (param) {
				var parts = param.split("=");
				args[parts[0]] = parts[1];
			});
		}
	} else {
		// POST body to json
		if (req.body) {
			args = JSON.parse(req.body);
		}
	}
	req.params.args = args;
}

// This module replaces the 'plugin/extension.js' from the webworks library.
define('customPlugin', function (require, exports, module) {

	module.exports = {
		get: function (request, succ, fail, args, env) {
			// The extension for each webview have already been assembled.  Return them now.
			console.log(env.webview.params.name + ' get: ', env.webview.modules.extNames);
			succ(env.webview.modules.extNames);
		},
		load: function (request, succ, fail, args, env) {
			var extension = request.params.ext,
				path = env.webview.modules.path,
				xhr,
				commentRegExp = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg,
				cjsRequireRegExp = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g,
				deps = [];

			try {
				xhr = new XMLHttpRequest();
				// Retrieve client API from the webviews unique location
				xhr.open("GET", path + "chrome/ext/" + extension + "/client.js", false);
				xhr.send();

				// get rid of all comments from client JS, parses out all require statements, for each require statement found
				// in client JS, push a JSON object (module path, module body) into the array
				// multi-level dependencies are not supported
				xhr.responseText.replace(commentRegExp, "").replace(cjsRequireRegExp, function (match, module) {
					var req = new XMLHttpRequest(),
						modulePath = require.toUrl(module, path + "chrome/ext/" + extension + "/client"),
						normalizedModuleName = require.toUrl(module, "ext/" + extension + "/client");

					// Retrieve the dependencies from the webviews unique location as well.

					req.open("GET", modulePath, false);
					req.send();
					deps.push({
						"moduleName": normalizedModuleName,
						"body": req.responseText
					});
				});

				// send client JS content as a JSON object, "client" property contains full text of client JS,
				// "dependencies" is an array of JSON object identified from client JS
				env.response.send(200, JSON.stringify({
					"client": xhr.responseText,
					"dependencies": deps
				}));
			} catch (e) {
				console.log(e);
				fail(-1, "Failed to load extension client", 404);
			}
		},

		// Retrieve the extension method from the specified location, then execute and return the response.
		exec: function (request, succ, fail, args, env) {
			var extPath = "ext/" + request.params.ext + "/index",
				requestObj = {
					extension: null,
					method: null,
					getExtension: function () {
						if (frameworkModules.indexOf(extPath + ".js") !== -1) {
							this.extension = require("../../lib/utils").loadModule("../../" + extPath);
							return requestObj;
						} else {
							throw {code: 404, msg: "Extension " + request.params.ext + " not found"};
						}
					},
					getMethod: function () {
						var methodParts = request.params.method ? request.params.method.split('/') : [request.params.method],
							extMethod;

						try {
							extMethod = this.extension[methodParts.shift()];
							extMethod = methodParts.reduce(function (previous, current) {
								if (previous[current]) {
									return previous[current];
								} else {
									throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
								}
							}, extMethod);

							if (extMethod && typeof extMethod === "function") {
								this.method = extMethod;
								return requestObj;
							} else {
								throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
							}
						} catch (e) {
							throw {code: 404, msg: "Method " + request.params.method + " for " + request.params.ext + " not found"};
						}
					},
					exec: function () {
						this.method(succ, fail, args, env);
					}
				};

			try {
				requestObj.getExtension().getMethod().exec();
			} catch (e) {
				console.warn(e.msg);
				fail(-1, e.msg, e.code);
			}
		}
	};
});

/**
 * Exports are the publicly accessible functions
 */
module.exports = {
	handle: function (req, res, sourceWebview, config) {
		try {
			var pluginName = "lib/plugins/" + req.params.service,
				plugin;

			if (frameworkModules.indexOf(pluginName + ".js") === -1) {
				pluginName = "lib/plugins/" + DEFAULT_SERVICE;
				req = rebuildRequest(req);
			}

			parseArgs(req);

			//Updating because some versions of node only work with relative paths
			pluginName = pluginName.replace('lib', '.');

			plugin = require("../../lib/utils").loadModule(pluginName);

			// Our unique webview are identified here by the presence of the modules object.
			// Only the 'get', 'load', and 'exec' actions are redirected to our custom plugin.
			if (sourceWebview && sourceWebview.modules) {
				if (req.params.action == 'get' || req.params.action == 'load' || req.params.action == 'exec') {
					plugin = require('customPlugin');
				}
			} 

			plugin[req.params.action](req,
			function (result) {
				res.send(200, encodeURIComponent(JSON.stringify({
					code: 1,
					data: result
				})));
			},
			function (code, error, httpCode) {
				if (!httpCode) {
					httpCode = 200;
				}

				res.send(httpCode, encodeURIComponent(JSON.stringify({
					code: Math.abs(code) * -1 || -1,
					data: null,
					msg: error
				})));
			},
			req.params.args,
			{
				"request": req,
				"response": res,
				"webview": sourceWebview,
				"config": config
			});
		} catch (e) {
			console.error(e);
			res.send(404, "can't find the stuff");
		}
	}
};
