(function () { 
/*
Copyright 2012 Research In Motion Limited.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.


*/
/**
 * almond 0.0.3 Copyright (c) 2011, The Dojo Foundation All Rights Reserved.
 * Available via the MIT or new BSD license.
 * see: http://github.com/jrburke/almond for details
 */
/*jslint strict: false, plusplus: false */
/*global setTimeout: false */

var requirejs, require, define;
(function (undef) {

    var defined = {},
        waiting = {},
        aps = [].slice,
        main, req;

    if (typeof define === "function") {
        //If a define is already in play via another AMD loader,
        //do not overwrite.
        return;
    }

    /**
     * Given a relative module name, like ./something, normalize it to
     * a real name that can be mapped to a path.
     * @param {String} name the relative name
     * @param {String} baseName a real name that the name arg is relative
     * to.
     * @returns {String} normalized name
     */
    function normalize(name, baseName) {
        //Adjust any relative paths.
        if (name && name.charAt(0) === ".") {
            //If have a base name, try to normalize against it,
            //otherwise, assume it is a top-level require that will
            //be relative to baseUrl in the end.
            if (baseName) {
                //Convert baseName to array, and lop off the last part,
                //so that . matches that "directory" and not name of the baseName's
                //module. For instance, baseName of "one/two/three", maps to
                //"one/two/three.js", but we want the directory, "one/two" for
                //this normalization.
                baseName = baseName.split("/");
                baseName = baseName.slice(0, baseName.length - 1);

                name = baseName.concat(name.split("/"));

                //start trimDots
                var i, part;
                for (i = 0; (part = name[i]); i++) {
                    if (part === ".") {
                        name.splice(i, 1);
                        i -= 1;
                    } else if (part === "..") {
                        if (i === 1 && (name[2] === '..' || name[0] === '..')) {
                            //End of the line. Keep at least one non-dot
                            //path segment at the front so it can be mapped
                            //correctly to disk. Otherwise, there is likely
                            //no path mapping for a path starting with '..'.
                            //This can still fail, but catches the most reasonable
                            //uses of ..
                            break;
                        } else if (i > 0) {
                            name.splice(i - 1, 2);
                            i -= 2;
                        }
                    }
                }
                //end trimDots

                name = name.join("/");
            }
        }
        return name;
    }

    function makeRequire(relName, forceSync) {
        return function () {
            //A version of a require function that passes a moduleName
            //value for items that may need to
            //look up paths relative to the moduleName
            return req.apply(undef, aps.call(arguments, 0).concat([relName, forceSync]));
        };
    }

    function makeNormalize(relName) {
        return function (name) {
            return normalize(name, relName);
        };
    }

    function makeLoad(depName) {
        return function (value) {
            defined[depName] = value;
        };
    }

    function callDep(name) {
        if (waiting.hasOwnProperty(name)) {
            var args = waiting[name];
            delete waiting[name];
            main.apply(undef, args);
        }
        return defined[name];
    }

    /**
     * Makes a name map, normalizing the name, and using a plugin
     * for normalization if necessary. Grabs a ref to plugin
     * too, as an optimization.
     */
    function makeMap(name, relName) {
        var prefix, plugin,
            index = name.indexOf('!');

        if (index !== -1) {
            prefix = normalize(name.slice(0, index), relName);
            name = name.slice(index + 1);
            plugin = callDep(prefix);

            //Normalize according
            if (plugin && plugin.normalize) {
                name = plugin.normalize(name, makeNormalize(relName));
            } else {
                name = normalize(name, relName);
            }
        } else {
            name = normalize(name, relName);
        }

        //Using ridiculous property names for space reasons
        return {
            f: prefix ? prefix + '!' + name : name, //fullName
            n: name,
            p: plugin
        };
    }

    main = function (name, deps, callback, relName) {
        var args = [],
            usingExports,
            cjsModule, depName, i, ret, map;

        //Use name if no relName
        if (!relName) {
            relName = name;
        }

        //Call the callback to define the module, if necessary.
        if (typeof callback === 'function') {

            //Default to require, exports, module if no deps if
            //the factory arg has any arguments specified.
            if (!deps.length && callback.length) {
                deps = ['require', 'exports', 'module'];
            }

            //Pull out the defined dependencies and pass the ordered
            //values to the callback.
            for (i = 0; i < deps.length; i++) {
                map = makeMap(deps[i], relName);
                depName = map.f;

                //Fast path CommonJS standard dependencies.
                if (depName === "require") {
                    args[i] = makeRequire(name);
                } else if (depName === "exports") {
                    //CommonJS module spec 1.1
                    args[i] = defined[name] = {};
                    usingExports = true;
                } else if (depName === "module") {
                    //CommonJS module spec 1.1
                    cjsModule = args[i] = {
                        id: name,
                        uri: '',
                        exports: defined[name]
                    };
                } else if (defined.hasOwnProperty(depName) || waiting.hasOwnProperty(depName)) {
                    args[i] = callDep(depName);
                } else if (map.p) {
                    map.p.load(map.n, makeRequire(relName, true), makeLoad(depName), {});
                    args[i] = defined[depName];
                } else {
                    throw name + ' missing ' + depName;
                }
            }

            ret = callback.apply(defined[name], args);

            if (name) {
                //If setting exports via "module" is in play,
                //favor that over return value and exports. After that,
                //favor a non-undefined return value over exports use.
                if (cjsModule && cjsModule.exports !== undef) {
                    defined[name] = cjsModule.exports;
                } else if (!usingExports) {
                    //Use the return value from the function.
                    defined[name] = ret;
                }
            }
        } else if (name) {
            //May just be an object definition for the module. Only
            //worry about defining if have a module name.
            defined[name] = callback;
        }
    };

    requirejs = req = function (deps, callback, relName, forceSync) {
        if (typeof deps === "string") {

            //Just return the module wanted. In this scenario, the
            //deps arg is the module name, and second arg (if passed)
            //is just the relName.
            //Normalize module name, if it contains . or ..
            return callDep(makeMap(deps, callback).f);
        } else if (!deps.splice) {
            //deps is a config object, not an array.
            //Drop the config stuff on the ground.
            if (callback.splice) {
                //callback is an array, which means it is a dependency list.
                //Adjust args if there are dependencies
                deps = callback;
                callback = arguments[2];
            } else {
                deps = [];
            }
        }

        //Simulate async callback;
        if (forceSync) {
            main(undef, deps, callback, relName);
        } else {
            setTimeout(function () {
                main(undef, deps, callback, relName);
            }, 15);
        }

        return req;
    };

    /**
     * Just drops the config on the floor, but returns req in case
     * the config return value is used.
     */
    req.config = function () {
        return req;
    };

    /**
     * Export require as a global, but only if it does not already exist.
     */
    if (!require) {
        require = req;
    }

    define = function (name, deps, callback) {

        //This module may not have dependencies
        if (!deps.splice) {
            //deps is not an array, so probably means
            //an object literal or factory function for
            //the value. Adjust args.
            callback = deps;
            deps = [];
        }

        if (define.unordered) {
            waiting[name] = [name, deps, callback];
        } else {
            main(name, deps, callback);
        }
    };

    define.amd = {
        jQuery: true
    };
}());

/*
jed.js
v0.5.0beta

https://github.com/SlexAxton/Jed
-----------
A gettext compatible i18n library for modern JavaScript Applications

by Alex Sexton - AlexSexton [at] gmail - @SlexAxton
WTFPL license for use
Dojo CLA for contributions

Jed offers the entire applicable GNU gettext spec'd set of
functions, but also offers some nicer wrappers around them.
The api for gettext was written for a language with no function
overloading, so Jed allows a little more of that.

Many thanks to Joshua I. Miller - unrtst@cpan.org - who wrote
gettext.js back in 2008. I was able to vet a lot of my ideas
against his. I also made sure Jed passed against his tests
in order to offer easy upgrades -- jsgettext.berlios.de
*/
(function (root, undef) {

  // Set up some underscore-style functions, if you already have
  // underscore, feel free to delete this section, and use it
  // directly, however, the amount of functions used doesn't
  // warrant having underscore as a full dependency.
  // Underscore 1.3.0 was used to port and is licensed
  // under the MIT License by Jeremy Ashkenas.
  var ArrayProto    = Array.prototype,
      ObjProto      = Object.prototype,
      slice         = ArrayProto.slice,
      hasOwnProp    = ObjProto.hasOwnProperty,
      nativeForEach = ArrayProto.forEach,
      breaker       = {};

  // We're not using the OOP style _ so we don't need the
  // extra level of indirection. This still means that you
  // sub out for real `_` though.
  var _ = {
    forEach : function( obj, iterator, context ) {
      var i, l, key;
      if ( obj === null ) {
        return;
      }

      if ( nativeForEach && obj.forEach === nativeForEach ) {
        obj.forEach( iterator, context );
      }
      else if ( obj.length === +obj.length ) {
        for ( i = 0, l = obj.length; i < l; i++ ) {
          if ( i in obj && iterator.call( context, obj[i], i, obj ) === breaker ) {
            return;
          }
        }
      }
      else {
        for ( key in obj) {
          if ( hasOwnProp.call( obj, key ) ) {
            if ( iterator.call (context, obj[key], key, obj ) === breaker ) {
              return;
            }
          }
        }
      }
    },
    extend : function( obj ) {
      this.forEach( slice.call( arguments, 1 ), function ( source ) {
        for ( var prop in source ) {
          obj[prop] = source[prop];
        }
      });
      return obj;
    }
  };
  // END Miniature underscore impl

  // Jed is a constructor function
  var Jed = function ( options ) {
    // Some minimal defaults
    this.defaults = {
      "locale_data" : {
        "messages" : {
          "" : {
            "domain"       : "messages",
            "lang"         : "en",
            "plural_forms" : "nplurals=2; plural=(n != 1);"
          }
          // There are no default keys, though
        }
      },
      // The default domain if one is missing
      "domain" : "messages"
    };

    // Mix in the sent options with the default options
    this.options = _.extend( {}, this.defaults, options );
    this.textdomain( this.options.domain );

    if ( options.domain && ! this.options.locale_data[ this.options.domain ] ) {
      throw new Error('Text domain set to non-existent domain: `' + domain + '`');
    }
  };

  // The gettext spec sets this character as the default
  // delimiter for context lookups.
  // e.g.: context\u0004key
  // If your translation company uses something different,
  // just change this at any time and it will use that instead.
  Jed.context_delimiter = String.fromCharCode( 4 );

  function getPluralFormFunc ( plural_form_string ) {
    return Jed.PF.compile( plural_form_string || "nplurals=2; plural=(n != 1);");
  }

  function Chain( key, i18n ){
    this._key = key;
    this._i18n = i18n;
  }

  // Create a chainable api for adding args prettily
  _.extend( Chain.prototype, {
    onDomain : function ( domain ) {
      this._domain = domain;
      return this;
    },
    withContext : function ( context ) {
      this._context = context;
      return this;
    },
    ifPlural : function ( num, pkey ) {
      this._val = num;
      this._pkey = pkey;
      return this;
    },
    fetch : function ( sArr ) {
      if ( {}.toString.call( sArr ) != '[object Array]' ) {
        sArr = [].slice.call(arguments);
      }
      return ( sArr && sArr.length ? Jed.sprintf : function(x){ return x; } )(
        this._i18n.dcnpgettext(this._domain, this._context, this._key, this._pkey, this._val),
        sArr
      );
    }
  });

  // Add functions to the Jed prototype.
  // These will be the functions on the object that's returned
  // from creating a `new Jed()`
  // These seem redundant, but they gzip pretty well.
  _.extend( Jed.prototype, {
    // The sexier api start point
    translate : function ( key ) {
      return new Chain( key, this );
    },

    textdomain : function ( domain ) {
      if ( ! domain ) {
        return this._textdomain;
      }
      this._textdomain = domain;
    },

    gettext : function ( key ) {
      return this.dcnpgettext.call( this, undef, undef, key );
    },

    dgettext : function ( domain, key ) {
     return this.dcnpgettext.call( this, domain, undef, key );
    },

    dcgettext : function ( domain , key /*, category */ ) {
      // Ignores the category anyways
      return this.dcnpgettext.call( this, domain, undef, key );
    },

    ngettext : function ( skey, pkey, val ) {
      return this.dcnpgettext.call( this, undef, undef, skey, pkey, val );
    },

    dngettext : function ( domain, skey, pkey, val ) {
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );
    },

    dcngettext : function ( domain, skey, pkey, val/*, category */) {
      return this.dcnpgettext.call( this, domain, undef, skey, pkey, val );
    },

    pgettext : function ( context, key ) {
      return this.dcnpgettext.call( this, undef, context, key );
    },

    dpgettext : function ( domain, context, key ) {
      return this.dcnpgettext.call( this, domain, context, key );
    },

    dcpgettext : function ( domain, context, key/*, category */) {
      return this.dcnpgettext.call( this, domain, context, key );
    },

    npgettext : function ( context, skey, pkey, val ) {
      return this.dcnpgettext.call( this, undef, context, skey, pkey, val );
    },

    dnpgettext : function ( domain, context, skey, pkey, val ) {
      return this.dcnpgettext.call( this, domain, context, skey, pkey, val );
    },

    // The most fully qualified gettext function. It has every option.
    // Since it has every option, we can use it from every other method.
    // This is the bread and butter.
    // Technically there should be one more argument in this function for 'Category',
    // but since we never use it, we might as well not waste the bytes to define it.
    dcnpgettext : function ( domain, context, singular_key, plural_key, val ) {
      // Set some defaults

      plural_key = plural_key || singular_key;

      // Use the global domain default if one
      // isn't explicitly passed in
      domain = domain || this._textdomain;

      // Default the value to the singular case
      val = typeof val == 'undefined' ? 1 : val;

      var fallback;

      // Handle special cases

      // No options found
      if ( ! this.options ) {
        // There's likely something wrong, but we'll return the correct key for english
        // We do this by instantiating a brand new Jed instance with the default set
        // for everything that could be broken.
        fallback = new Jed();
        return fallback.dcnpgettext.call( fallback, undefined, undefined, singular_key, plural_key, val );
      }

      // No translation data provided
      if ( ! this.options.locale_data ) {
        throw new Error('No locale data provided.');
      }

      if ( ! this.options.locale_data[ domain ] ) {
        throw new Error('Domain `' + domain + '` was not found.');
      }

      if ( ! this.options.locale_data[ domain ][ "" ] ) {
        throw new Error('No locale meta information provided.');
      }

      // Make sure we have a truthy key. Otherwise we might start looking
      // into the empty string key, which is the options for the locale
      // data.
      if ( ! singular_key ) {
        throw new Error('No translation key found.');
      }

      // Handle invalid numbers, but try casting strings for good measure
      if ( typeof val != 'number' ) {
        try {
          val = parseInt( val, 10 );
        }
        catch ( e ) {
          throw new Error('Error parsing the value.');
        }

        if ( isNaN( val ) ) {
          throw new Error('The number that was passed in is not a number.');
        }
      }

      var key  = context ? context + Jed.context_delimiter + singular_key : singular_key,
          locale_data = this.options.locale_data,
          dict = locale_data[ domain ],
          defaultPF = this.defaults.locale_data.messages[""].plural_forms,
          val_idx = getPluralFormFunc( dict[ "" ].plural_forms )( val ) + 1,
          val_list,
          res;

      // Throw an error if a domain isn't found
      if ( ! dict ) {
        throw new Error('No domain named `' + domain + '` could be found.');
      }

      val_list = dict[ key ];

      // If there is no match, then revert back to
      // english style singular/plural with the keys passed in.
      if ( ! val_list || val_idx >= val_list.length ) {
        res = [ null, singular_key, plural_key ];
        return res[ getPluralFormFunc()( val ) + 1 ];
      }

      res = val_list[ val_idx ];

      // This includes empty strings on purpose
      if ( ! res  ) {
        res = [ null, singular_key, plural_key ];
        return res[ getPluralFormFunc()( val ) + 1 ];
      }
      return res;
    }
  });


  // We add in sprintf capabilities for post translation value interolation
  // This is not internally used, so you can remove it if you have this
  // available somewhere else, or want to use a different system.

  // We _slightly_ modify the normal sprintf behavior to more gracefully handle
  // undefined values.

  /**
   sprintf() for JavaScript 0.7-beta1
   http://www.diveintojavascript.com/projects/javascript-sprintf

   Copyright (c) Alexandru Marasteanu <alexaholic [at) gmail (dot] com>
   All rights reserved.

   Redistribution and use in source and binary forms, with or without
   modification, are permitted provided that the following conditions are met:
       * Redistributions of source code must retain the above copyright
         notice, this list of conditions and the following disclaimer.
       * Redistributions in binary form must reproduce the above copyright
         notice, this list of conditions and the following disclaimer in the
         documentation and/or other materials provided with the distribution.
       * Neither the name of sprintf() for JavaScript nor the
         names of its contributors may be used to endorse or promote products
         derived from this software without specific prior written permission.

   THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   DISCLAIMED. IN NO EVENT SHALL Alexandru Marasteanu BE LIABLE FOR ANY
   DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
   (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
   LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
   ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
   (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
   SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */
  var sprintf = (function() {
    function get_type(variable) {
      return Object.prototype.toString.call(variable).slice(8, -1).toLowerCase();
    }
    function str_repeat(input, multiplier) {
      for (var output = []; multiplier > 0; output[--multiplier] = input) {/* do nothing */}
      return output.join('');
    }

    var str_format = function() {
      if (!str_format.cache.hasOwnProperty(arguments[0])) {
        str_format.cache[arguments[0]] = str_format.parse(arguments[0]);
      }
      return str_format.format.call(null, str_format.cache[arguments[0]], arguments);
    };

    str_format.format = function(parse_tree, argv) {
      var cursor = 1, tree_length = parse_tree.length, node_type = '', arg, output = [], i, k, match, pad, pad_character, pad_length;
      for (i = 0; i < tree_length; i++) {
        node_type = get_type(parse_tree[i]);
        if (node_type === 'string') {
          output.push(parse_tree[i]);
        }
        else if (node_type === 'array') {
          match = parse_tree[i]; // convenience purposes only
          if (match[2]) { // keyword argument
            arg = argv[cursor];
            for (k = 0; k < match[2].length; k++) {
              if (!arg.hasOwnProperty(match[2][k])) {
                throw(sprintf('[sprintf] property "%s" does not exist', match[2][k]));
              }
              arg = arg[match[2][k]];
            }
          }
          else if (match[1]) { // positional argument (explicit)
            arg = argv[match[1]];
          }
          else { // positional argument (implicit)
            arg = argv[cursor++];
          }

          if (/[^s]/.test(match[8]) && (get_type(arg) != 'number')) {
            throw(sprintf('[sprintf] expecting number but found %s', get_type(arg)));
          }

          // Jed EDIT
          if ( typeof arg == 'undefined' || arg === null ) {
            arg = '';
          }
          // Jed EDIT

          switch (match[8]) {
            case 'b': arg = arg.toString(2); break;
            case 'c': arg = String.fromCharCode(arg); break;
            case 'd': arg = parseInt(arg, 10); break;
            case 'e': arg = match[7] ? arg.toExponential(match[7]) : arg.toExponential(); break;
            case 'f': arg = match[7] ? parseFloat(arg).toFixed(match[7]) : parseFloat(arg); break;
            case 'o': arg = arg.toString(8); break;
            case 's': arg = ((arg = String(arg)) && match[7] ? arg.substring(0, match[7]) : arg); break;
            case 'u': arg = Math.abs(arg); break;
            case 'x': arg = arg.toString(16); break;
            case 'X': arg = arg.toString(16).toUpperCase(); break;
          }
          arg = (/[def]/.test(match[8]) && match[3] && arg >= 0 ? '+'+ arg : arg);
          pad_character = match[4] ? match[4] == '0' ? '0' : match[4].charAt(1) : ' ';
          pad_length = match[6] - String(arg).length;
          pad = match[6] ? str_repeat(pad_character, pad_length) : '';
          output.push(match[5] ? arg + pad : pad + arg);
        }
      }
      return output.join('');
    };

    str_format.cache = {};

    str_format.parse = function(fmt) {
      var _fmt = fmt, match = [], parse_tree = [], arg_names = 0;
      while (_fmt) {
        if ((match = /^[^\x25]+/.exec(_fmt)) !== null) {
          parse_tree.push(match[0]);
        }
        else if ((match = /^\x25{2}/.exec(_fmt)) !== null) {
          parse_tree.push('%');
        }
        else if ((match = /^\x25(?:([1-9]\d*)\$|\(([^\)]+)\))?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(_fmt)) !== null) {
          if (match[2]) {
            arg_names |= 1;
            var field_list = [], replacement_field = match[2], field_match = [];
            if ((field_match = /^([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
              field_list.push(field_match[1]);
              while ((replacement_field = replacement_field.substring(field_match[0].length)) !== '') {
                if ((field_match = /^\.([a-z_][a-z_\d]*)/i.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else if ((field_match = /^\[(\d+)\]/.exec(replacement_field)) !== null) {
                  field_list.push(field_match[1]);
                }
                else {
                  throw('[sprintf] huh?');
                }
              }
            }
            else {
              throw('[sprintf] huh?');
            }
            match[2] = field_list;
          }
          else {
            arg_names |= 2;
          }
          if (arg_names === 3) {
            throw('[sprintf] mixing positional and named placeholders is not (yet) supported');
          }
          parse_tree.push(match);
        }
        else {
          throw('[sprintf] huh?');
        }
        _fmt = _fmt.substring(match[0].length);
      }
      return parse_tree;
    };

    return str_format;
  })();

  var vsprintf = function(fmt, argv) {
    argv.unshift(fmt);
    return sprintf.apply(null, argv);
  };

  Jed.parse_plural = function ( plural_forms, n ) {
    plural_forms = plural_forms.replace(/n/g, n);
    return Jed.parse_expression(plural_forms);
  };

  Jed.sprintf = function ( fmt, args ) {
    if ( {}.toString.call( args ) == '[object Array]' ) {
      return vsprintf( fmt, [].slice.call(args) );
    }
    return sprintf.apply(this, [].slice.call(arguments) );
  };

  Jed.prototype.sprintf = function () {
    return Jed.sprintf.apply(this, arguments);
  };
  // END sprintf Implementation

  // Start the Plural forms section
  // This is a full plural form expression parser. It is used to avoid
  // running 'eval' or 'new Function' directly against the plural
  // forms.
  //
  // This can be important if you get translations done through a 3rd
  // party vendor. I encourage you to use this instead, however, I
  // also will provide a 'precompiler' that you can use at build time
  // to output valid/safe function representations of the plural form
  // expressions. This means you can build this code out for the most
  // part.
  Jed.PF = {};

  Jed.PF.parse = function ( p ) {
    var plural_str = Jed.PF.extractPluralExpr( p );
    return Jed.PF.parser.parse.call(Jed.PF.parser, plural_str);
  };

  Jed.PF.compile = function ( p ) {
    // Handle trues and falses as 0 and 1
    function imply( val ) {
      return (val === true ? 1 : val ? val : 0);
    }

    var ast = Jed.PF.parse( p );
    return function ( n ) {
      return imply( Jed.PF.interpreter( ast )( n ) );
    };
  };

  Jed.PF.interpreter = function ( ast ) {
    return function ( n ) {
      var res;
      switch ( ast.type ) {
        case 'GROUP':
          return Jed.PF.interpreter( ast.expr )( n );
        case 'TERNARY':
          if ( Jed.PF.interpreter( ast.expr )( n ) ) {
            return Jed.PF.interpreter( ast.truthy )( n );
          }
          return Jed.PF.interpreter( ast.falsey )( n );
        case 'OR':
          return Jed.PF.interpreter( ast.left )( n ) || Jed.PF.interpreter( ast.right )( n );
        case 'AND':
          return Jed.PF.interpreter( ast.left )( n ) && Jed.PF.interpreter( ast.right )( n );
        case 'LT':
          return Jed.PF.interpreter( ast.left )( n ) < Jed.PF.interpreter( ast.right )( n );
        case 'GT':
          return Jed.PF.interpreter( ast.left )( n ) > Jed.PF.interpreter( ast.right )( n );
        case 'LTE':
          return Jed.PF.interpreter( ast.left )( n ) <= Jed.PF.interpreter( ast.right )( n );
        case 'GTE':
          return Jed.PF.interpreter( ast.left )( n ) >= Jed.PF.interpreter( ast.right )( n );
        case 'EQ':
          return Jed.PF.interpreter( ast.left )( n ) == Jed.PF.interpreter( ast.right )( n );
        case 'NEQ':
          return Jed.PF.interpreter( ast.left )( n ) != Jed.PF.interpreter( ast.right )( n );
        case 'MOD':
          return Jed.PF.interpreter( ast.left )( n ) % Jed.PF.interpreter( ast.right )( n );
        case 'VAR':
          return n;
        case 'NUM':
          return ast.val;
        default:
          throw new Error("Invalid Token found.");
      }
    };
  };

  Jed.PF.extractPluralExpr = function ( p ) {
    // trim first
    p = p.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

    if (! /;\s*$/.test(p)) {
      p = p.concat(';');
    }

    var nplurals_re = /nplurals\=(\d+);/,
        plural_re = /plural\=(.*);/,
        nplurals_matches = p.match( nplurals_re ),
        res = {},
        plural_matches;

    // Find the nplurals number
    if ( nplurals_matches.length > 1 ) {
      res.nplurals = nplurals_matches[1];
    }
    else {
      throw new Error('nplurals not found in plural_forms string: ' + p );
    }

    // remove that data to get to the formula
    p = p.replace( nplurals_re, "" );
    plural_matches = p.match( plural_re );

    if (!( plural_matches && plural_matches.length > 1 ) ) {
      throw new Error('`plural` expression not found: ' + p);
    }
    return plural_matches[ 1 ];
  };

  /* Jison generated parser */
  Jed.PF.parser = (function(){

var parser = {trace: function trace() { },
yy: {},
symbols_: {"error":2,"expressions":3,"e":4,"EOF":5,"?":6,":":7,"||":8,"&&":9,"<":10,"<=":11,">":12,">=":13,"!=":14,"==":15,"%":16,"(":17,")":18,"n":19,"NUMBER":20,"$accept":0,"$end":1},
terminals_: {2:"error",5:"EOF",6:"?",7:":",8:"||",9:"&&",10:"<",11:"<=",12:">",13:">=",14:"!=",15:"==",16:"%",17:"(",18:")",19:"n",20:"NUMBER"},
productions_: [0,[3,2],[4,5],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,3],[4,1],[4,1]],
performAction: function anonymous(yytext,yyleng,yylineno,yy,yystate,$$,_$) {

var $0 = $$.length - 1;
switch (yystate) {
case 1: return { type : 'GROUP', expr: $$[$0-1] }; 
break;
case 2:this.$ = { type: 'TERNARY', expr: $$[$0-4], truthy : $$[$0-2], falsey: $$[$0] }; 
break;
case 3:this.$ = { type: "OR", left: $$[$0-2], right: $$[$0] };
break;
case 4:this.$ = { type: "AND", left: $$[$0-2], right: $$[$0] };
break;
case 5:this.$ = { type: 'LT', left: $$[$0-2], right: $$[$0] }; 
break;
case 6:this.$ = { type: 'LTE', left: $$[$0-2], right: $$[$0] };
break;
case 7:this.$ = { type: 'GT', left: $$[$0-2], right: $$[$0] };
break;
case 8:this.$ = { type: 'GTE', left: $$[$0-2], right: $$[$0] };
break;
case 9:this.$ = { type: 'NEQ', left: $$[$0-2], right: $$[$0] };
break;
case 10:this.$ = { type: 'EQ', left: $$[$0-2], right: $$[$0] };
break;
case 11:this.$ = { type: 'MOD', left: $$[$0-2], right: $$[$0] };
break;
case 12:this.$ = { type: 'GROUP', expr: $$[$0-1] }; 
break;
case 13:this.$ = { type: 'VAR' }; 
break;
case 14:this.$ = { type: 'NUM', val: Number(yytext) }; 
break;
}
},
table: [{3:1,4:2,17:[1,3],19:[1,4],20:[1,5]},{1:[3]},{5:[1,6],6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{4:17,17:[1,3],19:[1,4],20:[1,5]},{5:[2,13],6:[2,13],7:[2,13],8:[2,13],9:[2,13],10:[2,13],11:[2,13],12:[2,13],13:[2,13],14:[2,13],15:[2,13],16:[2,13],18:[2,13]},{5:[2,14],6:[2,14],7:[2,14],8:[2,14],9:[2,14],10:[2,14],11:[2,14],12:[2,14],13:[2,14],14:[2,14],15:[2,14],16:[2,14],18:[2,14]},{1:[2,1]},{4:18,17:[1,3],19:[1,4],20:[1,5]},{4:19,17:[1,3],19:[1,4],20:[1,5]},{4:20,17:[1,3],19:[1,4],20:[1,5]},{4:21,17:[1,3],19:[1,4],20:[1,5]},{4:22,17:[1,3],19:[1,4],20:[1,5]},{4:23,17:[1,3],19:[1,4],20:[1,5]},{4:24,17:[1,3],19:[1,4],20:[1,5]},{4:25,17:[1,3],19:[1,4],20:[1,5]},{4:26,17:[1,3],19:[1,4],20:[1,5]},{4:27,17:[1,3],19:[1,4],20:[1,5]},{6:[1,7],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[1,28]},{6:[1,7],7:[1,29],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16]},{5:[2,3],6:[2,3],7:[2,3],8:[2,3],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,3]},{5:[2,4],6:[2,4],7:[2,4],8:[2,4],9:[2,4],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,4]},{5:[2,5],6:[2,5],7:[2,5],8:[2,5],9:[2,5],10:[2,5],11:[2,5],12:[2,5],13:[2,5],14:[2,5],15:[2,5],16:[1,16],18:[2,5]},{5:[2,6],6:[2,6],7:[2,6],8:[2,6],9:[2,6],10:[2,6],11:[2,6],12:[2,6],13:[2,6],14:[2,6],15:[2,6],16:[1,16],18:[2,6]},{5:[2,7],6:[2,7],7:[2,7],8:[2,7],9:[2,7],10:[2,7],11:[2,7],12:[2,7],13:[2,7],14:[2,7],15:[2,7],16:[1,16],18:[2,7]},{5:[2,8],6:[2,8],7:[2,8],8:[2,8],9:[2,8],10:[2,8],11:[2,8],12:[2,8],13:[2,8],14:[2,8],15:[2,8],16:[1,16],18:[2,8]},{5:[2,9],6:[2,9],7:[2,9],8:[2,9],9:[2,9],10:[2,9],11:[2,9],12:[2,9],13:[2,9],14:[2,9],15:[2,9],16:[1,16],18:[2,9]},{5:[2,10],6:[2,10],7:[2,10],8:[2,10],9:[2,10],10:[2,10],11:[2,10],12:[2,10],13:[2,10],14:[2,10],15:[2,10],16:[1,16],18:[2,10]},{5:[2,11],6:[2,11],7:[2,11],8:[2,11],9:[2,11],10:[2,11],11:[2,11],12:[2,11],13:[2,11],14:[2,11],15:[2,11],16:[2,11],18:[2,11]},{5:[2,12],6:[2,12],7:[2,12],8:[2,12],9:[2,12],10:[2,12],11:[2,12],12:[2,12],13:[2,12],14:[2,12],15:[2,12],16:[2,12],18:[2,12]},{4:30,17:[1,3],19:[1,4],20:[1,5]},{5:[2,2],6:[1,7],7:[2,2],8:[1,8],9:[1,9],10:[1,10],11:[1,11],12:[1,12],13:[1,13],14:[1,14],15:[1,15],16:[1,16],18:[2,2]}],
defaultActions: {6:[2,1]},
parseError: function parseError(str, hash) {
    throw new Error(str);
},
parse: function parse(input) {
    var self = this,
        stack = [0],
        vstack = [null], // semantic value stack
        lstack = [], // location stack
        table = this.table,
        yytext = '',
        yylineno = 0,
        yyleng = 0,
        recovering = 0,
        TERROR = 2,
        EOF = 1;

    //this.reductionCount = this.shiftCount = 0;

    this.lexer.setInput(input);
    this.lexer.yy = this.yy;
    this.yy.lexer = this.lexer;
    if (typeof this.lexer.yylloc == 'undefined')
        this.lexer.yylloc = {};
    var yyloc = this.lexer.yylloc;
    lstack.push(yyloc);

    if (typeof this.yy.parseError === 'function')
        this.parseError = this.yy.parseError;

    function popStack (n) {
        stack.length = stack.length - 2*n;
        vstack.length = vstack.length - n;
        lstack.length = lstack.length - n;
    }

    function lex() {
        var token;
        token = self.lexer.lex() || 1; // $end = 1
        // if token isn't its numeric value, convert
        if (typeof token !== 'number') {
            token = self.symbols_[token] || token;
        }
        return token;
    }

    var symbol, preErrorSymbol, state, action, a, r, yyval={},p,len,newState, expected;
    while (true) {
        // retreive state number from top of stack
        state = stack[stack.length-1];

        // use default actions if available
        if (this.defaultActions[state]) {
            action = this.defaultActions[state];
        } else {
            if (symbol == null)
                symbol = lex();
            // read action for current state and first input
            action = table[state] && table[state][symbol];
        }

        // handle parse error
        _handle_error:
        if (typeof action === 'undefined' || !action.length || !action[0]) {

            if (!recovering) {
                // Report error
                expected = [];
                for (p in table[state]) if (this.terminals_[p] && p > 2) {
                    expected.push("'"+this.terminals_[p]+"'");
                }
                var errStr = '';
                if (this.lexer.showPosition) {
                    errStr = 'Parse error on line '+(yylineno+1)+":\n"+this.lexer.showPosition()+"\nExpecting "+expected.join(', ') + ", got '" + this.terminals_[symbol]+ "'";
                } else {
                    errStr = 'Parse error on line '+(yylineno+1)+": Unexpected " +
                                  (symbol == 1 /*EOF*/ ? "end of input" :
                                              ("'"+(this.terminals_[symbol] || symbol)+"'"));
                }
                this.parseError(errStr,
                    {text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected: expected});
            }

            // just recovered from another error
            if (recovering == 3) {
                if (symbol == EOF) {
                    throw new Error(errStr || 'Parsing halted.');
                }

                // discard current lookahead and grab another
                yyleng = this.lexer.yyleng;
                yytext = this.lexer.yytext;
                yylineno = this.lexer.yylineno;
                yyloc = this.lexer.yylloc;
                symbol = lex();
            }

            // try to recover from error
            while (1) {
                // check for error recovery rule in this state
                if ((TERROR.toString()) in table[state]) {
                    break;
                }
                if (state == 0) {
                    throw new Error(errStr || 'Parsing halted.');
                }
                popStack(1);
                state = stack[stack.length-1];
            }

            preErrorSymbol = symbol; // save the lookahead token
            symbol = TERROR;         // insert generic error symbol as new lookahead
            state = stack[stack.length-1];
            action = table[state] && table[state][TERROR];
            recovering = 3; // allow 3 real symbols to be shifted before reporting a new error
        }

        // this shouldn't happen, unless resolve defaults are off
        if (action[0] instanceof Array && action.length > 1) {
            throw new Error('Parse Error: multiple actions possible at state: '+state+', token: '+symbol);
        }

        switch (action[0]) {

            case 1: // shift
                //this.shiftCount++;

                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]); // push state
                symbol = null;
                if (!preErrorSymbol) { // normal execution/no error
                    yyleng = this.lexer.yyleng;
                    yytext = this.lexer.yytext;
                    yylineno = this.lexer.yylineno;
                    yyloc = this.lexer.yylloc;
                    if (recovering > 0)
                        recovering--;
                } else { // error just occurred, resume old lookahead f/ before error
                    symbol = preErrorSymbol;
                    preErrorSymbol = null;
                }
                break;

            case 2: // reduce
                //this.reductionCount++;

                len = this.productions_[action[1]][1];

                // perform semantic action
                yyval.$ = vstack[vstack.length-len]; // default to $$ = $1
                // default location, uses first token for firsts, last for lasts
                yyval._$ = {
                    first_line: lstack[lstack.length-(len||1)].first_line,
                    last_line: lstack[lstack.length-1].last_line,
                    first_column: lstack[lstack.length-(len||1)].first_column,
                    last_column: lstack[lstack.length-1].last_column
                };
                r = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);

                if (typeof r !== 'undefined') {
                    return r;
                }

                // pop off stack
                if (len) {
                    stack = stack.slice(0,-1*len*2);
                    vstack = vstack.slice(0, -1*len);
                    lstack = lstack.slice(0, -1*len);
                }

                stack.push(this.productions_[action[1]][0]);    // push nonterminal (reduce)
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                // goto new state = table[STATE][NONTERMINAL]
                newState = table[stack[stack.length-2]][stack[stack.length-1]];
                stack.push(newState);
                break;

            case 3: // accept
                return true;
        }

    }

    return true;
}};/* Jison generated lexer */
var lexer = (function(){

var lexer = ({EOF:1,
parseError:function parseError(str, hash) {
        if (this.yy.parseError) {
            this.yy.parseError(str, hash);
        } else {
            throw new Error(str);
        }
    },
setInput:function (input) {
        this._input = input;
        this._more = this._less = this.done = false;
        this.yylineno = this.yyleng = 0;
        this.yytext = this.matched = this.match = '';
        this.conditionStack = ['INITIAL'];
        this.yylloc = {first_line:1,first_column:0,last_line:1,last_column:0};
        return this;
    },
input:function () {
        var ch = this._input[0];
        this.yytext+=ch;
        this.yyleng++;
        this.match+=ch;
        this.matched+=ch;
        var lines = ch.match(/\n/);
        if (lines) this.yylineno++;
        this._input = this._input.slice(1);
        return ch;
    },
unput:function (ch) {
        this._input = ch + this._input;
        return this;
    },
more:function () {
        this._more = true;
        return this;
    },
pastInput:function () {
        var past = this.matched.substr(0, this.matched.length - this.match.length);
        return (past.length > 20 ? '...':'') + past.substr(-20).replace(/\n/g, "");
    },
upcomingInput:function () {
        var next = this.match;
        if (next.length < 20) {
            next += this._input.substr(0, 20-next.length);
        }
        return (next.substr(0,20)+(next.length > 20 ? '...':'')).replace(/\n/g, "");
    },
showPosition:function () {
        var pre = this.pastInput();
        var c = new Array(pre.length + 1).join("-");
        return pre + this.upcomingInput() + "\n" + c+"^";
    },
next:function () {
        if (this.done) {
            return this.EOF;
        }
        if (!this._input) this.done = true;

        var token,
            match,
            col,
            lines;
        if (!this._more) {
            this.yytext = '';
            this.match = '';
        }
        var rules = this._currentRules();
        for (var i=0;i < rules.length; i++) {
            match = this._input.match(this.rules[rules[i]]);
            if (match) {
                lines = match[0].match(/\n.*/g);
                if (lines) this.yylineno += lines.length;
                this.yylloc = {first_line: this.yylloc.last_line,
                               last_line: this.yylineno+1,
                               first_column: this.yylloc.last_column,
                               last_column: lines ? lines[lines.length-1].length-1 : this.yylloc.last_column + match[0].length}
                this.yytext += match[0];
                this.match += match[0];
                this.matches = match;
                this.yyleng = this.yytext.length;
                this._more = false;
                this._input = this._input.slice(match[0].length);
                this.matched += match[0];
                token = this.performAction.call(this, this.yy, this, rules[i],this.conditionStack[this.conditionStack.length-1]);
                if (token) return token;
                else return;
            }
        }
        if (this._input === "") {
            return this.EOF;
        } else {
            this.parseError('Lexical error on line '+(this.yylineno+1)+'. Unrecognized text.\n'+this.showPosition(), 
                    {text: "", token: null, line: this.yylineno});
        }
    },
lex:function lex() {
        var r = this.next();
        if (typeof r !== 'undefined') {
            return r;
        } else {
            return this.lex();
        }
    },
begin:function begin(condition) {
        this.conditionStack.push(condition);
    },
popState:function popState() {
        return this.conditionStack.pop();
    },
_currentRules:function _currentRules() {
        return this.conditions[this.conditionStack[this.conditionStack.length-1]].rules;
    },
topState:function () {
        return this.conditionStack[this.conditionStack.length-2];
    },
pushState:function begin(condition) {
        this.begin(condition);
    }});
lexer.performAction = function anonymous(yy,yy_,$avoiding_name_collisions,YY_START) {

var YYSTATE=YY_START
switch($avoiding_name_collisions) {
case 0:/* skip whitespace */
break;
case 1:return 20
break;
case 2:return 19
break;
case 3:return 8
break;
case 4:return 9
break;
case 5:return 6
break;
case 6:return 7
break;
case 7:return 11
break;
case 8:return 13
break;
case 9:return 10
break;
case 10:return 12
break;
case 11:return 14
break;
case 12:return 15
break;
case 13:return 16
break;
case 14:return 17
break;
case 15:return 18
break;
case 16:return 5
break;
case 17:return 'INVALID'
break;
}
};
lexer.rules = [/^\s+/,/^[0-9]+(\.[0-9]+)?\b/,/^n\b/,/^\|\|/,/^&&/,/^\?/,/^:/,/^<=/,/^>=/,/^</,/^>/,/^!=/,/^==/,/^%/,/^\(/,/^\)/,/^$/,/^./];
lexer.conditions = {"INITIAL":{"rules":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17],"inclusive":true}};return lexer;})()
parser.lexer = lexer;
return parser;
})();
// End parser

  // Handle node, amd, and global systems
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = Jed;
    }
    exports.Jed = Jed;
  }
  else {
    if (typeof define === 'function' && define.amd) {
      define('jed', function() {
        return Jed;
      });
    }
    // Leak a global regardless of module system
    root['Jed'] = Jed;
  }

})(this);

