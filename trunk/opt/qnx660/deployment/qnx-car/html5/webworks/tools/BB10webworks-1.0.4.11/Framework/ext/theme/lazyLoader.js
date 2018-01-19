module.exports = {
	LazyLoad: (function(doc) {
		try {
			// -- Private Variables ------------------------------------------------------
			// User agent and feature test information.
			var env,
	
			// Reference to the <head> element (populated lazily).
			head,
	
			// Requests currently in progress, if any.
			pending = {},
	
			// Number of times we've polled to check whether a pending stylesheet has
			// finished loading. If this gets too high, we're probably stalled.
			pollCount = 0,
	
			// Queued requests.
			queue = [];
	
			// Reference to the browser's list of stylesheets.
			styleSheets = doc.styleSheets;
	
			// -- Private Methods --------------------------------------------------------
			/**
			Creates and returns an HTML element with the specified name and attributes.
			
			@method createNode
			@param {String} name element name
			@param {Object} attrs name/value mapping of element attributes
			@return {HTMLElement}
			@private
			*/
			var createNode = function (name, attrs) {
				var node = doc.createElement(name),
					attr;
	
				for (attr in attrs) {
					if (attrs.hasOwnProperty(attr)) {
						node.setAttribute(attr, attrs[attr]);
					}
				}
	
				return node;
			}
	
			/**
			Called when the current pending resource of the specified type has finished
			loading. Executes the associated callback (if any) and loads the next
			resource in the queue.
			
			@method finish
			@param {String} type resource type ('css')
			@private
			*/
			var finish = function () {
				var p = pending["css"],
					callback, urls;
	
				if (p) {
					callback = p.callback;
					urls = p.urls;
	
					urls.shift();
					pollCount = 0;
	
					// If this is the last of the pending URLs, execute the callback and
					// start the next request in the queue (if any).
					if (!urls.length) {
						callback && callback.call(p.context, p.obj);
						pending["css"] = null;
						queue.length && load("css");
					}
				}
			}
	
			/**
			Loads the specified resources, or the next resource of the specified type
			in the queue if no resources are specified. If a resource of the specified
			type is already being loaded, the new request will be queued until the
			first request has been finished.
			
			When an array of resource URLs is specified, those URLs will be loaded in
			parallel if it is possible to do so while preserving execution order. All
			browsers support parallel loading of CSS, but only Firefox and Opera
			support parallel loading of scripts. In other browsers, scripts will be
			queued and loaded one at a time to ensure correct execution order.
			
			@method load
			@param {String} type resource type ('css')
			@param {String|Array} urls (optional) URL or array of URLs to load
			@param {Function} callback (optional) callback function to execute when the
			resource is loaded
			@param {Object} obj (optional) object to pass to the callback function
			@param {Object} context (optional) if provided, the callback function will
			be executed in this object's context
			@private
			*/
			var load = function (type, urls, primaryThemeAssetId, callback, obj, context) {
				var nodes = [],
					i, len, node, p, pendingUrls, url;
	
				if (Array.isArray(urls) || typeof urls === 'string') {
					// If urls is a string, wrap it in an array. Otherwise assume it's an
					// array and create a copy of it so modifications won't be made to the
					// original.
					urls = typeof urls === 'string' ? [urls] : urls.concat();
	
					// Create a request object for each URL. If multiple URLs are specified,
					// the callback will only be executed after all URLs have been loaded.
					queue.push({
						urls: urls,
						callback: callback,
						obj: obj,
						context: context
					});
				}
	
				// If a previous load request of this type is currently in progress, we'll
				// wait our turn. Otherwise, grab the next item in the queue.
				if (pending[type] || !(p = pending[type] = queue.shift())) {
					return;
				}
	
				head || (head = doc.head || doc.getElementsByTagName('head')[0]);
				pendingUrls = p.urls;
	
				for (i = 0, len = pendingUrls.length; i < len; ++i) {
					url = pendingUrls[i];

					node = doc.getElementById(primaryThemeAssetId);
					
					if(node) {
						node.href = url;
					} else {
						node = createNode('link', {
							href: url,
							rel: 'stylesheet'
						});
						
						node.id = primaryThemeAssetId;
						node.setAttribute('charset', 'utf-8');
					}
	
					// Poll for changes to document.styleSheets to
					// figure out when stylesheets have loaded.
					p.urls[i] = node.href; // resolve relative URLs (or polling won't work)
					pollResource();
	
					nodes.push(node);
				}
	
				for (i = 0, len = nodes.length; i < len; ++i) {
					head.appendChild(nodes[i]);
				}
			}
	
			/**
			Begins polling to determine when pending stylesheets have finished loading
			in WebKit. Polling stops when all pending stylesheets have loaded or after 10
			seconds (to prevent stalls).
			
			@method pollResource
			@private
			*/
			var pollResource = function () {
				var css = pending.css,
					i;
	
				if (css) {
					i = styleSheets.length;
	
					// Look for a stylesheet matching the pending URL.
					while (--i >= 0) {
						if (styleSheets[i].href === css.urls[0]) {
							finish();
							break;
						}
					}
	
					pollCount += 1;
	
					if (css) {
						if (pollCount < 200) {
							setTimeout(pollResource, 50);
						} else {
							// We've been polling for 10 seconds and nothing's happened, which may
							// indicate that the stylesheet has been removed from the document
							// before it had a chance to load. Stop polling and finish the pending
							// request to prevent blocking further requests.
							finish();
						}
					}
				}
			}
	
			// -- Public Methods --------------------------------------------------------
			return {
				/**
				Requests the specified CSS URL or URLs and executes the specified
				callback (if any) when they have finished loading. If an array of URLs is
				specified, the stylesheets will be loaded in parallel and the callback
				will be executed after all stylesheets have finished loading.
				
				@method css
				@param {String|Array} urls CSS URL or array of CSS URLs to load
				@param {Function} callback (optional) callback function to execute when
				  the specified stylesheets are loaded
				@param {Object} obj (optional) object to pass to the callback function
				@param {Object} context (optional) if provided, the callback function
				  will be executed in this object's context
				@static
				*/
				css: function (app, urls, primaryThemeAssetId, callback, obj, context) {
					load('css', urls, primaryThemeAssetId, callback, obj, context);
				}
			};
		} catch(err) {
			console.error("lazyLoader lib", err)
		}
	})(this.document)
};