/*!
 * Globalize
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 */

(function( window, undefined ) {

var Globalize,
	// private variables
	regexHex,
	regexInfinity,
	regexParseFloat,
	regexTrim,
	// private JavaScript utility functions
	arrayIndexOf,
	endsWith,
	extend,
	isArray,
	isFunction,
	isObject,
	startsWith,
	trim,
	truncate,
	zeroPad,
	// private Globalization utility functions
	appendPreOrPostMatch,
	expandFormat,
	formatDate,
	formatNumber,
	getTokenRegExp,
	getEra,
	getEraYear,
	parseExact,
	parseNegativePattern;

// Global variable (Globalize) or CommonJS module (globalize)
Globalize = function( cultureSelector ) {
	return new Globalize.prototype.init( cultureSelector );
};

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	module.exports = Globalize;
} else {
	// Export as global variable
	window.Globalize = Globalize;
}

Globalize.cultures = {};

Globalize.prototype = {
	constructor: Globalize,
	init: function( cultureSelector ) {
		this.cultures = Globalize.cultures;
		this.cultureSelector = cultureSelector;

		return this;
	}
};
Globalize.prototype.init.prototype = Globalize.prototype;

// 1. When defining a culture, all fields are required except the ones stated as optional.
// 2. Each culture should have a ".calendars" object with at least one calendar named "standard"
//    which serves as the default calendar in use by that culture.
// 3. Each culture should have a ".calendar" object which is the current calendar being used,
//    it may be dynamically changed at any time to one of the calendars in ".calendars".
Globalize.cultures[ "default" ] = {
	// A unique name for the culture in the form <language code>-<country/region code>
	name: "en",
	// the name of the culture in the english language
	englishName: "English",
	// the name of the culture in its own language
	nativeName: "English",
	// whether the culture uses right-to-left text
	isRTL: false,
	// "language" is used for so-called "specific" cultures.
	// For example, the culture "es-CL" means "Spanish, in Chili".
	// It represents the Spanish-speaking culture as it is in Chili,
	// which might have different formatting rules or even translations
	// than Spanish in Spain. A "neutral" culture is one that is not
	// specific to a region. For example, the culture "es" is the generic
	// Spanish culture, which may be a more generalized version of the language
	// that may or may not be what a specific culture expects.
	// For a specific culture like "es-CL", the "language" field refers to the
	// neutral, generic culture information for the language it is using.
	// This is not always a simple matter of the string before the dash.
	// For example, the "zh-Hans" culture is netural (Simplified Chinese).
	// And the "zh-SG" culture is Simplified Chinese in Singapore, whose lanugage
	// field is "zh-CHS", not "zh".
	// This field should be used to navigate from a specific culture to it's
	// more general, neutral culture. If a culture is already as general as it
	// can get, the language may refer to itself.
	language: "en",
	// numberFormat defines general number formatting rules, like the digits in
	// each grouping, the group separator, and how negative numbers are displayed.
	numberFormat: {
		// [negativePattern]
		// Note, numberFormat.pattern has no "positivePattern" unlike percent and currency,
		// but is still defined as an array for consistency with them.
		//   negativePattern: one of "(n)|-n|- n|n-|n -"
		pattern: [ "-n" ],
		// number of decimal places normally shown
		decimals: 2,
		// string that separates number groups, as in 1,000,000
		",": ",",
		// string that separates a number from the fractional portion, as in 1.99
		".": ".",
		// array of numbers indicating the size of each number group.
		// TODO: more detailed description and example
		groupSizes: [ 3 ],
		// symbol used for positive numbers
		"+": "+",
		// symbol used for negative numbers
		"-": "-",
		// symbol used for NaN (Not-A-Number)
		"NaN": "NaN",
		// symbol used for Negative Infinity
		negativeInfinity: "-Infinity",
		// symbol used for Positive Infinity
		positiveInfinity: "Infinity",
		percent: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "-n %|-n%|-%n|%-n|%n-|n-%|n%-|-% n|n %-|% n-|% -n|n- %"
			//   positivePattern: one of "n %|n%|%n|% n"
			pattern: [ "-n %", "n %" ],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [ 3 ],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent a percentage
			symbol: "%"
		},
		currency: {
			// [negativePattern, positivePattern]
			//   negativePattern: one of "($n)|-$n|$-n|$n-|(n$)|-n$|n-$|n$-|-n $|-$ n|n $-|$ n-|$ -n|n- $|($ n)|(n $)"
			//   positivePattern: one of "$n|n$|$ n|n $"
			pattern: [ "($n)", "$n" ],
			// number of decimal places normally shown
			decimals: 2,
			// array of numbers indicating the size of each number group.
			// TODO: more detailed description and example
			groupSizes: [ 3 ],
			// string that separates number groups, as in 1,000,000
			",": ",",
			// string that separates a number from the fractional portion, as in 1.99
			".": ".",
			// symbol used to represent currency
			symbol: "$"
		}
	},
	// calendars defines all the possible calendars used by this culture.
	// There should be at least one defined with name "standard", and is the default
	// calendar used by the culture.
	// A calendar contains information about how dates are formatted, information about
	// the calendar's eras, a standard set of the date formats,
	// translations for day and month names, and if the calendar is not based on the Gregorian
	// calendar, conversion functions to and from the Gregorian calendar.
	calendars: {
		standard: {
			// name that identifies the type of calendar this is
			name: "Gregorian_USEnglish",
			// separator of parts of a date (e.g. "/" in 11/05/1955)
			"/": "/",
			// separator of parts of a time (e.g. ":" in 05:44 PM)
			":": ":",
			// the first day of the week (0 = Sunday, 1 = Monday, etc)
			firstDay: 0,
			days: {
				// full day names
				names: [ "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday" ],
				// abbreviated day names
				namesAbbr: [ "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat" ],
				// shortest day names
				namesShort: [ "Su", "Mo", "Tu", "We", "Th", "Fr", "Sa" ]
			},
			months: {
				// full month names (13 months for lunar calendards -- 13th month should be "" if not lunar)
				names: [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December", "" ],
				// abbreviated month names
				namesAbbr: [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "" ]
			},
			// AM and PM designators in one of these forms:
			// The usual view, and the upper and lower case versions
			//   [ standard, lowercase, uppercase ]
			// The culture does not use AM or PM (likely all standard date formats use 24 hour time)
			//   null
			AM: [ "AM", "am", "AM" ],
			PM: [ "PM", "pm", "PM" ],
			eras: [
				// eras in reverse chronological order.
				// name: the name of the era in this culture (e.g. A.D., C.E.)
				// start: when the era starts in ticks (gregorian, gmt), null if it is the earliest supported era.
				// offset: offset in years from gregorian calendar
				{
					"name": "A.D.",
					"start": null,
					"offset": 0
				}
			],
			// when a two digit year is given, it will never be parsed as a four digit
			// year greater than this year (in the appropriate era for the culture)
			// Set it as a full year (e.g. 2029) or use an offset format starting from
			// the current year: "+19" would correspond to 2029 if the current year 2010.
			twoDigitYearMax: 2029,
			// set of predefined date and time patterns used by the culture
			// these represent the format someone in this culture would expect
			// to see given the portions of the date that are shown.
			patterns: {
				// short date pattern
				d: "M/d/yyyy",
				// long date pattern
				D: "dddd, MMMM dd, yyyy",
				// short time pattern
				t: "h:mm tt",
				// long time pattern
				T: "h:mm:ss tt",
				// long date, short time pattern
				f: "dddd, MMMM dd, yyyy h:mm tt",
				// long date, long time pattern
				F: "dddd, MMMM dd, yyyy h:mm:ss tt",
				// month/day pattern
				M: "MMMM dd",
				// month/year pattern
				Y: "yyyy MMMM",
				// S is a sortable format that does not vary by culture
				S: "yyyy\u0027-\u0027MM\u0027-\u0027dd\u0027T\u0027HH\u0027:\u0027mm\u0027:\u0027ss"
			}
			// optional fields for each calendar:
			/*
			monthsGenitive:
				Same as months but used when the day preceeds the month.
				Omit if the culture has no genitive distinction in month names.
				For an explaination of genitive months, see http://blogs.msdn.com/michkap/archive/2004/12/25/332259.aspx
			convert:
				Allows for the support of non-gregorian based calendars. This convert object is used to
				to convert a date to and from a gregorian calendar date to handle parsing and formatting.
				The two functions:
					fromGregorian( date )
						Given the date as a parameter, return an array with parts [ year, month, day ]
						corresponding to the non-gregorian based year, month, and day for the calendar.
					toGregorian( year, month, day )
						Given the non-gregorian year, month, and day, return a new Date() object
						set to the corresponding date in the gregorian calendar.
			*/
		}
	},
	// For localized strings
	messages: {}
};

Globalize.cultures[ "default" ].calendar = Globalize.cultures[ "default" ].calendars.standard;

Globalize.cultures.en = Globalize.cultures[ "default" ];

Globalize.cultureSelector = "en";

//
// private variables
//

regexHex = /^0x[a-f0-9]+$/i;
regexInfinity = /^[+\-]?infinity$/i;
regexParseFloat = /^[+\-]?\d*\.?\d*(e[+\-]?\d+)?$/;
regexTrim = /^\s+|\s+$/g;

//
// private JavaScript utility functions
//

arrayIndexOf = function( array, item ) {
	if ( array.indexOf ) {
		return array.indexOf( item );
	}
	for ( var i = 0, length = array.length; i < length; i++ ) {
		if ( array[i] === item ) {
			return i;
		}
	}
	return -1;
};

endsWith = function( value, pattern ) {
	return value.substr( value.length - pattern.length ) === pattern;
};

extend = function() {
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0] || {},
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if ( typeof target === "boolean" ) {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}

	// Handle case when target is a string or something (possible in deep copy)
	if ( typeof target !== "object" && !isFunction(target) ) {
		target = {};
	}

	for ( ; i < length; i++ ) {
		// Only deal with non-null/undefined values
		if ( (options = arguments[ i ]) != null ) {
			// Extend the base object
			for ( name in options ) {
				src = target[ name ];
				copy = options[ name ];

				// Prevent never-ending loop
				if ( target === copy ) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if ( deep && copy && ( isObject(copy) || (copyIsArray = isArray(copy)) ) ) {
					if ( copyIsArray ) {
						copyIsArray = false;
						clone = src && isArray(src) ? src : [];

					} else {
						clone = src && isObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[ name ] = extend( deep, clone, copy );

				// Don't bring in undefined values
				} else if ( copy !== undefined ) {
					target[ name ] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};

isArray = Array.isArray || function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Array]";
};

isFunction = function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Function]";
};

isObject = function( obj ) {
	return Object.prototype.toString.call( obj ) === "[object Object]";
};

startsWith = function( value, pattern ) {
	return value.indexOf( pattern ) === 0;
};

trim = function( value ) {
	return ( value + "" ).replace( regexTrim, "" );
};

truncate = function( value ) {
	if ( isNaN( value ) ) {
		return NaN;
	}
	return Math[ value < 0 ? "ceil" : "floor" ]( value );
};

zeroPad = function( str, count, left ) {
	var l;
	for ( l = str.length; l < count; l += 1 ) {
		str = ( left ? ("0" + str) : (str + "0") );
	}
	return str;
};

//
// private Globalization utility functions
//

appendPreOrPostMatch = function( preMatch, strings ) {
	// appends pre- and post- token match strings while removing escaped characters.
	// Returns a single quote count which is used to determine if the token occurs
	// in a string literal.
	var quoteCount = 0,
		escaped = false;
	for ( var i = 0, il = preMatch.length; i < il; i++ ) {
		var c = preMatch.charAt( i );
		switch ( c ) {
			case "\'":
				if ( escaped ) {
					strings.push( "\'" );
				}
				else {
					quoteCount++;
				}
				escaped = false;
				break;
			case "\\":
				if ( escaped ) {
					strings.push( "\\" );
				}
				escaped = !escaped;
				break;
			default:
				strings.push( c );
				escaped = false;
				break;
		}
	}
	return quoteCount;
};

expandFormat = function( cal, format ) {
	// expands unspecified or single character date formats into the full pattern.
	format = format || "F";
	var pattern,
		patterns = cal.patterns,
		len = format.length;
	if ( len === 1 ) {
		pattern = patterns[ format ];
		if ( !pattern ) {
			throw "Invalid date format string \'" + format + "\'.";
		}
		format = pattern;
	}
	else if ( len === 2 && format.charAt(0) === "%" ) {
		// %X escape format -- intended as a custom format string that is only one character, not a built-in format.
		format = format.charAt( 1 );
	}
	return format;
};

formatDate = function( value, format, culture ) {
	var cal = culture.calendar,
		convert = cal.convert,
		ret;

	if ( !format || !format.length || format === "i" ) {
		if ( culture && culture.name.length ) {
			if ( convert ) {
				// non-gregorian calendar, so we cannot use built-in toLocaleString()
				ret = formatDate( value, cal.patterns.F, culture );
			}
			else {
				var eraDate = new Date( value.getTime() ),
					era = getEra( value, cal.eras );
				eraDate.setFullYear( getEraYear(value, cal, era) );
				ret = eraDate.toLocaleString();
			}
		}
		else {
			ret = value.toString();
		}
		return ret;
	}

	var eras = cal.eras,
		sortable = format === "s";
	format = expandFormat( cal, format );

	// Start with an empty string
	ret = [];
	var hour,
		zeros = [ "0", "00", "000" ],
		foundDay,
		checkedDay,
		dayPartRegExp = /([^d]|^)(d|dd)([^d]|$)/g,
		quoteCount = 0,
		tokenRegExp = getTokenRegExp(),
		converted;

	function padZeros( num, c ) {
		var r, s = num + "";
		if ( c > 1 && s.length < c ) {
			r = ( zeros[c - 2] + s);
			return r.substr( r.length - c, c );
		}
		else {
			r = s;
		}
		return r;
	}

	function hasDay() {
		if ( foundDay || checkedDay ) {
			return foundDay;
		}
		foundDay = dayPartRegExp.test( format );
		checkedDay = true;
		return foundDay;
	}

	function getPart( date, part ) {
		if ( converted ) {
			return converted[ part ];
		}
		switch ( part ) {
			case 0:
				return date.getFullYear();
			case 1:
				return date.getMonth();
			case 2:
				return date.getDate();
			default:
				throw "Invalid part value " + part;
		}
	}

	if ( !sortable && convert ) {
		converted = convert.fromGregorian( value );
	}

	for ( ; ; ) {
		// Save the current index
		var index = tokenRegExp.lastIndex,
			// Look for the next pattern
			ar = tokenRegExp.exec( format );

		// Append the text before the pattern (or the end of the string if not found)
		var preMatch = format.slice( index, ar ? ar.index : format.length );
		quoteCount += appendPreOrPostMatch( preMatch, ret );

		if ( !ar ) {
			break;
		}

		// do not replace any matches that occur inside a string literal.
		if ( quoteCount % 2 ) {
			ret.push( ar[0] );
			continue;
		}

		var current = ar[ 0 ],
			clength = current.length;

		switch ( current ) {
			case "ddd":
				//Day of the week, as a three-letter abbreviation
			case "dddd":
				// Day of the week, using the full name
				var names = ( clength === 3 ) ? cal.days.namesAbbr : cal.days.names;
				ret.push( names[value.getDay()] );
				break;
			case "d":
				// Day of month, without leading zero for single-digit days
			case "dd":
				// Day of month, with leading zero for single-digit days
				foundDay = true;
				ret.push(
					padZeros( getPart(value, 2), clength )
				);
				break;
			case "MMM":
				// Month, as a three-letter abbreviation
			case "MMMM":
				// Month, using the full name
				var part = getPart( value, 1 );
				ret.push(
					( cal.monthsGenitive && hasDay() ) ?
					( cal.monthsGenitive[ clength === 3 ? "namesAbbr" : "names" ][ part ] ) :
					( cal.months[ clength === 3 ? "namesAbbr" : "names" ][ part ] )
				);
				break;
			case "M":
				// Month, as digits, with no leading zero for single-digit months
			case "MM":
				// Month, as digits, with leading zero for single-digit months
				ret.push(
					padZeros( getPart(value, 1) + 1, clength )
				);
				break;
			case "y":
				// Year, as two digits, but with no leading zero for years less than 10
			case "yy":
				// Year, as two digits, with leading zero for years less than 10
			case "yyyy":
				// Year represented by four full digits
				part = converted ? converted[ 0 ] : getEraYear( value, cal, getEra(value, eras), sortable );
				if ( clength < 4 ) {
					part = part % 100;
				}
				ret.push(
					padZeros( part, clength )
				);
				break;
			case "h":
				// Hours with no leading zero for single-digit hours, using 12-hour clock
			case "hh":
				// Hours with leading zero for single-digit hours, using 12-hour clock
				hour = value.getHours() % 12;
				if ( hour === 0 ) hour = 12;
				ret.push(
					padZeros( hour, clength )
				);
				break;
			case "H":
				// Hours with no leading zero for single-digit hours, using 24-hour clock
			case "HH":
				// Hours with leading zero for single-digit hours, using 24-hour clock
				ret.push(
					padZeros( value.getHours(), clength )
				);
				break;
			case "m":
				// Minutes with no leading zero for single-digit minutes
			case "mm":
				// Minutes with leading zero for single-digit minutes
				ret.push(
					padZeros( value.getMinutes(), clength )
				);
				break;
			case "s":
				// Seconds with no leading zero for single-digit seconds
			case "ss":
				// Seconds with leading zero for single-digit seconds
				ret.push(
					padZeros( value.getSeconds(), clength )
				);
				break;
			case "t":
				// One character am/pm indicator ("a" or "p")
			case "tt":
				// Multicharacter am/pm indicator
				part = value.getHours() < 12 ? ( cal.AM ? cal.AM[0] : " " ) : ( cal.PM ? cal.PM[0] : " " );
				ret.push( clength === 1 ? part.charAt(0) : part );
				break;
			case "f":
				// Deciseconds
			case "ff":
				// Centiseconds
			case "fff":
				// Milliseconds
				ret.push(
					padZeros( value.getMilliseconds(), 3 ).substr( 0, clength )
				);
				break;
			case "z":
				// Time zone offset, no leading zero
			case "zz":
				// Time zone offset with leading zero
				hour = value.getTimezoneOffset() / 60;
				ret.push(
					( hour <= 0 ? "+" : "-" ) + padZeros( Math.floor(Math.abs(hour)), clength )
				);
				break;
			case "zzz":
				// Time zone offset with leading zero
				hour = value.getTimezoneOffset() / 60;
				ret.push(
					( hour <= 0 ? "+" : "-" ) + padZeros( Math.floor(Math.abs(hour)), 2 ) +
					// Hard coded ":" separator, rather than using cal.TimeSeparator
					// Repeated here for consistency, plus ":" was already assumed in date parsing.
					":" + padZeros( Math.abs(value.getTimezoneOffset() % 60), 2 )
				);
				break;
			case "g":
			case "gg":
				if ( cal.eras ) {
					ret.push(
						cal.eras[ getEra(value, eras) ].name
					);
				}
				break;
		case "/":
			ret.push( cal["/"] );
			break;
		default:
			throw "Invalid date format pattern \'" + current + "\'.";
		}
	}
	return ret.join( "" );
};

// formatNumber
(function() {
	var expandNumber;

	expandNumber = function( number, precision, formatInfo ) {
		var groupSizes = formatInfo.groupSizes,
			curSize = groupSizes[ 0 ],
			curGroupIndex = 1,
			factor = Math.pow( 10, precision ),
			rounded = Math.round( number * factor ) / factor;

		if ( !isFinite(rounded) ) {
			rounded = number;
		}
		number = rounded;

		var numberString = number+"",
			right = "",
			split = numberString.split( /e/i ),
			exponent = split.length > 1 ? parseInt( split[1], 10 ) : 0;
		numberString = split[ 0 ];
		split = numberString.split( "." );
		numberString = split[ 0 ];
		right = split.length > 1 ? split[ 1 ] : "";

		var l;
		if ( exponent > 0 ) {
			right = zeroPad( right, exponent, false );
			numberString += right.slice( 0, exponent );
			right = right.substr( exponent );
		}
		else if ( exponent < 0 ) {
			exponent = -exponent;
			numberString = zeroPad( numberString, exponent + 1, true );
			right = numberString.slice( -exponent, numberString.length ) + right;
			numberString = numberString.slice( 0, -exponent );
		}

		if ( precision > 0 ) {
			right = formatInfo[ "." ] +
				( (right.length > precision) ? right.slice(0, precision) : zeroPad(right, precision) );
		}
		else {
			right = "";
		}

		var stringIndex = numberString.length - 1,
			sep = formatInfo[ "," ],
			ret = "";

		while ( stringIndex >= 0 ) {
			if ( curSize === 0 || curSize > stringIndex ) {
				return numberString.slice( 0, stringIndex + 1 ) + ( ret.length ? (sep + ret + right) : right );
			}
			ret = numberString.slice( stringIndex - curSize + 1, stringIndex + 1 ) + ( ret.length ? (sep + ret) : "" );

			stringIndex -= curSize;

			if ( curGroupIndex < groupSizes.length ) {
				curSize = groupSizes[ curGroupIndex ];
				curGroupIndex++;
			}
		}

		return numberString.slice( 0, stringIndex + 1 ) + sep + ret + right;
	};

	formatNumber = function( value, format, culture ) {
		if ( !isFinite(value) ) {
			if ( value === Infinity ) {
				return culture.numberFormat.positiveInfinity;
			}
			if ( value === -Infinity ) {
				return culture.numberFormat.negativeInfinity;
			}
			return culture.numberFormat[ "NaN" ];
		}
		if ( !format || format === "i" ) {
			return culture.name.length ? value.toLocaleString() : value.toString();
		}
		format = format || "D";

		var nf = culture.numberFormat,
			number = Math.abs( value ),
			precision = -1,
			pattern;
		if ( format.length > 1 ) precision = parseInt( format.slice(1), 10 );

		var current = format.charAt( 0 ).toUpperCase(),
			formatInfo;

		switch ( current ) {
			case "D":
				pattern = "n";
				number = truncate( number );
				if ( precision !== -1 ) {
					number = zeroPad( "" + number, precision, true );
				}
				if ( value < 0 ) number = "-" + number;
				break;
			case "N":
				formatInfo = nf;
				/* falls through */
			case "C":
				formatInfo = formatInfo || nf.currency;
				/* falls through */
			case "P":
				formatInfo = formatInfo || nf.percent;
				pattern = value < 0 ? formatInfo.pattern[ 0 ] : ( formatInfo.pattern[1] || "n" );
				if ( precision === -1 ) precision = formatInfo.decimals;
				number = expandNumber( number * (current === "P" ? 100 : 1), precision, formatInfo );
				break;
			default:
				throw "Bad number format specifier: " + current;
		}

		var patternParts = /n|\$|-|%/g,
			ret = "";
		for ( ; ; ) {
			var index = patternParts.lastIndex,
				ar = patternParts.exec( pattern );

			ret += pattern.slice( index, ar ? ar.index : pattern.length );

			if ( !ar ) {
				break;
			}

			switch ( ar[0] ) {
				case "n":
					ret += number;
					break;
				case "$":
					ret += nf.currency.symbol;
					break;
				case "-":
					// don't make 0 negative
					if ( /[1-9]/.test(number) ) {
						ret += nf[ "-" ];
					}
					break;
				case "%":
					ret += nf.percent.symbol;
					break;
			}
		}

		return ret;
	};

}());

getTokenRegExp = function() {
	// regular expression for matching date and time tokens in format strings.
	return (/\/|dddd|ddd|dd|d|MMMM|MMM|MM|M|yyyy|yy|y|hh|h|HH|H|mm|m|ss|s|tt|t|fff|ff|f|zzz|zz|z|gg|g/g);
};

getEra = function( date, eras ) {
	if ( !eras ) return 0;
	var start, ticks = date.getTime();
	for ( var i = 0, l = eras.length; i < l; i++ ) {
		start = eras[ i ].start;
		if ( start === null || ticks >= start ) {
			return i;
		}
	}
	return 0;
};

getEraYear = function( date, cal, era, sortable ) {
	var year = date.getFullYear();
	if ( !sortable && cal.eras ) {
		// convert normal gregorian year to era-shifted gregorian
		// year by subtracting the era offset
		year -= cal.eras[ era ].offset;
	}
	return year;
};

// parseExact
(function() {
	var expandYear,
		getDayIndex,
		getMonthIndex,
		getParseRegExp,
		outOfRange,
		toUpper,
		toUpperArray;

	expandYear = function( cal, year ) {
		// expands 2-digit year into 4 digits.
		if ( year < 100 ) {
			var now = new Date(),
				era = getEra( now ),
				curr = getEraYear( now, cal, era ),
				twoDigitYearMax = cal.twoDigitYearMax;
			twoDigitYearMax = typeof twoDigitYearMax === "string" ? new Date().getFullYear() % 100 + parseInt( twoDigitYearMax, 10 ) : twoDigitYearMax;
			year += curr - ( curr % 100 );
			if ( year > twoDigitYearMax ) {
				year -= 100;
			}
		}
		return year;
	};

	getDayIndex = function	( cal, value, abbr ) {
		var ret,
			days = cal.days,
			upperDays = cal._upperDays;
		if ( !upperDays ) {
			cal._upperDays = upperDays = [
				toUpperArray( days.names ),
				toUpperArray( days.namesAbbr ),
				toUpperArray( days.namesShort )
			];
		}
		value = toUpper( value );
		if ( abbr ) {
			ret = arrayIndexOf( upperDays[1], value );
			if ( ret === -1 ) {
				ret = arrayIndexOf( upperDays[2], value );
			}
		}
		else {
			ret = arrayIndexOf( upperDays[0], value );
		}
		return ret;
	};

	getMonthIndex = function( cal, value, abbr ) {
		var months = cal.months,
			monthsGen = cal.monthsGenitive || cal.months,
			upperMonths = cal._upperMonths,
			upperMonthsGen = cal._upperMonthsGen;
		if ( !upperMonths ) {
			cal._upperMonths = upperMonths = [
				toUpperArray( months.names ),
				toUpperArray( months.namesAbbr )
			];
			cal._upperMonthsGen = upperMonthsGen = [
				toUpperArray( monthsGen.names ),
				toUpperArray( monthsGen.namesAbbr )
			];
		}
		value = toUpper( value );
		var i = arrayIndexOf( abbr ? upperMonths[1] : upperMonths[0], value );
		if ( i < 0 ) {
			i = arrayIndexOf( abbr ? upperMonthsGen[1] : upperMonthsGen[0], value );
		}
		return i;
	};

	getParseRegExp = function( cal, format ) {
		// converts a format string into a regular expression with groups that
		// can be used to extract date fields from a date string.
		// check for a cached parse regex.
		var re = cal._parseRegExp;
		if ( !re ) {
			cal._parseRegExp = re = {};
		}
		else {
			var reFormat = re[ format ];
			if ( reFormat ) {
				return reFormat;
			}
		}

		// expand single digit formats, then escape regular expression characters.
		var expFormat = expandFormat( cal, format ).replace( /([\^\$\.\*\+\?\|\[\]\(\)\{\}])/g, "\\\\$1" ),
			regexp = [ "^" ],
			groups = [],
			index = 0,
			quoteCount = 0,
			tokenRegExp = getTokenRegExp(),
			match;

		// iterate through each date token found.
		while ( (match = tokenRegExp.exec(expFormat)) !== null ) {
			var preMatch = expFormat.slice( index, match.index );
			index = tokenRegExp.lastIndex;

			// don't replace any matches that occur inside a string literal.
			quoteCount += appendPreOrPostMatch( preMatch, regexp );
			if ( quoteCount % 2 ) {
				regexp.push( match[0] );
				continue;
			}

			// add a regex group for the token.
			var m = match[ 0 ],
				len = m.length,
				add;
			switch ( m ) {
				case "dddd": case "ddd":
				case "MMMM": case "MMM":
				case "gg": case "g":
					add = "(\\D+)";
					break;
				case "tt": case "t":
					add = "(\\D*)";
					break;
				case "yyyy":
				case "fff":
				case "ff":
				case "f":
					add = "(\\d{" + len + "})";
					break;
				case "dd": case "d":
				case "MM": case "M":
				case "yy": case "y":
				case "HH": case "H":
				case "hh": case "h":
				case "mm": case "m":
				case "ss": case "s":
					add = "(\\d\\d?)";
					break;
				case "zzz":
					add = "([+-]?\\d\\d?:\\d{2})";
					break;
				case "zz": case "z":
					add = "([+-]?\\d\\d?)";
					break;
				case "/":
					add = "(\\/)";
					break;
				default:
					throw "Invalid date format pattern \'" + m + "\'.";
			}
			if ( add ) {
				regexp.push( add );
			}
			groups.push( match[0] );
		}
		appendPreOrPostMatch( expFormat.slice(index), regexp );
		regexp.push( "$" );

		// allow whitespace to differ when matching formats.
		var regexpStr = regexp.join( "" ).replace( /\s+/g, "\\s+" ),
			parseRegExp = { "regExp": regexpStr, "groups": groups };

		// cache the regex for this format.
		return re[ format ] = parseRegExp;
	};

	outOfRange = function( value, low, high ) {
		return value < low || value > high;
	};

	toUpper = function( value ) {
		// "he-IL" has non-breaking space in weekday names.
		return value.split( "\u00A0" ).join( " " ).toUpperCase();
	};

	toUpperArray = function( arr ) {
		var results = [];
		for ( var i = 0, l = arr.length; i < l; i++ ) {
			results[ i ] = toUpper( arr[i] );
		}
		return results;
	};

	parseExact = function( value, format, culture ) {
		// try to parse the date string by matching against the format string
		// while using the specified culture for date field names.
		value = trim( value );
		var cal = culture.calendar,
			// convert date formats into regular expressions with groupings.
			// use the regexp to determine the input format and extract the date fields.
			parseInfo = getParseRegExp( cal, format ),
			match = new RegExp( parseInfo.regExp ).exec( value );
		if ( match === null ) {
			return null;
		}
		// found a date format that matches the input.
		var groups = parseInfo.groups,
			era = null, year = null, month = null, date = null, weekDay = null,
			hour = 0, hourOffset, min = 0, sec = 0, msec = 0, tzMinOffset = null,
			pmHour = false;
		// iterate the format groups to extract and set the date fields.
		for ( var j = 0, jl = groups.length; j < jl; j++ ) {
			var matchGroup = match[ j + 1 ];
			if ( matchGroup ) {
				var current = groups[ j ],
					clength = current.length,
					matchInt = parseInt( matchGroup, 10 );
				switch ( current ) {
					case "dd": case "d":
						// Day of month.
						date = matchInt;
						// check that date is generally in valid range, also checking overflow below.
						if ( outOfRange(date, 1, 31) ) return null;
						break;
					case "MMM": case "MMMM":
						month = getMonthIndex( cal, matchGroup, clength === 3 );
						if ( outOfRange(month, 0, 11) ) return null;
						break;
					case "M": case "MM":
						// Month.
						month = matchInt - 1;
						if ( outOfRange(month, 0, 11) ) return null;
						break;
					case "y": case "yy":
					case "yyyy":
						year = clength < 4 ? expandYear( cal, matchInt ) : matchInt;
						if ( outOfRange(year, 0, 9999) ) return null;
						break;
					case "h": case "hh":
						// Hours (12-hour clock).
						hour = matchInt;
						if ( hour === 12 ) hour = 0;
						if ( outOfRange(hour, 0, 11) ) return null;
						break;
					case "H": case "HH":
						// Hours (24-hour clock).
						hour = matchInt;
						if ( outOfRange(hour, 0, 23) ) return null;
						break;
					case "m": case "mm":
						// Minutes.
						min = matchInt;
						if ( outOfRange(min, 0, 59) ) return null;
						break;
					case "s": case "ss":
						// Seconds.
						sec = matchInt;
						if ( outOfRange(sec, 0, 59) ) return null;
						break;
					case "tt": case "t":
						// AM/PM designator.
						// see if it is standard, upper, or lower case PM. If not, ensure it is at least one of
						// the AM tokens. If not, fail the parse for this format.
						pmHour = cal.PM && ( matchGroup === cal.PM[0] || matchGroup === cal.PM[1] || matchGroup === cal.PM[2] );
						if (
							!pmHour && (
								!cal.AM || ( matchGroup !== cal.AM[0] && matchGroup !== cal.AM[1] && matchGroup !== cal.AM[2] )
							)
						) return null;
						break;
					case "f":
						// Deciseconds.
					case "ff":
						// Centiseconds.
					case "fff":
						// Milliseconds.
						msec = matchInt * Math.pow( 10, 3 - clength );
						if ( outOfRange(msec, 0, 999) ) return null;
						break;
					case "ddd":
						// Day of week.
					case "dddd":
						// Day of week.
						weekDay = getDayIndex( cal, matchGroup, clength === 3 );
						if ( outOfRange(weekDay, 0, 6) ) return null;
						break;
					case "zzz":
						// Time zone offset in +/- hours:min.
						var offsets = matchGroup.split( /:/ );
						if ( offsets.length !== 2 ) return null;
						hourOffset = parseInt( offsets[0], 10 );
						if ( outOfRange(hourOffset, -12, 13) ) return null;
						var minOffset = parseInt( offsets[1], 10 );
						if ( outOfRange(minOffset, 0, 59) ) return null;
						tzMinOffset = ( hourOffset * 60 ) + ( startsWith(matchGroup, "-") ? -minOffset : minOffset );
						break;
					case "z": case "zz":
						// Time zone offset in +/- hours.
						hourOffset = matchInt;
						if ( outOfRange(hourOffset, -12, 13) ) return null;
						tzMinOffset = hourOffset * 60;
						break;
					case "g": case "gg":
						var eraName = matchGroup;
						if ( !eraName || !cal.eras ) return null;
						eraName = trim( eraName.toLowerCase() );
						for ( var i = 0, l = cal.eras.length; i < l; i++ ) {
							if ( eraName === cal.eras[i].name.toLowerCase() ) {
								era = i;
								break;
							}
						}
						// could not find an era with that name
						if ( era === null ) return null;
						break;
				}
			}
		}
		var result = new Date(), defaultYear, convert = cal.convert;
		defaultYear = convert ? convert.fromGregorian( result )[ 0 ] : result.getFullYear();
		if ( year === null ) {
			year = defaultYear;
		}
		else if ( cal.eras ) {
			// year must be shifted to normal gregorian year
			// but not if year was not specified, its already normal gregorian
			// per the main if clause above.
			year += cal.eras[( era || 0 )].offset;
		}
		// set default day and month to 1 and January, so if unspecified, these are the defaults
		// instead of the current day/month.
		if ( month === null ) {
			month = 0;
		}
		if ( date === null ) {
			date = 1;
		}
		// now have year, month, and date, but in the culture's calendar.
		// convert to gregorian if necessary
		if ( convert ) {
			result = convert.toGregorian( year, month, date );
			// conversion failed, must be an invalid match
			if ( result === null ) return null;
		}
		else {
			// have to set year, month and date together to avoid overflow based on current date.
			result.setFullYear( year, month, date );
			// check to see if date overflowed for specified month (only checked 1-31 above).
			if ( result.getDate() !== date ) return null;
			// invalid day of week.
			if ( weekDay !== null && result.getDay() !== weekDay ) {
				return null;
			}
		}
		// if pm designator token was found make sure the hours fit the 24-hour clock.
		if ( pmHour && hour < 12 ) {
			hour += 12;
		}
		result.setHours( hour, min, sec, msec );
		if ( tzMinOffset !== null ) {
			// adjust timezone to utc before applying local offset.
			var adjustedMin = result.getMinutes() - ( tzMinOffset + result.getTimezoneOffset() );
			// Safari limits hours and minutes to the range of -127 to 127.  We need to use setHours
			// to ensure both these fields will not exceed this range.	adjustedMin will range
			// somewhere between -1440 and 1500, so we only need to split this into hours.
			result.setHours( result.getHours() + parseInt(adjustedMin / 60, 10), adjustedMin % 60 );
		}
		return result;
	};
}());

parseNegativePattern = function( value, nf, negativePattern ) {
	var neg = nf[ "-" ],
		pos = nf[ "+" ],
		ret;
	switch ( negativePattern ) {
		case "n -":
			neg = " " + neg;
			pos = " " + pos;
			/* falls through */
		case "n-":
			if ( endsWith(value, neg) ) {
				ret = [ "-", value.substr(0, value.length - neg.length) ];
			}
			else if ( endsWith(value, pos) ) {
				ret = [ "+", value.substr(0, value.length - pos.length) ];
			}
			break;
		case "- n":
			neg += " ";
			pos += " ";
			/* falls through */
		case "-n":
			if ( startsWith(value, neg) ) {
				ret = [ "-", value.substr(neg.length) ];
			}
			else if ( startsWith(value, pos) ) {
				ret = [ "+", value.substr(pos.length) ];
			}
			break;
		case "(n)":
			if ( startsWith(value, "(") && endsWith(value, ")") ) {
				ret = [ "-", value.substr(1, value.length - 2) ];
			}
			break;
	}
	return ret || [ "", value ];
};

//
// public instance functions
//

Globalize.prototype.findClosestCulture = function( cultureSelector ) {
	return Globalize.findClosestCulture.call( this, cultureSelector );
};

Globalize.prototype.format = function( value, format, cultureSelector ) {
	return Globalize.format.call( this, value, format, cultureSelector );
};

Globalize.prototype.localize = function( key, cultureSelector ) {
	return Globalize.localize.call( this, key, cultureSelector );
};

Globalize.prototype.parseInt = function( value, radix, cultureSelector ) {
	return Globalize.parseInt.call( this, value, radix, cultureSelector );
};

Globalize.prototype.parseFloat = function( value, radix, cultureSelector ) {
	return Globalize.parseFloat.call( this, value, radix, cultureSelector );
};

Globalize.prototype.culture = function( cultureSelector ) {
	return Globalize.culture.call( this, cultureSelector );
};

//
// public singleton functions
//

Globalize.addCultureInfo = function( cultureName, baseCultureName, info ) {

	var base = {},
		isNew = false;

	if ( typeof cultureName !== "string" ) {
		// cultureName argument is optional string. If not specified, assume info is first
		// and only argument. Specified info deep-extends current culture.
		info = cultureName;
		cultureName = this.culture().name;
		base = this.cultures[ cultureName ];
	} else if ( typeof baseCultureName !== "string" ) {
		// baseCultureName argument is optional string. If not specified, assume info is second
		// argument. Specified info deep-extends specified culture.
		// If specified culture does not exist, create by deep-extending default
		info = baseCultureName;
		isNew = ( this.cultures[ cultureName ] == null );
		base = this.cultures[ cultureName ] || this.cultures[ "default" ];
	} else {
		// cultureName and baseCultureName specified. Assume a new culture is being created
		// by deep-extending an specified base culture
		isNew = true;
		base = this.cultures[ baseCultureName ];
	}

	this.cultures[ cultureName ] = extend(true, {},
		base,
		info
	);
	// Make the standard calendar the current culture if it's a new culture
	if ( isNew ) {
		this.cultures[ cultureName ].calendar = this.cultures[ cultureName ].calendars.standard;
	}
};

Globalize.findClosestCulture = function( name ) {
	var match;
	if ( !name ) {
		return this.findClosestCulture( this.cultureSelector ) || this.cultures[ "default" ];
	}
	if ( typeof name === "string" ) {
		name = name.split( "," );
	}
	if ( isArray(name) ) {
		var lang,
			cultures = this.cultures,
			list = name,
			i, l = list.length,
			prioritized = [];
		for ( i = 0; i < l; i++ ) {
			name = trim( list[i] );
			var pri, parts = name.split( ";" );
			lang = trim( parts[0] );
			if ( parts.length === 1 ) {
				pri = 1;
			}
			else {
				name = trim( parts[1] );
				if ( name.indexOf("q=") === 0 ) {
					name = name.substr( 2 );
					pri = parseFloat( name );
					pri = isNaN( pri ) ? 0 : pri;
				}
				else {
					pri = 1;
				}
			}
			prioritized.push({ lang: lang, pri: pri });
		}
		prioritized.sort(function( a, b ) {
			if ( a.pri < b.pri ) {
				return 1;
			} else if ( a.pri > b.pri ) {
				return -1;
			}
			return 0;
		});
		// exact match
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			match = cultures[ lang ];
			if ( match ) {
				return match;
			}
		}

		// neutral language match
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			do {
				var index = lang.lastIndexOf( "-" );
				if ( index === -1 ) {
					break;
				}
				// strip off the last part. e.g. en-US => en
				lang = lang.substr( 0, index );
				match = cultures[ lang ];
				if ( match ) {
					return match;
				}
			}
			while ( 1 );
		}

		// last resort: match first culture using that language
		for ( i = 0; i < l; i++ ) {
			lang = prioritized[ i ].lang;
			for ( var cultureKey in cultures ) {
				var culture = cultures[ cultureKey ];
				if ( culture.language == lang ) {
					return culture;
				}
			}
		}
	}
	else if ( typeof name === "object" ) {
		return name;
	}
	return match || null;
};

Globalize.format = function( value, format, cultureSelector ) {
	var culture = this.findClosestCulture( cultureSelector );
	if ( value instanceof Date ) {
		value = formatDate( value, format, culture );
	}
	else if ( typeof value === "number" ) {
		value = formatNumber( value, format, culture );
	}
	return value;
};

Globalize.localize = function( key, cultureSelector ) {
	return this.findClosestCulture( cultureSelector ).messages[ key ] ||
		this.cultures[ "default" ].messages[ key ];
};

Globalize.parseDate = function( value, formats, culture ) {
	culture = this.findClosestCulture( culture );

	var date, prop, patterns;
	if ( formats ) {
		if ( typeof formats === "string" ) {
			formats = [ formats ];
		}
		if ( formats.length ) {
			for ( var i = 0, l = formats.length; i < l; i++ ) {
				var format = formats[ i ];
				if ( format ) {
					date = parseExact( value, format, culture );
					if ( date ) {
						break;
					}
				}
			}
		}
	} else {
		patterns = culture.calendar.patterns;
		for ( prop in patterns ) {
			date = parseExact( value, patterns[prop], culture );
			if ( date ) {
				break;
			}
		}
	}

	return date || null;
};

Globalize.parseInt = function( value, radix, cultureSelector ) {
	return truncate( Globalize.parseFloat(value, radix, cultureSelector) );
};

Globalize.parseFloat = function( value, radix, cultureSelector ) {
	// radix argument is optional
	if ( typeof radix !== "number" ) {
		cultureSelector = radix;
		radix = 10;
	}

	var culture = this.findClosestCulture( cultureSelector );
	var ret = NaN,
		nf = culture.numberFormat;

	if ( value.indexOf(culture.numberFormat.currency.symbol) > -1 ) {
		// remove currency symbol
		value = value.replace( culture.numberFormat.currency.symbol, "" );
		// replace decimal seperator
		value = value.replace( culture.numberFormat.currency["."], culture.numberFormat["."] );
	}

	// trim leading and trailing whitespace
	value = trim( value );

	// allow infinity or hexidecimal
	if ( regexInfinity.test(value) ) {
		ret = parseFloat( value );
	}
	else if ( !radix && regexHex.test(value) ) {
		ret = parseInt( value, 16 );
	}
	else {

		// determine sign and number
		var signInfo = parseNegativePattern( value, nf, nf.pattern[0] ),
			sign = signInfo[ 0 ],
			num = signInfo[ 1 ];

		// #44 - try parsing as "(n)"
		if ( sign === "" && nf.pattern[0] !== "(n)" ) {
			signInfo = parseNegativePattern( value, nf, "(n)" );
			sign = signInfo[ 0 ];
			num = signInfo[ 1 ];
		}

		// try parsing as "-n"
		if ( sign === "" && nf.pattern[0] !== "-n" ) {
			signInfo = parseNegativePattern( value, nf, "-n" );
			sign = signInfo[ 0 ];
			num = signInfo[ 1 ];
		}

		sign = sign || "+";

		// determine exponent and number
		var exponent,
			intAndFraction,
			exponentPos = num.indexOf( "e" );
		if ( exponentPos < 0 ) exponentPos = num.indexOf( "E" );
		if ( exponentPos < 0 ) {
			intAndFraction = num;
			exponent = null;
		}
		else {
			intAndFraction = num.substr( 0, exponentPos );
			exponent = num.substr( exponentPos + 1 );
		}
		// determine decimal position
		var integer,
			fraction,
			decSep = nf[ "." ],
			decimalPos = intAndFraction.indexOf( decSep );
		if ( decimalPos < 0 ) {
			integer = intAndFraction;
			fraction = null;
		}
		else {
			integer = intAndFraction.substr( 0, decimalPos );
			fraction = intAndFraction.substr( decimalPos + decSep.length );
		}
		// handle groups (e.g. 1,000,000)
		var groupSep = nf[ "," ];
		integer = integer.split( groupSep ).join( "" );
		var altGroupSep = groupSep.replace( /\u00A0/g, " " );
		if ( groupSep !== altGroupSep ) {
			integer = integer.split( altGroupSep ).join( "" );
		}
		// build a natively parsable number string
		var p = sign + integer;
		if ( fraction !== null ) {
			p += "." + fraction;
		}
		if ( exponent !== null ) {
			// exponent itself may have a number patternd
			var expSignInfo = parseNegativePattern( exponent, nf, "-n" );
			p += "e" + ( expSignInfo[0] || "+" ) + expSignInfo[ 1 ];
		}
		if ( regexParseFloat.test(p) ) {
			ret = parseFloat( p );
		}
	}
	return ret;
};

Globalize.culture = function( cultureSelector ) {
	// setter
	if ( typeof cultureSelector !== "undefined" ) {
		this.cultureSelector = cultureSelector;
	}
	// getter
	return this.findClosestCulture( cultureSelector ) || this.cultures[ "default" ];
};

}( this ));

define('globalize-sv-SE', {load: function() {
/*
 * Globalize Culture sv-SE
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "sv-SE", "default", {
	name: "sv-SE",
	englishName: "Swedish (Sweden)",
	nativeName: "svenska (Sverige)",
	language: "sv",
	numberFormat: {
		",": " ",
		".": ",",
		negativeInfinity: "-INF",
		positiveInfinity: "INF",
		percent: {
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "kr"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["söndag","måndag","tisdag","onsdag","torsdag","fredag","lördag"],
				namesAbbr: ["sö","må","ti","on","to","fr","lö"],
				namesShort: ["sö","må","ti","on","to","fr","lö"]
			},
			months: {
				names: ["januari","februari","mars","april","maj","juni","juli","augusti","september","oktober","november","december",""],
				namesAbbr: ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "yyyy-MM-dd",
				D: "'den 'd MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "'den 'd MMMM yyyy HH:mm",
				F: "'den 'd MMMM yyyy HH:mm:ss",
				M: "'den 'd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-da-DK', {load: function() {
/*
 * Globalize Culture da-DK
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "da-DK", "default", {
	name: "da-DK",
	englishName: "Danish (Denmark)",
	nativeName: "dansk (Danmark)",
	language: "da",
	numberFormat: {
		",": ".",
		".": ",",
		negativeInfinity: "-INF",
		positiveInfinity: "INF",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["$ -n","$ n"],
			",": ".",
			".": ",",
			symbol: "kr."
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],
				namesAbbr: ["sø","ma","ti","on","to","fr","lø"],
				namesShort: ["sø","ma","ti","on","to","fr","lø"]
			},
			months: {
				names: ["januar","februar","marts","april","maj","juni","juli","august","september","oktober","november","december",""],
				namesAbbr: ["jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd-MM-yyyy",
				D: "d. MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "d. MMMM yyyy HH:mm",
				F: "d. MMMM yyyy HH:mm:ss",
				M: "d. MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-en-US', {load: function() {
/*
 * Globalize Culture en-US
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "en-US", "default", {
	name: "en-US",
	englishName: "English (United States)"
});

}( this ));

}.bind(window)
});

define('globalize-fr-FR', {load: function() {
/*
 * Globalize Culture fr-FR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "fr-FR", "default", {
	name: "fr-FR",
	englishName: "French (France)",
	nativeName: "français (France)",
	language: "fr",
	numberFormat: {
		",": " ",
		".": ",",
		"NaN": "Non Numérique",
		negativeInfinity: "-Infini",
		positiveInfinity: "+Infini",
		percent: {
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": " ",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
				namesAbbr: ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],
				namesShort: ["di","lu","ma","me","je","ve","sa"]
			},
			months: {
				names: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre",""],
				namesAbbr: ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc.",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"ap. J.-C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd d MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd d MMMM yyyy HH:mm",
				F: "dddd d MMMM yyyy HH:mm:ss",
				M: "d MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-de-DE', {load: function() {
/*
 * Globalize Culture de-DE
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "de-DE", "default", {
	name: "de-DE",
	englishName: "German (Germany)",
	nativeName: "Deutsch (Deutschland)",
	language: "de",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "n. def.",
		negativeInfinity: "-unendlich",
		positiveInfinity: "+unendlich",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"],
				namesAbbr: ["So","Mo","Di","Mi","Do","Fr","Sa"],
				namesShort: ["So","Mo","Di","Mi","Do","Fr","Sa"]
			},
			months: {
				names: ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember",""],
				namesAbbr: ["Jan","Feb","Mrz","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"n. Chr.","start":null,"offset":0}],
			patterns: {
				d: "dd.MM.yyyy",
				D: "dddd, d. MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd, d. MMMM yyyy HH:mm",
				F: "dddd, d. MMMM yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ru-RU', {load: function() {
/*
 * Globalize Culture ru-RU
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ru-RU", "default", {
	name: "ru-RU",
	englishName: "Russian (Russia)",
	nativeName: "русский (Россия)",
	language: "ru",
	numberFormat: {
		",": " ",
		".": ",",
		negativeInfinity: "-бесконечность",
		positiveInfinity: "бесконечность",
		percent: {
			pattern: ["-n%","n%"],
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n$","n$"],
			",": " ",
			".": ",",
			symbol: "р."
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["воскресенье","понедельник","вторник","среда","четверг","пятница","суббота"],
				namesAbbr: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
				namesShort: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"]
			},
			months: {
				names: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь",""],
				namesAbbr: ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек",""]
			},
			monthsGenitive: {
				names: ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря",""],
				namesAbbr: ["янв","фев","мар","апр","май","июн","июл","авг","сен","окт","ноя","дек",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd.MM.yyyy",
				D: "d MMMM yyyy 'г.'",
				t: "H:mm",
				T: "H:mm:ss",
				f: "d MMMM yyyy 'г.' H:mm",
				F: "d MMMM yyyy 'г.' H:mm:ss",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-hu-HU', {load: function() {
/*
 * Globalize Culture hu-HU
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "hu-HU", "default", {
	name: "hu-HU",
	englishName: "Hungarian (Hungary)",
	nativeName: "magyar (Magyarország)",
	language: "hu",
	numberFormat: {
		",": " ",
		".": ",",
		"NaN": "nem szám",
		negativeInfinity: "negatív végtelen",
		positiveInfinity: "végtelen",
		percent: {
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": " ",
			".": ",",
			symbol: "Ft"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["vasárnap","hétfő","kedd","szerda","csütörtök","péntek","szombat"],
				namesAbbr: ["V","H","K","Sze","Cs","P","Szo"],
				namesShort: ["V","H","K","Sze","Cs","P","Szo"]
			},
			months: {
				names: ["január","február","március","április","május","június","július","augusztus","szeptember","október","november","december",""],
				namesAbbr: ["jan.","febr.","márc.","ápr.","máj.","jún.","júl.","aug.","szept.","okt.","nov.","dec.",""]
			},
			AM: ["de.","de.","DE."],
			PM: ["du.","du.","DU."],
			eras: [{"name":"i.sz.","start":null,"offset":0}],
			patterns: {
				d: "yyyy.MM.dd.",
				D: "yyyy. MMMM d.",
				t: "H:mm",
				T: "H:mm:ss",
				f: "yyyy. MMMM d. H:mm",
				F: "yyyy. MMMM d. H:mm:ss",
				M: "MMMM d.",
				Y: "yyyy. MMMM"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-es-ES', {load: function() {
/*
 * Globalize Culture es-ES
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "es-ES", "default", {
	name: "es-ES",
	englishName: "Spanish (Spain, International Sort)",
	nativeName: "Español (España, alfabetización internacional)",
	language: "es",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "NeuN",
		negativeInfinity: "-Infinito",
		positiveInfinity: "Infinito",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"],
				namesAbbr: ["dom","lun","mar","mié","jue","vie","sáb"],
				namesShort: ["do","lu","ma","mi","ju","vi","sá"]
			},
			months: {
				names: ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre",""],
				namesAbbr: ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd, dd' de 'MMMM' de 'yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "dddd, dd' de 'MMMM' de 'yyyy H:mm",
				F: "dddd, dd' de 'MMMM' de 'yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM' de 'yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-vi-VN', {load: function() {
/*
 * Globalize Culture vi-VN
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "vi-VN", "default", {
	name: "vi-VN",
	englishName: "Vietnamese (Vietnam)",
	nativeName: "Tiếng Việt (Việt Nam)",
	language: "vi",
	numberFormat: {
		",": ".",
		".": ",",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "₫"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["Chủ Nhật","Thứ Hai","Thứ Ba","Thứ Tư","Thứ Năm","Thứ Sáu","Thứ Bảy"],
				namesAbbr: ["CN","Hai","Ba","Tư","Năm","Sáu","Bảy"],
				namesShort: ["C","H","B","T","N","S","B"]
			},
			months: {
				names: ["Tháng Giêng","Tháng Hai","Tháng Ba","Tháng Tư","Tháng Năm","Tháng Sáu","Tháng Bảy","Tháng Tám","Tháng Chín","Tháng Mười","Tháng Mười Một","Tháng Mười Hai",""],
				namesAbbr: ["Thg1","Thg2","Thg3","Thg4","Thg5","Thg6","Thg7","Thg8","Thg9","Thg10","Thg11","Thg12",""]
			},
			AM: ["SA","sa","SA"],
			PM: ["CH","ch","CH"],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dd MMMM yyyy",
				f: "dd MMMM yyyy h:mm tt",
				F: "dd MMMM yyyy h:mm:ss tt",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-pt-PT', {load: function() {
/*
 * Globalize Culture pt-PT
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "pt-PT", "default", {
	name: "pt-PT",
	englishName: "Portuguese (Portugal)",
	nativeName: "português (Portugal)",
	language: "pt",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "NaN (Não é um número)",
		negativeInfinity: "-Infinito",
		positiveInfinity: "+Infinito",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],
				namesAbbr: ["dom","seg","ter","qua","qui","sex","sáb"],
				namesShort: ["D","S","T","Q","Q","S","S"]
			},
			months: {
				names: ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro",""],
				namesAbbr: ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd-MM-yyyy",
				D: "dddd, d' de 'MMMM' de 'yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd, d' de 'MMMM' de 'yyyy HH:mm",
				F: "dddd, d' de 'MMMM' de 'yyyy HH:mm:ss",
				M: "d/M",
				Y: "MMMM' de 'yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ko-KR', {load: function() {
/*
 * Globalize Culture ko-KR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ko-KR", "default", {
	name: "ko-KR",
	englishName: "Korean (Korea)",
	nativeName: "한국어 (대한민국)",
	language: "ko",
	numberFormat: {
		currency: {
			pattern: ["-$n","$n"],
			decimals: 0,
			symbol: "₩"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			days: {
				names: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
				namesAbbr: ["일","월","화","수","목","금","토"],
				namesShort: ["일","월","화","수","목","금","토"]
			},
			months: {
				names: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			AM: ["오전","오전","오전"],
			PM: ["오후","오후","오후"],
			eras: [{"name":"서기","start":null,"offset":0}],
			patterns: {
				d: "yyyy-MM-dd",
				D: "yyyy'년' M'월' d'일' dddd",
				t: "tt h:mm",
				T: "tt h:mm:ss",
				f: "yyyy'년' M'월' d'일' dddd tt h:mm",
				F: "yyyy'년' M'월' d'일' dddd tt h:mm:ss",
				M: "M'월' d'일'",
				Y: "yyyy'년' M'월'"
			}
		},
		Korean: {
			name: "Korean",
			"/": "-",
			days: {
				names: ["일요일","월요일","화요일","수요일","목요일","금요일","토요일"],
				namesAbbr: ["일","월","화","수","목","금","토"],
				namesShort: ["일","월","화","수","목","금","토"]
			},
			months: {
				names: ["1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			AM: ["오전","오전","오전"],
			PM: ["오후","오후","오후"],
			eras: [{"name":"단기","start":null,"offset":-2333}],
			twoDigitYearMax: 4362,
			patterns: {
				d: "gg yyyy-MM-dd",
				D: "gg yyyy'년' M'월' d'일' dddd",
				t: "tt h:mm",
				T: "tt h:mm:ss",
				f: "gg yyyy'년' M'월' d'일' dddd tt h:mm",
				F: "gg yyyy'년' M'월' d'일' dddd tt h:mm:ss",
				M: "M'월' d'일'",
				Y: "gg yyyy'년' M'월'"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-fi-FI', {load: function() {
/*
 * Globalize Culture fi-FI
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "fi-FI", "default", {
	name: "fi-FI",
	englishName: "Finnish (Finland)",
	nativeName: "suomi (Suomi)",
	language: "fi",
	numberFormat: {
		",": " ",
		".": ",",
		negativeInfinity: "-INF",
		positiveInfinity: "INF",
		percent: {
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": " ",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["sunnuntai","maanantai","tiistai","keskiviikko","torstai","perjantai","lauantai"],
				namesAbbr: ["su","ma","ti","ke","to","pe","la"],
				namesShort: ["su","ma","ti","ke","to","pe","la"]
			},
			months: {
				names: ["tammikuu","helmikuu","maaliskuu","huhtikuu","toukokuu","kesäkuu","heinäkuu","elokuu","syyskuu","lokakuu","marraskuu","joulukuu",""],
				namesAbbr: ["tammi","helmi","maalis","huhti","touko","kesä","heinä","elo","syys","loka","marras","joulu",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "d.M.yyyy",
				D: "d. MMMM'ta 'yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "d. MMMM'ta 'yyyy H:mm",
				F: "d. MMMM'ta 'yyyy H:mm:ss",
				M: "d. MMMM'ta'",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-hi-IN', {load: function() {
/*
 * Globalize Culture hi-IN
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "hi-IN", "default", {
	name: "hi-IN",
	englishName: "Hindi (India)",
	nativeName: "हिंदी (भारत)",
	language: "hi",
	numberFormat: {
		groupSizes: [3,2],
		percent: {
			groupSizes: [3,2]
		},
		currency: {
			pattern: ["$ -n","$ n"],
			groupSizes: [3,2],
			symbol: "रु"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["रविवार","सोमवार","मंगलवार","बुधवार","गुरुवार","शुक्रवार","शनिवार"],
				namesAbbr: ["रवि.","सोम.","मंगल.","बुध.","गुरु.","शुक्र.","शनि."],
				namesShort: ["र","स","म","ब","ग","श","श"]
			},
			months: {
				names: ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्तूबर","नवम्बर","दिसम्बर",""],
				namesAbbr: ["जनवरी","फरवरी","मार्च","अप्रैल","मई","जून","जुलाई","अगस्त","सितम्बर","अक्तूबर","नवम्बर","दिसम्बर",""]
			},
			AM: ["पूर्वाह्न","पूर्वाह्न","पूर्वाह्न"],
			PM: ["अपराह्न","अपराह्न","अपराह्न"],
			patterns: {
				d: "dd-MM-yyyy",
				D: "dd MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dd MMMM yyyy HH:mm",
				F: "dd MMMM yyyy HH:mm:ss",
				M: "dd MMMM"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ca-ES', {load: function() {
/*
 * Globalize Culture ca-ES
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ca-ES", "default", {
	name: "ca-ES",
	englishName: "Catalan (Catalan)",
	nativeName: "català (català)",
	language: "ca",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "NeuN",
		negativeInfinity: "-Infinit",
		positiveInfinity: "Infinit",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["diumenge","dilluns","dimarts","dimecres","dijous","divendres","dissabte"],
				namesAbbr: ["dg.","dl.","dt.","dc.","dj.","dv.","ds."],
				namesShort: ["dg","dl","dt","dc","dj","dv","ds"]
			},
			months: {
				names: ["gener","febrer","març","abril","maig","juny","juliol","agost","setembre","octubre","novembre","desembre",""],
				namesAbbr: ["gen","feb","març","abr","maig","juny","jul","ag","set","oct","nov","des",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd, d' / 'MMMM' / 'yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd, d' / 'MMMM' / 'yyyy HH:mm",
				F: "dddd, d' / 'MMMM' / 'yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM' / 'yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-he-IL', {load: function() {
/*
 * Globalize Culture he-IL
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "he-IL", "default", {
	name: "he-IL",
	englishName: "Hebrew (Israel)",
	nativeName: "עברית (ישראל)",
	language: "he",
	isRTL: true,
	numberFormat: {
		"NaN": "לא מספר",
		negativeInfinity: "אינסוף שלילי",
		positiveInfinity: "אינסוף חיובי",
		percent: {
			pattern: ["-n%","n%"]
		},
		currency: {
			pattern: ["$-n","$ n"],
			symbol: "₪"
		}
	},
	calendars: {
		standard: {
			days: {
				names: ["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"],
				namesAbbr: ["יום א","יום ב","יום ג","יום ד","יום ה","יום ו","שבת"],
				namesShort: ["א","ב","ג","ד","ה","ו","ש"]
			},
			months: {
				names: ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר",""],
				namesAbbr: ["ינו","פבר","מרץ","אפר","מאי","יונ","יול","אוג","ספט","אוק","נוב","דצמ",""]
			},
			eras: [{"name":"לספירה","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd dd MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd dd MMMM yyyy HH:mm",
				F: "dddd dd MMMM yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		},
		Hebrew: {
			name: "Hebrew",
			"/": " ",
			days: {
				names: ["יום ראשון","יום שני","יום שלישי","יום רביעי","יום חמישי","יום שישי","שבת"],
				namesAbbr: ["א","ב","ג","ד","ה","ו","ש"],
				namesShort: ["א","ב","ג","ד","ה","ו","ש"]
			},
			months: {
				names: ["תשרי","חשון","כסלו","טבת","שבט","אדר","אדר ב","ניסן","אייר","סיון","תמוז","אב","אלול"],
				namesAbbr: ["תשרי","חשון","כסלו","טבת","שבט","אדר","אדר ב","ניסן","אייר","סיון","תמוז","אב","אלול"]
			},
			eras: [{"name":"C.E.","start":null,"offset":0}],
			twoDigitYearMax: 5790,
			patterns: {
				d: "dd MMMM yyyy",
				D: "dddd dd MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd dd MMMM yyyy HH:mm",
				F: "dddd dd MMMM yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-it-IT', {load: function() {
/*
 * Globalize Culture it-IT
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "it-IT", "default", {
	name: "it-IT",
	englishName: "Italian (Italy)",
	nativeName: "italiano (Italia)",
	language: "it",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "Non un numero reale",
		negativeInfinity: "-Infinito",
		positiveInfinity: "+Infinito",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-$ n","$ n"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["domenica","lunedì","martedì","mercoledì","giovedì","venerdì","sabato"],
				namesAbbr: ["dom","lun","mar","mer","gio","ven","sab"],
				namesShort: ["do","lu","ma","me","gi","ve","sa"]
			},
			months: {
				names: ["gennaio","febbraio","marzo","aprile","maggio","giugno","luglio","agosto","settembre","ottobre","novembre","dicembre",""],
				namesAbbr: ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd d MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd d MMMM yyyy HH:mm",
				F: "dddd d MMMM yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-gl-ES', {load: function() {
/*
 * Globalize Culture gl-ES
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "gl-ES", "default", {
	name: "gl-ES",
	englishName: "Galician (Galician)",
	nativeName: "galego (galego)",
	language: "gl",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "NeuN",
		negativeInfinity: "-Infinito",
		positiveInfinity: "Infinito",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["domingo","luns","martes","mércores","xoves","venres","sábado"],
				namesAbbr: ["dom","luns","mar","mér","xov","ven","sáb"],
				namesShort: ["do","lu","ma","mé","xo","ve","sá"]
			},
			months: {
				names: ["xaneiro","febreiro","marzo","abril","maio","xuño","xullo","agosto","setembro","outubro","novembro","decembro",""],
				namesAbbr: ["xan","feb","mar","abr","maio","xuñ","xull","ago","set","out","nov","dec",""]
			},
			AM: ["a.m.","a.m.","A.M."],
			PM: ["p.m.","p.m.","P.M."],
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd, dd' de 'MMMM' de 'yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "dddd, dd' de 'MMMM' de 'yyyy H:mm",
				F: "dddd, dd' de 'MMMM' de 'yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM' de 'yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-nl-NL', {load: function() {
/*
 * Globalize Culture nl-NL
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "nl-NL", "default", {
	name: "nl-NL",
	englishName: "Dutch (Netherlands)",
	nativeName: "Nederlands (Nederland)",
	language: "nl",
	numberFormat: {
		",": ".",
		".": ",",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["$ -n","$ n"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["zondag","maandag","dinsdag","woensdag","donderdag","vrijdag","zaterdag"],
				namesAbbr: ["zo","ma","di","wo","do","vr","za"],
				namesShort: ["zo","ma","di","wo","do","vr","za"]
			},
			months: {
				names: ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december",""],
				namesAbbr: ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "d-M-yyyy",
				D: "dddd d MMMM yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "dddd d MMMM yyyy H:mm",
				F: "dddd d MMMM yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-tr-TR', {load: function() {
/*
 * Globalize Culture tr-TR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "tr-TR", "default", {
	name: "tr-TR",
	englishName: "Turkish (Turkey)",
	nativeName: "Türkçe (Türkiye)",
	language: "tr",
	numberFormat: {
		",": ".",
		".": ",",
		percent: {
			pattern: ["-%n","%n"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "TL"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["Pazar","Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi"],
				namesAbbr: ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],
				namesShort: ["Pz","Pt","Sa","Ça","Pe","Cu","Ct"]
			},
			months: {
				names: ["Ocak","Şubat","Mart","Nisan","Mayıs","Haziran","Temmuz","Ağustos","Eylül","Ekim","Kasım","Aralık",""],
				namesAbbr: ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd.MM.yyyy",
				D: "dd MMMM yyyy dddd",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dd MMMM yyyy dddd HH:mm",
				F: "dd MMMM yyyy dddd HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-th-TH', {load: function() {
/*
 * Globalize Culture th-TH
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "th-TH", "default", {
	name: "th-TH",
	englishName: "Thai (Thailand)",
	nativeName: "ไทย (ไทย)",
	language: "th",
	numberFormat: {
		currency: {
			pattern: ["-$n","$n"],
			symbol: "฿"
		}
	},
	calendars: {
		standard: {
			name: "ThaiBuddhist",
			firstDay: 1,
			days: {
				names: ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],
				namesAbbr: ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],
				namesShort: ["อ","จ","อ","พ","พ","ศ","ส"]
			},
			months: {
				names: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",""],
				namesAbbr: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",""]
			},
			eras: [{"name":"พ.ศ.","start":null,"offset":-543}],
			twoDigitYearMax: 2572,
			patterns: {
				d: "d/M/yyyy",
				D: "d MMMM yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "d MMMM yyyy H:mm",
				F: "d MMMM yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		},
		Gregorian_Localized: {
			firstDay: 1,
			days: {
				names: ["อาทิตย์","จันทร์","อังคาร","พุธ","พฤหัสบดี","ศุกร์","เสาร์"],
				namesAbbr: ["อา.","จ.","อ.","พ.","พฤ.","ศ.","ส."],
				namesShort: ["อ","จ","อ","พ","พ","ศ","ส"]
			},
			months: {
				names: ["มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน","กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",""],
				namesAbbr: ["ม.ค.","ก.พ.","มี.ค.","เม.ย.","พ.ค.","มิ.ย.","ก.ค.","ส.ค.","ก.ย.","ต.ค.","พ.ย.","ธ.ค.",""]
			},
			patterns: {
				d: "d/M/yyyy",
				D: "'วัน'dddd'ที่' d MMMM yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "'วัน'dddd'ที่' d MMMM yyyy H:mm",
				F: "'วัน'dddd'ที่' d MMMM yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-el-GR', {load: function() {
/*
 * Globalize Culture el-GR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "el-GR", "default", {
	name: "el-GR",
	englishName: "Greek (Greece)",
	nativeName: "Ελληνικά (Ελλάδα)",
	language: "el",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "μη αριθμός",
		negativeInfinity: "-Άπειρο",
		positiveInfinity: "Άπειρο",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["Κυριακή","Δευτέρα","Τρίτη","Τετάρτη","Πέμπτη","Παρασκευή","Σάββατο"],
				namesAbbr: ["Κυρ","Δευ","Τρι","Τετ","Πεμ","Παρ","Σαβ"],
				namesShort: ["Κυ","Δε","Τρ","Τε","Πε","Πα","Σά"]
			},
			months: {
				names: ["Ιανουάριος","Φεβρουάριος","Μάρτιος","Απρίλιος","Μάιος","Ιούνιος","Ιούλιος","Αύγουστος","Σεπτέμβριος","Οκτώβριος","Νοέμβριος","Δεκέμβριος",""],
				namesAbbr: ["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ",""]
			},
			monthsGenitive: {
				names: ["Ιανουαρίου","Φεβρουαρίου","Μαρτίου","Απριλίου","Μαΐου","Ιουνίου","Ιουλίου","Αυγούστου","Σεπτεμβρίου","Οκτωβρίου","Νοεμβρίου","Δεκεμβρίου",""],
				namesAbbr: ["Ιαν","Φεβ","Μαρ","Απρ","Μαϊ","Ιουν","Ιουλ","Αυγ","Σεπ","Οκτ","Νοε","Δεκ",""]
			},
			AM: ["πμ","πμ","ΠΜ"],
			PM: ["μμ","μμ","ΜΜ"],
			eras: [{"name":"μ.Χ.","start":null,"offset":0}],
			patterns: {
				d: "d/M/yyyy",
				D: "dddd, d MMMM yyyy",
				f: "dddd, d MMMM yyyy h:mm tt",
				F: "dddd, d MMMM yyyy h:mm:ss tt",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-hr-HR', {load: function() {
/*
 * Globalize Culture hr-HR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "hr-HR", "default", {
	name: "hr-HR",
	englishName: "Croatian (Croatia)",
	nativeName: "hrvatski (Hrvatska)",
	language: "hr",
	numberFormat: {
		pattern: ["- n"],
		",": ".",
		".": ",",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "kn"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["nedjelja","ponedjeljak","utorak","srijeda","četvrtak","petak","subota"],
				namesAbbr: ["ned","pon","uto","sri","čet","pet","sub"],
				namesShort: ["ne","po","ut","sr","če","pe","su"]
			},
			months: {
				names: ["siječanj","veljača","ožujak","travanj","svibanj","lipanj","srpanj","kolovoz","rujan","listopad","studeni","prosinac",""],
				namesAbbr: ["sij","vlj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro",""]
			},
			monthsGenitive: {
				names: ["siječnja","veljače","ožujka","travnja","svibnja","lipnja","srpnja","kolovoza","rujna","listopada","studenog","prosinca",""],
				namesAbbr: ["sij","vlj","ožu","tra","svi","lip","srp","kol","ruj","lis","stu","pro",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "d.M.yyyy.",
				D: "d. MMMM yyyy.",
				t: "H:mm",
				T: "H:mm:ss",
				f: "d. MMMM yyyy. H:mm",
				F: "d. MMMM yyyy. H:mm:ss",
				M: "d. MMMM"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ja-JP', {load: function() {
/*
 * Globalize Culture ja-JP
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ja-JP", "default", {
	name: "ja-JP",
	englishName: "Japanese (Japan)",
	nativeName: "日本語 (日本)",
	language: "ja",
	numberFormat: {
		"NaN": "NaN (非数値)",
		negativeInfinity: "-∞",
		positiveInfinity: "+∞",
		percent: {
			pattern: ["-n%","n%"]
		},
		currency: {
			pattern: ["-$n","$n"],
			decimals: 0,
			symbol: "¥"
		}
	},
	calendars: {
		standard: {
			days: {
				names: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
				namesAbbr: ["日","月","火","水","木","金","土"],
				namesShort: ["日","月","火","水","木","金","土"]
			},
			months: {
				names: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			AM: ["午前","午前","午前"],
			PM: ["午後","午後","午後"],
			eras: [{"name":"西暦","start":null,"offset":0}],
			patterns: {
				d: "yyyy/MM/dd",
				D: "yyyy'年'M'月'd'日'",
				t: "H:mm",
				T: "H:mm:ss",
				f: "yyyy'年'M'月'd'日' H:mm",
				F: "yyyy'年'M'月'd'日' H:mm:ss",
				M: "M'月'd'日'",
				Y: "yyyy'年'M'月'"
			}
		},
		Japanese: {
			name: "Japanese",
			days: {
				names: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
				namesAbbr: ["日","月","火","水","木","金","土"],
				namesShort: ["日","月","火","水","木","金","土"]
			},
			months: {
				names: ["1月","2月","3月","4月","5月","6月","7月","8月","9月","10月","11月","12月",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			AM: ["午前","午前","午前"],
			PM: ["午後","午後","午後"],
			eras: [{"name":"平成","start":null,"offset":1867},{"name":"昭和","start":-1812153600000,"offset":1911},{"name":"大正","start":-1357603200000,"offset":1925},{"name":"明治","start":60022080000,"offset":1988}],
			twoDigitYearMax: 99,
			patterns: {
				d: "gg y/M/d",
				D: "gg y'年'M'月'd'日'",
				t: "H:mm",
				T: "H:mm:ss",
				f: "gg y'年'M'月'd'日' H:mm",
				F: "gg y'年'M'月'd'日' H:mm:ss",
				M: "M'月'd'日'",
				Y: "gg y'年'M'月'"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ro-RO', {load: function() {
/*
 * Globalize Culture ro-RO
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ro-RO", "default", {
	name: "ro-RO",
	englishName: "Romanian (Romania)",
	nativeName: "română (România)",
	language: "ro",
	numberFormat: {
		",": ".",
		".": ",",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "lei"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["duminică","luni","marţi","miercuri","joi","vineri","sâmbătă"],
				namesAbbr: ["D","L","Ma","Mi","J","V","S"],
				namesShort: ["D","L","Ma","Mi","J","V","S"]
			},
			months: {
				names: ["ianuarie","februarie","martie","aprilie","mai","iunie","iulie","august","septembrie","octombrie","noiembrie","decembrie",""],
				namesAbbr: ["ian.","feb.","mar.","apr.","mai.","iun.","iul.","aug.","sep.","oct.","nov.","dec.",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd.MM.yyyy",
				D: "d MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "d MMMM yyyy HH:mm",
				F: "d MMMM yyyy HH:mm:ss",
				M: "d MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-eu-ES', {load: function() {
/*
 * Globalize Culture eu-ES
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "eu-ES", "default", {
	name: "eu-ES",
	englishName: "Basque (Basque)",
	nativeName: "euskara (euskara)",
	language: "eu",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "EdZ",
		negativeInfinity: "-Infinitu",
		positiveInfinity: "Infinitu",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": ".",
			".": ",",
			symbol: "€"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["igandea","astelehena","asteartea","asteazkena","osteguna","ostirala","larunbata"],
				namesAbbr: ["ig.","al.","as.","az.","og.","or.","lr."],
				namesShort: ["ig","al","as","az","og","or","lr"]
			},
			months: {
				names: ["urtarrila","otsaila","martxoa","apirila","maiatza","ekaina","uztaila","abuztua","iraila","urria","azaroa","abendua",""],
				namesAbbr: ["urt.","ots.","mar.","api.","mai.","eka.","uzt.","abu.","ira.","urr.","aza.","abe.",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "yyyy/MM/dd",
				D: "dddd, yyyy.'eko' MMMM'k 'd",
				t: "HH:mm",
				T: "H:mm:ss",
				f: "dddd, yyyy.'eko' MMMM'k 'd HH:mm",
				F: "dddd, yyyy.'eko' MMMM'k 'd H:mm:ss",
				Y: "yyyy.'eko' MMMM"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-id-ID', {load: function() {
/*
 * Globalize Culture id-ID
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "id-ID", "default", {
	name: "id-ID",
	englishName: "Indonesian (Indonesia)",
	nativeName: "Bahasa Indonesia (Indonesia)",
	language: "id",
	numberFormat: {
		",": ".",
		".": ",",
		percent: {
			",": ".",
			".": ","
		},
		currency: {
			decimals: 0,
			",": ".",
			".": ",",
			symbol: "Rp"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			days: {
				names: ["Minggu","Senin","Selasa","Rabu","Kamis","Jumat","Sabtu"],
				namesAbbr: ["Minggu","Sen","Sel","Rabu","Kamis","Jumat","Sabtu"],
				namesShort: ["M","S","S","R","K","J","S"]
			},
			months: {
				names: ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","Nopember","Desember",""],
				namesAbbr: ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agust","Sep","Okt","Nop","Des",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd/MM/yyyy",
				D: "dd MMMM yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "dd MMMM yyyy H:mm",
				F: "dd MMMM yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-pl-PL', {load: function() {
/*
 * Globalize Culture pl-PL
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "pl-PL", "default", {
	name: "pl-PL",
	englishName: "Polish (Poland)",
	nativeName: "polski (Polska)",
	language: "pl",
	numberFormat: {
		",": " ",
		".": ",",
		"NaN": "nie jest liczbą",
		negativeInfinity: "-nieskończoność",
		positiveInfinity: "+nieskończoność",
		percent: {
			pattern: ["-n%","n%"],
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": " ",
			".": ",",
			symbol: "zł"
		}
	},
	calendars: {
		standard: {
			"/": "-",
			firstDay: 1,
			days: {
				names: ["niedziela","poniedziałek","wtorek","środa","czwartek","piątek","sobota"],
				namesAbbr: ["niedz.","pon.","wt.","śr.","czw.","pt.","sob."],
				namesShort: ["N","Pn","Wt","Śr","Cz","Pt","So"]
			},
			months: {
				names: ["styczeń","luty","marzec","kwiecień","maj","czerwiec","lipiec","sierpień","wrzesień","październik","listopad","grudzień",""],
				namesAbbr: ["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru",""]
			},
			monthsGenitive: {
				names: ["stycznia","lutego","marca","kwietnia","maja","czerwca","lipca","sierpnia","września","października","listopada","grudnia",""],
				namesAbbr: ["sty","lut","mar","kwi","maj","cze","lip","sie","wrz","paź","lis","gru",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "yyyy-MM-dd",
				D: "d MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "d MMMM yyyy HH:mm",
				F: "d MMMM yyyy HH:mm:ss",
				M: "d MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-nb-NO', {load: function() {
/*
 * Globalize Culture nb-NO
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "nb-NO", "default", {
	name: "nb-NO",
	englishName: "Norwegian, Bokmål (Norway)",
	nativeName: "norsk, bokmål (Norge)",
	language: "nb",
	numberFormat: {
		",": " ",
		".": ",",
		negativeInfinity: "-INF",
		positiveInfinity: "INF",
		percent: {
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["$ -n","$ n"],
			",": " ",
			".": ",",
			symbol: "kr"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["søndag","mandag","tirsdag","onsdag","torsdag","fredag","lørdag"],
				namesAbbr: ["sø","ma","ti","on","to","fr","lø"],
				namesShort: ["sø","ma","ti","on","to","fr","lø"]
			},
			months: {
				names: ["januar","februar","mars","april","mai","juni","juli","august","september","oktober","november","desember",""],
				namesAbbr: ["jan","feb","mar","apr","mai","jun","jul","aug","sep","okt","nov","des",""]
			},
			AM: null,
			PM: null,
			patterns: {
				d: "dd.MM.yyyy",
				D: "d. MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "d. MMMM yyyy HH:mm",
				F: "d. MMMM yyyy HH:mm:ss",
				M: "d. MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-pt-BR', {load: function() {
/*
 * Globalize Culture pt-BR
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "pt-BR", "default", {
	name: "pt-BR",
	englishName: "Portuguese (Brazil)",
	nativeName: "Português (Brasil)",
	language: "pt",
	numberFormat: {
		",": ".",
		".": ",",
		"NaN": "NaN (Não é um número)",
		negativeInfinity: "-Infinito",
		positiveInfinity: "+Infinito",
		percent: {
			pattern: ["-n%","n%"],
			",": ".",
			".": ","
		},
		currency: {
			pattern: ["-$ n","$ n"],
			",": ".",
			".": ",",
			symbol: "R$"
		}
	},
	calendars: {
		standard: {
			days: {
				names: ["domingo","segunda-feira","terça-feira","quarta-feira","quinta-feira","sexta-feira","sábado"],
				namesAbbr: ["dom","seg","ter","qua","qui","sex","sáb"],
				namesShort: ["D","S","T","Q","Q","S","S"]
			},
			months: {
				names: ["janeiro","fevereiro","março","abril","maio","junho","julho","agosto","setembro","outubro","novembro","dezembro",""],
				namesAbbr: ["jan","fev","mar","abr","mai","jun","jul","ago","set","out","nov","dez",""]
			},
			AM: null,
			PM: null,
			eras: [{"name":"d.C.","start":null,"offset":0}],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dddd, d' de 'MMMM' de 'yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dddd, d' de 'MMMM' de 'yyyy HH:mm",
				F: "dddd, d' de 'MMMM' de 'yyyy HH:mm:ss",
				M: "dd' de 'MMMM",
				Y: "MMMM' de 'yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-en-GB', {load: function() {
/*
 * Globalize Culture en-GB
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "en-GB", "default", {
	name: "en-GB",
	englishName: "English (United Kingdom)",
	nativeName: "English (United Kingdom)",
	numberFormat: {
		currency: {
			pattern: ["-$n","$n"],
			symbol: "£"
		}
	},
	calendars: {
		standard: {
			firstDay: 1,
			patterns: {
				d: "dd/MM/yyyy",
				D: "dd MMMM yyyy",
				t: "HH:mm",
				T: "HH:mm:ss",
				f: "dd MMMM yyyy HH:mm",
				F: "dd MMMM yyyy HH:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-cs-CZ', {load: function() {
/*
 * Globalize Culture cs-CZ
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "cs-CZ", "default", {
	name: "cs-CZ",
	englishName: "Czech (Czech Republic)",
	nativeName: "čeština (Česká republika)",
	language: "cs",
	numberFormat: {
		",": " ",
		".": ",",
		"NaN": "Není číslo",
		negativeInfinity: "-nekonečno",
		positiveInfinity: "+nekonečno",
		percent: {
			pattern: ["-n%","n%"],
			",": " ",
			".": ","
		},
		currency: {
			pattern: ["-n $","n $"],
			",": " ",
			".": ",",
			symbol: "Kč"
		}
	},
	calendars: {
		standard: {
			"/": ".",
			firstDay: 1,
			days: {
				names: ["neděle","pondělí","úterý","středa","čtvrtek","pátek","sobota"],
				namesAbbr: ["ne","po","út","st","čt","pá","so"],
				namesShort: ["ne","po","út","st","čt","pá","so"]
			},
			months: {
				names: ["leden","únor","březen","duben","květen","červen","červenec","srpen","září","říjen","listopad","prosinec",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			monthsGenitive: {
				names: ["ledna","února","března","dubna","května","června","července","srpna","září","října","listopadu","prosince",""],
				namesAbbr: ["1","2","3","4","5","6","7","8","9","10","11","12",""]
			},
			AM: ["dop.","dop.","DOP."],
			PM: ["odp.","odp.","ODP."],
			eras: [{"name":"n. l.","start":null,"offset":0}],
			patterns: {
				d: "d.M.yyyy",
				D: "d. MMMM yyyy",
				t: "H:mm",
				T: "H:mm:ss",
				f: "d. MMMM yyyy H:mm",
				F: "d. MMMM yyyy H:mm:ss",
				M: "dd MMMM",
				Y: "MMMM yyyy"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-ar-EG', {load: function() {
/*
 * Globalize Culture ar-EG
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "ar-EG", "default", {
	name: "ar-EG",
	englishName: "Arabic (Egypt)",
	nativeName: "العربية (مصر)",
	language: "ar",
	isRTL: true,
	numberFormat: {
		pattern: ["n-"],
		decimals: 3,
		"NaN": "ليس برقم",
		negativeInfinity: "-لا نهاية",
		positiveInfinity: "+لا نهاية",
		percent: {
			decimals: 3
		},
		currency: {
			pattern: ["$n-","$ n"],
			symbol: "ج.م.\u200f"
		}
	},
	calendars: {
		standard: {
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["ح","ن","ث","ر","خ","ج","س"]
			},
			months: {
				names: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",""],
				namesAbbr: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			patterns: {
				d: "dd/MM/yyyy",
				D: "dd MMMM, yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dd MMMM, yyyy hh:mm tt",
				F: "dd MMMM, yyyy hh:mm:ss tt",
				M: "dd MMMM"
			}
		},
		UmAlQura: {
			name: "UmAlQura",
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["ح","ن","ث","ر","خ","ج","س"]
			},
			months: {
				names: ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة",""],
				namesAbbr: ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"بعد الهجرة","start":null,"offset":0}],
			twoDigitYearMax: 1451,
			patterns: {
				d: "dd/MM/yy",
				D: "dd/MMMM/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dd/MMMM/yyyy hh:mm tt",
				F: "dd/MMMM/yyyy hh:mm:ss tt",
				M: "dd MMMM"
			},
			convert: {
                    _yearInfo: [
                        // MonthLengthFlags, Gregorian Date
                        [746, -2198707200000],
                        [1769, -2168121600000],
                        [3794, -2137449600000],
                        [3748, -2106777600000],
                        [3402, -2076192000000],
                        [2710, -2045606400000],
                        [1334, -2015020800000],
                        [2741, -1984435200000],
                        [3498, -1953763200000],
                        [2980, -1923091200000],
                        [2889, -1892505600000],
                        [2707, -1861920000000],
                        [1323, -1831334400000],
                        [2647, -1800748800000],
                        [1206, -1770076800000],
                        [2741, -1739491200000],
                        [1450, -1708819200000],
                        [3413, -1678233600000],
                        [3370, -1647561600000],
                        [2646, -1616976000000],
                        [1198, -1586390400000],
                        [2397, -1555804800000],
                        [748, -1525132800000],
                        [1749, -1494547200000],
                        [1706, -1463875200000],
                        [1365, -1433289600000],
                        [1195, -1402704000000],
                        [2395, -1372118400000],
                        [698, -1341446400000],
                        [1397, -1310860800000],
                        [2994, -1280188800000],
                        [1892, -1249516800000],
                        [1865, -1218931200000],
                        [1621, -1188345600000],
                        [683, -1157760000000],
                        [1371, -1127174400000],
                        [2778, -1096502400000],
                        [1748, -1065830400000],
                        [3785, -1035244800000],
                        [3474, -1004572800000],
                        [3365, -973987200000],
                        [2637, -943401600000],
                        [685, -912816000000],
                        [1389, -882230400000],
                        [2922, -851558400000],
                        [2898, -820886400000],
                        [2725, -790300800000],
                        [2635, -759715200000],
                        [1175, -729129600000],
                        [2359, -698544000000],
                        [694, -667872000000],
                        [1397, -637286400000],
                        [3434, -606614400000],
                        [3410, -575942400000],
                        [2710, -545356800000],
                        [2349, -514771200000],
                        [605, -484185600000],
                        [1245, -453600000000],
                        [2778, -422928000000],
                        [1492, -392256000000],
                        [3497, -361670400000],
                        [3410, -330998400000],
                        [2730, -300412800000],
                        [1238, -269827200000],
                        [2486, -239241600000],
                        [884, -208569600000],
                        [1897, -177984000000],
                        [1874, -147312000000],
                        [1701, -116726400000],
                        [1355, -86140800000],
                        [2731, -55555200000],
                        [1370, -24883200000],
                        [2773, 5702400000],
                        [3538, 36374400000],
                        [3492, 67046400000],
                        [3401, 97632000000],
                        [2709, 128217600000],
                        [1325, 158803200000],
                        [2653, 189388800000],
                        [1370, 220060800000],
                        [2773, 250646400000],
                        [1706, 281318400000],
                        [1685, 311904000000],
                        [1323, 342489600000],
                        [2647, 373075200000],
                        [1198, 403747200000],
                        [2422, 434332800000],
                        [1388, 465004800000],
                        [2901, 495590400000],
                        [2730, 526262400000],
                        [2645, 556848000000],
                        [1197, 587433600000],
                        [2397, 618019200000],
                        [730, 648691200000],
                        [1497, 679276800000],
                        [3506, 709948800000],
                        [2980, 740620800000],
                        [2890, 771206400000],
                        [2645, 801792000000],
                        [693, 832377600000],
                        [1397, 862963200000],
                        [2922, 893635200000],
                        [3026, 924307200000],
                        [3012, 954979200000],
                        [2953, 985564800000],
                        [2709, 1016150400000],
                        [1325, 1046736000000],
                        [1453, 1077321600000],
                        [2922, 1107993600000],
                        [1748, 1138665600000],
                        [3529, 1169251200000],
                        [3474, 1199923200000],
                        [2726, 1230508800000],
                        [2390, 1261094400000],
                        [686, 1291680000000],
                        [1389, 1322265600000],
                        [874, 1352937600000],
                        [2901, 1383523200000],
                        [2730, 1414195200000],
                        [2381, 1444780800000],
                        [1181, 1475366400000],
                        [2397, 1505952000000],
                        [698, 1536624000000],
                        [1461, 1567209600000],
                        [1450, 1597881600000],
                        [3413, 1628467200000],
                        [2714, 1659139200000],
                        [2350, 1689724800000],
                        [622, 1720310400000],
                        [1373, 1750896000000],
                        [2778, 1781568000000],
                        [1748, 1812240000000],
                        [1701, 1842825600000],
                        [0, 1873411200000]
                    ],
                    minDate: -2198707200000,
                    maxDate: 1873411199999,
                    toGregorian: function(hyear, hmonth, hday) {
                        var days = hday - 1,
                            gyear = hyear - 1318;
                        if (gyear < 0 || gyear >= this._yearInfo.length) return null;
                        var info = this._yearInfo[gyear],
                            gdate = new Date(info[1]),
                            monthLength = info[0];
                        // Date's ticks in javascript are always from the GMT time,
                        // but we are interested in the gregorian date in the same timezone,
                        // not what the gregorian date was at GMT time, so we adjust for the offset.
                        gdate.setMinutes(gdate.getMinutes() + gdate.getTimezoneOffset());
                        for (var i = 0; i < hmonth; i++) {
                            days += 29 + (monthLength & 1);
                            monthLength = monthLength >> 1;
                        }
                        gdate.setDate(gdate.getDate() + days);
                        return gdate;
                    },
                    fromGregorian: function(gdate) {
                        // Date's ticks in javascript are always from the GMT time,
                        // but we are interested in the hijri date in the same timezone,
                        // not what the hijri date was at GMT time, so we adjust for the offset.
                        var ticks = gdate - gdate.getTimezoneOffset() * 60000;
                        if (ticks < this.minDate || ticks > this.maxDate) return null;
                        var hyear = 0,
                            hmonth = 1;
                        // find the earliest gregorian date in the array that is greater than or equal to the given date
                        while (ticks > this._yearInfo[++hyear][1]) { }
                        if (ticks !== this._yearInfo[hyear][1]) {
                            hyear--;
                        }
                        var info = this._yearInfo[hyear],
                            // how many days has it been since the date we found in the array?
                            // 86400000 = ticks per day
                            days = Math.floor((ticks - info[1]) / 86400000),
                            monthLength = info[0];
                        hyear += 1318; // the Nth array entry corresponds to hijri year 1318+N
                        // now increment day/month based on the total days, considering
                        // how many days are in each month. We cannot run past the year
                        // mark since we would have found a different array entry in that case.
                        var daysInMonth = 29 + (monthLength & 1);
                        while (days >= daysInMonth) {
                            days -= daysInMonth;
                            monthLength = monthLength >> 1;
                            daysInMonth = 29 + (monthLength & 1);
                            hmonth++;
                        }
                        // remaining days is less than is in one month, thus is the day of the month we landed on
                        // hmonth-1 because in javascript months are zero based, stay consistent with that.
                        return [hyear, hmonth - 1, days + 1];
                    }
			}
		},
		Gregorian_TransliteratedEnglish: {
			name: "Gregorian_TransliteratedEnglish",
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["أ","ا","ث","أ","خ","ج","س"]
			},
			months: {
				names: ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر",""],
				namesAbbr: ["يناير","فبراير","مارس","ابريل","مايو","يونيو","يوليو","اغسطس","سبتمبر","اكتوبر","نوفمبر","ديسمبر",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"م","start":null,"offset":0}],
			patterns: {
				d: "MM/dd/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dddd, MMMM dd, yyyy hh:mm tt",
				F: "dddd, MMMM dd, yyyy hh:mm:ss tt"
			}
		},
		Hijri: {
			name: "Hijri",
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["ح","ن","ث","ر","خ","ج","س"]
			},
			months: {
				names: ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة",""],
				namesAbbr: ["محرم","صفر","ربيع الأول","ربيع الثاني","جمادى الأولى","جمادى الثانية","رجب","شعبان","رمضان","شوال","ذو القعدة","ذو الحجة",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"بعد الهجرة","start":null,"offset":0}],
			twoDigitYearMax: 1451,
			patterns: {
				d: "dd/MM/yy",
				D: "dd/MM/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dd/MM/yyyy hh:mm tt",
				F: "dd/MM/yyyy hh:mm:ss tt",
				M: "dd MMMM"
			},
			convert: {
                    // Adapted to Script from System.Globalization.HijriCalendar
                    ticks1970: 62135596800000,
                    // number of days leading up to each month
                    monthDays: [0, 30, 59, 89, 118, 148, 177, 207, 236, 266, 295, 325, 355],
                    minDate: -42521673600000,
                    maxDate: 253402300799999,
                    // The number of days to add or subtract from the calendar to accommodate the variances
                    // in the start and the end of Ramadan and to accommodate the date difference between
                    // countries/regions. May be dynamically adjusted based on user preference, but should
                    // remain in the range of -2 to 2, inclusive.
                    hijriAdjustment: 0,
                    toGregorian: function(hyear, hmonth, hday) {
                        var daysSinceJan0101 = this.daysToYear(hyear) + this.monthDays[hmonth] + hday - 1 - this.hijriAdjustment;
                        // 86400000 = ticks per day
                        var gdate = new Date(daysSinceJan0101 * 86400000 - this.ticks1970);
                        // adjust for timezone, because we are interested in the gregorian date for the same timezone
                        // but ticks in javascript is always from GMT, unlike the server were ticks counts from the base
                        // date in the current timezone.
                        gdate.setMinutes(gdate.getMinutes() + gdate.getTimezoneOffset());
                        return gdate;
                    },
                    fromGregorian: function(gdate) {
                        if ((gdate < this.minDate) || (gdate > this.maxDate)) return null;
                        var ticks = this.ticks1970 + (gdate-0) - gdate.getTimezoneOffset() * 60000,
                            daysSinceJan0101 = Math.floor(ticks / 86400000) + 1 + this.hijriAdjustment;
                        // very particular formula determined by someone smart, adapted from the server-side implementation.
                        // it approximates the hijri year.
                        var hday, hmonth, hyear = Math.floor(((daysSinceJan0101 - 227013) * 30) / 10631) + 1,
                            absDays = this.daysToYear(hyear),
                            daysInYear = this.isLeapYear(hyear) ? 355 : 354;
                        // hyear is just approximate, it may need adjustment up or down by 1.
                        if (daysSinceJan0101 < absDays) {
                            hyear--;
                            absDays -= daysInYear;
                        }
                        else if (daysSinceJan0101 === absDays) {
                            hyear--;
                            absDays = this.daysToYear(hyear);
                        }
                        else {
                            if (daysSinceJan0101 > (absDays + daysInYear)) {
                                absDays += daysInYear;
                                hyear++;
                            }
                        }
                        // determine month by looking at how many days into the hyear we are
                        // monthDays contains the number of days up to each month.
                        hmonth = 0;
                        var daysIntoYear = daysSinceJan0101 - absDays;
                        while (hmonth <= 11 && daysIntoYear > this.monthDays[hmonth]) {
                            hmonth++;
                        }
                        hmonth--;
                        hday = daysIntoYear - this.monthDays[hmonth];
                        return [hyear, hmonth, hday];
                    },
                    daysToYear: function(year) {
                        // calculates how many days since Jan 1, 0001
                        var yearsToYear30 = Math.floor((year - 1) / 30) * 30,
                            yearsInto30 = year - yearsToYear30 - 1,
                            days = Math.floor((yearsToYear30 * 10631) / 30) + 227013;
                        while (yearsInto30 > 0) {
                            days += (this.isLeapYear(yearsInto30) ? 355 : 354);
                            yearsInto30--;
                        }
                        return days;
                    },
                    isLeapYear: function(year) {
                        return ((((year * 11) + 14) % 30) < 11);
                    }
			}
		},
		Gregorian_MiddleEastFrench: {
			name: "Gregorian_MiddleEastFrench",
			firstDay: 6,
			days: {
				names: ["dimanche","lundi","mardi","mercredi","jeudi","vendredi","samedi"],
				namesAbbr: ["dim.","lun.","mar.","mer.","jeu.","ven.","sam."],
				namesShort: ["di","lu","ma","me","je","ve","sa"]
			},
			months: {
				names: ["janvier","février","mars","avril","mai","juin","juillet","août","septembre","octobre","novembre","décembre",""],
				namesAbbr: ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc.",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"ap. J.-C.","start":null,"offset":0}],
			patterns: {
				d: "MM/dd/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dddd, MMMM dd, yyyy hh:mm tt",
				F: "dddd, MMMM dd, yyyy hh:mm:ss tt",
				M: "dd MMMM"
			}
		},
		Gregorian_Arabic: {
			name: "Gregorian_Arabic",
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["ح","ن","ث","ر","خ","ج","س"]
			},
			months: {
				names: ["كانون الثاني","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول",""],
				namesAbbr: ["كانون الثاني","شباط","آذار","نيسان","أيار","حزيران","تموز","آب","أيلول","تشرين الأول","تشرين الثاني","كانون الأول",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"م","start":null,"offset":0}],
			patterns: {
				d: "MM/dd/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dddd, MMMM dd, yyyy hh:mm tt",
				F: "dddd, MMMM dd, yyyy hh:mm:ss tt"
			}
		},
		Gregorian_TransliteratedFrench: {
			name: "Gregorian_TransliteratedFrench",
			firstDay: 6,
			days: {
				names: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesAbbr: ["الأحد","الإثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"],
				namesShort: ["ح","ن","ث","ر","خ","ج","س"]
			},
			months: {
				names: ["جانفييه","فيفرييه","مارس","أفريل","مي","جوان","جوييه","أوت","سبتمبر","اكتوبر","نوفمبر","ديسمبر",""],
				namesAbbr: ["جانفييه","فيفرييه","مارس","أفريل","مي","جوان","جوييه","أوت","سبتمبر","اكتوبر","نوفمبر","ديسمبر",""]
			},
			AM: ["ص","ص","ص"],
			PM: ["م","م","م"],
			eras: [{"name":"م","start":null,"offset":0}],
			patterns: {
				d: "MM/dd/yyyy",
				t: "hh:mm tt",
				T: "hh:mm:ss tt",
				f: "dddd, MMMM dd, yyyy hh:mm tt",
				F: "dddd, MMMM dd, yyyy hh:mm:ss tt"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-zh-CN', {load: function() {
/*
 * Globalize Culture zh-CN
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "zh-CN", "default", {
	name: "zh-CN",
	englishName: "Chinese (Simplified, PRC)",
	nativeName: "中文(中华人民共和国)",
	language: "zh-CHS",
	numberFormat: {
		"NaN": "非数字",
		negativeInfinity: "负无穷大",
		positiveInfinity: "正无穷大",
		percent: {
			pattern: ["-n%","n%"]
		},
		currency: {
			pattern: ["$-n","$n"],
			symbol: "¥"
		}
	},
	calendars: {
		standard: {
			days: {
				names: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
				namesAbbr: ["周日","周一","周二","周三","周四","周五","周六"],
				namesShort: ["日","一","二","三","四","五","六"]
			},
			months: {
				names: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""],
				namesAbbr: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""]
			},
			AM: ["上午","上午","上午"],
			PM: ["下午","下午","下午"],
			eras: [{"name":"公元","start":null,"offset":0}],
			patterns: {
				d: "yyyy/M/d",
				D: "yyyy'年'M'月'd'日'",
				t: "H:mm",
				T: "H:mm:ss",
				f: "yyyy'年'M'月'd'日' H:mm",
				F: "yyyy'年'M'月'd'日' H:mm:ss",
				M: "M'月'd'日'",
				Y: "yyyy'年'M'月'"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('globalize-zh-TW', {load: function() {
/*
 * Globalize Culture zh-TW
 *
 * http://github.com/jquery/globalize
 *
 * Copyright Software Freedom Conservancy, Inc.
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * This file was generated by the Globalize Culture Generator
 * Translation: bugs found in this file need to be fixed in the generator
 */

(function( window, undefined ) {

var Globalize;

if ( typeof require !== "undefined" &&
	typeof exports !== "undefined" &&
	typeof module !== "undefined" ) {
	// Assume CommonJS
	Globalize = require( "globalize" );
} else {
	// Global variable
	Globalize = window.Globalize;
}

Globalize.addCultureInfo( "zh-TW", "default", {
	name: "zh-TW",
	englishName: "Chinese (Traditional, Taiwan)",
	nativeName: "中文(台灣)",
	language: "zh-CHT",
	numberFormat: {
		"NaN": "不是一個數字",
		negativeInfinity: "負無窮大",
		positiveInfinity: "正無窮大",
		percent: {
			pattern: ["-n%","n%"]
		},
		currency: {
			pattern: ["-$n","$n"],
			symbol: "NT$"
		}
	},
	calendars: {
		standard: {
			days: {
				names: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
				namesAbbr: ["週日","週一","週二","週三","週四","週五","週六"],
				namesShort: ["日","一","二","三","四","五","六"]
			},
			months: {
				names: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""],
				namesAbbr: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""]
			},
			AM: ["上午","上午","上午"],
			PM: ["下午","下午","下午"],
			eras: [{"name":"西元","start":null,"offset":0}],
			patterns: {
				d: "yyyy/M/d",
				D: "yyyy'年'M'月'd'日'",
				t: "tt hh:mm",
				T: "tt hh:mm:ss",
				f: "yyyy'年'M'月'd'日' tt hh:mm",
				F: "yyyy'年'M'月'd'日' tt hh:mm:ss",
				M: "M'月'd'日'",
				Y: "yyyy'年'M'月'"
			}
		},
		Taiwan: {
			name: "Taiwan",
			days: {
				names: ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"],
				namesAbbr: ["週日","週一","週二","週三","週四","週五","週六"],
				namesShort: ["日","一","二","三","四","五","六"]
			},
			months: {
				names: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""],
				namesAbbr: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月",""]
			},
			AM: ["上午","上午","上午"],
			PM: ["下午","下午","下午"],
			eras: [{"name":"","start":null,"offset":1911}],
			twoDigitYearMax: 99,
			patterns: {
				d: "yyyy/M/d",
				D: "yyyy'年'M'月'd'日'",
				t: "tt hh:mm",
				T: "tt hh:mm:ss",
				f: "yyyy'年'M'月'd'日' tt hh:mm",
				F: "yyyy'年'M'月'd'日' tt hh:mm:ss",
				M: "M'月'd'日'",
				Y: "yyyy'年'M'月'"
			}
		}
	}
});

}( this ));

}.bind(window)
});

define('utils', function (require, exports, module) {
/*
 * Copyright 2010-2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/**#nocode+*/

var _self,
    _mimeTypes;

_self = {
    inNode: function () {
        return !!require.resolve;
    },

    getQnxNamespace: function () {
        return _self.inNode() ? null : qnx;
    },

    base64Encode: function (text) {
        return window.btoa(window.unescape(window.encodeURIComponent(text)));
    },

    base64Decode: function (text) {
        return window.decodeURIComponent(window.escape(window.atob(text)));
    },

    copy: function (obj) {
        var i,
            newObj = !obj ? false : (obj.isArray ? [] : {});

        if (typeof obj === 'number' ||
            typeof obj === 'string' ||
            typeof obj === 'boolean' ||
            obj === null ||
            obj === undefined) {
            return obj;
        }

        if (obj instanceof Date) {
            return new Date(obj);
        }

        if (obj instanceof RegExp) {
            return new RegExp(obj);
        }

        for (i in obj) {
            if (obj.hasOwnProperty(i)) {
                if (obj[i] && typeof obj[i] === "object") {
                    if (obj[i] instanceof Date) {
                        newObj[i] = obj[i];
                    }
                    else {
                        newObj[i] = _self.copy(obj[i]);
                    }
                }
                else {
                    newObj[i] = obj[i];
                }
            }
        }

        return newObj;
    },

    parseURI : function (str) {
        var i, uri = {},
            key = [ "source", "scheme", "authority", "userInfo", "user", "password", "host", "port", "relative", "path", "directory", "file", "query", "anchor" ],
            matcher = /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/.exec(str);

        for (i = key.length - 1; i >= 0; i--) {
            uri[key[i]] = matcher[i] || "";
        }

        return uri;
    },

    isLocalURI : function (uri) {
        return uri && uri.scheme && "local:///".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isFileURI : function (uri) {
        return uri && uri.scheme && "file://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpURI : function (uri) {
        return uri && uri.scheme && "http://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    isHttpsURI : function (uri) {
        return uri && uri.scheme && "https://".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Checks if the specified uri starts with 'data:'
    isDataURI : function (uri) {
        return uri && uri.scheme && "data:".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Check if a url has a tel scheme
    isTelURI: function (uri) {
        return uri && uri.scheme && "tel:".indexOf(uri.scheme.toLowerCase()) !== -1;
    },

    // Check if a url is from a local protocal
    isLocalUrl: function (url) {
        if (url && url.indexOf('local:///') !== -1) {
            return true;
        }
        return false;
    },

    isDataUrl: function (url) {
        if (url && url.substring(0, 5) === 'data:') {
            return true;
        }
    },

    startsWith : function (str, substr) {
        return str.indexOf(substr) === 0;
    },

    fileNameToMIME : function (fileName) {
        var ext = fileName.split('.').pop();

        if (!_mimeTypes) {
            _mimeTypes = require('./mimeTypes');
        }

        return _mimeTypes.lookupByFileEnding(ext);
    },

    /*
     * Warning this function is greedy and will only return the first
     * file type based on the provided MIME type
     */
    fileEndingByMIME : function (mimeType) {

        if (!_mimeTypes) {
            _mimeTypes = require('./mimeTypes');
        }

        return _mimeTypes.fileEndingbyMIME(mimeType);
    },

    series: function (tasks, callback) {

        var execute = function () {
            var args = [],
                task;

            if (tasks.length) {
                task = tasks.shift();
                args = args.concat(task.args).concat(execute);
                task.func.apply(this, args);
            }
            else {
                callback.func.apply(this, callback.args);
            }
        };

        execute();
    },

    // navigator.language may be immutable
    // this allows for proper mocking of the property during testing
    language: function () {
        return navigator.language;
    },

    i18n: function () {
        var i18n = {
            translate: function (key) {
                return {
                    fetch: function () {
                        return key;
                    }
                };
            },
            format: function (dateOrNumber, formatCode) {
                return {
                    fetch: function () {
                        return dateOrNumber;
                    }
                };
            },
            reset: function () {
                return;
            }
        };
        return qnx.webplatform.i18n ? qnx.webplatform.i18n : i18n;
    },

    mixin: function (mixin, to) {
        Object.getOwnPropertyNames(mixin).forEach(function (prop) {
            if (Object.hasOwnProperty.call(mixin, prop)) {
                Object.defineProperty(to, prop, Object.getOwnPropertyDescriptor(mixin, prop));
            }
        });
        return to;
    },

    /**
     * Returns a local path translated into an actual path on the file system, this method should be updated
     * if the structure of the OS file system ever changes
     */
    translatePath : function (path) {
        var sourceDir = qnx.webplatform.getApplication().getEnv("HOME");

        if (_self.isLocalUrl(path)) {
            path = "file:///" + sourceDir.replace(/^\/*/, '') + "/../app/native/" + path.replace(/local:\/\/\//, '');
        }
        return path;
    },

    downloadFile : function (source, target, onSuccess, onError, options) {

        var fileName  = source.replace(/^.*[\\\/]/, ''),
            mimeType = _self.fileNameToMIME(fileName),
            xhr;

        if (mimeType) {
            if (mimeType.length > 1 && mimeType.isArray) {
                mimeType = mimeType[0];
            }
        } else {
            mimeType = 'text/plain';
        }

        if (typeof target === 'object') {
            target = target[0];
        }

        if (typeof options !== 'undefined') {
            mimeType = options.mimeType ? options.mimeType : mimeType;
            fileName = options.fileName ? options.fileName : fileName;
        }

        window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
        source = _self.translatePath(source);

        xhr = new XMLHttpRequest();
        xhr.open('GET', source, true);
        xhr.responseType = 'blob';
        xhr.onload = function (e) {
            window.requestFileSystem(window.TEMPORARY, 1024 * 1024, function (fileSystem) {
                fileSystem.root.getFile(target, {create: true}, function (fileEntry) {
                    fileEntry.createWriter(function (writer) {
                        writer.onerror = function (e) {
                            console.log("Could not properly write " + fileName);
                            //pass
                        };

                        var blob = new Blob([xhr.response], {type: mimeType});
                        writer.write(blob);

                        // Call the callback sending back the invokable file path file:///
                        if (onSuccess) {
                            onSuccess("file:///" + target.replace(/^\/*/, ''));
                        }
                    }, onError);
                }, onError);
            }, onError);
        };

        xhr.send();
    }
};

module.exports = _self;

/**#nocode-*/

});

define('events', function (require, exports, module) {
/*
 *  Copyright 2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 *  NOTE: Taken from the Ripple-UI project
 *        https://github.com/blackberry/Ripple-UI/
 *
 *  MODIFICATIONS
 *      - renamed 'on' apis/methods to 'emit'
 *      - removed getEventSubscribers/eventHasSubscriber methods
 *      - remove usage of ripple's exception/utils modules
 *
 */
/* The following metaTag is added because this module would not be public */
/**#nocode+*/

var _listeners = {},
    _propertyMatcher = new RegExp("^Property(.*)Event$"),
    _networkEvents = ["NetworkResourceRequested", "NetworkResourceStatusReceived", "NetworkResourceHeaderReceived", "NetworkResourceDataReceived"];

function listenersFor(id, type, create) {
    var result = _listeners[id] || [];

    if (!id) {
        throw "id must be truthy";
    }
    if (!type) {
        throw "type must be truthy";
    }

    result = result[type];

    if (!result && create) {
        _listeners[id] = _listeners[id] || [];
        _listeners[id][type] = []; //Cannot exist
        result = _listeners[id][type]; //Pass by reference
    }

    return result;
}

function getNetworkListenerCount(id) {
    return _networkEvents.reduce(function (prev, currentEventName) {
        var returnCount,
            listeners;
        //Only will be string on first runThrough
        if (typeof prev === "string") {
            listeners = listenersFor(id, prev);
            returnCount = Array.isArray(listeners) ? listeners.length : 0;
        } else {
            returnCount = prev;
        }

        listeners = listenersFor(id, currentEventName);
        returnCount += Array.isArray(listeners) ? listeners.length : 0;

        return returnCount;
    });
}

function enableWebEvent(id, eventType, enable) {
    var matches = _propertyMatcher.exec(eventType),
        command = matches ? "webview.setPropertyChangedEventEnabled" : "webview.setWebEventEnabled",
        property = matches ? matches[1] : eventType,
        isNetworkEvent = (_networkEvents.indexOf(eventType) !== -1),
        enablePropertyChanged,
        networkListenerCount;

    qnx.callExtensionMethod(command, id, property, enable);
    if (matches) {
        // Enable PropertyChanged webEvent only when needed
        enablePropertyChanged = (qnx.callExtensionMethod("webview.isAnyPropertyChangedEventsEnabled", id) === "1");
        qnx.callExtensionMethod("webview.setWebEventEnabled", id, "PropertyChanged", enablePropertyChanged);
    }

    if (isNetworkEvent) {
        networkListenerCount = getNetworkListenerCount(id);
        if (enable && networkListenerCount === 1) {
            qnx.callExtensionMethod("webview.setEnableNetworkResourceRequestedEvents", id, true);
        }

        if (!enable && networkListenerCount === 0) {
            qnx.callExtensionMethod("webview.setEnableNetworkResourceRequestedEvents", id, false);
        }
    }
}

function on(id, type, listener, scope, once) {
    var listeners = listenersFor(id, type, true);
    listeners.push({
        func: listener,
        scope: scope,
        once: !!once
    });
    enableWebEvent(id, type, true);
}

function emit(listener, args, sync) {
    try {
        if (sync) {
            return listener.func.apply(listener.scope, args);
        } else {
            setTimeout(function () {
                listener.func.apply(listener.scope, args);
            }, 1);
        }
    } catch (e) {
        console.error(e && e.stack || e);
    }
}

function removeEventListener(id, type, targetListener) {
    var listeners = listenersFor(id, type),
        i;

    if (listeners) {
        for (i = 0; i < listeners.length; i++) {
            if (listeners[i].func === targetListener) {
                listeners.splice(i, 1); // delete
                if (listeners.length === 0) {
                    enableWebEvent(id, type, false);
                }
                break;
            }
        }
    }
}

module.exports = {
    on: function (id, type, listener, scope) {
        on(id, type, listener, scope);
    },

    once : function (id, type, listener, scope) {
        on(id, type, listener, scope, true);
    },

    isOn: function (id, type) {
        var listeners = listenersFor(id, type);
        //Check for undefined in case of deletion
        return typeof listeners !== "undefined"  && listeners.length !== 0;
    },

    //The emit function has 3 required params and 1 optional
    //The options function has two subparameters
    //options.sync means whether to emit synchronously (default false)
    //options.shouldReturn means
    emit: function (id, type, args, options) {
        var listeners = listenersFor(id, type),
            returnValue,
            sync,
            shouldReturn;
        args = args || [];
        options = options || {};
        sync = !!options.sync || false;
        shouldReturn = !!options.shouldReturn || false;
        if (listeners) {
            listeners.some(function (listener) {
                returnValue = emit(listener, args, sync);
                if (shouldReturn && returnValue) {
                    return true;
                }
                returnValue = null;
                return false;
            });

            if (shouldReturn && returnValue) {
                return returnValue;
            }

            //This array must exist or we wouldn't hit this block
            _listeners[id][type] = listeners.filter(function (listener) {
                return !listener.once;
            });
        }
    },

    removeEventListener: removeEventListener,

    clear: function (id) {
        if (id) {
            delete _listeners[id];
        }
    },

    receiveAllPropertyChangedEvents: function (id, enabled) {
        qnx.callExtensionMethod("webview.setAllPropertyChangedEventsEnabled", id, enabled);
    },

    //Exposing purely for debugging and less because there is a valid client reason
    listenersFor: listenersFor,

    defineNetworkEvent: function (eventName) {
        if (_networkEvents.indexOf(eventName) === -1) {
            _networkEvents.push(eventName);
        }
    }

};
/**#nocode-*/

});

define('i18n/locale', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2012. All rights reserved.
 */

// for retrieving locale data for use with Jed
// expects (build time generated) i18n/locale/list and locale/en-US (for one)

var utils = require('../utils'),
    _DEFAULT_LOCALE = "en-US",
    locales = {},
    self;

function hasLocale(locale) {
    return self.list().some(function (type) {
        return locale === type;
    });
}

function getLocale(locale) {
    if (!hasLocale(locale)) {
        console.error("unknown/unsupported locale code: '" + locale + "'. Using default " + _DEFAULT_LOCALE);
        locale = _DEFAULT_LOCALE;
    }

    if (!locales.hasOwnProperty(locale)) {
        locales[locale] = require('i18n/locale/' + locale);
    }

    return locales[locale];
}

function addLocale(localeCode, localeData) {
    if (!hasLocale(localeCode)) {
        locales[localeCode] = localeData;
    } else {
        //If its not in the "locales map" then load it
        //Otherwise assume the default has been loaded
        if (!locales.hasOwnProperty(localeCode)) {
            locales[localeCode] = require('i18n/locale/' + localeCode);
        }
        utils.mixin(localeData, locales[localeCode]);
    }
}


self = {
    // TODO: this needs to be more robust
    //       also, support general language codes such as 'en'
    //        --> do this at build time inside locale/list?
    //            or runtime (and test easier)?
    get: getLocale,

    add: addLocale,

    list: function () {
        return require('i18n/locale/list').concat(Object.keys(locales));
    }
};

module.exports = self;

});

define('i18n', function (require, exports, module) {
/*
 * Copyright (C) Research In Motion Limited 2012. All rights reserved.
 */

// This is the go to module for i18n. It uses the `navgator.language` property to determine its setting.
// Use it to translate strings specified in .po files (browser/po/locale_name.po), and also localize date/times.

// Jed (http://slexaxton.github.com/Jed/) is currently the main API to do basic translations with .po file strings (via `self.translate`).

// To do more complex localization (dates/times), use `self.format`.
// Note: This uses Globalize.js, which uses the term culture (https://github.com/jquery/globalize#what-is-a-culture).

// TODO: This module now uses two libraries to do basic and (now) specific date/time translations.
//       It may be prudent to pick one over the other, and if so, (for support) Globalize.js is most likely the best choice.
//       This means .po files would need to be translated into or added onto their respective culture files (at buildtime).

var self,
    events = require('./events'),
    utils = require('./utils'),
    locale = require('./i18n/locale'),
    jeds = {};

function instanceOfJed(localeCode) {
    return new Jed({
        locale_data: locale.get(localeCode)
    });
}

function loadCulture(cultureId) {
    if (cultureId && !Globalize.cultures[cultureId]) {
        require("globalize-" + cultureId).load();
    }
}

function closestLocale(localeCode) {
    function exists(code) {
        return locale.list().some(function (item) {
            return code === item;
        });
    }

    function baseLocale(code) {
        return code.replace(/-.*$/, '');
    }

    if (exists(localeCode)) {
        return localeCode;
    } else if (exists(baseLocale(localeCode))) {
        return baseLocale(localeCode);
    } else {
        return locale.list()[0];
    }
}

function translate(key) {
    var localeCode = closestLocale(utils.language());

    if (!jeds[localeCode]) {
        jeds[localeCode] = instanceOfJed(localeCode);
    }

    return jeds[localeCode].translate(key);
}

function format(dateOrNumber, formatCode) {
    loadCulture(utils.language());
    // If no matching culture can be found use the default culture
    var closestCulture = Globalize.findClosestCulture(utils.language());
    return Globalize.format(dateOrNumber, formatCode, closestCulture !== null ? closestCulture : Globalize.culture());
}

function reset() {
    jeds = {};
}

self = {
    // This returns a Jed translate call (http://slexaxton.github.com/Jed/).
    translate: translate,

    // format Globalize.js (for translating dates/numbers).
    // https://github.com/jquery/globalize#date-formatting
    // https://github.com/jquery/globalize#numbers
    // https://github.com/jquery/globalize#currency-formatting
    format: format,

    reset: reset,

    addLocale: locale.add
};

module.exports = self;

});
define("i18n/locale/list", function (require, exports, module) {
module.exports = ["sv-SE","da-DK","en-US","fr-FR","de-DE","ru-RU","hu-HU","es-ES","vi-VN","pt-PT","ko-KR","fi-FI","hi-IN","ca-ES","he-IL","it-IT","gl-ES","nl-NL","tr-TR","th-TH","el-GR","hr-HR","ja-JP","ro-RO","eu-ES","id-ID","pl-PL","nb-NO","pt-BR","en-GB","cs-CZ","ar-EG","zh-CN","zh-TW"];});
define("i18n/locale/sv-SE", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"sv-SE","plural_forms":null},"Unable to open the camera.":[null,"Det gick inte att öppna kameran."],"Unable to select a file.":[null,"Det gick inte att välja en fil."],"File successfully saved.":[null,"Filen sparades."],"File could not be saved.":[null,"Det gick inte att spara filen."],"Clear Field":[null,"Töm fält"],"Dismiss Selection":[null,"Ignorera val"],"Cut":[null,"Klipp ut"],"Copy":[null,"Kopiera"],"Paste":[null,"Klistra in"],"Select All":[null,"Välj alla"],"Select":[null,"Välj"],"Copy Link":[null,"Kopiera länk"],"Save Link As":[null,"Spara länk som"],"Save Image":[null,"Spara bild"],"Copy Image Link":[null,"Kopiera bildlänk"],"View Image":[null,"Visa bild"],"Inspect Element":[null,"Inspektera element"],"Cancel":[null,"Avbryt"],"Front":[null,"Främre"],"Rear":[null,"Bakre"],"Camera Selection":[null,"Kameraval"],"Close":[null,"Stäng"],"Selection":[null,"Val"],"JavaScript Alert":[null,"JavaScript-varning"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL-certifikatundantag"],"The certificate for this site can't be trusted. ":[null,"Certifikatet för den här platsen är inte tillförlitligt. "],"Another site may be impersonating the site you are trying to visit. ":[null,"En annan plats kan se ut att vara den plats som du vill besöka. "],"If you add an exception, you will continue to the site and not be ":[null,"Om du lägger till ett platsundantag visas platsen, och "],"warned next time you view %1$s.":[null,"du varnas inte nästa gång du visar %1$s."],"Add Exception":[null,"Lägg till undantag"],"Security Information":[null,"Säkerhetsinformation"],"Yes":[null,"Ja"],"No":[null,"Nej"],"JavaScript Confirm":[null,"Bekräfta JavaScript"],"JavaScript Prompt":[null,"JavaScript-fråga"],"Authentication Required":[null,"Autentisering krävs"],"Can't Connect to the network":[null,"Det går inte att ansluta till nätverket"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Inloggningsinformationen som angavs för proxyservern är felaktig. Ange informationen igen."],"Connecting to %1$s via SSL connection":[null,"Ansluter till %1$s via SSL-anslutning"],"Connecting to %1$s":[null,"Ansluter till %1$s"],"Username":[null,"Användarnamn"],"Password":[null,"Lösenord"],"Show password":[null,"Visa lösenord"],"Try Again":[null,"Försök igen"],"Signing In":[null,"Loggar in"],"Save":[null,"Spara"],"Never":[null,"Aldrig"],"Ignore":[null,"Ignorera"],"Custom Dialog":[null,"Anpassningsdialogruta"],"Location Services Off":[null,"Positioneringstjänster inaktiverade"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Aktivera positioneringstjänsterna i Inställningar, så kan du använda alla funktionerna i det här programmet."],"Settings":[null,"Inställningar"],"Previous":[null,"Föregående"],"Next":[null,"Nästa"],"Submit":[null,"Skicka"],"Share":[null,"Dela"]}};});
define("i18n/locale/da-DK", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"da-DK","plural_forms":null},"Unable to open the camera.":[null,"Kunne ikke åbne kameraet."],"Unable to select a file.":[null,"Kunne ikke vælge en fil."],"File successfully saved.":[null,"Fil gemt."],"File could not be saved.":[null,"Fil kunne ikke gemmes."],"Clear Field":[null,"Ryd felt"],"Dismiss Selection":[null,"Afvis det valgte"],"Cut":[null,"Klip"],"Copy":[null,"Kopier"],"Paste":[null,"Indsæt"],"Select All":[null,"Vælg alle"],"Select":[null,"Vælg"],"Copy Link":[null,"Kopier link"],"Save Link As":[null,"Gem link som"],"Save Image":[null,"Gem billede"],"Copy Image Link":[null,"Kopier billedlink"],"View Image":[null,"Se billede"],"Inspect Element":[null,"Undersøg element"],"Cancel":[null,"Annuller"],"Front":[null,"Front"],"Rear":[null,"Bagside"],"Camera Selection":[null,"Kameravalg"],"Close":[null,"Luk"],"Selection":[null,"Valg"],"JavaScript Alert":[null,"JavaScript-alarm"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL-certifikatundtagelse"],"The certificate for this site can't be trusted. ":[null,"Certifikatet for dette websted er ikke pålideligt. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Et andet websted udgiver sig måske for det websted, du vil ind på. "],"If you add an exception, you will continue to the site and not be ":[null,"Hvis du tilføjer en undtagelse, fortsætter du til websteder og advares ikke "],"warned next time you view %1$s.":[null,"næste gang, du ser %1$s."],"Add Exception":[null,"Tilføj undtagelse"],"Security Information":[null,"Sikkerhedsoplysninger"],"Yes":[null,"Ja"],"No":[null,"Nej"],"JavaScript Confirm":[null,"JavaScript-bekræftelse"],"JavaScript Prompt":[null,"JavaScript-prompt"],"Authentication Required":[null,"Godkendelse påkrævet"],"Can't Connect to the network":[null,"Kan ikke tilslutte til netværk"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"De angivne login-oplysninger for proxy'en er forkerte. Prøv at skrive oplysningerne igen."],"Connecting to %1$s via SSL connection":[null,"Tilslutter til %1$s via SSL-forbindelse"],"Connecting to %1$s":[null,"Tilslutter til %1$s"],"Username":[null,"Brugernavn"],"Password":[null,"Adgangskode"],"Show password":[null,"Vis adgangskode"],"Try Again":[null,"Prøv igen"],"Signing In":[null,"Logger på"],"Save":[null,"Gem"],"Never":[null,"Aldrig"],"Ignore":[null,"Ignorer"],"Custom Dialog":[null,"Tilpasset dialog"],"Location Services Off":[null,"Positionstjenester deaktiveret"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Aktiver Positionstjenester i Indstillinger, og få fordel af alle funktionerne i denne app."],"Settings":[null,"Indstillinger"],"Previous":[null,"Forrige"],"Next":[null,"Næste"],"Submit":[null,"Indsend"],"Share":[null,"Del"]}};});
define("i18n/locale/en-US", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"en-US","plural_forms":null}}};});
define("i18n/locale/fr-FR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"fr-FR","plural_forms":null},"Unable to open the camera.":[null,"Impossible d'ouvrir l'appareil photo."],"Unable to select a file.":[null,"Impossible de sélectionner un fichier."],"File successfully saved.":[null,"Fichier enregistré avec succès."],"File could not be saved.":[null,"Échec de l'enregistrement du fichier."],"Clear Field":[null,"Effacer le champ"],"Dismiss Selection":[null,"Annuler la sélection"],"Cut":[null,"Couper"],"Copy":[null,"Copier"],"Paste":[null,"Coller"],"Select All":[null,"Tout sélectionner"],"Select":[null,"Sélectionner"],"Copy Link":[null,"Copier le lien"],"Save Link As":[null,"Enregistrer le lien sous"],"Save Image":[null,"Enregistrer l'image"],"Copy Image Link":[null,"Copier le lien de l'image"],"View Image":[null,"Afficher l'image"],"Inspect Element":[null,"Inspecter l'élément"],"Cancel":[null,"Annuler"],"Front":[null,"Avant"],"Rear":[null,"Arrière"],"Camera Selection":[null,"Choix de l'appareil photo"],"Close":[null,"Fermer"],"Selection":[null,"Sélection"],"JavaScript Alert":[null,"Alerte JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Exception de certificat SSL"],"The certificate for this site can't be trusted. ":[null,"Le certificat de ce site n'est pas digne de confiance. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Il se peut qu'un autre site usurpe l'identité du site auquel vous tentez d'accéder. "],"If you add an exception, you will continue to the site and not be ":[null,"Si vous ajoutez une exception, vous accéderez au site et ne "],"warned next time you view %1$s.":[null,"serez pas averti la prochaine fois que vous visualiserez %1$s."],"Add Exception":[null,"Ajouter une exception"],"Security Information":[null,"Informations de sécurité"],"Yes":[null,"Oui"],"No":[null,"Non"],"JavaScript Confirm":[null,"Confirmation JavaScript"],"JavaScript Prompt":[null,"Invite JavaScript"],"Authentication Required":[null,"Authentification requise"],"Can't Connect to the network":[null,"Impossible de se connecter au réseau"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Les informations de connexion saisies pour le proxy sont incorrectes. Saisissez les informations à nouveau."],"Connecting to %1$s via SSL connection":[null,"Connexion SSL à %1$s en cours"],"Connecting to %1$s":[null,"Connexion à %1$s en cours"],"Username":[null,"Nom d'utilisateur"],"Password":[null,"Mot de passe"],"Show password":[null,"Afficher le mot de passe"],"Try Again":[null,"Réessayer"],"Signing In":[null,"Connexion"],"Save":[null,"Enregistrer"],"Never":[null,"Jamais"],"Ignore":[null,"Ignorer"],"Custom Dialog":[null,"Boîte de dialogue personnalisée"],"Location Services Off":[null,"Services de géolocalisation désactivés"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Activez les services de géolocalisation dans les Paramètres pour profiter de toutes les fonctionnalités de cette application."],"Settings":[null,"Paramètres"],"Previous":[null,"Précédent"],"Next":[null,"Suivant"],"Submit":[null,"Envoyer"],"Share":[null,"Partager"]}};});
define("i18n/locale/de-DE", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"de-DE","plural_forms":null},"Unable to open the camera.":[null,"Kamera kann nicht geöffnet werden."],"Unable to select a file.":[null,"Auswählen einer Datei nicht möglich."],"File successfully saved.":[null,"Datei erfolgreich gespeichert."],"File could not be saved.":[null,"Die Datei konnte nicht gespeichert werden."],"Clear Field":[null,"Feld löschen"],"Dismiss Selection":[null,"Auswahl schließen"],"Cut":[null,"Ausschneiden"],"Copy":[null,"Kopieren"],"Paste":[null,"Einfügen"],"Select All":[null,"Alles auswählen"],"Select":[null,"Auswählen"],"Copy Link":[null,"Link kopieren"],"Save Link As":[null,"Link speichern unter"],"Save Image":[null,"Bild speichern"],"Copy Image Link":[null,"Bildverknüpfung kopieren"],"View Image":[null,"Bild anzeigen"],"Inspect Element":[null,"Element prüfen"],"Cancel":[null,"Abbrechen"],"Front":[null,"Vorderseite"],"Rear":[null,"Rückseite"],"Camera Selection":[null,"Kameraauswahl"],"Close":[null,"Schließen"],"Selection":[null,"Auswahl"],"JavaScript Alert":[null,"JavaScript-Alarm"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL-Zertifikatausnahme"],"The certificate for this site can't be trusted. ":[null,"Das Zertifikat für diese Webseite ist nicht vertrauenswürdig. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Es ist möglich, dass eine andere Webseite die Identität der Webseite annimmt, die Sie besuchen möchten. "],"If you add an exception, you will continue to the site and not be ":[null,"Wenn Sie eine Ausnahme hinzufügen, werden Sie zur Seite weitergeleitet und "],"warned next time you view %1$s.":[null,"beim nächsten Anzeigen von %1$s nicht mehr gewarnt."],"Add Exception":[null,"Ausnahme hinzufügen"],"Security Information":[null,"Sicherheitsinformationen"],"Yes":[null,"Ja"],"No":[null,"Nein"],"JavaScript Confirm":[null,"JavaScript-Bestätigung"],"JavaScript Prompt":[null,"JavaScript-Eingabeaufforderung"],"Authentication Required":[null,"Authentifizierung erforderlich"],"Can't Connect to the network":[null,"Verbindung zum Netzwerk nicht möglich"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Die eingegebenen Anmeldeinformationen für den Proxyserver sind falsch. Geben Sie die Informationen erneut ein."],"Connecting to %1$s via SSL connection":[null,"Verbindung zu %1$s wird über SSL-Verbindung hergestellt"],"Connecting to %1$s":[null,"Verbindung zu %1$s wird hergestellt"],"Username":[null,"Benutzername"],"Password":[null,"Kennwort"],"Show password":[null,"Kennwort anzeigen"],"Try Again":[null,"Erneut versuchen"],"Signing In":[null,"Anmeldung erfolgt"],"Save":[null,"Speichern"],"Never":[null,"Nie"],"Ignore":[null,"Ignorieren"],"Custom Dialog":[null,"Benutzerdefinierter Dialog"],"Location Services Off":[null,"Dienste für die Standortbestimmung sind ausgeschaltet"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Aktivieren Sie die Dienste für die Standortbestimmung, um alle Funktionen dieser App nutzen zu können."],"Settings":[null,"Einstellungen"],"Previous":[null,"Zurück"],"Next":[null,"Weiter"],"Submit":[null,"Senden"],"Share":[null,"Teilen"]}};});
define("i18n/locale/ru-RU", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ru-RU","plural_forms":null},"Unable to open the camera.":[null,"Не удалось включить камеру."],"Unable to select a file.":[null,"Не удалось выбрать файл."],"File successfully saved.":[null,"Файл успешно сохранен."],"File could not be saved.":[null,"Не удалось сохранить файл."],"Clear Field":[null,"Очистить поле"],"Dismiss Selection":[null,"Сбросить выбор"],"Cut":[null,"Вырезать"],"Copy":[null,"Копировать"],"Paste":[null,"Вставить"],"Select All":[null,"Выбрать все"],"Select":[null,"Выбрать"],"Copy Link":[null,"Копировать ссылку"],"Save Link As":[null,"Сохранить ссылку как"],"Save Image":[null,"Сохранить изображение"],"Copy Image Link":[null,"Копировать ссылку изображения"],"View Image":[null,"Просмотр изображения"],"Inspect Element":[null,"Проверить элемент"],"Cancel":[null,"Отмена"],"Front":[null,"Передняя"],"Rear":[null,"Задняя"],"Camera Selection":[null,"Выбор камеры"],"Close":[null,"Закрыть"],"Selection":[null,"Выбор"],"JavaScript Alert":[null,"Предупреждение JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Исключение для сертификата SSL"],"The certificate for this site can't be trusted. ":[null,"Сертификат этого сайта является ненадежным. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Возможно, другой сайт пытается выдать себя за сайт, который вы хотите открыть. "],"If you add an exception, you will continue to the site and not be ":[null,"После добавления исключения вы будете перенаправлены на сайт %1$s, при последующих просмотрах которого "],"warned next time you view %1$s.":[null,"предупреждение отображаться не будет."],"Add Exception":[null,"Добавить исключение"],"Security Information":[null,"Информация о безопасности"],"Yes":[null,"Да"],"No":[null,"Нет"],"JavaScript Confirm":[null,"Подтверждение JavaScript"],"JavaScript Prompt":[null,"Запрос JavaScript"],"Authentication Required":[null,"Требуется проверка подлинности"],"Can't Connect to the network":[null,"Не удается подключиться к сети"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Данные для доступа к прокси-серверу указаны неверно. Введите данные еще раз."],"Connecting to %1$s via SSL connection":[null,"Подключение к %1$s с помощью подключения SSL"],"Connecting to %1$s":[null,"Подключение к %1$s"],"Username":[null,"Имя пользователя"],"Password":[null,"Пароль"],"Show password":[null,"Показывать пароль"],"Try Again":[null,"Повторите попытку"],"Signing In":[null,"Вход в систему"],"Save":[null,"Сохранить"],"Never":[null,"Никогда"],"Ignore":[null,"Игнорировать"],"Custom Dialog":[null,"Настраиваемое диалоговое окно"],"Location Services Off":[null,"Службы определения местоположения отключены"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Включите службы определения местоположения в меню Настройки, чтобы полноценно использовать функции приложения."],"Settings":[null,"Настройки"],"Previous":[null,"Назад"],"Next":[null,"Далее"],"Submit":[null,"Отправить"],"Share":[null,"Поделиться"]}};});
define("i18n/locale/hu-HU", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"hu-HU","plural_forms":null},"Unable to open the camera.":[null,"A fényképezőgép nem nyitható meg."],"Unable to select a file.":[null,"A fájlt nem lehet kiválasztani."],"File successfully saved.":[null,"A fájl sikeresen mentve."],"File could not be saved.":[null,"A fájl mentése sikertelen."],"Clear Field":[null,"Mező törlése"],"Dismiss Selection":[null,"Kijelölés elvetése"],"Cut":[null,"Kivágás"],"Copy":[null,"Másolás"],"Paste":[null,"Beillesztés"],"Select All":[null,"Összes kijelölése"],"Select":[null,"Kiválasztás"],"Copy Link":[null,"Hivatkozás másolása"],"Save Link As":[null,"Hivatkozás mentése más néven"],"Save Image":[null,"Kép mentése"],"Copy Image Link":[null,"Képhivatkozás másolása"],"View Image":[null,"Képnézegetés"],"Inspect Element":[null,"Elem vizsgálata"],"Cancel":[null,"Mégse"],"Front":[null,"Első rész"],"Rear":[null,"Hátsó"],"Camera Selection":[null,"Kameraválasztás"],"Close":[null,"Bezárás"],"Selection":[null,"Kijelölés"],"JavaScript Alert":[null,"JavaScript figyelmeztetés"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL tanúsítvány kivétel"],"The certificate for this site can't be trusted. ":[null,"A webhely tanúsítványa nem megbízható. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Egy másik webhely felvehette a meglátogatni kívánt webhely azonosságát. "],"If you add an exception, you will continue to the site and not be ":[null,"Ha kivételt ad hozzá, akkor továbblép a webhelyre, és nem kap "],"warned next time you view %1$s.":[null,"többé értesítést, amikor megtekinti a következőt: %1$s."],"Add Exception":[null,"Kivétel hozzáadása"],"Security Information":[null,"Biztonsági adatok"],"Yes":[null,"Igen"],"No":[null,"Nem"],"JavaScript Confirm":[null,"JavaScript megerősítése"],"JavaScript Prompt":[null,"JavaScript kérés"],"Authentication Required":[null,"Hitelesítés kötelező"],"Can't Connect to the network":[null,"Nem lehet csatlakozni a hálózathoz"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"A proxyhoz megadott bejelentkezési adatok helytelenek. Próbálja újra megadni az adatokat."],"Connecting to %1$s via SSL connection":[null,"Csatlakozás a következőhöz: %1$s SSL kapcsolaton keresztül"],"Connecting to %1$s":[null,"Csatlakozás a következőhöz: %1$s"],"Username":[null,"Felhasználónév"],"Password":[null,"Jelszó"],"Show password":[null,"Jelszó megjelenítése"],"Try Again":[null,"Próbálja újra"],"Signing In":[null,"Bejelentkezés"],"Save":[null,"Mentés"],"Never":[null,"Soha"],"Ignore":[null,"Mellőzés"],"Custom Dialog":[null,"Egyéni párbeszéd"],"Location Services Off":[null,"Helymeghatározási szolgáltatások ki"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Az alkalmazás előnyeinek kihasználásához kapcsolja be a Helymeghatározási szolgáltatásokat a Beállítások menüpontban."],"Settings":[null,"Beállítások"],"Previous":[null,"Előző"],"Next":[null,"Következő"],"Submit":[null,"Küldés"],"Share":[null,"Megosztás"]}};});
define("i18n/locale/es-ES", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"es-ES","plural_forms":null},"Unable to open the camera.":[null,"No se puede acceder a la cámara."],"Unable to select a file.":[null,"No se puede seleccionar un archivo."],"File successfully saved.":[null,"Archivo guardado."],"File could not be saved.":[null,"No se pudo guardar el archivo."],"Clear Field":[null,"Borrar campo"],"Dismiss Selection":[null,"Descartar selección"],"Cut":[null,"Cortar"],"Copy":[null,"Copiar"],"Paste":[null,"Pegar"],"Select All":[null,"Seleccionar todos"],"Select":[null,"Seleccionar"],"Copy Link":[null,"Copiar vínculo"],"Save Link As":[null,"Guardar vínculo como"],"Save Image":[null,"Guardar imagen"],"Copy Image Link":[null,"Copiar vínculo de imagen"],"View Image":[null,"Ver imagen"],"Inspect Element":[null,"Inspeccionar elemento"],"Cancel":[null,"Cancelar"],"Front":[null,"Frontal"],"Rear":[null,"Posterior"],"Camera Selection":[null,"Selección de cámara"],"Close":[null,"Cerrar"],"Selection":[null,"Selección"],"JavaScript Alert":[null,"Alerta de JavaScript"],"OK":[null,"Aceptar"],"SSL Certificate Exception":[null,"Excepción de certificado SSL"],"The certificate for this site can't be trusted. ":[null,"El certificado de este sitio no es de confianza. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Puede que otro sitio esté haciéndose pasar por el sitio que trata de visitar. "],"If you add an exception, you will continue to the site and not be ":[null,"Si agrega una excepción, será redirigido al sitio y no "],"warned next time you view %1$s.":[null,"recibirá una advertencia la próxima vez que visite %1$s."],"Add Exception":[null,"Agregar excepción"],"Security Information":[null,"Información de seguridad"],"Yes":[null,"Sí"],"No":[null,"No"],"JavaScript Confirm":[null,"Confirmación de JavaScript"],"JavaScript Prompt":[null,"Aviso de JavaScript"],"Authentication Required":[null,"Se requiere autenticación"],"Can't Connect to the network":[null,"No se puede conectar con la red"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"La información de inicio de sesión para el proxy no es correcta. Intente escribir la información de nuevo."],"Connecting to %1$s via SSL connection":[null,"Conectándose a %1$s mediante conexión SSL"],"Connecting to %1$s":[null,"Conectándose a %1$s"],"Username":[null,"Nombre de usuario"],"Password":[null,"Contraseña"],"Show password":[null,"Mostrar contraseña"],"Try Again":[null,"Volver a intentar"],"Signing In":[null,"Iniciando sesión"],"Save":[null,"Guardar"],"Never":[null,"Nunca"],"Ignore":[null,"Ignorar"],"Custom Dialog":[null,"Diálogo personalizado"],"Location Services Off":[null,"Servicios de ubicación desactivados"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Active los servicios de ubicación en Configuración para aprovechar todas las funciones de esta aplicación."],"Settings":[null,"Configuración"],"Previous":[null,"Anterior"],"Next":[null,"Siguiente"],"Submit":[null,"Enviar"],"Share":[null,"Compartir"]}};});
define("i18n/locale/vi-VN", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"vi-VN","plural_forms":null},"Unable to open the camera.":[null,"Không thể chọn một tập tin."],"Unable to select a file.":[null,"Không thể chọn một tập tin."],"File successfully saved.":[null,"Tập tin đã được lưu thành công."],"File could not be saved.":[null,"Không thể lưu tập tin."],"Clear Field":[null,"Xóa trường"],"Dismiss Selection":[null,"Loại bỏ lựa chọn"],"Cut":[null,"Cắt"],"Copy":[null,"Sao chép"],"Paste":[null,"Dán"],"Select All":[null,"Chọn tất cả"],"Select":[null,"Chọn"],"Copy Link":[null,"Sao chép đường dẫn"],"Save Link As":[null,"Lưu liên kết dưới dạng"],"Save Image":[null,"Lưu hình ảnh"],"Copy Image Link":[null,"Sao chép liên kết hình ảnh"],"View Image":[null,"Xem hình ảnh"],"Inspect Element":[null,"Kiểm tra phần tử"],"Cancel":[null,"Hủy"],"Front":[null,"Mặt trước"],"Rear":[null,"Mặt sau"],"Camera Selection":[null,"Lựa chọn máy ảnh"],"Close":[null,"Đóng"],"Selection":[null,"Lựa chọn"],"JavaScript Alert":[null,"Cảnh báo JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Ngoại lệ chứng chỉ SSL"],"The certificate for this site can't be trusted. ":[null,"Chứng chỉ cho trang web này không thể được tin cậy. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Một trang web khác có thể mạo danh trang web bạn đang tìm cách truy cập. "],"If you add an exception, you will continue to the site and not be ":[null,"Nếu bạn thêm một ngoại lệ, bạn sẽ tiếp tục đến trang web và không "],"warned next time you view %1$s.":[null,"được cảnh báo lần sau khi bạn xem %1$s."],"Add Exception":[null,"Thêm ngoại trừ"],"Security Information":[null,"Thông tin bảo mật"],"Yes":[null,"Có"],"No":[null,"Không"],"JavaScript Confirm":[null,"Xác nhận JavaScript"],"JavaScript Prompt":[null,"Nhắc JavaScript"],"Authentication Required":[null,"Yêu cầu xác thực"],"Can't Connect to the network":[null,"Không thể kết nối vào mạng"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Thông tin đăng nhập đã nhập cho proxy không chính xác. Thử nhập lại thông tin đó."],"Connecting to %1$s via SSL connection":[null,"Kết nối với %1$s qua kết nối SSL"],"Connecting to %1$s":[null,"Đang kết nối với %1$s"],"Username":[null,"Tên người dùng"],"Password":[null,"Mật khẩu"],"Show password":[null,"Hiển thị mật khẩu"],"Try Again":[null,"Thử lại"],"Signing In":[null,"Đang đăng nhập"],"Save":[null,"Lưu"],"Never":[null,"Không bao giờ"],"Ignore":[null,"Bỏ qua"],"Custom Dialog":[null,"Hộp thoại tùy chỉnh"],"Location Services Off":[null,"Tắt dịch vụ vị trí"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Bật dịch vụ vị trí trong cài đặt để tận dụng tất cả các tính năng trong ứng dụng này."],"Settings":[null,"Cài đặt"],"Previous":[null,"Trước đó"],"Next":[null,"Tiếp theo"],"Submit":[null,"Gửi"],"Share":[null,"Chia sẻ"]}};});
define("i18n/locale/pt-PT", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"pt-PT","plural_forms":null},"Unable to open the camera.":[null,"Não é possível abrir a câmara."],"Unable to select a file.":[null,"Não é possível selecionar um ficheiro."],"File successfully saved.":[null,"Ficheiro guardado com êxito."],"File could not be saved.":[null,"Não foi possível guardar o ficheiro."],"Clear Field":[null,"Limpar campo"],"Dismiss Selection":[null,"Cancelar seleção"],"Cut":[null,"Cortar"],"Copy":[null,"Copiar"],"Paste":[null,"Colar"],"Select All":[null,"Selecionar tudo"],"Select":[null,"Selecionar"],"Copy Link":[null,"Copiar ligação"],"Save Link As":[null,"Guardar ligação como"],"Save Image":[null,"Guardar imagem"],"Copy Image Link":[null,"Copiar ligação da imagem"],"View Image":[null,"Ver imagem"],"Inspect Element":[null,"Inspecionar elemento"],"Cancel":[null,"Cancelar"],"Front":[null,"Frente"],"Rear":[null,"Parte traseira"],"Camera Selection":[null,"Seleção de câmara"],"Close":[null,"Fechar"],"Selection":[null,"Seleção"],"JavaScript Alert":[null,"Alerta do JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Exceção de certificado SSL"],"The certificate for this site can't be trusted. ":[null,"O certificado para este site não é fidedigno. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Um outro site poderá estar a imitar o site que está a tentar visitar. "],"If you add an exception, you will continue to the site and not be ":[null,"Se adicionar uma exceção, será direcionado para o site e não será "],"warned next time you view %1$s.":[null,"alertado na próxima vez que visualizar %1$s."],"Add Exception":[null,"Adicionar exceção"],"Security Information":[null,"Informações de segurança"],"Yes":[null,"Sim"],"No":[null,"Não"],"JavaScript Confirm":[null,"Confirmar JavaScript"],"JavaScript Prompt":[null,"Pedido do JavaScript"],"Authentication Required":[null,"Autenticação necessária"],"Can't Connect to the network":[null,"Não é possível ligar à rede"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"As informações de início de sessão introduzidas para o proxy estão incorretas. Tente introduzir as informações novamente."],"Connecting to %1$s via SSL connection":[null,"A ligar a %1$s através de ligação SSL"],"Connecting to %1$s":[null,"A ligar a %1$s"],"Username":[null,"Nome de utilizador"],"Password":[null,"Palavra-passe"],"Show password":[null,"Mostrar palavra-passe"],"Try Again":[null,"Tentar novamente"],"Signing In":[null,"Registar"],"Save":[null,"Guardar"],"Never":[null,"Nunca"],"Ignore":[null,"Ignorar"],"Custom Dialog":[null,"Caixa de diálogo personalizada"],"Location Services Off":[null,"Serviços de localização desativados"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Ative os Serviços de localização nas Definições para tirar o máximo partido das funcionalidades desta aplicação."],"Settings":[null,"Definições"],"Previous":[null,"Anterior"],"Next":[null,"Seguinte"],"Submit":[null,"Enviar"],"Share":[null,"Partilhar"]}};});
define("i18n/locale/ko-KR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ko-KR","plural_forms":null},"Unable to open the camera.":[null,"카메라를 열 수 없습니다."],"Unable to select a file.":[null,"파일을 선택할 수 없습니다."],"File successfully saved.":[null,"파일이 성공적으로 저장되었습니다."],"File could not be saved.":[null,"파일을 저장할 수 없습니다."],"Clear Field":[null,"필드 지우기"],"Dismiss Selection":[null,"선택 영역 해제"],"Cut":[null,"잘라내기"],"Copy":[null,"복사"],"Paste":[null,"붙여넣기"],"Select All":[null,"모두 선택"],"Select":[null,"선택"],"Copy Link":[null,"링크 복사"],"Save Link As":[null,"다른 이름으로 링크 저장"],"Save Image":[null,"이미지 저장"],"Copy Image Link":[null,"이미지 링크 복사"],"View Image":[null,"이미지 보기"],"Inspect Element":[null,"요소 검사"],"Cancel":[null,"취소"],"Front":[null,"전면"],"Rear":[null,"후면"],"Camera Selection":[null,"카메라 선택"],"Close":[null,"닫기"],"Selection":[null,"선택"],"JavaScript Alert":[null,"JavaScript 알림"],"OK":[null,"확인"],"SSL Certificate Exception":[null,"SSL 인증서 예외"],"The certificate for this site can't be trusted. ":[null,"이 사이트의 인증서를 신뢰할 수 없습니다. "],"Another site may be impersonating the site you are trying to visit. ":[null,"다른 사이트가 해당 사이트로 가장했을 수 있습니다. "],"If you add an exception, you will continue to the site and not be ":[null,"예외를 추가하면 계속 사이트로 이동하고 "],"warned next time you view %1$s.":[null,"다음에 %1$s을(를) 볼 때 경고가 나타나지 않습니다."],"Add Exception":[null,"예외 추가"],"Security Information":[null,"보안 정보"],"Yes":[null,"예"],"No":[null,"아니요"],"JavaScript Confirm":[null,"JavaScript 확인"],"JavaScript Prompt":[null,"JavaScript 확인 팝업 표시"],"Authentication Required":[null,"인증 필요"],"Can't Connect to the network":[null,"네트워크에 연결할 수 없습니다."],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"프록시에 대해 입력한 로그인 정보가 올바르지 않습니다. 정보를 다시 입력하십시오."],"Connecting to %1$s via SSL connection":[null,"SSL 연결을 통해 %1$s에 연결하는 중"],"Connecting to %1$s":[null,"%1$s에 연결하는 중"],"Username":[null,"사용자 이름"],"Password":[null,"암호"],"Show password":[null,"암호 표시"],"Try Again":[null,"다시 시도"],"Signing In":[null,"로그인"],"Save":[null,"저장"],"Never":[null,"안 함"],"Ignore":[null,"무시"],"Custom Dialog":[null,"사용자 지정 대화 상자"],"Location Services Off":[null,"위치 서비스 꺼짐"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"이 앱의 모든 기능을 사용하려면 설정에서 위치 서비스를 켜십시오."],"Settings":[null,"설정"],"Previous":[null,"이전"],"Next":[null,"다음"],"Submit":[null,"전송"],"Share":[null,"공유"]}};});
define("i18n/locale/fi-FI", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"fi-FI","plural_forms":null},"Unable to open the camera.":[null,"Kameraa ei voi avata."],"Unable to select a file.":[null,"Tiedoston valinta ei onnistu."],"File successfully saved.":[null,"Tiedoston tallennus onnistui."],"File could not be saved.":[null,"Tiedostoa ei voitu tallentaa."],"Clear Field":[null,"Tyhjennä kenttä"],"Dismiss Selection":[null,"Hylkää valinta"],"Cut":[null,"Leikkaa"],"Copy":[null,"Kopioi"],"Paste":[null,"Liitä"],"Select All":[null,"Valitse kaikki"],"Select":[null,"Valitse"],"Copy Link":[null,"Kopioi linkki"],"Save Link As":[null,"Tallenna linkki nimellä"],"Save Image":[null,"Tallenna kuva"],"Copy Image Link":[null,"Kopioi kuvalinkki"],"View Image":[null,"Näytä kuva"],"Inspect Element":[null,"Tutki elementtiä"],"Cancel":[null,"Peruuta"],"Front":[null,"Etupuoli"],"Rear":[null,"Taustapuoli"],"Camera Selection":[null,"Kameran valinta"],"Close":[null,"Sulje"],"Selection":[null,"Valinta"],"JavaScript Alert":[null,"JavaScript-hälytys"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL-varmenteen poikkeus"],"The certificate for this site can't be trusted. ":[null,"Tämän sivuston varmenteeseen ei voi luottaa. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Toinen sivusto saattaa yrittää tekeytyä sivustoksi, jossa yrität vierailla. "],"If you add an exception, you will continue to the site and not be ":[null,"Jos lisäät poikkeuksen, siirryt sivustoon eikä sinua "],"warned next time you view %1$s.":[null,"varoiteta seuraavalla kerralla, kun avaat kohteen %1$s."],"Add Exception":[null,"Lisää poikkeus"],"Security Information":[null,"Suojaustiedot"],"Yes":[null,"Kyllä"],"No":[null,"Ei"],"JavaScript Confirm":[null,"JavaScript-vahvistus"],"JavaScript Prompt":[null,"JavaScript-kehotus"],"Authentication Required":[null,"Todennus pakollinen"],"Can't Connect to the network":[null,"Ei yhteyttä verkkoon"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Annetut välityspalvelimen kirjautumistiedot ovat virheellisiä. Kokeile antaa tiedot uudelleen."],"Connecting to %1$s via SSL connection":[null,"Yhdistetään kohteeseen %1$s SSL-yhteydellä"],"Connecting to %1$s":[null,"Yhdistetään kohteeseen %1$s"],"Username":[null,"Käyttäjätunnus"],"Password":[null,"Salasana"],"Show password":[null,"Näytä salasana"],"Try Again":[null,"Yritä uudelleen"],"Signing In":[null,"Kirjaudutaan"],"Save":[null,"Tallenna"],"Never":[null,"Ei koskaan"],"Ignore":[null,"Ohita"],"Custom Dialog":[null,"Mukautettu valintaikkuna"],"Location Services Off":[null,"Sijaintipalvelut eivät käytössä"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Ota sijaintipalvelut käyttöön asetuksista, jotta voit hyödyntää kaikkia sovelluksen ominaisuuksia."],"Settings":[null,"Asetukset"],"Previous":[null,"Edellinen"],"Next":[null,"Seuraava"],"Submit":[null,"Lähetä"],"Share":[null,"Jaa"]}};});
define("i18n/locale/hi-IN", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"hi-IN","plural_forms":null},"Unable to open the camera.":[null,"कैमरा खोलने में असमर्थ."],"Unable to select a file.":[null,"कोई फ़ाइल चयन करने में असमर्थ."],"File successfully saved.":[null,"फ़ाइल सफलतापूर्वक सहेजी गई."],"File could not be saved.":[null,"फाइल सहेजी नहीं जा सकी."],"Clear Field":[null,"फ़ील्ड साफ़ करें"],"Dismiss Selection":[null,"चयन ख़ारिज करें"],"Cut":[null,"काटें"],"Copy":[null,"कॉपी करें"],"Paste":[null,"चिपकाएं"],"Select All":[null,"सभी का चयन करें"],"Select":[null,"चयन करें"],"Copy Link":[null,"लिंक कॉपी करें"],"Save Link As":[null,"लिंक को इस रूप में सहेजें"],"Save Image":[null,"छवि सहेजें"],"Copy Image Link":[null,"छवि लिंक कॉपी करें"],"View Image":[null,"छवि देखें"],"Inspect Element":[null,"तत्‍व का निरीक्षण करें"],"Cancel":[null,"रद्द करें"],"Front":[null,"अग्र भाग"],"Rear":[null,"पिछला भाग"],"Camera Selection":[null,"कैमरा चयन"],"Close":[null,"बंद करें"],"Selection":[null,"चयन"],"JavaScript Alert":[null,"JavaScript अलर्ट"],"OK":[null,"ठीक"],"SSL Certificate Exception":[null,"SSL प्रमाणपत्र अपवाद"],"The certificate for this site can't be trusted. ":[null,"इस साइट के प्रमाणपत्र पर विश्वास नहीं किया जा सकता. "],"Another site may be impersonating the site you are trying to visit. ":[null,"अन्य साइट उस साइट को प्रतिरूपित कर रही हो सकती है जिस पर आप जाने का प्रयास कर रहे हैं. "],"If you add an exception, you will continue to the site and not be ":[null,"यदि आप कोई अपवाद जोड़ते हैं, तो आप साइट पर जाना जारी रखेंगे और आपको अगली बार "],"warned next time you view %1$s.":[null,"%1$s देखने पर चेतावनी नहीं दी जाएगी."],"Add Exception":[null,"अपवाद जोड़ें"],"Security Information":[null,"सुरक्षा जानकारी"],"Yes":[null,"हां"],"No":[null,"नहीं"],"JavaScript Confirm":[null,"JavaScript पुष्‍टि"],"JavaScript Prompt":[null,"JavaScript संकेत"],"Authentication Required":[null,"प्रमाणीकरण आवश्यक"],"Can't Connect to the network":[null,"नेटवर्क से कनेक्ट नहीं कर सकता"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"प्रॉक्सी के लिए दर्ज लॉगिन जानकारी गलत है. जानकारी को पुन: दर्ज करने का प्रयास करें."],"Connecting to %1$s via SSL connection":[null,"SSL कनेक्शन के माध्यम से %1$s कनेक्ट कर रहा है"],"Connecting to %1$s":[null,"%1$s से कनेक्ट कर रहा है"],"Username":[null,"उपयोगकर्ता नाम"],"Password":[null,"पासवर्ड"],"Show password":[null,"पासवर्ड दिखाएं"],"Try Again":[null,"फिर से प्रयास करें"],"Signing In":[null,"साइन इन करना"],"Save":[null,"सहेजें"],"Never":[null,"कभी नहीं"],"Ignore":[null,"अनदेखा करें"],"Custom Dialog":[null,"कस्टम संवाद"],"Location Services Off":[null,"स्थान सेवाएं ऑफ़ हैं"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"इस अनुप्रयोग की सभी सुविधाओं का लाभ उठाने के लिए सेटिंग्स में स्थान सेवाएँ ऑन करें."],"Settings":[null,"सेटिंग्स"],"Previous":[null,"पिछला"],"Next":[null,"अगला"],"Submit":[null,"सबमिट करें"],"Share":[null,"साझा करें"]}};});
define("i18n/locale/ca-ES", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ca-ES","plural_forms":null},"Unable to open the camera.":[null,"No es pot obrir la càmera."],"Unable to select a file.":[null,"No es pot seleccionar cap fitxer."],"File successfully saved.":[null,"El fitxer s'ha desat correctament."],"File could not be saved.":[null,"No s'ha pogut desar el fitxer."],"Clear Field":[null,"Esborra el camp"],"Dismiss Selection":[null,"Anul·la la selecció"],"Cut":[null,"Retalla"],"Copy":[null,"Copia"],"Paste":[null,"Enganxa"],"Select All":[null,"Selecciona-ho tot"],"Select":[null,"Selecciona"],"Copy Link":[null,"Copia enllaç"],"Save Link As":[null,"Anomena i desa l'enllaç"],"Save Image":[null,"Desa la imatge"],"Copy Image Link":[null,"Copia enllaç d'imatge"],"View Image":[null,"Visualitza la imatge"],"Inspect Element":[null,"Inspecciona element"],"Cancel":[null,"Anul·la"],"Front":[null,"Davant"],"Rear":[null,"Darrere"],"Camera Selection":[null,"Selecció de la càmera"],"Close":[null,"Tanca"],"Selection":[null,"Selecció"],"JavaScript Alert":[null,"Alerta de JavaScript"],"OK":[null,"D'acord"],"SSL Certificate Exception":[null,"Certificat d'excepció d'SSL"],"The certificate for this site can't be trusted. ":[null,"El certificat d'aquest lloc no és de confiança. "],"Another site may be impersonating the site you are trying to visit. ":[null,"És possible que un altre lloc estigui intentant suplantar el lloc que voleu visitar. "],"If you add an exception, you will continue to the site and not be ":[null,"Si afegiu una excepció, us dirigireu al lloc i no rebreu cap avís "],"warned next time you view %1$s.":[null,"la propera vegada que visualitzeu %1$s."],"Add Exception":[null,"Afegeix excepció"],"Security Information":[null,"Informació de seguretat"],"Yes":[null,"Sí"],"No":[null,"No"],"JavaScript Confirm":[null,"Confirmació de JavaScript"],"JavaScript Prompt":[null,"Avís de JavaScript"],"Authentication Required":[null,"Autenticació requerida"],"Can't Connect to the network":[null,"No pot connectar-se amb la xarxa"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"La informació d'inici de sessió introduïda per al proxy no és correcta. Intenteu introduir la informació una altra vegada."],"Connecting to %1$s via SSL connection":[null,"S'està connectant amb %1$s mitjançant la connexió SSL"],"Connecting to %1$s":[null,"S'està connectant amb %1$s"],"Username":[null,"Nom d'usuari"],"Password":[null,"Contrasenya"],"Show password":[null,"Mostra la contrasenya"],"Try Again":[null,"Torna-ho a provar"],"Signing In":[null,"S'està iniciant la sessió"],"Save":[null,"Desa"],"Never":[null,"Mai"],"Ignore":[null,"Ignora"],"Custom Dialog":[null,"Quadre de diàleg personalitzat"],"Location Services Off":[null,"Serveis d'ubicació desactivats"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Activeu els Serveis d'ubicació a la Configuració per poder aprofitar totes les funcions d'aquesta aplicació."],"Settings":[null,"Configuració"],"Previous":[null,"Anterior"],"Next":[null,"Següent"],"Submit":[null,"Envia"],"Share":[null,"Comparteix"]}};});
define("i18n/locale/he-IL", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"he-IL","plural_forms":null},"Unable to open the camera.":[null,"לא ניתן לפתוח את המצלמה."],"Unable to select a file.":[null,"לא ניתן לבחור קובץ."],"File successfully saved.":[null,"הקובץ נשמר בהצלחה."],"File could not be saved.":[null,"לא ניתן לשמור את הקובץ."],"Clear Field":[null,"נקה שדה"],"Dismiss Selection":[null,"בטל בחירה"],"Cut":[null,"גזור"],"Copy":[null,"העתק"],"Paste":[null,"הדבק"],"Select All":[null,"בחר הכול"],"Select":[null,"בחר"],"Copy Link":[null,"העתק קישור"],"Save Link As":[null,"שמור קישור בשם"],"Save Image":[null,"שמור תמונה"],"Copy Image Link":[null,"העתק קישור לתמונה"],"View Image":[null,"הצג תמונה"],"Inspect Element":[null,"בדוק רכיב"],"Cancel":[null,"ביטול"],"Front":[null,"צד קדמי"],"Rear":[null,"צד אחורי"],"Camera Selection":[null,"בחירת מצלמה"],"Close":[null,"סגור"],"Selection":[null,"בחירה"],"JavaScript Alert":[null,"התראת JavaScript"],"OK":[null,"אישור"],"SSL Certificate Exception":[null,"חריג לאישור SSL"],"The certificate for this site can't be trusted. ":[null,"לא ניתן לבטוח באישור עבור אתר זה. "],"Another site may be impersonating the site you are trying to visit. ":[null,"ייתכן שאתר אחר מתחזה לאתר שבו אתה מנסה לבקר. "],"If you add an exception, you will continue to the site and not be ":[null,"אם תוסיף חריג, תמשיך אל האתר ולא "],"warned next time you view %1$s.":[null,"תקבל אזהרה בפעם הבאה שאתה מציג את %1$s."],"Add Exception":[null,"הוסף חריג"],"Security Information":[null,"מידע על אבטחה"],"Yes":[null,"כן"],"No":[null,"לא"],"JavaScript Confirm":[null,"אשר JavaScript"],"JavaScript Prompt":[null,"הודעת הנחיה של JavaScript"],"Authentication Required":[null,"נדרש אימות"],"Can't Connect to the network":[null,"לא ניתן להתחבר לרשת"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"פרטי הכניסה שהוזנו עבור ה-Proxy שגויים. נסה להזין שוב את הפרטים."],"Connecting to %1$s via SSL connection":[null,"מתחבר אל %1$s באמצעות חיבור SSL"],"Connecting to %1$s":[null,"מתחבר אל %1$s"],"Username":[null,"שם משתמש"],"Password":[null,"סיסמה"],"Show password":[null,"הצג סיסמה"],"Try Again":[null,"נסה שוב"],"Signing In":[null,"כניסה"],"Save":[null,"שמור"],"Never":[null,"אף פעם"],"Ignore":[null,"התעלם"],"Custom Dialog":[null,"תיבת דו-שיח מותאמת אישית"],"Location Services Off":[null,"שירותי המיקום מושבתים"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"הפעל את 'שירותי מיקום' ב'הגדרות' כדי לנצל את היתרונות של כל התכונות ביישום זה."],"Settings":[null,"הגדרות"],"Previous":[null,"הקודם"],"Next":[null,"הבא"],"Submit":[null,"שלח"],"Share":[null,"שתף"]}};});
define("i18n/locale/it-IT", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"it-IT","plural_forms":null},"Unable to open the camera.":[null,"Impossibile aprire la fotocamera."],"Unable to select a file.":[null,"Impossibile selezionare un file."],"File successfully saved.":[null,"File salvato."],"File could not be saved.":[null,"Impossibile salvare il file."],"Clear Field":[null,"Cancella campo"],"Dismiss Selection":[null,"Ignora selezione"],"Cut":[null,"Taglia"],"Copy":[null,"Copia"],"Paste":[null,"Incolla"],"Select All":[null,"Seleziona tutto"],"Select":[null,"Seleziona"],"Copy Link":[null,"Copia collegamento"],"Save Link As":[null,"Salva collegamento come"],"Save Image":[null,"Salva immagine"],"Copy Image Link":[null,"Copia collegamento immagine"],"View Image":[null,"Visualizza immagine"],"Inspect Element":[null,"Ispeziona elemento"],"Cancel":[null,"Annulla"],"Front":[null,"Anteriore"],"Rear":[null,"Posteriore"],"Camera Selection":[null,"Selezione fotocamera"],"Close":[null,"Chiudi"],"Selection":[null,"Selezione"],"JavaScript Alert":[null,"Avviso JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Eccezione certificato SSL"],"The certificate for this site can't be trusted. ":[null,"Impossibile verificare l'attendibilità del certificato. "],"Another site may be impersonating the site you are trying to visit. ":[null,"È possibile che un altro sito stia imitando il sito che si sta tentando di visitare. "],"If you add an exception, you will continue to the site and not be ":[null,"Se si aggiunge un'eccezione, si accederà al sito senza "],"warned next time you view %1$s.":[null,"ricevere alcun avviso la prossima volta che si visualizza %1$s."],"Add Exception":[null,"Aggiungi eccezione"],"Security Information":[null,"Informazioni sulla protezione"],"Yes":[null,"Sì"],"No":[null,"No"],"JavaScript Confirm":[null,"Conferma JavaScript"],"JavaScript Prompt":[null,"Richiesta JavaScript"],"Authentication Required":[null,"Autenticazione richiesta"],"Can't Connect to the network":[null,"Impossibile connettersi alla rete"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Le informazioni di accesso immesse per il proxy non sono corrette. Provare a immettere nuovamente le informazioni."],"Connecting to %1$s via SSL connection":[null,"Connessione a %1$s mediante SSL"],"Connecting to %1$s":[null,"Connessione a %1$s"],"Username":[null,"Nome utente"],"Password":[null,"Password"],"Show password":[null,"Mostra password"],"Try Again":[null,"Riprova"],"Signing In":[null,"Accesso"],"Save":[null,"Salva"],"Never":[null,"Mai"],"Ignore":[null,"Ignora"],"Custom Dialog":[null,"Finestra personalizzata"],"Location Services Off":[null,"Servizi di posizionamento disattivati"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Attivare Servizi di posizionamento in Impostazioni per utilizzare tutte le funzioni di questa applicazione."],"Settings":[null,"Impostazioni"],"Previous":[null,"Precedente"],"Next":[null,"Successivo"],"Submit":[null,"Invia"],"Share":[null,"Condividi"]}};});
define("i18n/locale/gl-ES", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"gl-ES","plural_forms":null},"Unable to open the camera.":[null,"Non se pode abrir a cámara."],"Unable to select a file.":[null,"Non se pode seleccionar un ficheiro."],"File successfully saved.":[null,"Ficheiro gardado correctamente."],"File could not be saved.":[null,"Non se puido gardar o ficheiro."],"Clear Field":[null,"Borrar campo"],"Dismiss Selection":[null,"Rexeitar selección"],"Cut":[null,"Cortar"],"Copy":[null,"Copiar"],"Paste":[null,"Pegar"],"Select All":[null,"Seleccionar todo"],"Select":[null,"Seleccionar"],"Copy Link":[null,"Copiar ligazón"],"Save Link As":[null,"Gardar ligazón como"],"Save Image":[null,"Gardar imaxe"],"Copy Image Link":[null,"Copiar ligazón de imaxe"],"View Image":[null,"Ver imaxe"],"Inspect Element":[null,"Inspeccionar elemento"],"Cancel":[null,"Cancelar"],"Front":[null,"Frontal"],"Rear":[null,"Posterior"],"Camera Selection":[null,"Selección de cámara"],"Close":[null,"Pechar"],"Selection":[null,"Selección"],"JavaScript Alert":[null,"Alerta de JavaScript"],"OK":[null,"Aceptar"],"SSL Certificate Exception":[null,"Excepción de certificado SSL"],"The certificate for this site can't be trusted. ":[null,"Non se pode confiar no certificado deste sitio. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Seica outro sitio está a falsificar o que está intentando acceder. "],"If you add an exception, you will continue to the site and not be ":[null,"Se engade unha excepción, continuará no sitio e non "],"warned next time you view %1$s.":[null,"se lle avisará a próxima que vexa %1$s."],"Add Exception":[null,"Engadir excepción"],"Security Information":[null,"Información de seguridade"],"Yes":[null,"Si"],"No":[null,"Non"],"JavaScript Confirm":[null,"Confirmar JavaScript"],"JavaScript Prompt":[null,"Solicitude de JavaScript"],"Authentication Required":[null,"Cómpre autenticación"],"Can't Connect to the network":[null,"Non se pode conectar coa rede"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"A información de inicio de sesión inserida para o proxy non é correcta. Volva escribila."],"Connecting to %1$s via SSL connection":[null,"Conectando con %1$s a través da conexión SSL"],"Connecting to %1$s":[null,"Conectando con %1$s"],"Username":[null,"Nome de usuario"],"Password":[null,"Contrasinal"],"Show password":[null,"Amosar contrasinal"],"Try Again":[null,"Volver intentar"],"Signing In":[null,"Iniciando sesión"],"Save":[null,"Gardar"],"Never":[null,"Nunca"],"Ignore":[null,"Ignorar"],"Custom Dialog":[null,"Cadro de diálogo personalizado"],"Location Services Off":[null,"Servizos de localización desactivados"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Active os servizos de localización en Configuración para beneficiarse de todas as funcións desta aplicación."],"Settings":[null,"Configuración"],"Previous":[null,"Anterior"],"Next":[null,"Seguinte"],"Submit":[null,"Enviar"],"Share":[null,"Compartir"]}};});
define("i18n/locale/nl-NL", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"nl-NL","plural_forms":null},"Unable to open the camera.":[null,"Kan de camera niet openen."],"Unable to select a file.":[null,"Kan geen bestand selecteren."],"File successfully saved.":[null,"Bestand opgeslagen."],"File could not be saved.":[null,"Bestand kan niet worden opgeslagen."],"Clear Field":[null,"Veld wissen"],"Dismiss Selection":[null,"Selectie ongedaan maken"],"Cut":[null,"Knippen"],"Copy":[null,"Kopiëren"],"Paste":[null,"Plakken"],"Select All":[null,"Alles selecteren"],"Select":[null,"Selecteren"],"Copy Link":[null,"Koppeling kopiëren"],"Save Link As":[null,"Koppeling opslaan als"],"Save Image":[null,"Afbeelding opslaan"],"Copy Image Link":[null,"Koppeling naar afbeelding kopiëren"],"View Image":[null,"Afbeelding bekijken"],"Inspect Element":[null,"Element inspecteren"],"Cancel":[null,"Annuleren"],"Front":[null,"Voorzijde"],"Rear":[null,"Achterzijde"],"Camera Selection":[null,"Cameraselectie"],"Close":[null,"Sluiten"],"Selection":[null,"Selectie"],"JavaScript Alert":[null,"JavaScript-waarschuwing"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Uitzondering SSL-certificaat"],"The certificate for this site can't be trusted. ":[null,"Het certificaat voor deze site is niet betrouwbaar. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Een andere site imiteert mogelijk de site die u probeert te bezoeken. "],"If you add an exception, you will continue to the site and not be ":[null,"Als u een uitzondering toevoegt, gaat u verder naar de site en "],"warned next time you view %1$s.":[null,"krijgt u geen waarschuwing als u %1$s de volgende keer opent."],"Add Exception":[null,"Uitzondering toevoegen"],"Security Information":[null,"Beveiligingsgegevens"],"Yes":[null,"Ja"],"No":[null,"Nee"],"JavaScript Confirm":[null,"JavaScript bevestigen"],"JavaScript Prompt":[null,"Toestemming vragen voor JavaScript"],"Authentication Required":[null,"Verificatie vereist"],"Can't Connect to the network":[null,"Kan geen verbinding maken met netwerk"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"De aanmeldingsgegevens die voor de proxy zijn ingevoerd, zijn onjuist. Voer de gegevens opnieuw in."],"Connecting to %1$s via SSL connection":[null,"Verbinding maken met %1$s via SSL-verbinding..."],"Connecting to %1$s":[null,"Verbinding maken met %1$s..."],"Username":[null,"Gebruikersnaam"],"Password":[null,"Wachtwoord"],"Show password":[null,"Wachtwoord weergeven"],"Try Again":[null,"Opnieuw proberen"],"Signing In":[null,"Aanmelden..."],"Save":[null,"Opslaan"],"Never":[null,"Nooit"],"Ignore":[null,"Negeren"],"Custom Dialog":[null,"Dialoogvenster Aangepast"],"Location Services Off":[null,"Locatieservices uitgeschakeld"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Schakel onder Instellingen de Locatieservices in om gebruik te maken van alle functies van deze app."],"Settings":[null,"Instellingen"],"Previous":[null,"Vorige"],"Next":[null,"Volgende"],"Submit":[null,"Verzenden"],"Share":[null,"Delen"]}};});
define("i18n/locale/tr-TR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"tr-TR","plural_forms":null},"Unable to open the camera.":[null,"Kamera açılamıyor."],"Unable to select a file.":[null,"Bir dosya seçilemiyor."],"File successfully saved.":[null,"Dosya başarıyla kaydedildi."],"File could not be saved.":[null,"Dosya kaydedilemedi."],"Clear Field":[null,"Alanı Sil"],"Dismiss Selection":[null,"Seçime Son Ver"],"Cut":[null,"Kes"],"Copy":[null,"Kopyala"],"Paste":[null,"Yapıştır"],"Select All":[null,"Tümünü Seç"],"Select":[null,"Seç"],"Copy Link":[null,"Bağlantıyı Kopyala"],"Save Link As":[null,"Bağlantıyı Farklı Kaydet"],"Save Image":[null,"Resmi Kaydet"],"Copy Image Link":[null,"Resim Bağlantısını Kopyala"],"View Image":[null,"Resmi Görüntüle"],"Inspect Element":[null,"Öğeyi İncele"],"Cancel":[null,"İptal"],"Front":[null,"Ön"],"Rear":[null,"Arka"],"Camera Selection":[null,"Kamera Seçimi"],"Close":[null,"Kapat"],"Selection":[null,"Seçim"],"JavaScript Alert":[null,"JavaScript Uyarısı"],"OK":[null,"Tamam"],"SSL Certificate Exception":[null,"SSL Sertifikası İstisnası"],"The certificate for this site can't be trusted. ":[null,"Bu sitenin sertifikasına güvenilemiyor. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Başka bir site, ziyaret etmeye çalıştığınız siteyi taklit etmeye çalışıyor olabilir. "],"If you add an exception, you will continue to the site and not be ":[null,"Bir istisna eklerseniz, siteye devam edeceksiniz ve bir sonraki "],"warned next time you view %1$s.":[null,"%1$s görüntülemenizde uyarı almayacaksınız."],"Add Exception":[null,"İstisna Ekle"],"Security Information":[null,"Güvenlik Bilgileri"],"Yes":[null,"Evet"],"No":[null,"Hayır"],"JavaScript Confirm":[null,"JavaScript Onayı"],"JavaScript Prompt":[null,"JavaScript İstemi"],"Authentication Required":[null,"Kimlik Doğrulama Gerekli"],"Can't Connect to the network":[null,"Şebekeye bağlanılamıyor"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Proxy için girilen oturum açma bilgileri yanlış. Bilgileri girmeyi tekrar deneyin."],"Connecting to %1$s via SSL connection":[null,"SSL bağlantısı yoluyla %1$s ile bağlantı kuruluyor"],"Connecting to %1$s":[null,"%1$s ile bağlantı kuruluyor"],"Username":[null,"Kullanıcı Adı"],"Password":[null,"Parola"],"Show password":[null,"Parolayı göster"],"Try Again":[null,"Tekrar Dene"],"Signing In":[null,"Oturum Açılıyor"],"Save":[null,"Kaydet"],"Never":[null,"Hiçbir Zaman"],"Ignore":[null,"Yoksay"],"Custom Dialog":[null,"Özel İletişim Kutusu"],"Location Services Off":[null,"Konum Servisleri Kapalı"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Bu uygulamanın tüm özelliklerinden yararlanmak için Ayarlar'dan Konum Servisleri'ni açın."],"Settings":[null,"Ayarlar"],"Previous":[null,"Geri"],"Next":[null,"İleri"],"Submit":[null,"Gönder"],"Share":[null,"Paylaş"]}};});
define("i18n/locale/th-TH", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"th-TH","plural_forms":null},"Unable to open the camera.":[null,"ไม่สามารถเปิดกล้องได้"],"Unable to select a file.":[null,"ไม่สามารถเลือกไฟล์ได้"],"File successfully saved.":[null,"บันทึกไฟล์สำเร็จ"],"File could not be saved.":[null,"ไม่สามารถบันทึกไฟล์ได้"],"Clear Field":[null,"ล้างฟิลด์"],"Dismiss Selection":[null,"ยกเลิกการเลือก"],"Cut":[null,"ตัด"],"Copy":[null,"คัดลอก"],"Paste":[null,"วาง"],"Select All":[null,"เลือกทั้งหมด"],"Select":[null,"เลือก"],"Copy Link":[null,"คัดลอกลิงค์"],"Save Link As":[null,"บันทึกลิงค์เป็น"],"Save Image":[null,"บันทึกภาพ"],"Copy Image Link":[null,"คัดลอกลิงค์ภาพ"],"View Image":[null,"ดูภาพ"],"Inspect Element":[null,"ตรวจสอบอีลิเมนต์"],"Cancel":[null,"ยกเลิก"],"Front":[null,"ด้านหน้า"],"Rear":[null,"ด้านหลัง"],"Camera Selection":[null,"การเลือกกล้อง"],"Close":[null,"ปิด"],"Selection":[null,"การเลือก"],"JavaScript Alert":[null,"การเตือน JavaScript"],"OK":[null,"ตกลง"],"SSL Certificate Exception":[null,"ข้อยกเว้นใบรับรอง SSL"],"The certificate for this site can't be trusted. ":[null,"ใบรับรองสำหรับไซต์นี้ไม่น่าเชื่อถือ "],"Another site may be impersonating the site you are trying to visit. ":[null,"ไซต์อื่นอาจกำลังปลอมตัวเป็นไซต์ที่คุณพยายามเยี่ยมชม "],"If you add an exception, you will continue to the site and not be ":[null,"หากคุณเพิ่มข้อยกเว้นไซต์ คุณจะดำเนินการต่อไปยังไซต์ได้ และไม่ได้ "],"warned next time you view %1$s.":[null,"รับคำเตือนในครั้งถัดไปที่คุณดู %1$s"],"Add Exception":[null,"เพิ่มข้อยกเว้น"],"Security Information":[null,"ข้อมูลการรักษาความปลอดภัย"],"Yes":[null,"ใช่"],"No":[null,"ไม่"],"JavaScript Confirm":[null,"การยืนยัน JavaScript"],"JavaScript Prompt":[null,"พรอมต์ JavaScript"],"Authentication Required":[null,"ต้องมีการตรวจสอบสิทธิ์"],"Can't Connect to the network":[null,"ไม่สามารถเชื่อมต่อกับเครือข่ายได้"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"ข้อมูลล็อกอินที่ป้อนสำหรับพร็อกซีไม่ถูกต้อง ลองป้อนข้อมูลอีกครั้ง"],"Connecting to %1$s via SSL connection":[null,"กำลังเชื่อมต่อกับ %1$s ผ่านการเชื่อมต่อ SSL"],"Connecting to %1$s":[null,"กำลังเชื่อมต่อกับ %1$s"],"Username":[null,"ชื่อผู้ใช้"],"Password":[null,"รหัสผ่าน"],"Show password":[null,"แสดงรหัสผ่าน"],"Try Again":[null,"ลองอีกครั้ง"],"Signing In":[null,"กำลังไซน์อิน"],"Save":[null,"บันทึก"],"Never":[null,"ไม่"],"Ignore":[null,"ละเว้น"],"Custom Dialog":[null,"กล่องโต้ตอบที่กำหนดเอง"],"Location Services Off":[null,"ปิดบริการตามตำแหน่ง"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"เปิดบริการตามตำแหน่งในการตั้งค่าเพื่อใช้คุณสมบัติทั้งหมดในแอปพลิเคชันนี้"],"Settings":[null,"การตั้งค่า"],"Previous":[null,"ก่อนหน้า"],"Next":[null,"ถัดไป"],"Submit":[null,"ส่ง"],"Share":[null,"แบ่งปัน"]}};});
define("i18n/locale/el-GR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"el-GR","plural_forms":null},"Unable to open the camera.":[null,"Δεν είναι δυνατό το άνοιγμα της κάμερας."],"Unable to select a file.":[null,"Δεν είναι δυνατή η επιλογή αρχείου."],"File successfully saved.":[null,"Η αποθήκευση του αρχείου ολοκληρώθηκε με επιτυχία."],"File could not be saved.":[null,"Δεν ήταν δυνατή η αποθήκευση του αρχείου."],"Clear Field":[null,"Διαγραφή πεδίου"],"Dismiss Selection":[null,"Απόρριψη επιλογής"],"Cut":[null,"Αποκοπή"],"Copy":[null,"Αντιγραφή"],"Paste":[null,"Επικόλληση"],"Select All":[null,"Επιλογή όλων"],"Select":[null,"Επιλογή"],"Copy Link":[null,"Αντιγραφή συνδέσμου"],"Save Link As":[null,"Αποθήκευση συνδέσμου ως"],"Save Image":[null,"Αποθήκευση εικόνας"],"Copy Image Link":[null,"Αντιγραφή συνδέσμου εικόνας"],"View Image":[null,"Προβολή εικόνας"],"Inspect Element":[null,"Έλεγχος στοιχείου"],"Cancel":[null,"Άκυρο"],"Front":[null,"Εμπρός"],"Rear":[null,"Πίσω"],"Camera Selection":[null,"Επιλογή κάμερας"],"Close":[null,"Κλείσιμο"],"Selection":[null,"Επιλογή"],"JavaScript Alert":[null,"Ειδοποίηση JavaScript"],"OK":[null,"ΟΚ"],"SSL Certificate Exception":[null,"Εξαίρεση πιστοποιητικού SSL"],"The certificate for this site can't be trusted. ":[null,"Το πιστοποιητικό για αυτήν την τοποθεσία δεν είναι αξιόπιστο. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Μια άλλη τοποθεσία μπορεί να μιμείται την τοποθεσία που προσπαθείτε να επισκεφθείτε. "],"If you add an exception, you will continue to the site and not be ":[null,"Εάν προσθέσετε μια εξαίρεση, θα συνεχίσετε στην τοποθεσία και δεν θα "],"warned next time you view %1$s.":[null,"ειδοποιηθείτε την επόμενη φορά που θα προβάλετε το %1$s."],"Add Exception":[null,"Προσθήκη εξαίρεσης"],"Security Information":[null,"Πληροφορίες ασφαλείας"],"Yes":[null,"Ναι"],"No":[null,"Όχι"],"JavaScript Confirm":[null,"Επιβεβαίωση JavaScript"],"JavaScript Prompt":[null,"Ερώτηση JavaScript"],"Authentication Required":[null,"Απαιτείται έλεγχος ταυτότητας"],"Can't Connect to the network":[null,"Δεν είναι δυνατή η σύνδεση στο δίκτυο"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Οι πληροφορίες σύνδεσης που πληκτρολογήσατε για το διακομιστή μεσολάβησης είναι εσφαλμένες. Δοκιμάστε να πληκτρολογήσετε ξανά τις πληροφορίες."],"Connecting to %1$s via SSL connection":[null,"Γίνεται σύνδεση σε %1$s μέσω σύνδεσης SSL"],"Connecting to %1$s":[null,"Γίνεται σύνδεση σε %1$s"],"Username":[null,"Όνομα χρήστη"],"Password":[null,"Κωδικός πρόσβασης"],"Show password":[null,"Εμφάνιση κωδικού πρόσβασης"],"Try Again":[null,"Δοκιμάστε ξανά"],"Signing In":[null,"Σύνδεση σε εξέλιξη"],"Save":[null,"Αποθήκευση"],"Never":[null,"Ποτέ"],"Ignore":[null,"Αγνόηση"],"Custom Dialog":[null,"Προσαρμοσμένο παράθυρο διαλόγου"],"Location Services Off":[null,"Απενεργοποίηση υπηρεσιών εντοπισμού θέσης"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Ενεργοποιήστε τις Υπηρεσίες θέσης στις Ρυθμίσεις για να επωφεληθείτε από όλες τις λειτουργίες σε αυτήν την εφαρμογή."],"Settings":[null,"Ρυθμίσεις"],"Previous":[null,"Προηγούμενο"],"Next":[null,"Επόμενο"],"Submit":[null,"Υποβολή"],"Share":[null,"Κοινή χρήση"]}};});
define("i18n/locale/hr-HR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"hr-HR","plural_forms":null},"Unable to open the camera.":[null,"Fotoaparat se ne može otvoriti."],"Unable to select a file.":[null,"Datoteka se ne može odabrati."],"File successfully saved.":[null,"Datoteka je uspješno spremljena."],"File could not be saved.":[null,"Spremanje datoteke nije uspjelo."],"Clear Field":[null,"Očisti polje"],"Dismiss Selection":[null,"Odbaci odabir"],"Cut":[null,"Rezanje"],"Copy":[null,"Kopiraj"],"Paste":[null,"Zalijepi"],"Select All":[null,"Odaberi sve"],"Select":[null,"Odaberi"],"Copy Link":[null,"Kopiraj vezu"],"Save Link As":[null,"Spremi vezu kao"],"Save Image":[null,"Spremi sliku"],"Copy Image Link":[null,"Kopiraj vezu slike"],"View Image":[null,"Prikaži sliku"],"Inspect Element":[null,"Provjeri element"],"Cancel":[null,"Odustani"],"Front":[null,"Prednji"],"Rear":[null,"Stražnji"],"Camera Selection":[null,"Odabir fotoaparata"],"Close":[null,"Zatvori"],"Selection":[null,"Odabir"],"JavaScript Alert":[null,"JavaScript upozorenje"],"OK":[null,"U redu"],"SSL Certificate Exception":[null,"Iznimka SSL certifikata"],"The certificate for this site can't be trusted. ":[null,"Certifikat za ovo web-mjesto nije pouzdan. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Drugo web-mjesto možda oponaša web-mjesto koje pokušavate posjetiti. "],"If you add an exception, you will continue to the site and not be ":[null,"Ako dodate iznimku, nastavit ćete s otvaranjem web-mjesta i "],"warned next time you view %1$s.":[null,"sljedeći put kada otvorite %1$s neće se prikazati upozorenje."],"Add Exception":[null,"Dodaj iznimku"],"Security Information":[null,"Informacije o zaštiti"],"Yes":[null,"Da"],"No":[null,"Ne"],"JavaScript Confirm":[null,"JavaScript potvrda"],"JavaScript Prompt":[null,"JavaScript odzivnik"],"Authentication Required":[null,"Potrebna provjera autentičnosti"],"Can't Connect to the network":[null,"Ne može se uspostaviti veza s mrežom"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Podaci za prijavu uneseni za proxy nisu točni. Pokušajte ponovo unijeti podatke."],"Connecting to %1$s via SSL connection":[null,"Povezivanje s %1$s putem SSL veze"],"Connecting to %1$s":[null,"Povezivanje s %1$s"],"Username":[null,"Korisničko ime"],"Password":[null,"Lozinka"],"Show password":[null,"Prikaži lozinku"],"Try Again":[null,"Pokušajte ponovo"],"Signing In":[null,"Prijava u tijeku"],"Save":[null,"Spremi"],"Never":[null,"Nikad"],"Ignore":[null,"Ignoriraj"],"Custom Dialog":[null,"Prilagođeni dijaloški okvir"],"Location Services Off":[null,"Lokacijske usluge su isključene"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Uključite Lokacijske usluge u Postavkama kako biste iskoristili prednosti svih značajki ove aplikacije."],"Settings":[null,"Postavke"],"Previous":[null,"Prethodno"],"Next":[null,"Sljedeće"],"Submit":[null,"Podnesi"],"Share":[null,"Podijeli"]}};});
define("i18n/locale/ja-JP", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ja-JP","plural_forms":null},"Unable to open the camera.":[null,"カメラを開けません。"],"Unable to select a file.":[null,"ファイルを選択できません。"],"File successfully saved.":[null,"ファイルは正常に保存されました。"],"File could not be saved.":[null,"ファイルを保存できませんでした。"],"Clear Field":[null,"フィールドをクリア"],"Dismiss Selection":[null,"選択を解除"],"Cut":[null,"切り取り"],"Copy":[null,"コピー"],"Paste":[null,"貼り付け"],"Select All":[null,"すべて選択"],"Select":[null,"選択"],"Copy Link":[null,"リンクをコピー"],"Save Link As":[null,"リンクに名前を付けて保存"],"Save Image":[null,"画像を保存"],"Copy Image Link":[null,"画像リンクをコピー"],"View Image":[null,"画像を表示"],"Inspect Element":[null,"要素を確認"],"Cancel":[null,"キャンセル"],"Front":[null,"前面"],"Rear":[null,"背面"],"Camera Selection":[null,"カメラ選択"],"Close":[null,"閉じる"],"Selection":[null,"選択"],"JavaScript Alert":[null,"JavaScriptの通知"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL証明書の例外"],"The certificate for this site can't be trusted. ":[null,"このサイトの証明書は信頼できません。 "],"Another site may be impersonating the site you are trying to visit. ":[null,"別のサイトが、アクセスしようとしているサイトになりすましている可能性があります。 "],"If you add an exception, you will continue to the site and not be ":[null,"例外を追加すると、サイトを引き続き使用でき、次回に%1$sを表示した "],"warned next time you view %1$s.":[null,"ときに警告メッセージは表示されません。"],"Add Exception":[null,"例外を追加"],"Security Information":[null,"セキュリティ情報"],"Yes":[null,"はい"],"No":[null,"いいえ"],"JavaScript Confirm":[null,"JavaScriptの確認"],"JavaScript Prompt":[null,"JavaScriptのプロンプト"],"Authentication Required":[null,"認証が必要です"],"Can't Connect to the network":[null,"ネットワークに接続できません"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"プロキシ用に入力したログイン情報が間違っています。入力し直してみてください。"],"Connecting to %1$s via SSL connection":[null,"SSL接続経由で%1$sに接続しています"],"Connecting to %1$s":[null,"%1$sに接続しています"],"Username":[null,"ユーザー名"],"Password":[null,"パスワード"],"Show password":[null,"パスワードを表示"],"Try Again":[null,"再度実行"],"Signing In":[null,"サインインしています"],"Save":[null,"保存"],"Never":[null,"なし"],"Ignore":[null,"無視"],"Custom Dialog":[null,"カスタムダイアログ"],"Location Services Off":[null,"位置情報サービスオフ"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"このアプリケーションのすべての機能を活用するには、[設定]で位置情報サービスをオンにします。"],"Settings":[null,"設定"],"Previous":[null,"前へ"],"Next":[null,"次へ"],"Submit":[null,"送信"],"Share":[null,"共有"]}};});
define("i18n/locale/ro-RO", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ro-RO","plural_forms":null},"Unable to open the camera.":[null,"Nu se poate deschide camera foto."],"Unable to select a file.":[null,"Nu se poate selecta un fişier."],"File successfully saved.":[null,"Fişier salvat cu succes."],"File could not be saved.":[null,"Fişierul nu a putut fi salvat."],"Clear Field":[null,"Golire câmp"],"Dismiss Selection":[null,"Eliminare selectare"],"Cut":[null,"Decupare"],"Copy":[null,"Copiere"],"Paste":[null,"Lipire"],"Select All":[null,"Selectare toate"],"Select":[null,"Selectare"],"Copy Link":[null,"Copiere legătură"],"Save Link As":[null,"Salvare legătură ca"],"Save Image":[null,"Salvare imagine"],"Copy Image Link":[null,"Copiere legătură la imagine"],"View Image":[null,"Vizualizare imagine"],"Inspect Element":[null,"Inspectare element"],"Cancel":[null,"Anulare"],"Front":[null,"Faţă"],"Rear":[null,"Spate"],"Camera Selection":[null,"Selecţie cameră foto"],"Close":[null,"Închidere"],"Selection":[null,"Selecţie"],"JavaScript Alert":[null,"Alertă JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Excepţie certificat SSL"],"The certificate for this site can't be trusted. ":[null,"Certificatul pentru acest site nu poate fi creditat. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Este posibil ca alt site să simuleze site-ul pe care încercaţi să-l vizitaţi. "],"If you add an exception, you will continue to the site and not be ":[null,"Dacă adăugaţi o excepţie, veţi continua pe site şi nu veţi fi "],"warned next time you view %1$s.":[null,"avertizat(ă) data viitoare când vizualizaţi %1$s."],"Add Exception":[null,"Adăugare excepţie"],"Security Information":[null,"Informaţii de securitate"],"Yes":[null,"Da"],"No":[null,"Nu"],"JavaScript Confirm":[null,"Confirmare JavaScript"],"JavaScript Prompt":[null,"Solicitare JavaScript"],"Authentication Required":[null,"Este necesară autentificarea"],"Can't Connect to the network":[null,"Conectarea la reţea este imposibilă"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Informaţiile de conectare introduse pentru proxy sunt incorecte. Încercaţi să le introduceţi din nou."],"Connecting to %1$s via SSL connection":[null,"Conectare la %1$s prin conexiune SSL"],"Connecting to %1$s":[null,"Conectare la %1$s"],"Username":[null,"Nume de utilizator"],"Password":[null,"Parolă"],"Show password":[null,"Afişare parolă"],"Try Again":[null,"Încercaţi din nou"],"Signing In":[null,"Conectare"],"Save":[null,"Salvare"],"Never":[null,"Niciodată"],"Ignore":[null,"Ignorare"],"Custom Dialog":[null,"Dialog personalizat"],"Location Services Off":[null,"Servicii de localizare oprite"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Activaţi serviciile de localizare din Setări pentru a beneficia de toate caracteristicile acestei aplicaţii."],"Settings":[null,"Setări"],"Previous":[null,"Anteriorul"],"Next":[null,"Următorul"],"Submit":[null,"Trimitere"],"Share":[null,"Partajare"]}};});
define("i18n/locale/eu-ES", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"eu-ES","plural_forms":null},"Unable to open the camera.":[null,"Ezin izan da kamera ireki."],"Unable to select a file.":[null,"Ezin izan da fitxategia hautatu."],"File successfully saved.":[null,"Fitxategia ondo gorde da."],"File could not be saved.":[null,"Ezin izan da fitxategirik gorde."],"Clear Field":[null,"Garbitu eremua"],"Dismiss Selection":[null,"Utzi hautaketa"],"Cut":[null,"Ebaki"],"Copy":[null,"Kopiatu"],"Paste":[null,"Itsatsi"],"Select All":[null,"Hautatu guztiak"],"Select":[null,"Hautatu"],"Copy Link":[null,"Kopiatu esteka"],"Save Link As":[null,"Gorde esteka honela"],"Save Image":[null,"Gorde irudia"],"Copy Image Link":[null,"Kopiatu irudiaren esteka"],"View Image":[null,"Ikusi irudia"],"Inspect Element":[null,"Ikuskatu elementua"],"Cancel":[null,"Utzi"],"Front":[null,"Aurrealdea"],"Rear":[null,"Atzealdea"],"Camera Selection":[null,"Kameraren hautaketa"],"Close":[null,"Itxi"],"Selection":[null,"Hautaketa"],"JavaScript Alert":[null,"JavaScript-en alerta"],"OK":[null,"Ados"],"SSL Certificate Exception":[null,"SSL ziurtagiriaren salbuespena"],"The certificate for this site can't be trusted. ":[null,"Gune honen ziurtagiria ez da fidagarria. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Baliteke beste gune bat bisitatu nahi duzun gunearen identitatea ordezkatzen aritzea. "],"If you add an exception, you will continue to the site and not be ":[null,"Salbuespen bat gehitu baduzu, gunera jarraituko duzu eta ez zaizu "],"warned next time you view %1$s.":[null,"abisatuko %1$s ikusten duzun hurrengo aldian."],"Add Exception":[null,"Gehitu salbuespena"],"Security Information":[null,"Segurtasun-informazioa"],"Yes":[null,"Bai"],"No":[null,"Ez"],"JavaScript Confirm":[null,"JavaScript-en berrespena"],"JavaScript Prompt":[null,"JavaScript-en galdera"],"Authentication Required":[null,"Autentifikazioa behar da"],"Can't Connect to the network":[null,"Ezin da sarera konektatu"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Proxyan saioa hasteko idatzitako informazioa okerra da. Idatzi informazioa berriro."],"Connecting to %1$s via SSL connection":[null,"%1$s(e)ra konektatzen SSL konexio bidez"],"Connecting to %1$s":[null,"%1$s(e)ra konektatzen"],"Username":[null,"Erabiltzaile-izena"],"Password":[null,"Pasahitza"],"Show password":[null,"Erakutsi pasahitza"],"Try Again":[null,"Saiatu berriro"],"Signing In":[null,"Saioa hasten"],"Save":[null,"Gorde"],"Never":[null,"Inoiz ere ez"],"Ignore":[null,"Egin ez ikusi"],"Custom Dialog":[null,"Pertsonalizatu elkarrizketa"],"Location Services Off":[null,"Kokapen-zerbitzuak desaktibatuta"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Aktibatu kokapen-zerbitzuak ezarpenetan, aplikazio honetako eginbide guztiei etekina ateratzeko."],"Settings":[null,"Ezarpenak"],"Previous":[null,"Aurrekoa"],"Next":[null,"Hurrengoa"],"Submit":[null,"Bidali"],"Share":[null,"Partekatu"]}};});
define("i18n/locale/id-ID", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"id-ID","plural_forms":null},"Unable to open the camera.":[null,"Tidak bisa membuka kamera."],"Unable to select a file.":[null,"Tidak bisa memilih file."],"File successfully saved.":[null,"File berhasil disimpan."],"File could not be saved.":[null,"File tidak bisa disimpan."],"Clear Field":[null,"Kosongkan Bidang"],"Dismiss Selection":[null,"Hilangkan Pilihan"],"Cut":[null,"Potong"],"Copy":[null,"Salin"],"Paste":[null,"Tempel"],"Select All":[null,"Pilih Semua"],"Select":[null,"Pilih"],"Copy Link":[null,"Salin Tautan"],"Save Link As":[null,"Simpan Tautan Sebagai"],"Save Image":[null,"Simpan Gambar"],"Copy Image Link":[null,"Salin Tautan Gambar"],"View Image":[null,"Lihat Gambar"],"Inspect Element":[null,"Periksa Elemen"],"Cancel":[null,"Batal"],"Front":[null,"Depan"],"Rear":[null,"Belakang"],"Camera Selection":[null,"Pilihan Kamera"],"Close":[null,"Tutup"],"Selection":[null,"Pilihan"],"JavaScript Alert":[null,"Tanda JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Pengecualian Sertifikat SSL"],"The certificate for this site can't be trusted. ":[null,"Sertifikat untuk situs ini tidak dapat dipercaya. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Situs lain mungkin meniru situs yang Anda coba kunjungi. "],"If you add an exception, you will continue to the site and not be ":[null,"Jika menambah pengecualian, Anda akan melanjutkan ke situs tersebut dan tidak akan "],"warned next time you view %1$s.":[null,"diperingatkan lain kali Anda melihat %1$s."],"Add Exception":[null,"Tambahkan Pengecualian"],"Security Information":[null,"Informasi Keamanan"],"Yes":[null,"Ya"],"No":[null,"Tidak"],"JavaScript Confirm":[null,"Konfirmasi JavaScript"],"JavaScript Prompt":[null,"Konfirmasi JavaScript"],"Authentication Required":[null,"Diperlukan Autentikasi"],"Can't Connect to the network":[null,"Tidak Dapat Terhubung ke jaringan"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Informasi login yang dimasukkan untuk proxy salah. Coba masukkan informasi itu lagi."],"Connecting to %1$s via SSL connection":[null,"Menghubungkan ke %1$s melalui koneksi SSL"],"Connecting to %1$s":[null,"Menghubungkan ke %1$s"],"Username":[null,"Nama Pengguna"],"Password":[null,"Kata Sandi"],"Show password":[null,"Tampilkan kata sandi"],"Try Again":[null,"Coba Lagi"],"Signing In":[null,"Sign-In"],"Save":[null,"Simpan"],"Never":[null,"Tidak Pernah"],"Ignore":[null,"Abaikan"],"Custom Dialog":[null,"Dialog Khusus"],"Location Services Off":[null,"Layanan Lokasi Mati"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Hidupkan Layanan Lokasi dalam Setelan untuk memanfaatkan semua fitur dalam aplikasi ini."],"Settings":[null,"Setelan"],"Previous":[null,"Sebelumnya"],"Next":[null,"Berikutnya"],"Submit":[null,"Kirim"],"Share":[null,"Bagikan"]}};});
define("i18n/locale/pl-PL", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"pl-PL","plural_forms":null},"Unable to open the camera.":[null,"Nie można otworzyć aparatu."],"Unable to select a file.":[null,"Nie można wybrać pliku."],"File successfully saved.":[null,"Udało się zapisać plik."],"File could not be saved.":[null,"Nie można zapisać pliku."],"Clear Field":[null,"Wyczyść pole"],"Dismiss Selection":[null,"Odrzuć zaznaczenie"],"Cut":[null,"Wytnij"],"Copy":[null,"Kopiuj"],"Paste":[null,"Wklej"],"Select All":[null,"Zaznacz wszystko"],"Select":[null,"Wybierz"],"Copy Link":[null,"Kopiuj łącze"],"Save Link As":[null,"Zapisz łącze jako"],"Save Image":[null,"Zapisz obraz"],"Copy Image Link":[null,"Kopiuj łącze do obrazu"],"View Image":[null,"Pokaż obraz"],"Inspect Element":[null,"Sprawdź element"],"Cancel":[null,"Anuluj"],"Front":[null,"Przód"],"Rear":[null,"Tył"],"Camera Selection":[null,"Wybór kamery"],"Close":[null,"Zamknij"],"Selection":[null,"Zaznaczenie"],"JavaScript Alert":[null,"Alarm JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Wyjątek certyfikatu SSL"],"The certificate for this site can't be trusted. ":[null,"Nie można zaufać certyfikatowi tej witryny. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Inna witryna może się podszywać pod witrynę, którą chcesz odwiedzić. "],"If you add an exception, you will continue to the site and not be ":[null,"Jeżeli dodasz wyjątek, przejdziesz do tej witryny i nie "],"warned next time you view %1$s.":[null,"zostaniesz ostrzeżony, gdy następnym razem wyświetlisz %1$s."],"Add Exception":[null,"Dodaj wyjątek"],"Security Information":[null,"Informacje o zabezpieczeniach"],"Yes":[null,"Tak"],"No":[null,"Nie"],"JavaScript Confirm":[null,"Potwierdzenie JavaScript"],"JavaScript Prompt":[null,"Monit JavaScript"],"Authentication Required":[null,"Wymagane uwierzytelnienie"],"Can't Connect to the network":[null,"Nie można połączyć z siecią"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Informacje dotyczące serwera proxy są nieprawidłowe. Spróbuj ponownie wprowadzić informacje."],"Connecting to %1$s via SSL connection":[null,"Łączenie z %1$s za pośrednictwem SSL"],"Connecting to %1$s":[null,"Łączenie z %1$s"],"Username":[null,"Nazwa użytkownika"],"Password":[null,"Hasło"],"Show password":[null,"Pokaż hasło"],"Try Again":[null,"Spróbuj ponownie,"],"Signing In":[null,"Zarejestruj"],"Save":[null,"Zapisz"],"Never":[null,"Nigdy"],"Ignore":[null,"Ignoruj"],"Custom Dialog":[null,"Niestandardowe okno dialogowe"],"Location Services Off":[null,"Usługi lokalizacyjne wyłączone"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Włącz Usługi lokalizacyjne w Ustawieniach, aby skorzystać z wszystkich funkcji tej aplikacji."],"Settings":[null,"Ustawienia"],"Previous":[null,"Poprzedni"],"Next":[null,"Następny"],"Submit":[null,"Prześlij"],"Share":[null,"Udostępnij"]}};});
define("i18n/locale/nb-NO", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"nb-NO","plural_forms":null},"Unable to open the camera.":[null,"Kan ikke åpne kamera."],"Unable to select a file.":[null,"Kan ikke velge fil."],"File successfully saved.":[null,"Filen er lagret."],"File could not be saved.":[null,"Filen kan ikke lagres."],"Clear Field":[null,"Tøm felt"],"Dismiss Selection":[null,"Forkast utvalg"],"Cut":[null,"Klipp ut"],"Copy":[null,"Kopier"],"Paste":[null,"Lim inn"],"Select All":[null,"Velg alle"],"Select":[null,"Velg"],"Copy Link":[null,"Kopier kobling"],"Save Link As":[null,"Lagre kobling som"],"Save Image":[null,"Lagre bilde"],"Copy Image Link":[null,"Kopier bildekobling"],"View Image":[null,"Vis bilde"],"Inspect Element":[null,"Undersøk element"],"Cancel":[null,"Avbryt"],"Front":[null,"Forside"],"Rear":[null,"Bakside"],"Camera Selection":[null,"Kameravalg"],"Close":[null,"Lukk"],"Selection":[null,"Utvalg"],"JavaScript Alert":[null,"JavaScript-varsel"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Unntak for SSL-sertifikat"],"The certificate for this site can't be trusted. ":[null,"Sertifikatet for dette området kan ikke klareres. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Det kan hende at et annet område utgir seg for å være området som du prøver å gå til. "],"If you add an exception, you will continue to the site and not be ":[null,"Hvis du legger til et unntak, vil du kunne gå til området uten å "],"warned next time you view %1$s.":[null,"få noen advarsel neste gang du viser %1$s."],"Add Exception":[null,"Legg til unntak"],"Security Information":[null,"Sikkerhetsinformasjon"],"Yes":[null,"Ja"],"No":[null,"Nei"],"JavaScript Confirm":[null,"JavaScript-bekreftelse"],"JavaScript Prompt":[null,"JavaScript-spørring"],"Authentication Required":[null,"Krever godkjenning"],"Can't Connect to the network":[null,"Kan ikke koble til nettverket"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Den angitte påloggingsinformasjonen for proxy er feil. Prøv å legge inn informasjonen på nytt."],"Connecting to %1$s via SSL connection":[null,"Kobler til %1$s via SSL-tilkobling"],"Connecting to %1$s":[null,"Kobler til %1$s"],"Username":[null,"Brukernavn"],"Password":[null,"Passord"],"Show password":[null,"Vis passord"],"Try Again":[null,"Prøv på nytt"],"Signing In":[null,"Logger på"],"Save":[null,"Lagre"],"Never":[null,"Aldri"],"Ignore":[null,"Ignorer"],"Custom Dialog":[null,"Egendefinert dialog"],"Location Services Off":[null,"Posisjonstjenester Av"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Gå til Innstillinger og slå på Posisjonstjenester for å få fullt utbytte av alle programmets funksjoner."],"Settings":[null,"Innstillinger"],"Previous":[null,"Forrige"],"Next":[null,"Neste"],"Submit":[null,"Send inn"],"Share":[null,"Del"]}};});
define("i18n/locale/pt-BR", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"pt-BR","plural_forms":null},"Unable to open the camera.":[null,"Não foi possível abrir a câmera."],"Unable to select a file.":[null,"Não foi possível selecionar um arquivo."],"File successfully saved.":[null,"Arquivo salvo com êxito."],"File could not be saved.":[null,"Não foi possível salvar o arquivo."],"Clear Field":[null,"Limpar campo"],"Dismiss Selection":[null,"Descartar seleção"],"Cut":[null,"Recortar"],"Copy":[null,"Copiar"],"Paste":[null,"Colar"],"Select All":[null,"Selecionar tudo"],"Select":[null,"Selecionar"],"Copy Link":[null,"Copiar link"],"Save Link As":[null,"Salvar link como"],"Save Image":[null,"Salvar imagem"],"Copy Image Link":[null,"Copiar link da imagem"],"View Image":[null,"Exibir imagem"],"Inspect Element":[null,"Inspecionar elemento"],"Cancel":[null,"Cancelar"],"Front":[null,"Frente"],"Rear":[null,"Trás"],"Camera Selection":[null,"Seleção de câmera"],"Close":[null,"Fechar"],"Selection":[null,"Seleção"],"JavaScript Alert":[null,"Alerta de JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Exceção de certificado SSL"],"The certificate for this site can't be trusted. ":[null,"O certificado para este site não pode ser confiável. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Outro site pode estar personificando o site que você está tentando visitar. "],"If you add an exception, you will continue to the site and not be ":[null,"Se adicionar uma exceção, você continuará e acessará e site e não será "],"warned next time you view %1$s.":[null,"alertado a próxima vez que visualizar %1$s."],"Add Exception":[null,"Adicionar exceção"],"Security Information":[null,"Informações de segurança"],"Yes":[null,"Sim"],"No":[null,"Não"],"JavaScript Confirm":[null,"Confirmação do JavaScript"],"JavaScript Prompt":[null,"Prompt do JavaScript"],"Authentication Required":[null,"Autenticação obrigatória"],"Can't Connect to the network":[null,"Não é possível conectar-se à rede"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"As informações de login inseridas para o proxy estão incorretas. Experimente inserir as informações novamente."],"Connecting to %1$s via SSL connection":[null,"Conectando a %1$s via conexão SSL"],"Connecting to %1$s":[null,"Conectando a %1$s"],"Username":[null,"Nome de usuário"],"Password":[null,"Senha"],"Show password":[null,"Mostrar senha"],"Try Again":[null,"Tentar novamente"],"Signing In":[null,"Conectando"],"Save":[null,"Salvar"],"Never":[null,"Nunca"],"Ignore":[null,"Ignorar"],"Custom Dialog":[null,"Caixa de diálogo personalizada"],"Location Services Off":[null,"Serviços de localização desativados"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Ative os Serviços de localização em Ajustes para desfrutar de todos os recursos deste aplicativo."],"Settings":[null,"Configurações"],"Previous":[null,"Anterior"],"Next":[null,"Próxima"],"Submit":[null,"Carregar"],"Share":[null,"Compartilhar"]}};});
define("i18n/locale/en-GB", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"en-GB","plural_forms":null},"Unable to open the camera.":[null,"Unable to open the camera."],"Unable to select a file.":[null,"Unable to select a file."],"File successfully saved.":[null,"File successfully saved."],"File could not be saved.":[null,"File could not be saved."],"Clear Field":[null,"Clear Field"],"Dismiss Selection":[null,"Dismiss Selection"],"Cut":[null,"Cut"],"Copy":[null,"Copy"],"Paste":[null,"Paste"],"Select All":[null,"Select All"],"Select":[null,"Select"],"Copy Link":[null,"Copy Link"],"Save Link As":[null,"Save Link As"],"Save Image":[null,"Save Image"],"Copy Image Link":[null,"Copy Image Link"],"View Image":[null,"View Image"],"Inspect Element":[null,"Inspect Element"],"Cancel":[null,"Cancel"],"Front":[null,"Front"],"Rear":[null,"Rear"],"Camera Selection":[null,"Camera Selection"],"Close":[null,"Close"],"Selection":[null,"Selection"],"JavaScript Alert":[null,"JavaScript Alert"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"SSL Certificate Exception"],"The certificate for this site can't be trusted. ":[null,"The certificate for this site can't be trusted. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Another site may be impersonating the site you are trying to visit. "],"If you add an exception, you will continue to the site and not be ":[null,"If you add an exception, you will continue to the site and not be "],"warned next time you view %1$s.":[null,"warned next time you view %1$s."],"Add Exception":[null,"Add Exception"],"Security Information":[null,"Security Information"],"Yes":[null,"Yes"],"No":[null,"No"],"JavaScript Confirm":[null,"JavaScript Confirm"],"JavaScript Prompt":[null,"JavaScript Prompt"],"Authentication Required":[null,"Authentication Required"],"Can't Connect to the network":[null,"Can't Connect to the network"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"The login information entered for the proxy is incorrect. Try entering the information again."],"Connecting to %1$s via SSL connection":[null,"Connecting to %1$s via SSL connection"],"Connecting to %1$s":[null,"Connecting to %1$s"],"Username":[null,"Username"],"Password":[null,"Password"],"Show password":[null,"Show password"],"Try Again":[null,"Try Again"],"Signing In":[null,"Signing In"],"Save":[null,"Save"],"Never":[null,"Never"],"Ignore":[null,"Ignore"],"Custom Dialog":[null,"Custom Dialog"],"Location Services Off":[null,"Location Services Off"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Turn on Location Services in Settings to take advantage of all the features in this app."],"Settings":[null,"Settings"],"Previous":[null,"Previous"],"Next":[null,"Next"],"Submit":[null,"Submit"],"Share":[null,"Share"]}};});
define("i18n/locale/cs-CZ", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"cs-CZ","plural_forms":null},"Unable to open the camera.":[null,"Fotoaparát nelze otevřít."],"Unable to select a file.":[null,"Soubor nelze vybrat."],"File successfully saved.":[null,"Soubor byl úspěšně uložen."],"File could not be saved.":[null,"Soubor nelze uložit."],"Clear Field":[null,"Vymazat pole"],"Dismiss Selection":[null,"Zrušit výběr"],"Cut":[null,"Vyjmout"],"Copy":[null,"Kopírovat"],"Paste":[null,"Vložit"],"Select All":[null,"Vybrat vše"],"Select":[null,"Vybrat"],"Copy Link":[null,"Kopírovat odkaz"],"Save Link As":[null,"Uložit odkaz jako"],"Save Image":[null,"Uložit obrázek"],"Copy Image Link":[null,"Kopírovat odkaz na obrázek"],"View Image":[null,"Zobrazení snímku"],"Inspect Element":[null,"Zkontrolovat prvek"],"Cancel":[null,"Zrušit"],"Front":[null,"Vpřed"],"Rear":[null,"Zadní"],"Camera Selection":[null,"Výběr fotoaparátu"],"Close":[null,"Zavřít"],"Selection":[null,"Výběr"],"JavaScript Alert":[null,"Výstraha JavaScript"],"OK":[null,"OK"],"SSL Certificate Exception":[null,"Výjimka certifikátu SSL"],"The certificate for this site can't be trusted. ":[null,"Certifikát pro tento web není důvěryhodný. "],"Another site may be impersonating the site you are trying to visit. ":[null,"Za web, který se snažíte navštívit, může vystupovat jiný web. "],"If you add an exception, you will continue to the site and not be ":[null,"Pokud přidáte výjimku, budete pokračovat na web a při příštím "],"warned next time you view %1$s.":[null,"zobrazení %1$s nebudete varováni."],"Add Exception":[null,"Přidat výjimku"],"Security Information":[null,"Informace zabezpečení"],"Yes":[null,"Ano"],"No":[null,"Ne"],"JavaScript Confirm":[null,"Potvrzení JavaScript"],"JavaScript Prompt":[null,"Výzva JavaScript"],"Authentication Required":[null,"Je vyžadováno ověření"],"Can't Connect to the network":[null,"Nelze se připojit k síti"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"Přihlašovací údaje zadané pro server proxy jsou nesprávné. Zkuste je zadat znovu."],"Connecting to %1$s via SSL connection":[null,"Připojování k %1$s pomocí připojení SSL"],"Connecting to %1$s":[null,"Připojování k %1$s"],"Username":[null,"Uživatelské jméno"],"Password":[null,"Heslo"],"Show password":[null,"Zobrazit heslo"],"Try Again":[null,"Zkusit znovu"],"Signing In":[null,"Přihlášení"],"Save":[null,"Uložit"],"Never":[null,"Nikdy"],"Ignore":[null,"Ignorovat"],"Custom Dialog":[null,"Vlastní dialogové okno"],"Location Services Off":[null,"Služby určení polohy vypnuté"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"Zapněte služby určení polohy v nastaveních a využívejte všechny funkce této aplikace."],"Settings":[null,"Nastavení"],"Previous":[null,"Předchozí"],"Next":[null,"Další"],"Submit":[null,"Odeslat"],"Share":[null,"Sdílet"]}};});
define("i18n/locale/ar-EG", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"ar-EG","plural_forms":null},"Unable to open the camera.":[null,"تعذّر فتح الكاميرا."],"Unable to select a file.":[null,"تعذر تحديد ملف."],"File successfully saved.":[null,"تم حفظ الملف بنجاح."],"File could not be saved.":[null,"تعذَّر حفظ الملف."],"Clear Field":[null,"مسح الحقل"],"Dismiss Selection":[null,"استبعاد التحديد"],"Cut":[null,"قص"],"Copy":[null,"نسخ"],"Paste":[null,"لصق"],"Select All":[null,"تحديد الكل"],"Select":[null,"تحديد"],"Copy Link":[null,"نسخ الرابط"],"Save Link As":[null,"حفظ الرابط كـ"],"Save Image":[null,"حفظ الصورة"],"Copy Image Link":[null,"نسخ رابط الصورة"],"View Image":[null,"عرض الصورة"],"Inspect Element":[null,"فحص العنصر"],"Cancel":[null,"إلغاء"],"Front":[null,"أمامية"],"Rear":[null,"خلفية"],"Camera Selection":[null,"تحديد الكاميرا"],"Close":[null,"إغلاق"],"Selection":[null,"تحديد"],"JavaScript Alert":[null,"تنبيه JavaScript"],"OK":[null,"موافق"],"SSL Certificate Exception":[null,"استثناء شهادة SSL"],"The certificate for this site can't be trusted. ":[null,"لا يمكن الوثوق في شهادة هذا الموقع. "],"Another site may be impersonating the site you are trying to visit. ":[null,"قد ينتحل موقع آخر صفة الموقع الذي تحاول زيارته. "],"If you add an exception, you will continue to the site and not be ":[null,"إذا قمت بإضافة استثناء، فستواصل الانتقال إلى الموقع ولن يتم "],"warned next time you view %1$s.":[null,"تحذيرك في المرة التالية التي تقوم فيها بعرض %1$s."],"Add Exception":[null,"إضافة استثناء"],"Security Information":[null,"معلومات الحماية"],"Yes":[null,"نعم"],"No":[null,"لا"],"JavaScript Confirm":[null,"تأكيد JavaScript"],"JavaScript Prompt":[null,"مطالبة JavaScript"],"Authentication Required":[null,"المصادقة مطلوبة"],"Can't Connect to the network":[null,"تعذر الاتصال بالشبكة"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"إن المعلومات التي تم إدخالها للبروكسي غير صحيحة. حاول إدخال المعلومات مجددًا."],"Connecting to %1$s via SSL connection":[null,"الاتصال بـ %1$s عبر اتصال SSL"],"Connecting to %1$s":[null,"الاتصال بـ %1$s"],"Username":[null,"اسم المستخدم"],"Password":[null,"كلمة السر"],"Show password":[null,"إظهار كلمة السر"],"Try Again":[null,"إعادة المحاولة"],"Signing In":[null,"تسجيل الدخول"],"Save":[null,"حفظ"],"Never":[null,"أبدًا"],"Ignore":[null,"تجاهل"],"Custom Dialog":[null,"حوار مخصص"],"Location Services Off":[null,"إيقاف تشغيل خدمات الموقع"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"قم بتشغيل خدمات الموقع في الإعدادات للاستفادة من ميزات هذا التطبيق."],"Settings":[null,"الإعدادات"],"Previous":[null,"السابق"],"Next":[null,"التالي"],"Submit":[null,"إرسال"],"Share":[null,"مشاركة"]}};});
define("i18n/locale/zh-CN", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"zh-CN","plural_forms":null},"Unable to open the camera.":[null,"无法打开相机。"],"Unable to select a file.":[null,"无法选择文件。"],"File successfully saved.":[null,"文件成功保存。"],"File could not be saved.":[null,"文件无法保存。"],"Clear Field":[null,"清除字段"],"Dismiss Selection":[null,"取消选择"],"Cut":[null,"剪切"],"Copy":[null,"复制"],"Paste":[null,"粘贴"],"Select All":[null,"全選"],"Select":[null,"选择"],"Copy Link":[null,"复制链接"],"Save Link As":[null,"链接另存为"],"Save Image":[null,"保存图像"],"Copy Image Link":[null,"复制图像链接"],"View Image":[null,"查看图像"],"Inspect Element":[null,"检查元素"],"Cancel":[null,"取消"],"Front":[null,"前置"],"Rear":[null,"后置"],"Camera Selection":[null,"相机选择"],"Close":[null,"关闭"],"Selection":[null,"选择"],"JavaScript Alert":[null,"JavaScript 提醒"],"OK":[null,"确定"],"SSL Certificate Exception":[null,"SSL 证书例外"],"The certificate for this site can't be trusted. ":[null,"此站点的证书不可信。 "],"Another site may be impersonating the site you are trying to visit. ":[null,"其他站点可能正冒充您尝试访问的站点。 "],"If you add an exception, you will continue to the site and not be ":[null,"如果添加例外，将会继续访问该站点， "],"warned next time you view %1$s.":[null,"并在下次查看 %1$s 时不会出现警告。"],"Add Exception":[null,"添加例外"],"Security Information":[null,"安全信息"],"Yes":[null,"是"],"No":[null,"否"],"JavaScript Confirm":[null,"JavaScript 确认"],"JavaScript Prompt":[null,"JavaScript 提示"],"Authentication Required":[null,"要求身份验证"],"Can't Connect to the network":[null,"无法连接至网络"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"为代理输入的登录信息不正确。请尝试重新输入信息。"],"Connecting to %1$s via SSL connection":[null,"正在通过 SSL 连接至 %1$s"],"Connecting to %1$s":[null,"正在连接至 %1$s"],"Username":[null,"用户名"],"Password":[null,"密码"],"Show password":[null,"显示密码"],"Try Again":[null,"重试"],"Signing In":[null,"正在登录"],"Save":[null,"保存"],"Never":[null,"从不"],"Ignore":[null,"忽略"],"Custom Dialog":[null,"自定义对话框"],"Location Services Off":[null,"定位服务关闭"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"打开“设置”中的“定位服务”，以利用此应用程序中的所有功能。"],"Settings":[null,"设置"],"Previous":[null,"上一步"],"Next":[null,"下一步"],"Submit":[null,"提交"],"Share":[null,"共享"]}};});
define("i18n/locale/zh-TW", function (require, exports, module) {
module.exports = {"messages":{"":{"domain":"messages","lang":"zh-TW","plural_forms":null},"Unable to open the camera.":[null,"無法開啟相機。"],"Unable to select a file.":[null,"無法選擇檔案。"],"File successfully saved.":[null,"已成功儲存檔案。"],"File could not be saved.":[null,"無法儲存檔案。"],"Clear Field":[null,"清除欄位"],"Dismiss Selection":[null,"解除選取範圍"],"Cut":[null,"剪下"],"Copy":[null,"複製"],"Paste":[null,"貼上"],"Select All":[null,"全選"],"Select":[null,"選擇"],"Copy Link":[null,"複製連結"],"Save Link As":[null,"另存連結"],"Save Image":[null,"儲存影像"],"Copy Image Link":[null,"複製影像連結"],"View Image":[null,"檢視影像"],"Inspect Element":[null,"檢查元素"],"Cancel":[null,"取消"],"Front":[null,"前置"],"Rear":[null,"後置"],"Camera Selection":[null,"相機選擇"],"Close":[null,"關閉"],"Selection":[null,"選擇項目"],"JavaScript Alert":[null,"JavaScript 警示"],"OK":[null,"確定"],"SSL Certificate Exception":[null,"SSL 憑證例外狀況"],"The certificate for this site can't be trusted. ":[null,"無法信任此網站的憑證。 "],"Another site may be impersonating the site you are trying to visit. ":[null,"您目前嘗試瀏覽的網站可能是假冒的惡意網站。 "],"If you add an exception, you will continue to the site and not be ":[null,"如果您新增例外狀況，將會繼續連線至該網站， "],"warned next time you view %1$s.":[null,"而且當您下次檢視 %1$s 時，不會出現警告。"],"Add Exception":[null,"新增例外狀況"],"Security Information":[null,"安全性資訊"],"Yes":[null,"是"],"No":[null,"否"],"JavaScript Confirm":[null,"JavaScript 確認"],"JavaScript Prompt":[null,"JavaScript 提示"],"Authentication Required":[null,"需要驗證"],"Can't Connect to the network":[null,"無法連線至網路"],"The login information entered for the proxy is incorrect. Try entering the information again.":[null,"針對 Proxy 輸入的登入資訊不正確。請嘗試重新輸入資訊。"],"Connecting to %1$s via SSL connection":[null,"透過 SSL 連線連至 %1$s"],"Connecting to %1$s":[null,"連線至 %1$s"],"Username":[null,"使用者名稱"],"Password":[null,"密碼"],"Show password":[null,"顯示密碼"],"Try Again":[null,"再試一次"],"Signing In":[null,"正在登入"],"Save":[null,"儲存"],"Never":[null,"永不"],"Ignore":[null,"忽略"],"Custom Dialog":[null,"自訂對話方塊"],"Location Services Off":[null,"定位服務關閉"],"Turn on Location Services in Settings to take advantage of all the features in this app.":[null,"開啟「設定」中的「定位服務」，充分運用此應用程式中的所有功能。"],"Settings":[null,"設定"],"Previous":[null,"上一步"],"Next":[null,"下一步"],"Submit":[null,"送出"],"Share":[null,"分享"]}};});


/*
 * Copyright 2010-2011 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

if (!qnx.webplatform) {
    qnx.webplatform = {};
}

qnx.webplatform.i18n = require('i18n');



}());