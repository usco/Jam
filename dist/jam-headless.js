/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "./dist/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(1);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	var _view = __webpack_require__(2);

	var _view2 = _interopRequireDefault(_view);

	var _rx = __webpack_require__(26);

	var _rx2 = _interopRequireDefault(_rx);

	var _fs = __webpack_require__(23);

	var _fs2 = _interopRequireDefault(_fs);

	var _utils = __webpack_require__(27);

	var _meshUtils = __webpack_require__(28);

	var _glViewHelpers = __webpack_require__(20);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//BIG hack, because parsers are browserified modules ...
	global.Rx = _rx2.default;
	var stlParser = __webpack_require__(29);
	var objParser = __webpack_require__(30);
	//import * as stlParser from 'usco-stl-parser'
	//import * as objParser from 'usco-obj-parser'

	var centerMesh = _glViewHelpers.meshTools.centerMesh;

	//TODO: refactor ,same as assetManager
	function postProcessParsedData(data) {
	  var mesh = data;
	  mesh = (0, _meshUtils.geometryFromBuffers)(mesh);
	  mesh = (0, _meshUtils.postProcessMesh)(mesh);
	  mesh = centerMesh(mesh);
	  return mesh;
	}

	/*import makeHttpDriver     from '../../core/drivers/simpleHttpDriver'
	import {requests,resources} from '../../utils/assetManager'
	let httpDriver   = makeHttpDriver()*/

	//see http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
	function toArrayBuffer(buffer) {
	  var ab = new ArrayBuffer(buffer.length);
	  var view = new Uint8Array(ab);
	  for (var i = 0; i < buffer.length; ++i) {
	    view[i] = buffer[i];
	  }
	  return ab;
	}

	/////////deal with command line args etc
	var args = process.argv.slice(2);

	if (args.length > 0) {
	  (function () {

	    //more advanced params handling , for later
	    /*
	      console.log("params",args)
	      let params = args.reduce(function(cur,combo){
	      let [name,val]= cur.split("=")
	      combo[name] = val
	    },{})*/

	    var uri = args[0];

	    var _args$1$split$map = args[1].split("x").map(function (e) {
	      return parseInt(e);
	    });

	    var _args$1$split$map2 = _slicedToArray(_args$1$split$map, 2);

	    var width = _args$1$split$map2[0];
	    var height = _args$1$split$map2[1];

	    var _getNameAndExtension = (0, _utils.getNameAndExtension)(uri);

	    var name = _getNameAndExtension.name;
	    var ext = _getNameAndExtension.ext;

	    var resolution = { width: width, height: height };
	    var outputPath = uri + '.png';

	    console.log("Running renderer with params", uri, resolution, outputPath);

	    var parsers = {};
	    parsers["stl"] = stlParser.default;
	    parsers["obj"] = objParser.default;

	    var data = toArrayBuffer(_fs2.default.readFileSync(uri));
	    var parse = parsers[ext];
	    var parseOptions = {};
	    var parsedObs$ = parse(data, parseOptions);

	    var data$ = parsedObs$.filter(function (e) {
	      return e.progress === undefined;
	    }) //seperate out progress data
	    .map(postProcessParsedData).forEach(function (mesh) {
	      (0, _view2.default)({ mesh: mesh, uri: outputPath, resolution: resolution });
	    });

	    /*let uris = args
	    const requests$ = Rx.Observable.from(uris)
	     .map(function(uri){
	        return {
	          url:uri
	          ,method:'get'
	          ,type:'resource'
	        }
	      })
	     const responses$ = httpDriver(requests$)
	      responses$
	        .forEach(e=>console.log("responses",e))
	    //resources()*/
	  })();
	}

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = view;

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	var _utils = __webpack_require__(4);

	var _presets = __webpack_require__(10);

	var _EffectComposer = __webpack_require__(11);

	var _EffectComposer2 = _interopRequireDefault(_EffectComposer);

	var _ShaderPass = __webpack_require__(12);

	var _ShaderPass2 = _interopRequireDefault(_ShaderPass);

	var _RenderPass = __webpack_require__(13);

	var _RenderPass2 = _interopRequireDefault(_RenderPass);

	var _MaskPass = __webpack_require__(14);

	var _CopyShader = __webpack_require__(15);

	var _CopyShader2 = _interopRequireDefault(_CopyShader);

	var _FXAAShader = __webpack_require__(16);

	var _FXAAShader2 = _interopRequireDefault(_FXAAShader);

	var _vignetteShader = __webpack_require__(17);

	var _vignetteShader2 = _interopRequireDefault(_vignetteShader);

	var _EdgeShader = __webpack_require__(18);

	var _EdgeShader2 = _interopRequireDefault(_EdgeShader);

	var _AdditiveBlendShader = __webpack_require__(19);

	var _AdditiveBlendShader2 = _interopRequireDefault(_AdditiveBlendShader);

	var _glViewHelpers = __webpack_require__(20);

	var _LabeledGrid = __webpack_require__(21);

	var _LabeledGrid2 = _interopRequireDefault(_LabeledGrid);

	var _bufferToPng = __webpack_require__(22);

	var _bufferToPng2 = _interopRequireDefault(_bufferToPng);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; } //default configuration for lighting, cameras etc

	var zoomToFit = _glViewHelpers.objectEffects.zoomToFit;

	var gl = __webpack_require__(25)(); //(width, height, { preserveDrawingBuffer: true })

	//console.log("helpers.grids",helpers,helpers.grids)
	//let LabeledGrid = helpers.grids.LabeledGrid
	var ShadowPlane = _glViewHelpers.planes.ShadowPlane;

	function makeGlRendering() {}

	//Helpers for offline Rendering

	function contextToBuffer(gl, width, height) {
	  var depth = arguments.length <= 3 || arguments[3] === undefined ? 4 : arguments[3];

	  var buffer = new Uint8Array(width * height * depth);
	  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, buffer);
	  return buffer;
	}

	function writeBufferToFile(buffer, width, height, path) {
	  (0, _bufferToPng2.default)(buffer, width, height, path);
	}

	function writeContextToFile(context, width, height, depth) {
	  var path = arguments.length <= 4 || arguments[4] === undefined ? "./test.png" : arguments[4];

	  var buffer = contextToBuffer(context, width, height, depth);
	  writeBufferToFile(buffer, width, height, path);
	}

	//////////////////////////////////////////////////

	function setupPostProcess(renderer, camera, scene, params) {
	  var width = params.width;
	  var height = params.height;
	  var devicePixelRatio = params.devicePixelRatio;
	  var renderToScreen = params.renderToScreen;
	  ////////post processing

	  var renderTargetParameters = {
	    minFilter: _three2.default.LinearFilter,
	    magFilter: _three2.default.LinearFilter,
	    format: _three2.default.RGBAFormat,
	    stencilBuffer: true
	  };

	  var outScene = new _three2.default.Scene();
	  var maskScene = new _three2.default.Scene();

	  var renderTarget = new _three2.default.WebGLRenderTarget(width, height, renderTargetParameters);

	  //setup composer
	  var composer = new _EffectComposer2.default(renderer);
	  composer.renderTarget1.stencilBuffer = true;
	  composer.renderTarget2.stencilBuffer = true;

	  var normal = new _RenderPass2.default(scene, camera);
	  var outline = new _RenderPass2.default(outScene, camera);
	  var maskPass = new _three2.default.MaskPass(maskScene, camera);
	  maskPass.inverse = true;
	  var clearMask = new _three2.default.ClearMaskPass();
	  var copyPass = new _three2.default.ShaderPass(_three2.default.CopyShader);
	  var fxaaPass = new _three2.default.ShaderPass(_three2.default.FXAAShader);
	  var vignettePass = new _three2.default.ShaderPass(_three2.default.VignetteShader);

	  fxaaPass.uniforms['resolution'].value.set(1 / width * devicePixelRatio, 1 / height * devicePixelRatio);
	  vignettePass.uniforms["offset"].value = 0.95;
	  vignettePass.uniforms["darkness"].value = 0.9;

	  renderer.autoClear = false;
	  //renderer.autoClearStencil = false   
	  outline.clear = false;
	  //normal.clear = false   

	  composer.addPass(normal);
	  composer.addPass(maskPass);
	  composer.addPass(outline);

	  composer.addPass(clearMask);
	  //composer.addPass(vignettePass)
	  //composer.addPass(fxaaPass)
	  composer.addPass(copyPass);

	  var lastPass = composer.passes[composer.passes.length - 1];
	  lastPass.renderToScreen = renderToScreen;

	  return { composers: [composer], fxaaPass: fxaaPass, outScene: outScene, maskScene: maskScene };

	  //return {composer:finalComposer, fxaaPass, outScene, maskScene, composers:[normalComposer,depthComposer,finalComposer]}
	}

	function setupPostProcess2(renderer, camera, scene, params) {

	  //FIXME hack
	  if (!renderer.context.canvas) {
	    renderer.context.canvas = {
	      width: params.width,
	      height: params.height
	    };
	  }

	  var ppData = setupPostProcess(renderer, camera, scene, params);
	  //composer = ppData.composer
	  var composers = ppData.composers;
	  /*fxaaPass = ppData.fxaaPass
	  outScene = ppData.outScene
	  maskScene = ppData.maskScene*/
	  return composers;
	}

	///various helpers

	function makeOfflineCanvas() {
	  // mock object, not used in our test case, might be problematic for some workflow
	  var canvas = new Object();
	  canvas.addEventListener = function (e, b) {
	    //only for contextLost
	    //console.log("canvas addEventListener",e,b)
	  };
	  return canvas;
	}

	function makeLiveCanvas() {
	  var canvas = document.createElement('canvas');
	  return canvas;
	}

	function makeCanvas() {
	  if (typeof window !== 'undefined') {
	    return makeLiveCanvas();
	  }
	  return makeOfflineCanvas();
	}

	function handleResize(sizeInfos) {
	  //log.debug("setting glView size",sizeInfos)
	  console.log("setting glView size", sizeInfos);
	  var width = sizeInfos.width;
	  var height = sizeInfos.height;
	  var aspect = sizeInfos.aspect;

	  if (width > 0 && height > 0 && camera && renderer) {
	    (function () {
	      renderer.setSize(width, height);
	      camera.aspect = aspect;
	      camera.setSize(width, height);
	      camera.updateProjectionMatrix();

	      var pixelRatio = window.devicePixelRatio || 1;
	      fxaaPass.uniforms['resolution'].value.set(1 / (width * pixelRatio), 1 / (height * pixelRatio));

	      composers.forEach(function (c) {
	        c.reset();
	        c.setSize(width * pixelRatio, height * pixelRatio);
	      });
	    })();
	  }
	}

	function setupWindowSpecific(container, renderer, camera) {
	  console.log("initializing into container", container);
	  container.appendChild(renderer.domElement);

	  //controls are only needed for live aka browser mode
	  var controls = (0, _utils.makeControls)(config.controls[0]);
	  var transformControls = new TransformControls(camera);
	  //controls, transformControls

	  //prevents zooming the 3d view from scrolling the window
	  preventScroll(container);
	  transformControls.setDomElement(container);

	  //more init
	  controls.setObservables(actions.filteredInteractions$);
	  controls.addObject(camera);

	  //let pixelRatio = window.devicePixelRatio || 1
	  return {
	    updateables: [controls, transformControls]
	  };
	}

	function setupNodeSpecific(renderer, camera, scene) {
	  camera.lookAt(scene.position);
	}

	function monkeyPatchGl(gl) {

	  function checkObject(object) {
	    return (typeof object === 'undefined' ? 'undefined' : _typeof(object)) === 'object' || object === void 0;
	  }

	  //Don't allow: ", $, `, @, \, ', \0
	  function isValidString(str) {
	    return !/[\"\$\`\@\\\'\0]/.test(str);
	  }

	  function checkWrapper(context, object, wrapper) {
	    if (!checkValid(object, wrapper)) {
	      setError(context, gl.INVALID_VALUE);
	      return false;
	    } else if (!checkOwns(context, object)) {
	      setError(context, gl.INVALID_OPERATION);
	      return false;
	    }
	    return true;
	  }

	  function shaderSource(shader, source) {
	    if (!checkObject(shader)) {
	      throw new TypeError('shaderSource(WebGLShader, String)');
	    }
	    if (!shader || !source && typeof source !== 'string') {
	      setError(this, gl.INVALID_VALUE);
	      return;
	    }
	    source += '';
	    if (!isValidString(source)) {
	      setError(this, gl.INVALID_VALUE);
	      return;
	    } else if (checkWrapper(this, shader, WebGLShader)) {

	      //patch
	      if (source.indexOf('precision') >= 0) {

	        //'#ifdef GL_ES',
	        var sourceChunks = source.split('\n');

	        sourceChunks.map(function (chunk) {
	          console.log("chunk", chunk);
	        });

	        //sourceChunks = sourceChunks.concat(['#endif'])
	        source = sourceChunks.concat('\n');
	      }

	      _shaderSource.call(this, shader._ | 0, wrapShader(shader._type, source));
	      shader._source = source;
	    }
	  }
	  //gl.shaderSource = shaderSource.bind(gl)
	  return gl;

	  //gl.shaderSource()
	  //
	}

	function render(renderer, composers, camera, scene) {
	  composers.forEach(function (c) {
	    return c.render();
	  });
	  //renderer.render(scene, camera)

	  /*let width = 640
	  let height = 480
	  let rtTexture = new THREE.WebGLRenderTarget(width, height, {
	    minFilter: THREE.LinearFilter,
	    magFilter: THREE.NearestFilter,
	    format: THREE.RGBAFormat
	  })
	   renderer.render(scene, camera, rtTexture, true)*/

	  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse2' ].value = composers[0].renderTarget2
	  //composer.passes[composer.passes.length-1].uniforms[ 'tDiffuse3' ].value = composers[1].renderTarget2
	}

	function setupScene(scene, extras, config) {
	  config.scenes["main"]
	  //TODO , update to be more generic
	  .map(function (light) {
	    return (0, _utils.makeLight)(light);
	  }).forEach(function (light) {
	    return scene.add(light);
	  });

	  return scene;
	}

	function setupRenderer(canvas, context, config) {
	  var pixelRatio = 1;

	  var renderer = new _three2.default.WebGLRenderer({
	    antialias: false,
	    preserveDrawingBuffer: true,
	    //width: 0,
	    //height: 0,
	    canvas: canvas,
	    context: context
	  });
	  renderer.setClearColor("#fff");
	  renderer.setPixelRatio(pixelRatio);
	  Object.keys(config.renderer).map(function (key) {
	    //TODO add hasOwnProp check
	    renderer[key] = config.renderer[key];
	  });

	  console.log("renderer setup DONE");

	  return renderer;
	}

	function getDefaultsWindowSpecific() {
	  var params = {
	    width: window.innerWidth,
	    height: window.innerHeight,
	    pixelRatio: window.devicePixelRatio || 1
	  };
	  return params;
	}

	function makeDefaults(data) {
	  var params = {
	    width: resolution.width,
	    height: resolution.height,
	    devicePixelRatio: 1,
	    renderToScreen: typeof window !== 'undefined' //FALSE if you want server side renders
	  };
	}

	//////////////////////////////////////////////////

	function view(data) {
	  var mesh = data.mesh;
	  var uri = data.uri;
	  var resolution = data.resolution;

	  var config = _presets.presets;
	  var params = {
	    width: resolution.width,
	    height: resolution.height,
	    devicePixelRatio: 1,
	    renderToScreen: typeof window !== 'undefined' //FALSE if you want server side renders
	  };

	  gl = monkeyPatchGl(gl);

	  var renderer = null;
	  var composer = null;
	  var composers = [];
	  var outScene = null;
	  var maskScene = null;

	  var scene = new _three2.default.Scene();
	  var dynamicInjector = new _three2.default.Object3D(); //all dynamic mapped objects reside here
	  scene.dynamicInjector = dynamicInjector;
	  scene.add(dynamicInjector);

	  var camera = (0, _utils.makeCamera)(config.cameras[0], params);
	  //let grid        = new LabeledGrid(200, 200, 10, config.cameras[0].up) //needs CANVAS....
	  var shadowPlane = new ShadowPlane(2000, 2000, null, config.cameras[0].up);

	  var material = new _three2.default.ShaderMaterial();

	  //material = new THREE.MeshBasicMaterial( { color: 0xf0ff00 } )
	  //material = new THREE.MeshPhongMaterial( { color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: THREE.FlatShading} )//NOT WORKING => black shape
	  //material = new THREE.MeshBasicMaterial( { color: 0xffaa00, transparent: true, blending: THREE.AdditiveBlending } ) //NOT WORKING => all white
	  //material = new THREE.MeshLambertMaterial( { color: 0xdddddd, shading: THREE.SmoothShading } )  //NOT WORKING => black shape
	  material = new _three2.default.MeshNormalMaterial({ shading: _three2.default.SmoothShading }); //THIS WORKS
	  //material = new THREE.MeshBasicMaterial( { color: 0xffaa00, wireframe: true } )//THIS WORKS
	  //material = new THREE.MeshDepthMaterial() //NOT WORKING => all white

	  //hack
	  mesh.material = material;
	  dynamicInjector.add(mesh);

	  var sceneExtras = [camera, shadowPlane];

	  var canvas = makeCanvas();
	  renderer = setupRenderer(canvas, gl, config);
	  scene = setupScene(scene, sceneExtras, config);
	  composers = setupPostProcess2(renderer, camera, scene, params);

	  //do context specific config
	  setupNodeSpecific(renderer, camera, scene);
	  //this is too hard coded
	  var targetNode = dynamicInjector;
	  zoomToFit(targetNode, camera, new _three2.default.Vector3());

	  ///do the actual rendering
	  render(renderer, composers, camera, scene);

	  //now we output to file
	  var _gl = renderer.getContext();
	  writeContextToFile(_gl, params.width, params.height, 4, uri); //,4, path)
	}

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = require("three");

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.positionFromCoords = positionFromCoords;
	exports.targetObject = targetObject;
	exports.isTransformTool = isTransformTool;
	exports.selectionAt = selectionAt;
	exports.meshFrom = meshFrom;
	exports.makeCamera = makeCamera;
	exports.makeControls = makeControls;
	exports.makeLight = makeLight;

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	var _OrbitControls = __webpack_require__(5);

	var _OrbitControls2 = _interopRequireDefault(_OrbitControls);

	var _CombinedCamera = __webpack_require__(6);

	var _CombinedCamera2 = _interopRequireDefault(_CombinedCamera);

	var _ramda = __webpack_require__(7);

	var _Selector = __webpack_require__(8);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function positionFromCoords(coords) {
	  return { position: { x: coords.x, y: coords.y }, event: coords };
	}
	function targetObject(event) {
	  return event.target.object;
	}
	function isTransformTool(input) {
	  return ["translate", "rotate", "scale", null, undefined].indexOf(input) > -1;
	}

	function selectionAt(event, mouseCoords, camera, hiearchyRoot) {
	  //log.debug("selection at",event)
	  //, container, selector, width, height, rootObject

	  //let intersects = selector.pickAlt({x:event.clientX,y:event.clientY}, rect, width, height, rootObject)
	  var intersects = (0, _Selector.pick)(mouseCoords, camera, hiearchyRoot); //, ortho = false, precision=10)

	  var outEvent = {};
	  outEvent.clientX = event.clientX;
	  outEvent.clientY = event.clientY;
	  outEvent.offsetX = event.offsetX;
	  outEvent.offsetY = event.offsetY;
	  outEvent.x = event.x || event.clientX;
	  outEvent.y = event.y || event.clientY;

	  outEvent.detail = {};
	  outEvent.detail.pickingInfos = intersects;
	  return outEvent;
	}

	function meshFrom(event) {
	  var mesh = undefined;
	  if (event && event.detail && event.detail.pickingInfos) {
	    var _take = (0, _ramda.take)(1, event.detail.pickingInfos);

	    var _take2 = _slicedToArray(_take, 1);

	    var intersect = _take2[0]; //we actually only get the best match => DO NOT MODIFY original object

	    if (intersect && intersect.object) {
	      mesh = (0, _Selector.findSelectionRoot)(intersect.object); //now we make sure that what we have is actually selectable
	    }
	  }
	  return mesh;
	}

	////////////Various "making" functions , data/config in, (3d object) instances out
	//yup, like factories ! yikes !

	/*create a camera instance from the provided data*/
	function makeCamera(cameraData, params) {
	  //let cameraData = cameraData//TODO: merge with defaults using object.assign
	  var DEFAULTS = {
	    width: 320,
	    height: 240,
	    lens: {
	      fov: 45,
	      near: 0.1,
	      far: 20000
	    },
	    aspect: 320 / 240,
	    up: [0, 0, 1],
	    pos: [0, 0, 0]
	  };
	  cameraData = Object.assign({}, DEFAULTS, cameraData);

	  var camera = new _CombinedCamera2.default(cameraData.width, cameraData.height, cameraData.lens.fov, cameraData.lens.near, cameraData.lens.far, cameraData.lens.near, cameraData.lens.far);

	  camera.up.fromArray(cameraData.up);
	  camera.position.fromArray(cameraData.pos);
	  return camera;
	}

	/*setup a controls instance from the provided data*/
	function makeControls(controlsData) {
	  var up = new _three2.default.Vector3().fromArray(controlsData.up);

	  //controlsData = controlsData//TODO: merge with defaults using object.assign
	  var controls = new _OrbitControls2.default(undefined, undefined, up);
	  controls.upVector = up;

	  controls.userPanSpeed = controlsData.panSpeed;
	  controls.userZoomSpeed = controlsData.zoomSpeed;
	  controls.userRotateSpeed = controlsData.rotateSpeed;

	  controls.autoRotate = controlsData.autoRotate.enabled;
	  controls.autoRotateSpeed = controlsData.autoRotate.speed;

	  return controls;
	}

	/*create a light instance from the provided data*/
	function makeLight(lightData) {
	  var light = undefined;
	  var DEFAULTS = {
	    color: "#FFF",
	    intensity: 1,
	    pos: [0, 0, 0]
	  };
	  lightData = Object.assign({}, DEFAULTS, lightData);

	  switch (lightData.type) {
	    case "light":
	      light = new _three2.default.Light(lightData.color);
	      light.intensity = lightData.intensity;
	      break;
	    case "hemisphereLight":
	      light = new _three2.default.HemisphereLight(lightData.color, lightData.gndColor, lightData.intensity);
	      break;
	    case "ambientLight":
	      // ambient light does not have intensity, only color
	      var newColor = new _three2.default.Color(lightData.color);
	      newColor.r *= lightData.intensity;
	      newColor.g *= lightData.intensity;
	      newColor.b *= lightData.intensity;
	      light = new _three2.default.AmbientLight(newColor);
	      break;
	    case "directionalLight":
	      var dirLightDefaults = {
	        castShadow: false,
	        onlyShadow: false,

	        shadowMapWidth: 2048,
	        shadowMapHeight: 2048,
	        shadowCameraLeft: -500,
	        shadowCameraRight: 500,
	        shadowCameraTop: 500,
	        shadowCameraBottom: -500,
	        shadowCameraNear: 1200,
	        shadowCameraFar: 5000,
	        shadowCameraFov: 50,
	        shadowBias: 0.0001,
	        shadowDarkness: 0.3,
	        shadowCameraVisible: false
	      };
	      lightData = Object.assign({}, dirLightDefaults, lightData);
	      light = new _three2.default.DirectionalLight(lightData.color, lightData.intensity);
	      for (var key in lightData) {
	        if (light.hasOwnProperty(key)) {
	          light[key] = lightData[key];
	        }
	      }

	      break;
	    default:
	      throw new Error("could not create light");
	      break;
	  }

	  light.position.fromArray(lightData.pos);

	  return light;
	}

	function cameraWobble3dHint(camera) {
	  var time = arguments.length <= 1 || arguments[1] === undefined ? 1500 : arguments[1];

	  var camPos = camera.position.clone();
	  var target = camera.position.clone().add(new _three2.default.Vector3(-5, -10, -5));

	  var tween = new TWEEN.Tween(camPos).to(target, time).repeat(Infinity).delay(500).yoyo(true).easing(TWEEN.Easing.Cubic.InOut).onUpdate(function () {
	    camera.position.copy(camPos);
	  }).start();

	  var camRot = camera.rotation.clone();
	  //let rtarget = camera.rotation.clone().add(new THREE.Vector3(50,50,50))

	  /*let tween2 = new TWEEN.Tween( camRot )
	    .to( rtarget , time )
	    .repeat( Infinity )
	    .delay( 500 )
	    .yoyo(true)
	    .easing( TWEEN.Easing.Quadratic.InOut )
	    .onUpdate( function () {
	      camera.position.copy(camRot)
	    } )
	    .start()*/
	  return tween;
	}

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author kaosat-dev
	 * @author qiao / https://github.com/qiao
	 * @author mrdoob / http://mrdoob.com
	 * @author alteredq / http://alteredqualia.com/
	 * @author WestLangley / http://github.com/WestLangley
	 */
	var OrbitControls = function OrbitControls(object, domElement, upVector) {

	  //this.object = object
	  this.objects = [];
	  this.objectOptions = [];
	  this.camStates = [];

	  this.domElement = domElement !== undefined ? domElement : document;
	  this.upVector = upVector || new _three2.default.Vector3(0, 1, 0);

	  // API
	  this.enabled = true;

	  //this.center = new THREE.Vector3()
	  this.centers = [];

	  this.userZoom = true;
	  this.userZoomSpeed = 1.0;

	  this.userRotate = true;
	  this.userRotateSpeed = 1.0;

	  this.userPan = true;
	  this.userPanSpeed = 2.0;

	  this.autoRotate = false;
	  this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	  this.minPolarAngle = 0; // radians
	  this.maxPolarAngle = Math.PI; // radians

	  this.minDistance = 0.2;
	  this.maxDistance = 600;

	  this.active = false;
	  this.mainPointerPressed = false;

	  // internals

	  var scope = this;

	  var EPS = 0.000001;
	  var PIXELS_PER_ROUND = 1800;

	  var phiDelta = 0;
	  var thetaDelta = 0;
	  var scale = 1;

	  var origPhiDelta = phiDelta;
	  var origThetaDelta = thetaDelta;
	  var origScale = scale;

	  //to add control of multiple cameras
	  this.addObject = function (object, options) {
	    if (this.objects.indexOf(object) != -1) return;
	    var DEFAULTS = { userZoom: true, userPan: true, userRotate: true };
	    options = Object.assign({}, DEFAULTS, options);

	    this.objects.push(object);
	    this.objectOptions.push(options);
	    this.centers.push(new _three2.default.Vector3());
	    this.camStates.push({ phiDelta: 0, thetaDelta: 0, scale: 1, lastPosition: new _three2.default.Vector3() });
	  };

	  // events
	  var changeEvent = { type: 'change' };

	  this.update = function (dt) {
	    //this is a modified version, with inverted Y and Z (since we use camera.z => up)
	    //we also allow multiple objects/cameras
	    for (var i = 0; i < this.objects.length; i++) {
	      var object = this.objects[i];
	      var center = this.centers[i];
	      var camState = this.camStates[i];

	      var curThetaDelta = camState.thetaDelta;
	      var curPhiDelta = camState.phiDelta;
	      var curScale = camState.scale;

	      var lastPosition = camState.lastPosition;

	      var position = object.position;
	      var offset = position.clone().sub(center);

	      if (this.upVector.z == 1) {
	        // angle from z-axis around y-axis, upVector : z
	        var theta = Math.atan2(offset.x, offset.y);
	        // angle from y-axis
	        var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.y * offset.y), offset.z);
	      } else {
	        //in case of y up
	        var theta = Math.atan2(offset.x, offset.z);
	        var phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);
	        curThetaDelta = -curThetaDelta;
	      }

	      if (this.autoRotate) {
	        //this.rotateLeft( getAutoRotationAngle() )
	        //PER camera
	        this.objects.map(function (object, index) {
	          if (scope.objectOptions[index].userRotate) {
	            scope.camStates[index].thetaDelta += getAutoRotationAngle();
	          }
	        });
	      }

	      theta += curThetaDelta;
	      phi += curPhiDelta;

	      // restrict phi to be between desired limits
	      phi = Math.max(this.minPolarAngle, Math.min(this.maxPolarAngle, phi));
	      // restrict phi to be betwee EPS and PI-EPS
	      phi = Math.max(EPS, Math.min(Math.PI - EPS, phi));
	      //multiply by scaling effect
	      var radius = offset.length() * curScale;
	      // restrict radius to be between desired limits
	      radius = Math.max(this.minDistance, Math.min(this.maxDistance, radius));

	      if (this.upVector.z == 1) {
	        offset.x = radius * Math.sin(phi) * Math.sin(theta);
	        offset.z = radius * Math.cos(phi);
	        offset.y = radius * Math.sin(phi) * Math.cos(theta);
	      } else {
	        offset.x = radius * Math.sin(phi) * Math.sin(theta);
	        offset.y = radius * Math.cos(phi);
	        offset.z = radius * Math.sin(phi) * Math.cos(theta);
	      }

	      //
	      position.copy(center).add(offset);
	      object.lookAt(center);

	      if (lastPosition.distanceTo(object.position) > 0) {
	        //this.active = true
	        this.dispatchEvent(changeEvent);

	        lastPosition.copy(object.position);
	      } else {
	        //fireDeActivated()
	      }

	      camState.thetaDelta /= 1.5;
	      camState.phiDelta /= 1.5;
	      camState.scale = 1;
	    }
	  };

	  function getAutoRotationAngle() {
	    return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;
	  }

	  function getZoomScale() {
	    return Math.pow(0.95, scope.userZoomSpeed);
	  }

	  this.enable = function () {
	    scope.enabled = true;
	    this.enabled = true;
	  };

	  this.disable = function () {
	    scope.enabled = false;
	    this.enabled = false;
	  };

	  this.reset = function () {
	    for (var i = 0; i < this.objects.length; i++) {
	      var center = this.centers[i];
	      center = new _three2.default.Vector3();
	    }
	    this.objects.map(function (object, index) {
	      var center = this.centers[index];
	      center = new _three2.default.Vector3();
	      this.camStates[index].phiDelta = origPhiDelta;
	      this.camStates[index].thetaDelta = origThetaDelta;
	      this.camStates[index].scale = origScale = scale;
	    });

	    this.update();
	  };

	  this.setObservables = function (observables) {
	    var dragMoves$ = observables.dragMoves$;
	    var zooms$ = observables.zooms$;

	    var self = this;

	    /* are these useful ?
	    scope.userZoomSpeed = 0.6
	     onPinch
	    */
	    function zoom(zoomDir, zoomScale, cameras) {

	      if (scope.enabled === false) return;
	      if (scope.userZoom === false) return;

	      //PER camera
	      cameras.map(function (object, index) {
	        if (scope.objectOptions[index].userZoom) {

	          if (zoomDir < 0) scope.camStates[index].scale /= zoomScale;
	          if (zoomDir > 0) scope.camStates[index].scale *= zoomScale;
	        }
	      });
	    }

	    function rotate(cameras, angle) {

	      if (scope.enabled === false) return;
	      if (scope.userRotate === false) return;

	      //PER camera
	      cameras.map(function (object, index) {
	        if (scope.objectOptions[index].userRotate) {
	          scope.camStates[index].thetaDelta += angle.x;
	          scope.camStates[index].phiDelta += angle.y;
	        }
	      });
	    }

	    //TODO: implement
	    function pan(cameras, offset) {
	      //console.log(event)
	      var _origDist = distance.clone();

	      //do this PER camera
	      cameras.map(function (object, index) {
	        if (scope.objectOptions[index].userPan) {
	          var _distance = _origDist.clone();
	          _distance.transformDirection(object.matrix);
	          _distance.multiplyScalar(scope.userPanSpeed);

	          object.position.add(_distance);
	          scope.centers[index].add(_distance);
	        }
	      });
	    }

	    dragMoves$.subscribe(function (e) {
	      var delta = e.delta;

	      /*if ( angle === undefined ) {
	      angle = 2 * Math.PI /180  * scope.userRotateSpeed
	      }*/
	      var angle = { x: 0, y: 0 };
	      angle.x = 2 * Math.PI * delta.x / PIXELS_PER_ROUND * scope.userRotateSpeed;
	      angle.y = -2 * Math.PI * delta.y / PIXELS_PER_ROUND * scope.userRotateSpeed;

	      //console.log("rotate by angle",angle)
	      /*if ( angle === undefined ) {
	        angle = 2 * Math.PI /180  * scope.userRotateSpeed
	      } */
	      rotate(self.objects, angle);
	    });
	    //.subscribe(e=>e)//console.log("dragMoves",e.delta))

	    zooms$.subscribe(function (delta) {
	      var zoomScale = undefined;
	      if (!zoomScale) {
	        zoomScale = getZoomScale();
	      }
	      zoom(delta, zoomScale, self.objects);
	    });
	    //.subscribe(e=>e)//console.log("zoom",e))
	  };
	};

	OrbitControls.prototype = Object.create(_three2.default.EventDispatcher.prototype);

	exports.default = OrbitControls;

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/*
	 *  @author zz85 / http://twitter.com/blurspline / http://www.lab4games.net/zz85/blog
	 *
	 *  A general perpose camera, for setting FOV, Lens Focal Length,
	 *      and switching between perspective and orthographic views easily.
	 *      Use this only if you do not wish to manage
	 *      both a Orthographic and Perspective Camera
	 *
	 * some additional changes by kaosat-dev
	 */

	var CombinedCamera = function CombinedCamera(width, height, fov, near, far, orthoNear, orthoFar) {

	    _three2.default.Camera.call(this);

	    this.fov = fov;

	    this.left = -width / 2;
	    this.right = width / 2;
	    this.top = height / 2;
	    this.bottom = -height / 2;

	    // We could also handle the projectionMatrix internally, but just wanted to test nested camera objects

	    this.cameraO = new _three2.default.OrthographicCamera(width / -2, width / 2, height / 2, height / -2, orthoNear, orthoFar);
	    this.cameraP = new _three2.default.PerspectiveCamera(fov, width / height, near, far);

	    this.zoom = 1;

	    this.toPerspective();

	    var aspect = width / height;

	    this.target = new _three2.default.Vector3();
	    this.defaultPosition = new _three2.default.Vector3();

	    /**
	      Orientations:
	        front: +x 
	        back:  -x
	        top/above : +z
	        bottom/under : -z
	        left: +y
	        right: -y 
	    */
	    this.orientationMap = {
	        "F": new _three2.default.Vector3(1, 0, 0),
	        "B": new _three2.default.Vector3(-1, 0, 0),

	        "A": new _three2.default.Vector3(0, 0, 1),
	        "U": new _three2.default.Vector3(0, 0, -1),

	        "L": new _three2.default.Vector3(0, 1, 0),
	        "R": new _three2.default.Vector3(0, -1, 0)
	    };

	    //we generate methods for each an every possible case
	    var orientationNameMap = {
	        "F": "Front",
	        "B": "Back",
	        "L": "Left",
	        "R": "Right",
	        "A": "Top",
	        "U": "Bottom",

	        "FL": "FrontLeft",
	        "FR": "FrontRight",
	        "FA": "FrontTop",
	        "FU": "FrontBottom",

	        "BL": "BackLeft",
	        "BR": "BackRight",
	        "BA": "BackTop",
	        "BU": "BackBottom",

	        "LA": "LeftTop",
	        "LU": "LeftBottom",
	        "RA": "RightTop",
	        "RU": "RightBottom",

	        "FAL": "FrontTopLeft",
	        "FAR": "FrontTopRight",
	        "FUL": "FrontBottomLeft",
	        "FUR": "FrontBottomRight",

	        "BAL": "BackTopLeft",
	        "BAR": "BackTopRight",
	        "BUL": "BackBottomLeft",
	        "BUR": "BackBottomRight"
	    };

	    var self = this;
	    function createOrientationFunct(methodName, orCode) {
	        self[methodName] = function () {
	            self.orientationGenerator(orCode);
	        };
	    }

	    for (var shortOrientationName in orientationNameMap) {
	        var orientation = orientationNameMap[shortOrientationName];
	        var methodName = "to" + orientation.charAt(0).toUpperCase() + orientation.slice(1) + "View";
	        createOrientationFunct(methodName, shortOrientationName);
	    }
	};

	CombinedCamera.prototype = Object.create(_three2.default.Camera.prototype);

	CombinedCamera.prototype.lookAt = (function () {

	    // This routine does not support cameras with rotated and/or translated parent(s)

	    var m1 = new _three2.default.Matrix4();

	    return function (vector) {
	        this.target = vector;
	        if (this.inOrthographicMode === true) {
	            this.toOrthographic();
	        }

	        m1.lookAt(this.position, vector, this.up);

	        this.quaternion.setFromRotationMatrix(m1);
	    };
	})();

	CombinedCamera.prototype.toPerspective = function () {

	    // Switches to the Perspective Camera

	    this.near = this.cameraP.near;
	    this.far = this.cameraP.far;

	    this.cameraP.fov = this.fov / this.zoom;

	    this.cameraP.updateProjectionMatrix();

	    this.projectionMatrix = this.cameraP.projectionMatrix;

	    this.inPerspectiveMode = true;
	    this.inOrthographicMode = false;
	};

	CombinedCamera.prototype.toOrthographic = function () {

	    // Switches to the Orthographic camera estimating viewport from Perspective

	    var fov = this.fov;
	    var aspect = this.cameraP.aspect;
	    var near = this.cameraP.near;
	    var far = this.cameraP.far;

	    //set the orthographic view rectangle to 0,0,width,height
	    //see here : http://stackoverflow.com/questions/13483775/set-zoomvalue-of-a-perspective-equal-to-perspective
	    if (this.target === null) {
	        this.target = new _three2.default.Vector3();
	    }
	    var distance = new _three2.default.Vector3().subVectors(this.position, this.target).length() * 0.3;
	    var width = Math.tan(fov) * distance * aspect;
	    var height = Math.tan(fov) * distance;

	    var halfWidth = width;
	    var halfHeight = height;

	    this.cameraO.left = halfWidth;
	    this.cameraO.right = -halfWidth;
	    this.cameraO.top = -halfHeight;
	    this.cameraO.bottom = halfHeight;

	    this.cameraO.updateProjectionMatrix();

	    this.near = this.cameraO.near;
	    this.far = this.cameraO.far;
	    this.projectionMatrix = this.cameraO.projectionMatrix;

	    this.inPerspectiveMode = false;
	    this.inOrthographicMode = true;
	};

	CombinedCamera.prototype.setSize = function (width, height) {

	    this.cameraP.aspect = width / height;
	    this.left = -width / 2;
	    this.right = width / 2;
	    this.top = height / 2;
	    this.bottom = -height / 2;
	};

	CombinedCamera.prototype.setFov = function (fov) {

	    this.fov = fov;

	    if (this.inPerspectiveMode) {

	        this.toPerspective();
	    } else {

	        this.toOrthographic();
	    }
	};

	// For mantaining similar API with PerspectiveCamera

	CombinedCamera.prototype.updateProjectionMatrix = function () {

	    if (this.inPerspectiveMode) {

	        this.toPerspective();
	    } else {

	        this.toPerspective();
	        this.toOrthographic();
	    }
	};

	/*
	* Uses Focal Length (in mm) to estimate and set FOV
	* 35mm (fullframe) camera is used if frame size is not specified;
	* Formula based on http://www.bobatkins.com/photography/technical/field_of_view.html
	*/
	CombinedCamera.prototype.setLens = function (focalLength, frameHeight) {

	    if (frameHeight === undefined) frameHeight = 24;

	    var fov = 2 * _three2.default.Math.radToDeg(Math.atan(frameHeight / (focalLength * 2)));

	    this.setFov(fov);

	    return fov;
	};

	CombinedCamera.prototype.setZoom = function (zoom) {

	    this.zoom = zoom;

	    if (this.inPerspectiveMode) {
	        this.toPerspective();
	    } else {
	        this.toOrthographic();
	    }
	};

	CombinedCamera.prototype.toDiagonalView = function () {
	    this.position.copy(this.defaultPosition);
	    this.target = new _three2.default.Vector3();
	    this.lookAt(this.target);
	};

	CombinedCamera.prototype.orientationGenerator = function (name) {

	    //name is a string of letters of length 1 to 3 representing
	    // the desired orientation : ex : a: above, r: right, ar: above right
	    //, flb: front left bottom

	    var offset = this.position.clone().sub(this.target);
	    var components = name;
	    //console.log("offset distance",offset.length());

	    var combinedTransform = new _three2.default.Vector3();
	    for (var i = 0; i < components.length; i++) {
	        //console.log("handling", components[i] );
	        var component = components[i];
	        var nPost = this.orientationMap[component].clone(); //.multiplyScalar( offset.length() );

	        combinedTransform.add(nPost);
	    }
	    combinedTransform.setLength(offset.length());
	    //console.log("offset disance 2",combinedTransform.length() );
	    this.position.copy(combinedTransform);

	    //console.log("offset disance 3",this.position.clone().sub(this.target).length() );
	    this.lookAt(this.target);
	    //console.log("offset disance 4",this.position.clone().sub(this.target).length() );
	};

	/*CombinedCamera.prototype.toFrontView = function() {
	    
	    var offset = this.position.clone().sub( this.target );
	    var nPost = new  THREE.Vector3();
	    nPost.y = -offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};

	CombinedCamera.prototype.toFrontLeftView = function() {
	    //TODO: check posisitoning
	    var offset = this.position.clone().sub( this.target );
	    var nPost = new  THREE.Vector3();
	    nPost.y = -offset.length();
	    nPost.x = -offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};

	CombinedCamera.prototype.toFrontRightView = function() {
	    //TODO: check posisitoning
	    var offset = this.position.clone().sub( this.target );
	    var nPost = new  THREE.Vector3();
	    nPost.y = -offset.length();
	    nPost.x = offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};

	CombinedCamera.prototype.toFrontTopView = function() {
	    //TODO: check posisitoning
	    var offset = this.position.clone().sub( this.target );
	    var nPost = new  THREE.Vector3();
	    nPost.y = -offset.length();
	    nPost.z = offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};

	CombinedCamera.prototype.toFrontBottomView = function() {
	    //TODO: check posisitoning
	    var offset = this.position.clone().sub( this.target );
	    var nPost = new  THREE.Vector3();
	    nPost.y = -offset.length();
	    nPost.z = -offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};

	CombinedCamera.prototype.toBackView = function() {

	    var offset = this.position.clone().sub(this.target);
	    var nPost = new  THREE.Vector3();
	    nPost.y = offset.length();
	    this.position.copy(nPost);
	    this.lookAt(this.target);
	};

	CombinedCamera.prototype.toLeftView = function() {
	    
	    var offset = this.position.clone().sub(this.target);
	    var nPost = new  THREE.Vector3();
	    nPost.x = offset.length();
	    this.position.copy(nPost);
	    this.lookAt(this.target);
	    
	};

	CombinedCamera.prototype.toRightView = function() {
	    var offset = this.position.clone().sub(this.target);
	    var nPost = new  THREE.Vector3();
	    nPost.x = -offset.length();
	    this.position.copy( nPost );
	    this.lookAt(this.target );
	};

	CombinedCamera.prototype.toTopView = function() {
	    this.orientationGenerator( "a" );
	};

	CombinedCamera.prototype.toBottomView = function() {
	    var offset = this.position.clone().sub(this.target);
	    var nPost = new  THREE.Vector3();
	    nPost.z = -offset.length();
	    this.position.copy( nPost );
	    this.lookAt( this.target );
	};*/

	CombinedCamera.prototype.centerView = function () {
	    //var offset = new THREE.Vector3().sub(this.target.clone());
	    //this.position= new THREE.Vector3(100,100,200);
	    //this.target = new THREE.Vector3();

	    this.position.copy(this.defaultPosition);
	    this.lookAt(this.target);
	};

	CombinedCamera.prototype.resetView = function () {
	    this.position.copy(this.defaultPosition);
	    this.target.copy(new _three2.default.Vector3());
	};

	//export default CombinedCamera;
	module.exports = CombinedCamera;

/***/ },
/* 7 */
/***/ function(module, exports) {

	module.exports = require("ramda");

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.findSelectionRoot = findSelectionRoot;
	exports.getCoordsFromPosSizeRect = getCoordsFromPosSizeRect;
	exports.pick = pick;

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	var _Projector = __webpack_require__(9);

	var _Projector2 = _interopRequireDefault(_Projector);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function isRootNode(node) {
	  return node.selectTrickleUp === false && node.selectable === true;
	}

	function walkUp(node, checker) {
	  if (node) {
	    if (checker(node)) {
	      return node;
	    }
	    if (node.parent) {
	      return walkUp(node.parent, checker);
	    }
	  }
	  return undefined;
	}

	function findSelectionRoot(node) {
	  return walkUp(node, isRootNode);
	}

	function getCoordsFromPosSizeRect(inputs) {
	  var pos = inputs.pos;
	  var rect = inputs.rect;
	  var width = inputs.width;
	  var height = inputs.height;

	  var x = (pos.x - rect.left) / width * 2 - 1;
	  var y = -((pos.y - rect.top) / height) * 2 + 1;
	  //v = new THREE.Vector3((x / this.viewWidth) * 2 - 1, -(y / this.viewHeight) * 2 + 1, 1)
	  return { x: x, y: y };
	}

	function pick(mouseCoords, camera, hiearchyRoot) {
	  var ortho = arguments.length <= 3 || arguments[3] === undefined ? false : arguments[3];
	  var precision = arguments.length <= 4 || arguments[4] === undefined ? 10 : arguments[4];
	  var x = mouseCoords.x;
	  var y = mouseCoords.y;

	  var mousecoords = new _three2.default.Vector3(x, y, 0.5);
	  var v = mousecoords;
	  var intersects = [];

	  if (!ortho) {
	    v.unproject(camera);
	    var fooV = v.clone();
	    var raycaster = new _three2.default.Raycaster(camera.position, v.sub(camera.position).normalize());
	    //raycaster.precision = 10
	    intersects = raycaster.intersectObjects(hiearchyRoot, true);
	  } else {
	    // use picking ray since it's an orthographic camera
	    //var ray = this.projector.pickingRay( v, this.camera )
	    //intersects = ray.intersectObjects( this.hiearchyRoot, true )
	    //see here:
	    _three2.default.Vector3.prototype.pickingRay = function (camera) {
	      var tan = Math.tan(0.5 * _three2.default.Math.degToRad(camera.fov)) / camera.zoom;

	      this.x *= tan * camera.aspect;
	      this.y *= tan;
	      this.z = -1;
	      return this.transformDirection(camera.matrixWorld);
	    };

	    var raycaster = new _three2.default.Raycaster();
	    v.pickingRay(camera);
	    raycaster.set(camera.position, v);
	    intersects = raycaster.intersectObjects(hiearchyRoot, true);
	  }

	  //remove invisibles, dedupe ??
	  //TODO: use transducers.js ?
	  intersects = intersects.filter(function (intersect) {
	    return intersect.object && intersect.object.visible === true;
	  }) //&& intersect.object.pickable)
	  .sort(function (a, b) {
	    return a.distance - b.distance;
	  });
	  //.reverse()

	  return intersects;
	}

	var Selector = (function () {
	  function Selector() {
	    _classCallCheck(this, Selector);

	    this.projector = new _three2.default.Projector();
	    this.camera = undefined;
	    //for camera
	    this.isOrtho = false;
	  }

	  /*pick(event, rect, width, height, scene){
	    event.preventDefault()
	    //console.log("rect, width, height",rect, width, height)
	    var x =   ( (event.clientX - rect.left) / width) * 2 - 1
	    var y = - ( (event.clientY - rect.top) / height) * 2 + 1
	     this.hiearchyRoot = scene.children
	     return this._pickInner( x, y, null, this.camera)
	  }*/

	  _createClass(Selector, [{
	    key: 'pickAlt',
	    value: function pickAlt(pos, rect, width, height, scene) {
	      //console.log("rect, width, height",rect, width, height)
	      var x = (pos.x - rect.left) / width * 2 - 1;
	      var y = -((pos.y - rect.top) / height) * 2 + 1;

	      this.hiearchyRoot = scene.children;

	      return this._pickInner(x, y, null, this.camera);
	    }
	  }, {
	    key: '_pickInner',
	    value: function _pickInner(x, y, isOrtho, camera) {
	      isOrtho = isOrtho || this.isOrtho;
	      camera = camera || this.camera;
	      var mousecoords = new _three2.default.Vector3(x, y, 0.5);

	      var intersects = [];
	      //v = new THREE.Vector3((x / this.viewWidth) * 2 - 1, -(y / this.viewHeight) * 2 + 1, 1)
	      var v = mousecoords;
	      if (!isOrtho) {
	        v.unproject(camera);
	        var v1 = v.clone();
	        var fooV = v.clone();
	        var raycaster = new _three2.default.Raycaster(camera.position, v.sub(camera.position).normalize());
	        //raycaster.precision = 10
	        intersects = raycaster.intersectObjects(this.hiearchyRoot, true);
	      } else {
	        // use picking ray since it's an orthographic camera
	        //var ray = this.projector.pickingRay( v, this.camera )
	        //intersects = ray.intersectObjects( this.hiearchyRoot, true )
	        //see here:
	        _three2.default.Vector3.prototype.pickingRay = function (camera) {
	          var tan = Math.tan(0.5 * _three2.default.Math.degToRad(camera.fov)) / camera.zoom;

	          this.x *= tan * camera.aspect;
	          this.y *= tan;
	          this.z = -1;

	          return this.transformDirection(camera.matrixWorld);
	        };

	        var raycaster = new _three2.default.Raycaster();
	        v.pickingRay(this.camera);
	        raycaster.set(this.camera.position, v);
	        intersects = raycaster.intersectObjects(this.hiearchyRoot, true);
	      }

	      //remove invisibles, dedupe
	      //TODO: use transducers.js
	      intersects = intersects.sort().filter(function (intersect, pos) {
	        return intersect.object && intersect.object.visible === true && !pos || intersect != intersects[pos - 1];
	      });

	      return intersects;

	      /*
	      mousecoords.unproject(camera)
	      raycaster.ray.set( camera.position, mousecoords.sub( camera.position ).normalize() )
	       var intersections = raycaster.intersectObjects( this._THREEObject3D.children, true )
	      var firstintersection = ( intersections.length ) > 0 ? intersections[ 0 ] : null
	      if (firstintersection !== null) {
	        var pickobject = firstintersection.object
	        if (typeof pickobject.userData !== 'undefined' &&
	            typeof pickobject.userData.props.onPick === 'function') {
	          pickobject.userData.props.onPick(event, firstintersection)
	        }
	      }*/
	    }
	  }]);

	  return Selector;
	})();

	exports.default = Selector;

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
		value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//var THREE = require("three"); //until it is done via the import syntax everywhere we have to use this

	_three2.default.RenderableObject = function () {

		this.id = 0;

		this.object = null;
		this.z = 0;
	};

	//

	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author supereggbert / http://www.paulbrunt.co.uk/
	 * @author julianwa / https://github.com/julianwa
	 */
	_three2.default.RenderableFace = function () {

		this.id = 0;

		this.v1 = new _three2.default.RenderableVertex();
		this.v2 = new _three2.default.RenderableVertex();
		this.v3 = new _three2.default.RenderableVertex();

		this.normalModel = new _three2.default.Vector3();

		this.vertexNormalsModel = [new _three2.default.Vector3(), new _three2.default.Vector3(), new _three2.default.Vector3()];
		this.vertexNormalsLength = 0;

		this.color = new _three2.default.Color();
		this.material = null;
		this.uvs = [new _three2.default.Vector2(), new _three2.default.Vector2(), new _three2.default.Vector2()];

		this.z = 0;
	};

	//

	_three2.default.RenderableVertex = function () {

		this.position = new _three2.default.Vector3();
		this.positionWorld = new _three2.default.Vector3();
		this.positionScreen = new _three2.default.Vector4();

		this.visible = true;
	};

	_three2.default.RenderableVertex.prototype.copy = function (vertex) {

		this.positionWorld.copy(vertex.positionWorld);
		this.positionScreen.copy(vertex.positionScreen);
	};

	//

	_three2.default.RenderableLine = function () {

		this.id = 0;

		this.v1 = new _three2.default.RenderableVertex();
		this.v2 = new _three2.default.RenderableVertex();

		this.vertexColors = [new _three2.default.Color(), new _three2.default.Color()];
		this.material = null;

		this.z = 0;
	};

	//

	_three2.default.RenderableSprite = function () {

		this.id = 0;

		this.object = null;

		this.x = 0;
		this.y = 0;
		this.z = 0;

		this.rotation = 0;
		this.scale = new _three2.default.Vector2();

		this.material = null;
	};

	//

	_three2.default.Projector = function () {

		var _object,
		    _objectCount,
		    _objectPool = [],
		    _objectPoolLength = 0,
		    _vertex,
		    _vertexCount,
		    _vertexPool = [],
		    _vertexPoolLength = 0,
		    _face,
		    _faceCount,
		    _facePool = [],
		    _facePoolLength = 0,
		    _line,
		    _lineCount,
		    _linePool = [],
		    _linePoolLength = 0,
		    _sprite,
		    _spriteCount,
		    _spritePool = [],
		    _spritePoolLength = 0,
		    _renderData = { objects: [], lights: [], elements: [] },
		    _vA = new _three2.default.Vector3(),
		    _vB = new _three2.default.Vector3(),
		    _vC = new _three2.default.Vector3(),
		    _vector3 = new _three2.default.Vector3(),
		    _vector4 = new _three2.default.Vector4(),
		    _clipBox = new _three2.default.Box3(new _three2.default.Vector3(-1, -1, -1), new _three2.default.Vector3(1, 1, 1)),
		    _boundingBox = new _three2.default.Box3(),
		    _points3 = new Array(3),
		    _points4 = new Array(4),
		    _viewMatrix = new _three2.default.Matrix4(),
		    _viewProjectionMatrix = new _three2.default.Matrix4(),
		    _modelMatrix,
		    _modelViewProjectionMatrix = new _three2.default.Matrix4(),
		    _normalMatrix = new _three2.default.Matrix3(),
		    _frustum = new _three2.default.Frustum(),
		    _clippedVertex1PositionScreen = new _three2.default.Vector4(),
		    _clippedVertex2PositionScreen = new _three2.default.Vector4();

		//

		this.projectVector = function (vector, camera) {

			console.warn('THREE.Projector: .projectVector() is now vector.project().');
			vector.project(camera);
		};

		this.unprojectVector = function (vector, camera) {

			console.warn('THREE.Projector: .unprojectVector() is now vector.unproject().');
			vector.unproject(camera);
		};

		this.pickingRay = function (vector, camera) {

			console.error('THREE.Projector: .pickingRay() has been removed.');
		};

		//

		var RenderList = function RenderList() {

			var normals = [];
			var uvs = [];

			var object = null;
			var material = null;

			var normalMatrix = new _three2.default.Matrix3();

			var setObject = function setObject(value) {

				object = value;
				material = object.material;

				normalMatrix.getNormalMatrix(object.matrixWorld);

				normals.length = 0;
				uvs.length = 0;
			};

			var projectVertex = function projectVertex(vertex) {

				var position = vertex.position;
				var positionWorld = vertex.positionWorld;
				var positionScreen = vertex.positionScreen;

				positionWorld.copy(position).applyMatrix4(_modelMatrix);
				positionScreen.copy(positionWorld).applyMatrix4(_viewProjectionMatrix);

				var invW = 1 / positionScreen.w;

				positionScreen.x *= invW;
				positionScreen.y *= invW;
				positionScreen.z *= invW;

				vertex.visible = positionScreen.x >= -1 && positionScreen.x <= 1 && positionScreen.y >= -1 && positionScreen.y <= 1 && positionScreen.z >= -1 && positionScreen.z <= 1;
			};

			var pushVertex = function pushVertex(x, y, z) {

				_vertex = getNextVertexInPool();
				_vertex.position.set(x, y, z);

				projectVertex(_vertex);
			};

			var pushNormal = function pushNormal(x, y, z) {

				normals.push(x, y, z);
			};

			var pushUv = function pushUv(x, y) {

				uvs.push(x, y);
			};

			var checkTriangleVisibility = function checkTriangleVisibility(v1, v2, v3) {

				if (v1.visible === true || v2.visible === true || v3.visible === true) return true;

				_points3[0] = v1.positionScreen;
				_points3[1] = v2.positionScreen;
				_points3[2] = v3.positionScreen;

				return _clipBox.isIntersectionBox(_boundingBox.setFromPoints(_points3));
			};

			var checkBackfaceCulling = function checkBackfaceCulling(v1, v2, v3) {

				return (v3.positionScreen.x - v1.positionScreen.x) * (v2.positionScreen.y - v1.positionScreen.y) - (v3.positionScreen.y - v1.positionScreen.y) * (v2.positionScreen.x - v1.positionScreen.x) < 0;
			};

			var pushLine = function pushLine(a, b) {

				var v1 = _vertexPool[a];
				var v2 = _vertexPool[b];

				_line = getNextLineInPool();

				_line.id = object.id;
				_line.v1.copy(v1);
				_line.v2.copy(v2);
				_line.z = (v1.positionScreen.z + v2.positionScreen.z) / 2;

				_line.material = object.material;

				_renderData.elements.push(_line);
			};

			var pushTriangle = function pushTriangle(a, b, c) {

				var v1 = _vertexPool[a];
				var v2 = _vertexPool[b];
				var v3 = _vertexPool[c];

				if (checkTriangleVisibility(v1, v2, v3) === false) return;

				if (material.side === _three2.default.DoubleSide || checkBackfaceCulling(v1, v2, v3) === true) {

					_face = getNextFaceInPool();

					_face.id = object.id;
					_face.v1.copy(v1);
					_face.v2.copy(v2);
					_face.v3.copy(v3);
					_face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;

					for (var i = 0; i < 3; i++) {

						var offset = arguments[i] * 3;
						var normal = _face.vertexNormalsModel[i];

						normal.set(normals[offset], normals[offset + 1], normals[offset + 2]);
						normal.applyMatrix3(normalMatrix).normalize();

						var offset2 = arguments[i] * 2;

						var uv = _face.uvs[i];
						uv.set(uvs[offset2], uvs[offset2 + 1]);
					}

					_face.vertexNormalsLength = 3;

					_face.material = object.material;

					_renderData.elements.push(_face);
				}
			};

			return {
				setObject: setObject,
				projectVertex: projectVertex,
				checkTriangleVisibility: checkTriangleVisibility,
				checkBackfaceCulling: checkBackfaceCulling,
				pushVertex: pushVertex,
				pushNormal: pushNormal,
				pushUv: pushUv,
				pushLine: pushLine,
				pushTriangle: pushTriangle
			};
		};

		var renderList = new RenderList();

		this.projectScene = function (scene, camera, sortObjects, sortElements) {

			_faceCount = 0;
			_lineCount = 0;
			_spriteCount = 0;

			_renderData.elements.length = 0;

			if (scene.autoUpdate === true) scene.updateMatrixWorld();
			if (camera.parent === undefined) camera.updateMatrixWorld();

			_viewMatrix.copy(camera.matrixWorldInverse.getInverse(camera.matrixWorld));
			_viewProjectionMatrix.multiplyMatrices(camera.projectionMatrix, _viewMatrix);

			_frustum.setFromMatrix(_viewProjectionMatrix);

			//

			_objectCount = 0;

			_renderData.objects.length = 0;
			_renderData.lights.length = 0;

			scene.traverseVisible(function (object) {

				if (object instanceof _three2.default.Light) {

					_renderData.lights.push(object);
				} else if (object instanceof _three2.default.Mesh || object instanceof _three2.default.Line || object instanceof _three2.default.Sprite) {

					if (object.material.visible === false) return;

					if (object.frustumCulled === false || _frustum.intersectsObject(object) === true) {

						_object = getNextObjectInPool();
						_object.id = object.id;
						_object.object = object;

						if (object.renderDepth !== null) {

							_object.z = object.renderDepth;
						} else {

							_vector3.setFromMatrixPosition(object.matrixWorld);
							_vector3.applyProjection(_viewProjectionMatrix);
							_object.z = _vector3.z;
						}

						_renderData.objects.push(_object);
					}
				}
			});

			if (sortObjects === true) {

				_renderData.objects.sort(painterSort);
			}

			//

			for (var o = 0, ol = _renderData.objects.length; o < ol; o++) {

				var object = _renderData.objects[o].object;
				var geometry = object.geometry;

				renderList.setObject(object);

				_modelMatrix = object.matrixWorld;

				_vertexCount = 0;

				if (object instanceof _three2.default.Mesh) {

					if (geometry instanceof _three2.default.BufferGeometry) {

						var attributes = geometry.attributes;
						var offsets = geometry.offsets;

						if (attributes.position === undefined) continue;

						var positions = attributes.position.array;

						for (var i = 0, l = positions.length; i < l; i += 3) {

							renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
						}

						if (attributes.normal !== undefined) {

							var normals = attributes.normal.array;

							for (var i = 0, l = normals.length; i < l; i += 3) {

								renderList.pushNormal(normals[i], normals[i + 1], normals[i + 2]);
							}
						}

						if (attributes.uv !== undefined) {

							var uvs = attributes.uv.array;

							for (var i = 0, l = uvs.length; i < l; i += 2) {

								renderList.pushUv(uvs[i], uvs[i + 1]);
							}
						}

						if (attributes.index !== undefined) {

							var indices = attributes.index.array;

							if (offsets.length > 0) {

								for (var o = 0; o < offsets.length; o++) {

									var offset = offsets[o];
									var index = offset.index;

									for (var i = offset.start, l = offset.start + offset.count; i < l; i += 3) {

										renderList.pushTriangle(indices[i] + index, indices[i + 1] + index, indices[i + 2] + index);
									}
								}
							} else {

								for (var i = 0, l = indices.length; i < l; i += 3) {

									renderList.pushTriangle(indices[i], indices[i + 1], indices[i + 2]);
								}
							}
						} else {

							for (var i = 0, l = positions.length / 3; i < l; i += 3) {

								renderList.pushTriangle(i, i + 1, i + 2);
							}
						}
					} else if (geometry instanceof _three2.default.Geometry) {

						var vertices = geometry.vertices;
						var faces = geometry.faces;
						var faceVertexUvs = geometry.faceVertexUvs[0];

						_normalMatrix.getNormalMatrix(_modelMatrix);

						var isFaceMaterial = object.material instanceof _three2.default.MeshFaceMaterial;
						var objectMaterials = isFaceMaterial === true ? object.material : null;

						for (var v = 0, vl = vertices.length; v < vl; v++) {

							var vertex = vertices[v];
							renderList.pushVertex(vertex.x, vertex.y, vertex.z);
						}

						for (var f = 0, fl = faces.length; f < fl; f++) {

							var face = faces[f];

							var material = isFaceMaterial === true ? objectMaterials.materials[face.materialIndex] : object.material;

							if (material === undefined) continue;

							var side = material.side;

							var v1 = _vertexPool[face.a];
							var v2 = _vertexPool[face.b];
							var v3 = _vertexPool[face.c];

							if (material.morphTargets === true) {

								var morphTargets = geometry.morphTargets;
								var morphInfluences = object.morphTargetInfluences;

								var v1p = v1.position;
								var v2p = v2.position;
								var v3p = v3.position;

								_vA.set(0, 0, 0);
								_vB.set(0, 0, 0);
								_vC.set(0, 0, 0);

								for (var t = 0, tl = morphTargets.length; t < tl; t++) {

									var influence = morphInfluences[t];

									if (influence === 0) continue;

									var targets = morphTargets[t].vertices;

									_vA.x += (targets[face.a].x - v1p.x) * influence;
									_vA.y += (targets[face.a].y - v1p.y) * influence;
									_vA.z += (targets[face.a].z - v1p.z) * influence;

									_vB.x += (targets[face.b].x - v2p.x) * influence;
									_vB.y += (targets[face.b].y - v2p.y) * influence;
									_vB.z += (targets[face.b].z - v2p.z) * influence;

									_vC.x += (targets[face.c].x - v3p.x) * influence;
									_vC.y += (targets[face.c].y - v3p.y) * influence;
									_vC.z += (targets[face.c].z - v3p.z) * influence;
								}

								v1.position.add(_vA);
								v2.position.add(_vB);
								v3.position.add(_vC);

								renderList.projectVertex(v1);
								renderList.projectVertex(v2);
								renderList.projectVertex(v3);
							}

							if (renderList.checkTriangleVisibility(v1, v2, v3) === false) continue;

							var visible = renderList.checkBackfaceCulling(v1, v2, v3);

							if (side !== _three2.default.DoubleSide) {
								if (side === _three2.default.FrontSide && visible === false) continue;
								if (side === _three2.default.BackSide && visible === true) continue;
							}

							_face = getNextFaceInPool();

							_face.id = object.id;
							_face.v1.copy(v1);
							_face.v2.copy(v2);
							_face.v3.copy(v3);

							_face.normalModel.copy(face.normal);

							if (visible === false && (side === _three2.default.BackSide || side === _three2.default.DoubleSide)) {

								_face.normalModel.negate();
							}

							_face.normalModel.applyMatrix3(_normalMatrix).normalize();

							var faceVertexNormals = face.vertexNormals;

							for (var n = 0, nl = Math.min(faceVertexNormals.length, 3); n < nl; n++) {

								var normalModel = _face.vertexNormalsModel[n];
								normalModel.copy(faceVertexNormals[n]);

								if (visible === false && (side === _three2.default.BackSide || side === _three2.default.DoubleSide)) {

									normalModel.negate();
								}

								normalModel.applyMatrix3(_normalMatrix).normalize();
							}

							_face.vertexNormalsLength = faceVertexNormals.length;

							var vertexUvs = faceVertexUvs[f];

							if (vertexUvs !== undefined) {

								for (var u = 0; u < 3; u++) {

									_face.uvs[u].copy(vertexUvs[u]);
								}
							}

							_face.color = face.color;
							_face.material = material;

							_face.z = (v1.positionScreen.z + v2.positionScreen.z + v3.positionScreen.z) / 3;

							_renderData.elements.push(_face);
						}
					}
				} else if (object instanceof _three2.default.Line) {

					if (geometry instanceof _three2.default.BufferGeometry) {

						var attributes = geometry.attributes;

						if (attributes.position !== undefined) {

							var positions = attributes.position.array;

							for (var i = 0, l = positions.length; i < l; i += 3) {

								renderList.pushVertex(positions[i], positions[i + 1], positions[i + 2]);
							}

							if (attributes.index !== undefined) {

								var indices = attributes.index.array;

								for (var i = 0, l = indices.length; i < l; i += 2) {

									renderList.pushLine(indices[i], indices[i + 1]);
								}
							} else {

								var step = object.mode === _three2.default.LinePieces ? 2 : 1;

								for (var i = 0, l = positions.length / 3 - 1; i < l; i += step) {

									renderList.pushLine(i, i + 1);
								}
							}
						}
					} else if (geometry instanceof _three2.default.Geometry) {

						_modelViewProjectionMatrix.multiplyMatrices(_viewProjectionMatrix, _modelMatrix);

						var vertices = object.geometry.vertices;

						if (vertices.length === 0) continue;

						v1 = getNextVertexInPool();
						v1.positionScreen.copy(vertices[0]).applyMatrix4(_modelViewProjectionMatrix);

						// Handle LineStrip and LinePieces
						var step = object.mode === _three2.default.LinePieces ? 2 : 1;

						for (var v = 1, vl = vertices.length; v < vl; v++) {

							v1 = getNextVertexInPool();
							v1.positionScreen.copy(vertices[v]).applyMatrix4(_modelViewProjectionMatrix);

							if ((v + 1) % step > 0) continue;

							v2 = _vertexPool[_vertexCount - 2];

							_clippedVertex1PositionScreen.copy(v1.positionScreen);
							_clippedVertex2PositionScreen.copy(v2.positionScreen);

							if (clipLine(_clippedVertex1PositionScreen, _clippedVertex2PositionScreen) === true) {

								// Perform the perspective divide
								_clippedVertex1PositionScreen.multiplyScalar(1 / _clippedVertex1PositionScreen.w);
								_clippedVertex2PositionScreen.multiplyScalar(1 / _clippedVertex2PositionScreen.w);

								_line = getNextLineInPool();

								_line.id = object.id;
								_line.v1.positionScreen.copy(_clippedVertex1PositionScreen);
								_line.v2.positionScreen.copy(_clippedVertex2PositionScreen);

								_line.z = Math.max(_clippedVertex1PositionScreen.z, _clippedVertex2PositionScreen.z);

								_line.material = object.material;

								if (object.material.vertexColors === _three2.default.VertexColors) {

									_line.vertexColors[0].copy(object.geometry.colors[v]);
									_line.vertexColors[1].copy(object.geometry.colors[v - 1]);
								}

								_renderData.elements.push(_line);
							}
						}
					}
				} else if (object instanceof _three2.default.Sprite) {

					_vector4.set(_modelMatrix.elements[12], _modelMatrix.elements[13], _modelMatrix.elements[14], 1);
					_vector4.applyMatrix4(_viewProjectionMatrix);

					var invW = 1 / _vector4.w;

					_vector4.z *= invW;

					if (_vector4.z >= -1 && _vector4.z <= 1) {

						_sprite = getNextSpriteInPool();
						_sprite.id = object.id;
						_sprite.x = _vector4.x * invW;
						_sprite.y = _vector4.y * invW;
						_sprite.z = _vector4.z;
						_sprite.object = object;

						_sprite.rotation = object.rotation;

						_sprite.scale.x = object.scale.x * Math.abs(_sprite.x - (_vector4.x + camera.projectionMatrix.elements[0]) / (_vector4.w + camera.projectionMatrix.elements[12]));
						_sprite.scale.y = object.scale.y * Math.abs(_sprite.y - (_vector4.y + camera.projectionMatrix.elements[5]) / (_vector4.w + camera.projectionMatrix.elements[13]));

						_sprite.material = object.material;

						_renderData.elements.push(_sprite);
					}
				}
			}

			if (sortElements === true) {

				_renderData.elements.sort(painterSort);
			}

			return _renderData;
		};

		// Pools

		function getNextObjectInPool() {

			if (_objectCount === _objectPoolLength) {

				var object = new _three2.default.RenderableObject();
				_objectPool.push(object);
				_objectPoolLength++;
				_objectCount++;
				return object;
			}

			return _objectPool[_objectCount++];
		}

		function getNextVertexInPool() {

			if (_vertexCount === _vertexPoolLength) {

				var vertex = new _three2.default.RenderableVertex();
				_vertexPool.push(vertex);
				_vertexPoolLength++;
				_vertexCount++;
				return vertex;
			}

			return _vertexPool[_vertexCount++];
		}

		function getNextFaceInPool() {

			if (_faceCount === _facePoolLength) {

				var face = new _three2.default.RenderableFace();
				_facePool.push(face);
				_facePoolLength++;
				_faceCount++;
				return face;
			}

			return _facePool[_faceCount++];
		}

		function getNextLineInPool() {

			if (_lineCount === _linePoolLength) {

				var line = new _three2.default.RenderableLine();
				_linePool.push(line);
				_linePoolLength++;
				_lineCount++;
				return line;
			}

			return _linePool[_lineCount++];
		}

		function getNextSpriteInPool() {

			if (_spriteCount === _spritePoolLength) {

				var sprite = new _three2.default.RenderableSprite();
				_spritePool.push(sprite);
				_spritePoolLength++;
				_spriteCount++;
				return sprite;
			}

			return _spritePool[_spriteCount++];
		}

		//

		function painterSort(a, b) {

			if (a.z !== b.z) {

				return b.z - a.z;
			} else if (a.id !== b.id) {

				return a.id - b.id;
			} else {

				return 0;
			}
		}

		function clipLine(s1, s2) {

			var alpha1 = 0,
			    alpha2 = 1,
			   

			// Calculate the boundary coordinate of each vertex for the near and far clip planes,
			// Z = -1 and Z = +1, respectively.
			bc1near = s1.z + s1.w,
			    bc2near = s2.z + s2.w,
			    bc1far = -s1.z + s1.w,
			    bc2far = -s2.z + s2.w;

			if (bc1near >= 0 && bc2near >= 0 && bc1far >= 0 && bc2far >= 0) {

				// Both vertices lie entirely within all clip planes.
				return true;
			} else if (bc1near < 0 && bc2near < 0 || bc1far < 0 && bc2far < 0) {

				// Both vertices lie entirely outside one of the clip planes.
				return false;
			} else {

				// The line segment spans at least one clip plane.

				if (bc1near < 0) {

					// v1 lies outside the near plane, v2 inside
					alpha1 = Math.max(alpha1, bc1near / (bc1near - bc2near));
				} else if (bc2near < 0) {

					// v2 lies outside the near plane, v1 inside
					alpha2 = Math.min(alpha2, bc1near / (bc1near - bc2near));
				}

				if (bc1far < 0) {

					// v1 lies outside the far plane, v2 inside
					alpha1 = Math.max(alpha1, bc1far / (bc1far - bc2far));
				} else if (bc2far < 0) {

					// v2 lies outside the far plane, v2 inside
					alpha2 = Math.min(alpha2, bc1far / (bc1far - bc2far));
				}

				if (alpha2 < alpha1) {

					// The line segment spans two boundaries, but is outside both of them.
					// (This can't happen when we're only clipping against just near/far but good
					//  to leave the check here for future usage if other clip planes are added.)
					return false;
				} else {

					// Update the s1 and s2 vertices to match the clipped line segment.
					s1.lerp(s2, alpha1);
					s2.lerp(s1, 1 - alpha2);

					return true;
				}
			}
		}
	};

	//module.exports = THREE.Projector;
	exports.default = _three2.default.Projector;

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	var presets = exports.presets = {
	  renderer: {
	    shadowMapEnabled: true,
	    shadowMapAutoUpdate: true,
	    shadowMapSoft: true,
	    shadowMapType: undefined, //THREE.PCFSoftShadowMap,//THREE.PCFSoftShadowMap,//PCFShadowMap
	    autoUpdateScene: true, //Default ?
	    physicallyBasedShading: false, //Default ?
	    autoClear: true, //Default ?
	    gammaInput: false,
	    gammaOutput: false
	  },
	  cameras: [{
	    name: "mainCamera",
	    pos: [75, 75, 145], //[100,-100,100]
	    up: [0, 0, 1],
	    lens: {
	      fov: 45,
	      near: 0.1,
	      far: 20000
	    }
	  }],
	  controls: [{
	    up: [0, 0, 1],
	    rotateSpeed: 2.0,
	    panSpeed: 2.0,
	    zoomSpeed: 2.0,
	    autoRotate: {
	      enabled: false,
	      speed: 0.2
	    },
	    _enabled: true,
	    _active: true
	  }],
	  scenes: {
	    "main": [
	    //{ type:"hemisphereLight", color:"#FFFF33", gndColor:"#FF9480", pos:[0, 0, 500], intensity:0.6 },
	    { type: "hemisphereLight", color: "#FFEEEE", gndColor: "#FFFFEE", pos: [0, 1200, 1500], intensity: 0.8 }, { type: "ambientLight", color: "#0x252525", intensity: 0.03 }, { type: "directionalLight", color: "#262525", intensity: 0.2, pos: [150, 150, 1500], castShadow: true, onlyShadow: true }
	    //{ type:"directionalLight", color:"#FFFFFF", intensity:0.2 , pos:[150,150,1500], castShadow:true, onlyShadow:true}
	    ],
	    "helpers": [{ type: "LabeledGrid" }]
	  }
	};

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	_three2.default.EffectComposer = function (renderer, renderTarget) {

	  this.renderer = renderer;

	  if (renderTarget === undefined) {

	    var pixelRatio = renderer.getPixelRatio();

	    var width = Math.floor(renderer.context.canvas.width / pixelRatio) || 1;
	    var height = Math.floor(renderer.context.canvas.height / pixelRatio) || 1;
	    var parameters = { minFilter: _three2.default.LinearFilter, magFilter: _three2.default.LinearFilter, format: _three2.default.RGBFormat, stencilBuffer: false };

	    renderTarget = new _three2.default.WebGLRenderTarget(width, height, parameters);
	  }

	  this.renderTarget1 = renderTarget;
	  this.renderTarget2 = renderTarget.clone();

	  this.writeBuffer = this.renderTarget1;
	  this.readBuffer = this.renderTarget2;

	  this.passes = [];

	  if (_three2.default.CopyShader === undefined) console.error("THREE.EffectComposer relies on THREE.CopyShader");

	  this.copyPass = new _three2.default.ShaderPass(_three2.default.CopyShader);
	};

	_three2.default.EffectComposer.prototype = {

	  swapBuffers: function swapBuffers() {

	    var tmp = this.readBuffer;
	    this.readBuffer = this.writeBuffer;
	    this.writeBuffer = tmp;
	  },

	  addPass: function addPass(pass) {

	    this.passes.push(pass);
	  },

	  insertPass: function insertPass(pass, index) {

	    this.passes.splice(index, 0, pass);
	  },

	  render: function render(delta) {

	    this.writeBuffer = this.renderTarget1;
	    this.readBuffer = this.renderTarget2;

	    var maskActive = false;

	    var pass,
	        i,
	        il = this.passes.length;

	    for (i = 0; i < il; i++) {

	      pass = this.passes[i];

	      if (!pass.enabled) continue;

	      pass.render(this.renderer, this.writeBuffer, this.readBuffer, delta, maskActive);

	      if (pass.needsSwap) {

	        if (maskActive) {

	          var context = this.renderer.context;

	          context.stencilFunc(context.NOTEQUAL, 1, 0xffffffff);

	          this.copyPass.render(this.renderer, this.writeBuffer, this.readBuffer, delta);

	          context.stencilFunc(context.EQUAL, 1, 0xffffffff);
	        }

	        this.swapBuffers();
	      }

	      if (pass instanceof _three2.default.MaskPass) {

	        maskActive = true;
	      } else if (pass instanceof _three2.default.ClearMaskPass) {

	        maskActive = false;
	      }
	    }
	  },

	  reset: function reset(renderTarget) {

	    if (renderTarget === undefined) {

	      renderTarget = this.renderTarget1.clone();

	      var pixelRatio = this.renderer.getPixelRatio();

	      renderTarget.width = Math.floor(this.renderer.context.canvas.width / pixelRatio);
	      renderTarget.height = Math.floor(this.renderer.context.canvas.height / pixelRatio);
	    }

	    this.renderTarget1 = renderTarget;
	    this.renderTarget2 = renderTarget.clone();

	    this.writeBuffer = this.renderTarget1;
	    this.readBuffer = this.renderTarget2;
	  },

	  setSize: function setSize(width, height) {

	    var renderTarget = this.renderTarget1.clone();

	    renderTarget.width = width;
	    renderTarget.height = height;

	    this.reset(renderTarget);
	  }

	};
	exports.default = _three2.default.EffectComposer;

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	_three2.default.ShaderPass = function (shader, textureID) {

	  this.textureID = textureID !== undefined ? textureID : "tDiffuse";

	  this.uniforms = _three2.default.UniformsUtils.clone(shader.uniforms);

	  this.material = new _three2.default.ShaderMaterial({

	    defines: shader.defines || {},
	    uniforms: this.uniforms,
	    vertexShader: shader.vertexShader,
	    fragmentShader: shader.fragmentShader

	  });

	  this.renderToScreen = false;

	  this.enabled = true;
	  this.needsSwap = true;
	  this.clear = false;

	  this.camera = new _three2.default.OrthographicCamera(-1, 1, 1, -1, 0, 1);
	  this.scene = new _three2.default.Scene();

	  this.quad = new _three2.default.Mesh(new _three2.default.PlaneBufferGeometry(2, 2), null);
	  this.scene.add(this.quad);
	};

	_three2.default.ShaderPass.prototype = {

	  render: function render(renderer, writeBuffer, readBuffer, delta) {

	    if (this.uniforms[this.textureID]) {

	      this.uniforms[this.textureID].value = readBuffer;
	    }

	    this.quad.material = this.material;

	    if (this.renderToScreen) {

	      renderer.render(this.scene, this.camera);
	    } else {

	      renderer.render(this.scene, this.camera, writeBuffer, this.clear);
	    }
	  }

	};

	exports.default = _three2.default.ShaderPass;

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	_three2.default.RenderPass = function (scene, camera, overrideMaterial, clearColor, clearAlpha) {

	  this.scene = scene;
	  this.camera = camera;

	  this.overrideMaterial = overrideMaterial;

	  this.clearColor = clearColor;
	  this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 1;

	  this.oldClearColor = new _three2.default.Color();
	  this.oldClearAlpha = 1;

	  this.enabled = true;
	  this.clear = true;
	  this.needsSwap = false;
	};

	_three2.default.RenderPass.prototype = {

	  render: function render(renderer, writeBuffer, readBuffer, delta) {

	    this.scene.overrideMaterial = this.overrideMaterial;

	    if (this.clearColor) {

	      this.oldClearColor.copy(renderer.getClearColor());
	      this.oldClearAlpha = renderer.getClearAlpha();

	      renderer.setClearColor(this.clearColor, this.clearAlpha);
	    }

	    renderer.render(this.scene, this.camera, readBuffer, this.clear);

	    if (this.clearColor) {

	      renderer.setClearColor(this.oldClearColor, this.oldClearAlpha);
	    }

	    this.scene.overrideMaterial = null;
	  }

	};

	exports.default = _three2.default.RenderPass;

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ClearMaskPass = exports.MaskPass = undefined;

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 */

	_three2.default.MaskPass = function (scene, camera) {

	  this.scene = scene;
	  this.camera = camera;

	  this.enabled = true;
	  this.clear = true;
	  this.needsSwap = false;

	  this.inverse = false;
	};

	_three2.default.MaskPass.prototype = {

	  render: function render(renderer, writeBuffer, readBuffer, delta) {

	    var context = renderer.context;

	    // don't update color or depth

	    context.colorMask(false, false, false, false);
	    context.depthMask(false);

	    // set up stencil

	    var writeValue, clearValue;

	    if (this.inverse) {

	      writeValue = 0;
	      clearValue = 1;
	    } else {

	      writeValue = 1;
	      clearValue = 0;
	    }

	    context.enable(context.STENCIL_TEST);
	    context.stencilOp(context.REPLACE, context.REPLACE, context.REPLACE);
	    context.stencilFunc(context.ALWAYS, writeValue, 0xffffffff);
	    context.clearStencil(clearValue);

	    // draw into the stencil buffer

	    renderer.render(this.scene, this.camera, readBuffer, this.clear);
	    renderer.render(this.scene, this.camera, writeBuffer, this.clear);

	    // re-enable update of color and depth

	    context.colorMask(true, true, true, true);
	    context.depthMask(true);

	    // only render where stencil is set to 1

	    context.stencilFunc(context.EQUAL, 1, 0xffffffff); // draw if == 1
	    context.stencilOp(context.KEEP, context.KEEP, context.KEEP);
	  }

	};

	_three2.default.ClearMaskPass = function () {

	  this.enabled = true;
	};

	_three2.default.ClearMaskPass.prototype = {

	  render: function render(renderer, writeBuffer, readBuffer, delta) {

	    var context = renderer.context;

	    context.disable(context.STENCIL_TEST);
	  }

	};

	var MaskPass = _three2.default.MaskPass;
	var ClearMaskPass = _three2.default.ClearMaskPass;
	exports.MaskPass = MaskPass;
	exports.ClearMaskPass = ClearMaskPass;

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Full-screen textured quad shader
	 */

	_three2.default.CopyShader = {

	  uniforms: {

	    "tDiffuse": { type: "t", value: null },
	    "opacity": { type: "f", value: 1.0 }

	  },

	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	  fragmentShader: ["uniform float opacity;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {", "vec4 texel = texture2D( tDiffuse, vUv );", "gl_FragColor = opacity * texel;", "}"].join("\n")

	};

	exports.default = _three2.default.CopyShader;

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 * @author davidedc / http://www.sketchpatch.net/
	 *
	 * NVIDIA FXAA by Timothy Lottes
	 * http://timothylottes.blogspot.com/2011/06/fxaa3-source-released.html
	 * - WebGL port by @supereggbert
	 * http://www.glge.org/demos/fxaa/
	 */

	_three2.default.FXAAShader = {

	  uniforms: {

	    "tDiffuse": { type: "t", value: null },
	    "resolution": { type: "v2", value: new _three2.default.Vector2(1 / 1024, 1 / 512) }

	  },

	  vertexShader: ["void main() {", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	  fragmentShader: ["uniform sampler2D tDiffuse;", "uniform vec2 resolution;", "#define FXAA_REDUCE_MIN   (1.0/128.0)", "#define FXAA_REDUCE_MUL   (1.0/8.0)", "#define FXAA_SPAN_MAX     8.0", "void main() {", "vec3 rgbNW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, -1.0 ) ) * resolution ).xyz;", "vec3 rgbNE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, -1.0 ) ) * resolution ).xyz;", "vec3 rgbSW = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( -1.0, 1.0 ) ) * resolution ).xyz;", "vec3 rgbSE = texture2D( tDiffuse, ( gl_FragCoord.xy + vec2( 1.0, 1.0 ) ) * resolution ).xyz;", "vec4 rgbaM  = texture2D( tDiffuse,  gl_FragCoord.xy  * resolution );", "vec3 rgbM  = rgbaM.xyz;", "vec3 luma = vec3( 0.299, 0.587, 0.114 );", "float lumaNW = dot( rgbNW, luma );", "float lumaNE = dot( rgbNE, luma );", "float lumaSW = dot( rgbSW, luma );", "float lumaSE = dot( rgbSE, luma );", "float lumaM  = dot( rgbM,  luma );", "float lumaMin = min( lumaM, min( min( lumaNW, lumaNE ), min( lumaSW, lumaSE ) ) );", "float lumaMax = max( lumaM, max( max( lumaNW, lumaNE) , max( lumaSW, lumaSE ) ) );", "vec2 dir;", "dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));", "dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));", "float dirReduce = max( ( lumaNW + lumaNE + lumaSW + lumaSE ) * ( 0.25 * FXAA_REDUCE_MUL ), FXAA_REDUCE_MIN );", "float rcpDirMin = 1.0 / ( min( abs( dir.x ), abs( dir.y ) ) + dirReduce );", "dir = min( vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),", "max( vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),", "dir * rcpDirMin)) * resolution;", "vec4 rgbA = (1.0/2.0) * (", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (1.0/3.0 - 0.5)) +", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (2.0/3.0 - 0.5)));", "vec4 rgbB = rgbA * (1.0/2.0) + (1.0/4.0) * (", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (0.0/3.0 - 0.5)) +", "texture2D(tDiffuse,  gl_FragCoord.xy  * resolution + dir * (3.0/3.0 - 0.5)));", "float lumaB = dot(rgbB, vec4(luma, 0.0));", "if ( ( lumaB < lumaMin ) || ( lumaB > lumaMax ) ) {", "gl_FragColor = rgbA;", "} else {", "gl_FragColor = rgbB;", "}", "}"].join("\n")

	};

	exports.default = _three2.default.FXAAShader;

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author alteredq / http://alteredqualia.com/
	 *
	 * Vignette shader
	 * based on PaintEffect postprocess from ro.me
	 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
	 */

	_three2.default.VignetteShader = {

	  uniforms: {

	    "tDiffuse": { type: "t", value: null },
	    "offset": { type: "f", value: 1.0 },
	    "darkness": { type: "f", value: 1.0 }

	  },

	  vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	  fragmentShader: ["uniform float offset;", "uniform float darkness;", "uniform sampler2D tDiffuse;", "varying vec2 vUv;", "void main() {",

	  // Eskil's vignette

	  "vec4 texel = texture2D( tDiffuse, vUv );", "vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );", "gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );",

	  /*
	  // alternative version from glfx.js
	  // this one makes more "dusty" look (as opposed to "burned")
	   "vec4 color = texture2D( tDiffuse, vUv );",
	  "float dist = distance( vUv, vec2( 0.5 ) );",
	  "color.rgb *= smoothstep( 0.8, offset * 0.799, dist *( darkness + offset ) );",
	  "gl_FragColor = color;",
	  */

	  "}"].join("\n")

	};

	exports.default = _three2.default.VignetteShader;

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * @author zz85 / https://github.com/zz85 | https://www.lab4games.net/zz85/blog
	 *
	 * Edge Detection Shader using Sobel filter
	 * Based on http://rastergrid.com/blog/2011/01/frei-chen-edge-detector
	 *
	 * aspect: vec2 of (1/width, 1/height)
	 */

	var EdgeShader3 = {

	    uniforms: {

	        "tDiffuse": { type: "t", value: null },
	        "aspect": { type: "v2", value: new _three2.default.Vector2(512, 512) }
	    },

	    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	    fragmentShader: ["uniform sampler2D tDiffuse;", "varying vec2 vUv;", "uniform vec2 aspect;", "vec2 texel = vec2(1.0 / aspect.x, 1.0 / aspect.y);", "mat3 G[2];", "const mat3 g0 = mat3( 1.0, 2.0, 1.0, 0.0, 0.0, 0.0, -1.0, -2.0, -1.0 );", "const mat3 g1 = mat3( 1.0, 0.0, -1.0, 2.0, 0.0, -2.0, 1.0, 0.0, -1.0 );", "void main(void)", "{", "mat3 I;", "float cnv[2];", "vec3 sample;", "G[0] = g0;", "G[1] = g1;",

	    /* fetch the 3x3 neighbourhood and use the RGB vector's length as intensity value */
	    "for (float i=0.0; i<3.0; i++)", "for (float j=0.0; j<3.0; j++) {", "sample = texture2D( tDiffuse, vUv + texel * vec2(i-1.0,j-1.0) ).rgb;", "I[int(i)][int(j)] = length(sample);", "}",

	    /* calculate the convolution values for all the masks */
	    "for (int i=0; i<2; i++) {", "float dp3 = dot(G[i][0], I[0]) + dot(G[i][1], I[1]) + dot(G[i][2], I[2]);", "cnv[i] = dp3 * dp3; ", "}", "gl_FragColor = vec4(0.5 * sqrt(cnv[0]*cnv[0]+cnv[1]*cnv[1]));", "} "].join("\n")

	};

	exports.default = EdgeShader3;

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * original @author stemkoski / http://github.com/stemkoski
	 * modified by @kaosat-dev / http://github.com/kaosat-dev
	 * Blend three textures additively
	 * texel1 + texel2
	 * + vec4(0.5, 0.75, 1.0, 1.0)
	 */

	var AdditiveBlendShader = {

	    uniforms: {

	        "tDiffuse1": { type: "t", value: null },
	        "tDiffuse2": { type: "t", value: null },
	        "tDiffuse3": { type: "t", value: null },
	        "normalThreshold": { type: "f", value: 0.1 },
	        "depthThreshold": { type: "f", value: 0.05 },
	        "strengh": { type: "f", value: 0.4 },
	        "color": { type: "c", value: new _three2.default.Color(0x000002) }
	    },

	    vertexShader: ["varying vec2 vUv;", "void main() {", "vUv = uv;", "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );", "}"].join("\n"),

	    fragmentShader: ["uniform sampler2D tDiffuse1;", "uniform sampler2D tDiffuse2;", "uniform sampler2D tDiffuse3;", "uniform float normalThreshold;", "uniform float depthThreshold;", "uniform float strengh;", "uniform vec3 color;", "varying vec2 vUv;", "void main() {", "vec4 colorTexel = texture2D( tDiffuse1, vUv );", "vec4 normalTexel = texture2D( tDiffuse2, vUv );", "vec4 depthTexel = texture2D( tDiffuse3, vUv );", "gl_FragColor = colorTexel;", "if( normalTexel.r >= normalThreshold || depthTexel.r >=depthThreshold) {", "gl_FragColor= colorTexel*(1.0-strengh) + vec4(color[0], color[1], color[2],1);", "}", "}"].join("\n")

	};

	exports.default = AdditiveBlendShader;

/***/ },
/* 20 */
/***/ function(module, exports) {

	module.exports = require("glView-helpers");

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

	/*TODO:
	 - refactor
	 - use label helper
	*/

	var LabeledGrid = (function (_THREE$Object3D) {
	  _inherits(LabeledGrid, _THREE$Object3D);

	  function LabeledGrid() {
	    var width = arguments.length <= 0 || arguments[0] === undefined ? 200 : arguments[0];
	    var length = arguments.length <= 1 || arguments[1] === undefined ? 200 : arguments[1];
	    var step = arguments.length <= 2 || arguments[2] === undefined ? 100 : arguments[2];
	    var upVector = arguments.length <= 3 || arguments[3] === undefined ? [0, 1, 0] : arguments[3];
	    var color = arguments.length <= 4 || arguments[4] === undefined ? 0x00baff : arguments[4];
	    var opacity = arguments.length <= 5 || arguments[5] === undefined ? 0.2 : arguments[5];
	    var text = arguments.length <= 6 || arguments[6] === undefined ? true : arguments[6];
	    var textColor = arguments.length <= 7 || arguments[7] === undefined ? "#000000" : arguments[7];
	    var textLocation = arguments.length <= 8 || arguments[8] === undefined ? "center" : arguments[8];

	    _classCallCheck(this, LabeledGrid);

	    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(LabeledGrid).call(this));

	    _this.width = width;
	    _this.length = length;
	    _this.step = step;
	    _this.color = color;
	    _this.opacity = opacity;
	    _this.text = text;
	    _this.textColor = textColor;
	    _this.textLocation = textLocation;
	    _this.upVector = new _three2.default.Vector3().fromArray(upVector);

	    _this.name = "grid";

	    //TODO: clean this up
	    _this.marginSize = 10;
	    _this.stepSubDivisions = 10;

	    _this._drawGrid();

	    //default grid orientation is z up, rotate if not the case
	    var upVector = _this.upVector;
	    _this.up = upVector;
	    _this.lookAt(upVector);
	    return _this;
	  }

	  _createClass(LabeledGrid, [{
	    key: "_drawGrid",
	    value: function _drawGrid() {
	      var gridGeometry, gridMaterial, mainGridZ, planeFragmentShader, planeGeometry, planeMaterial, subGridGeometry, subGridMaterial, subGridZ;

	      //offset to avoid z fighting
	      mainGridZ = -0.05;
	      gridGeometry = new _three2.default.Geometry();
	      gridMaterial = new _three2.default.LineBasicMaterial({
	        color: new _three2.default.Color().setHex(this.color),
	        opacity: this.opacity,
	        linewidth: 2,
	        transparent: true
	      });

	      subGridZ = -0.05;
	      subGridGeometry = new _three2.default.Geometry();
	      subGridMaterial = new _three2.default.LineBasicMaterial({
	        color: new _three2.default.Color().setHex(this.color),
	        opacity: this.opacity / 2,
	        transparent: true
	      });

	      var step = this.step;
	      var stepSubDivisions = this.stepSubDivisions;
	      var width = this.width;
	      var length = this.length;

	      var centerBased = true;

	      if (centerBased) {
	        for (var i = 0; i <= width / 2; i += step / stepSubDivisions) {
	          subGridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, i, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(length / 2, i, subGridZ));

	          subGridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, -i, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(length / 2, -i, subGridZ));

	          if (i % step == 0) {
	            gridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, i, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(length / 2, i, mainGridZ));

	            gridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, -i, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(length / 2, -i, mainGridZ));
	          }
	        }
	        for (var i = 0; i <= length / 2; i += step / stepSubDivisions) {
	          subGridGeometry.vertices.push(new _three2.default.Vector3(i, -width / 2, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(i, width / 2, subGridZ));

	          subGridGeometry.vertices.push(new _three2.default.Vector3(-i, -width / 2, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(-i, width / 2, subGridZ));

	          if (i % step == 0) {
	            gridGeometry.vertices.push(new _three2.default.Vector3(i, -width / 2, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(i, width / 2, mainGridZ));

	            gridGeometry.vertices.push(new _three2.default.Vector3(-i, -width / 2, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(-i, width / 2, mainGridZ));
	          }
	        }
	      } else {
	        for (var i = -width / 2; i <= width / 2; i += step / stepSubDivisions) {
	          subGridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, i, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(length / 2, i, subGridZ));

	          if (i % step == 0) {
	            gridGeometry.vertices.push(new _three2.default.Vector3(-length / 2, i, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(length / 2, i, mainGridZ));
	          }
	        }
	        for (var i = -length / 2; i <= length / 2; i += step / stepSubDivisions) {
	          subGridGeometry.vertices.push(new _three2.default.Vector3(i, -width / 2, subGridZ));
	          subGridGeometry.vertices.push(new _three2.default.Vector3(i, width / 2, subGridZ));

	          if (i % step == 0) {
	            gridGeometry.vertices.push(new _three2.default.Vector3(i, -width / 2, mainGridZ));
	            gridGeometry.vertices.push(new _three2.default.Vector3(i, width / 2, mainGridZ));
	          }
	        }
	      }

	      this.mainGrid = new _three2.default.Line(gridGeometry, gridMaterial, _three2.default.LinePieces);
	      //create sub grid geometry object
	      this.subGrid = new _three2.default.Line(subGridGeometry, subGridMaterial, _three2.default.LinePieces);

	      //create margin
	      var offsetWidth = width + this.marginSize;
	      var offsetLength = length + this.marginSize;

	      var marginGeometry = new _three2.default.Geometry();
	      marginGeometry.vertices.push(new _three2.default.Vector3(-length / 2, -width / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(length / 2, -width / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(length / 2, -width / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(length / 2, width / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(length / 2, width / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(-length / 2, width / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(-length / 2, width / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(-length / 2, -width / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(-offsetLength / 2, -offsetWidth / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(offsetLength / 2, -offsetWidth / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(offsetLength / 2, -offsetWidth / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(offsetLength / 2, offsetWidth / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(offsetLength / 2, offsetWidth / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(-offsetLength / 2, offsetWidth / 2, subGridZ));

	      marginGeometry.vertices.push(new _three2.default.Vector3(-offsetLength / 2, offsetWidth / 2, subGridZ));
	      marginGeometry.vertices.push(new _three2.default.Vector3(-offsetLength / 2, -offsetWidth / 2, subGridZ));

	      var strongGridMaterial = new _three2.default.LineBasicMaterial({
	        color: new _three2.default.Color().setHex(this.color),
	        opacity: this.opacity * 2,
	        linewidth: 2,
	        transparent: true
	      });
	      this.margin = new _three2.default.Line(marginGeometry, strongGridMaterial, _three2.default.LinePieces);

	      //add all grids, subgrids, margins etc
	      this.add(this.mainGrid);
	      this.add(this.subGrid);
	      this.add(this.margin);

	      this._drawNumbering();
	    }
	  }, {
	    key: "toggle",
	    value: function toggle(_toggle) {
	      //apply visibility settings to all children
	      this.traverse(function (child) {
	        child.visible = _toggle;
	      });
	    }
	  }, {
	    key: "setOpacity",
	    value: function setOpacity(opacity) {
	      this.opacity = opacity;
	      this.mainGrid.material.opacity = opacity;
	      this.subGrid.material.opacity = opacity / 2;
	      this.margin.material.opacity = opacity * 2;
	    }
	  }, {
	    key: "setColor",
	    value: function setColor(color) {
	      this.color = color;
	      this.mainGrid.material.color = new _three2.default.Color().setHex(this.color);
	      this.subGrid.material.color = new _three2.default.Color().setHex(this.color);
	      this.margin.material.color = new _three2.default.Color().setHex(this.color);
	    }
	  }, {
	    key: "toggleText",
	    value: function toggleText(toggle) {
	      this.text = toggle;
	      var labels = this.labels.children;
	      for (var i = 0; i < this.labels.children.length; i++) {
	        var label = labels[i];
	        label.visible = toggle;
	      }
	    }
	  }, {
	    key: "setTextColor",
	    value: function setTextColor(color) {
	      this.textColor = color;
	      this._drawNumbering();
	    }
	  }, {
	    key: "setTextLocation",
	    value: function setTextLocation(location) {
	      this.textLocation = location;
	      return this._drawNumbering();
	    }
	  }, {
	    key: "setUp",
	    value: function setUp(upVector) {
	      this.upVector = upVector;
	      this.up = upVector;
	      this.lookAt(upVector);
	    }
	  }, {
	    key: "resize",
	    value: function resize(width, length) {
	      if (width && length) {
	        var width = Math.max(width, 10);
	        this.width = width;

	        var length = Math.max(length, 10);
	        this.length = length;

	        this.step = Math.max(this.step, 5);

	        this.remove(this.mainGrid);
	        this.remove(this.subGrid);
	        this.remove(this.margin);
	        //this.remove(this.plane);
	        return this._drawGrid();
	      }
	    }
	  }, {
	    key: "_drawNumbering",
	    value: function _drawNumbering() {
	      var label, sizeLabel, sizeLabel2, xLabelsLeft, xLabelsRight, yLabelsBack, yLabelsFront;
	      var step = this.step;

	      this._labelStore = {};

	      if (this.labels != null) {
	        this.mainGrid.remove(this.labels);
	      }
	      this.labels = new _three2.default.Object3D();

	      var width = this.width;
	      var length = this.length;
	      var numbering = this.numbering = "centerBased";

	      var labelsFront = new _three2.default.Object3D();
	      var labelsSideRight = new _three2.default.Object3D();

	      if (numbering == "centerBased") {
	        for (var i = 0; i <= width / 2; i += step) {
	          var sizeLabel = this.drawTextOnPlane("" + i, 32);
	          var sizeLabel2 = sizeLabel.clone();

	          sizeLabel.position.set(length / 2, -i, 0.1);
	          sizeLabel.rotation.z = -Math.PI / 2;
	          labelsFront.add(sizeLabel);

	          sizeLabel2.position.set(length / 2, i, 0.1);
	          sizeLabel2.rotation.z = -Math.PI / 2;
	          labelsFront.add(sizeLabel2);
	        }

	        for (var i = 0; i <= length / 2; i += step) {
	          var sizeLabel = this.drawTextOnPlane("" + i, 32);
	          var sizeLabel2 = sizeLabel.clone();

	          sizeLabel.position.set(-i, width / 2, 0.1);
	          //sizeLabel.rotation.z = -Math.PI / 2;
	          labelsSideRight.add(sizeLabel);

	          sizeLabel2.position.set(i, width / 2, 0.1);
	          //sizeLabel2.rotation.z = -Math.PI / 2;
	          labelsSideRight.add(sizeLabel2);
	        }

	        var labelsSideLeft = labelsSideRight.clone();
	        labelsSideLeft.rotation.z = -Math.PI;
	        //labelsSideLeft = labelsSideRight.clone().translateY(- width );

	        var labelsBack = labelsFront.clone();
	        labelsBack.rotation.z = -Math.PI;
	      }

	      /*if (this.textLocation === "center") {
	        yLabelsRight.translateY(- length/ 2);
	        xLabelsFront.translateX(- width / 2);
	      } else {
	        yLabelsLeft = yLabelsRight.clone().translateY( -width );
	        xLabelsBack = xLabelsFront.clone().translateX( -length );
	        
	        this.labels.add( yLabelsLeft );
	        this.labels.add( xLabelsBack) ;
	      }*/
	      //this.labels.add( yLabelsRight );
	      this.labels.add(labelsFront);
	      this.labels.add(labelsBack);

	      this.labels.add(labelsSideRight);
	      this.labels.add(labelsSideLeft);

	      //apply visibility settings to all labels
	      var textVisible = this.text;
	      this.labels.traverse(function (child) {
	        child.visible = textVisible;
	      });

	      this.mainGrid.add(this.labels);
	    }
	  }, {
	    key: "drawTextOnPlane",
	    value: function drawTextOnPlane(text, size) {
	      var canvas, context, material, plane, texture;

	      if (size == null) {
	        size = 256;
	      }

	      if (document) {
	        canvas = document.createElement('canvas');
	      } else {
	        canvas = {};
	      }

	      var size = 128;
	      canvas.width = size;
	      canvas.height = size;
	      context = canvas.getContext('2d');
	      context.font = "18px sans-serif";
	      context.textAlign = 'center';
	      context.fillStyle = this.textColor;
	      context.fillText(text, canvas.width / 2, canvas.height / 2);
	      context.strokeStyle = this.textColor;
	      context.strokeText(text, canvas.width / 2, canvas.height / 2);

	      texture = new _three2.default.Texture(canvas);
	      texture.needsUpdate = true;
	      texture.generateMipmaps = true;
	      texture.magFilter = _three2.default.LinearFilter;
	      texture.minFilter = _three2.default.LinearFilter;

	      material = new _three2.default.MeshBasicMaterial({
	        map: texture,
	        transparent: true,
	        color: 0xffffff,
	        alphaTest: 0.3
	      });
	      plane = new _three2.default.Mesh(new _three2.default.PlaneBufferGeometry(size / 8, size / 8), material);
	      plane.doubleSided = true;
	      plane.overdraw = true;

	      return plane;
	    }
	  }]);

	  return LabeledGrid;
	})(_three2.default.Object3D);

	//autoresize, disabled for now
	/*
	updateGridSize() {
	      var max, maxX, maxY, min, minX, minY, size, subchild, _getBounds, _i, _len, _ref,
	        _this = this;
	      minX = 99999;
	      maxX = -99999;
	      minY = 99999;
	      maxY = -99999;
	      _getBounds = function(mesh) {
	        var bBox, subchild, _i, _len, _ref, _results;
	        if (mesh instanceof THREE.Mesh) {
	          mesh.geometry.computeBoundingBox();
	          bBox = mesh.geometry.boundingBox;
	          minX = Math.min(minX, bBox.min.x);
	          maxX = Math.max(maxX, bBox.max.x);
	          minY = Math.min(minY, bBox.min.y);
	          maxY = Math.max(maxY, bBox.max.y);
	          _ref = mesh.children;
	          _results = [];
	          for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	            subchild = _ref[_i];
	            _results.push(_getBounds(subchild));
	          }
	          return _results;
	        }
	      };
	      if (this.rootAssembly != null) {
	        _ref = this.rootAssembly.children;
	        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
	          subchild = _ref[_i];
	          if (subchild.name !== "renderSubs" && subchild.name !== "connectors") {
	            _getBounds(subchild);
	          }
	        }
	      }
	      max = Math.max(Math.max(maxX, maxY), 100);
	      min = Math.min(Math.min(minX, minY), -100);
	      size = (Math.max(max, Math.abs(min))) * 2;
	      size = Math.ceil(size / 10) * 10;
	      if (size >= 200) {
	        return this.resize(size);
	      }
	};
	*/

	exports.default = LabeledGrid;

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.default = bufferToPng;
	var fs = __webpack_require__(23);

	function bufferToPng(buffer, width, height, fileName) {

	  function genOutput(inBuf, width, height) {
	    var PNG = __webpack_require__(24).PNG;
	    var png = new PNG({ width: width, height: height });

	    /*for (let i = 0; i < inBuf.length; ++i) {
	      png.data[i] = inBuf[i]
	    }*/
	    //vertical flip

	    for (var j = 0; j < height; ++j) {
	      //from https://gist.github.com/bsergean
	      for (var i = 0; i < width; ++i) {

	        var k = j * width + i;
	        var r = inBuf[4 * k];
	        var g = inBuf[4 * k + 1];
	        var b = inBuf[4 * k + 2];
	        var a = inBuf[4 * k + 3];

	        //let m = (height - j + 1) * width + i
	        var m = (height - j) * width + i;
	        png.data[4 * m] = r;
	        png.data[4 * m + 1] = g;
	        png.data[4 * m + 2] = b;
	        png.data[4 * m + 3] = a;
	      }
	    }
	    png.pack().pipe(fs.createWriteStream(fileName));
	  }

	  //this is just a helper
	  function log(inBuf, width, height) {
	    var channels = inBuf.length / 4;
	    for (var i = 0; i < channels; ++i) {
	      var r = inBuf[i * 4];
	      var g = inBuf[i * 4 + 1];
	      var b = inBuf[i * 4 + 2];
	      var a = inBuf[i * 4 + 3];

	      console.log(r, g, b, a);
	      console.log("//");
	    }
	  }

	  genOutput(buffer, width, height);
	}

/***/ },
/* 23 */
/***/ function(module, exports) {

	module.exports = require("fs");

/***/ },
/* 24 */
/***/ function(module, exports) {

	module.exports = require("pngjs");

/***/ },
/* 25 */
/***/ function(module, exports) {

	module.exports = require("gl");

/***/ },
/* 26 */
/***/ function(module, exports) {

	module.exports = require("rx");

/***/ },
/* 27 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.trim = trim;
	exports.exists = exists;
	exports.isEmpty = isEmpty;
	exports.itemsEqual = itemsEqual;
	exports.toArray = toArray;
	exports.safeJSONParse = safeJSONParse;
	exports.getExtension = getExtension;
	exports.getNameAndExtension = getNameAndExtension;
	exports.isValidFile = isValidFile;
	exports.generateUUID = generateUUID;
	function trim(string) {
	  return String(string).replace(/^\s+|\s+$/g, '');
	}

	function exists(input) {
	  return input !== null && input !== undefined;
	}

	//utiity to determine if a string is empty, null, or full of whitespaces
	function isEmpty(str) {
	  if (!(typeof str === "string")) return false; //UUUGH bad way of checking not a string
	  return !str || /^\s*$/.test(str) || str.length === 0 || !str.trim();
	}

	function itemsEqual(a, b) {
	  //perhaps an immutable library would not require such horrors?
	  if (JSON.stringify(a) === JSON.stringify(b)) {
	    return true;
	  }
	  return false;
	}

	/*converts input data to array if it is not already an array*/
	function toArray(data) {
	  if (!data) return [];
	  if (data.constructor !== Array) return [data];
	  return data;
	}

	/* JSON parse that always returns an object*/
	function safeJSONParse(str) {
	  try {
	    return JSON.parse(str) || {}; //from cycle.js
	  } catch (error) {
	    throw new Error("Error parsing data", JSON.stringify(str));
	  }
	}

	//file utils ??
	function getExtension(fname) {
	  return fname.substr((~ -fname.lastIndexOf(".") >>> 0) + 2).toLowerCase();
	}

	function getNameAndExtension(uri) {
	  var _uriElems = uri.split("?");
	  var name = _uriElems.shift().split("/").pop();
	  var ext = getExtension(uri);
	  return { name: name, ext: ext };
	}

	function isValidFile(file) {
	  return typeof file !== "undefined" && file !== null && file instanceof File;
	}

	//TODO: taken from three.js ,do correct attribution
	function generateUUID() {

	  // http://www.broofa.com/Tools/Math.uuid.htm

	  var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
	  var uuid = new Array(36);
	  var rnd = 0,
	      r = undefined;

	  return (function () {

	    for (var i = 0; i < 36; i++) {

	      if (i == 8 || i == 13 || i == 18 || i == 23) {

	        uuid[i] = '-';
	      } else if (i == 14) {

	        uuid[i] = '4';
	      } else {

	        if (rnd <= 0x02) rnd = 0x2000000 + Math.random() * 0x1000000 | 0;
	        r = rnd & 0xf;
	        rnd = rnd >> 4;
	        uuid[i] = chars[i == 19 ? r & 0x3 | 0x8 : r];
	      }
	    }
	    return uuid.join('');
	  })();
	}

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.postProcessMesh = postProcessMesh;
	exports.geometryFromBuffers = geometryFromBuffers;
	exports.meshTohash = meshTohash;

	var _three = __webpack_require__(3);

	var _three2 = _interopRequireDefault(_three);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	//TODO: UNIFY api for parsers, this is redundant
	function postProcessMesh(shape) {

	  //geometry
	  if (!(shape instanceof _three2.default.Object3D)) {
	    var material = new _three2.default.MeshPhongMaterial({ color: 0x17a9f5, specular: 0xffffff, shininess: 5, shading: _three2.default.FlatShading });
	    shape = new _three2.default.Mesh(shape, material);
	  }

	  //FIXME  should this be handled by the asset manager or the parsers ?
	  //ie , this won't work for loaded hierarchies etc
	  var geometry = shape.geometry;
	  if (geometry) {
	    geometry.computeVertexNormals(); //needed at least for .ply files
	    geometry.computeFaceNormals();
	  }

	  /* OLD STUFF, needs to be sorted out 
	    var vs = require('./vertShader.vert')();
	    var fs = require('./fragShader.frag')();
	     var material = new THREE.RawShaderMaterial( {
	            uniforms: {
	              time: { type: "f", value: 1.0 }
	            },
	            vertexShader: vs,
	            fragmentShader: fs,
	            side: THREE.DoubleSide,
	            transparent: true
	           } );
	    var material = new this.defaultMaterialType({color:color, specular: 0xffffff, shininess: 2, shading: THREE.FlatShading});//,vertexColors: THREE.VertexColors
	  */

	  //Additional hack, only for buffer geometry
	  if (!geometry.morphTargets) geometry.morphTargets = [];
	  if (!geometry.morphNormals) geometry.morphNormals = [];
	  return shape;
	}

	function geometryFromBuffers(_ref) {
	  var positions = _ref.positions;
	  var normals = _ref.normals;
	  var indices = _ref.indices;
	  var colors = _ref.colors;

	  var geometry = new _three2.default.BufferGeometry();

	  geometry.addAttribute('position', new _three2.default.BufferAttribute(positions, 3));
	  geometry.addAttribute('normal', new _three2.default.BufferAttribute(normals, 3));

	  if (indices) {
	    geometry.addAttribute('index', new _three2.default.BufferAttribute(indices, 1));
	  }
	  if (colors) {
	    geometry.addAttribute('color', new _three2.default.BufferAttribute(colors, 1));
	  }

	  return geometry;
	}

	//import Hashes from 'jshashes'
	function meshTohash(mesh) {
	  //let SHA512 = new Hashes.SHA512
	  //geometry.vertices
	  /*for obj in meshLoader.loadMeshes(arg):
	    for mesh in obj._meshList:
	      hash.update(mesh.vertexes.tostring())*/

	  var modelHash = hash.hex();
	  return modelHash;
	}

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;/*** IMPORTS FROM imports-loader ***/
	var Rx = __webpack_require__(26);

	(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.stlParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };

	},{}],2:[function(require,module,exports){
	(function (process){
	(function () {
	  // Hueristics.
	  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
	  var isBrowser = typeof window !== 'undefined';
	  var isModule = typeof module !== 'undefined' && !!module.exports;

	  // Export.
	  var detect = (isModule ? exports : (this.detect = {}));
	  detect.isNode = isNode;
	  detect.isBrowser = isBrowser;
	  detect.isModule = isModule;
	}).call(this);
	}).call(this,require('_process'))
	},{"_process":1}],3:[function(require,module,exports){
	'use strict';

	/**
	 * Analogue of Object.assign().
	 * Copies properties from one or more source objects to
	 * a target object. Existing keys on the target object will be overwritten.
	 *
	 * > Note: This differs from spec in some important ways:
	 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
	 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
	 * > For more details, see:
	 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 *
	 *
	 *
	 * @param  {Object} target      The target object to copy properties to.
	 * @param  {Object} source, ... The source(s) to copy properties from.
	 * @return {Object}             The updated target object.
	 */
	module.exports = function fastAssign (target) {
	  var totalArgs = arguments.length,
	      source, i, totalKeys, keys, key, j;

	  for (i = 1; i < totalArgs; i++) {
	    source = arguments[i];
	    keys = Object.keys(source);
	    totalKeys = keys.length;
	    for (j = 0; j < totalKeys; j++) {
	      key = keys[j];
	      target[key] = source[key];
	    }
	  }
	  return target;
	};

	},{}],4:[function(require,module,exports){
	(function (global){
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.outputs = undefined;
	exports.default = parse;

	var _compositeDetect = require('composite-detect');

	var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

	var _assign = require('fast.js/object/assign');

	var _assign2 = _interopRequireDefault(_assign);

	var _rx = typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null;

	var _rx2 = _interopRequireDefault(_rx);

	var _parseHelpers = require('./parseHelpers');

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}

	/**
	 * @author aleeper / http://adamleeper.com/
	 * @author mrdoob / http://mrdoob.com/
	 * @author gero3 / https://github.com/gero3
	 * @author kaosat-dev / https://github.com/kaosat-dev
	 *
	 * Description: A THREE parser for STL ASCII files & BINARY, as created by Solidworks and other CAD programs.
	 *
	 * Supports both binary and ASCII encoded files, with automatic detection of type.
	 *
	 * Limitations:
	 *  Binary decoding ignores header. There doesn't seem to be much of a use for it.
	 *  There is perhaps some question as to how valid it is to always assume little-endian-ness.
	 *  ASCII decoding assumes file is UTF-8. Seems to work for the examples...
	 *
	 * Usage:
	 *  var parser = new STLParser();
	 *  var loader = new THREE.XHRLoader( parser );
	 *  loader.addEventListener( 'load', function ( event ) {
	 *
	 *    var geometry = event.content;
	 *    scene.add( new THREE.Mesh( geometry ) );
	 *
	 *  } );
	 *  loader.load( './models/stl/slotted_disk.stl' );
	 */

	//var detectEnv = require("composite-detect");
	var outputs = exports.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser

	function parse(data) {
	  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  var defaults = {
	    useWorker: _compositeDetect2.default.isBrowser === true
	  };
	  parameters = (0, _assign2.default)({}, defaults, parameters);
	  var _parameters = parameters;
	  var useWorker = _parameters.useWorker;

	  var obs = new _rx2.default.ReplaySubject(1);

	  if (useWorker) {
	    (function () {
	      //var Worker = require("./worker.js")//Webpack worker!
	      //var worker = new Worker

	      var worker = new Worker((window.URL || window.webkitURL || window.mozURL).createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n\'use strict\';\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.parseSteps = parseSteps;\nexports.parseBinary = parseBinary;\nexports.parseASCII = parseASCII;\n\nvar _utils = require(\'./utils\');\n\nfunction parseSteps(data) {\n  data = (0, _utils.ensureBinary)(data);\n  var isBinary = (0, _utils.isDataBinary)(data);\n\n  var result = null;\n  if (isBinary) {\n    result = parseBinary(data);\n  } else {\n    result = parseASCII((0, _utils.ensureString)(data));\n  }\n  return result;\n}\n\nfunction parseBinary(data) {\n  var reader = new DataView(data);\n  var faces = reader.getUint32(80, true);\n  var dataOffset = 84;\n  var faceLength = 12 * 4 + 2;\n  var offset = 0;\n\n  var positions = new Float32Array(faces * 3 * 3);\n  var normals = new Float32Array(faces * 3 * 3);\n\n  for (var face = 0; face < faces; face++) {\n\n    var start = dataOffset + face * faceLength;\n\n    for (var i = 1; i <= 3; i++) {\n\n      var vertexstart = start + i * 12;\n\n      positions[offset] = reader.getFloat32(vertexstart, true);\n      positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);\n      positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);\n\n      normals[offset] = reader.getFloat32(start, true);\n      normals[offset + 1] = reader.getFloat32(start + 4, true);\n      normals[offset + 2] = reader.getFloat32(start + 8, true);\n      offset += 3;\n    }\n  }\n  return { positions: positions, normals: normals };\n}\n\n//ASCII stl parsing\nfunction parseASCII(data) {\n\n  var normal, patternFace, patternNormal, patternVertex, result, text;\n  patternFace = /facet([\\s\\S]*?)endfacet/g;\n\n  var posArray = [];\n  var normArray = [];\n  var indicesArray = [];\n  var faces = 0;\n\n  while ((result = patternFace.exec(data)) !== null) {\n    var length = 0;\n\n    text = result[0];\n    patternNormal = /normal[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n    while ((result = patternNormal.exec(text)) !== null) {\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n    }\n\n    patternVertex = /vertex[\\s]+([\\-+]?[0-9]+\\.?[0-9]*([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+[\\s]+([\\-+]?[0-9]*\\.?[0-9]+([eE][\\-+]?[0-9]+)?)+/g;\n\n    while ((result = patternVertex.exec(text)) !== null) {\n\n      posArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));\n      length += 1;\n    }\n    faces += 1;\n  }\n\n  var positions = new Float32Array(faces * 3 * 3);\n  var normals = new Float32Array(faces * 3 * 3);\n\n  positions.set(posArray);\n  normals.set(normArray);\n\n  return { positions: positions, normals: normals };\n}\n\n},{"./utils":2}],2:[function(require,module,exports){\n"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n  value: true\n});\nexports.ensureString = ensureString;\nexports.ensureBinary = ensureBinary;\nexports.isDataBinary = isDataBinary;\nfunction ensureString(buf) {\n\n  if (typeof buf !== "string") {\n    var array_buffer = new Uint8Array(buf);\n    var str = \'\';\n    for (var i = 0; i < buf.byteLength; i++) {\n      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian\n    }\n    return str;\n  } else {\n    return buf;\n  }\n}\n\nfunction ensureBinary(buf) {\n\n  if (typeof buf === "string") {\n    var array_buffer = new Uint8Array(buf.length);\n    for (var i = 0; i < buf.length; i++) {\n      array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian\n    }\n    return array_buffer.buffer || array_buffer;\n  } else {\n    return buf;\n  }\n}\n\nfunction isDataBinary(data) {\n  var expect, face_size, n_faces, reader;\n  reader = new DataView(data);\n  face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;\n\n  n_faces = reader.getUint32(80, true);\n  expect = 80 + 32 / 8 + n_faces * face_size;\n  return expect === reader.byteLength;\n}\n\n},{}],3:[function(require,module,exports){\n\'use strict\';\n\nvar _parseHelpers = require(\'./parseHelpers\');\n\nself.onmessage = function (event) {\n  var result = (0, _parseHelpers.parseSteps)(event.data.data);\n\n  var positions = result.positions.buffer;\n  var normals = result.normals.buffer;\n  self.postMessage({ positions: positions, normals: normals }, [positions, normals]);\n  self.close();\n}; //importScripts(\'./stl-utils.js\');\n\n},{"./parseHelpers":1}]},{},[3])'], { type: "text/javascript" }))); //browserify
	      worker.onmessage = function (event) {
	        var positions = new Float32Array(event.data.positions);
	        var normals = new Float32Array(event.data.normals);
	        var geometry = { positions: positions, normals: normals };

	        obs.onNext({ progress: 1, total: positions.length });
	        obs.onNext(geometry);
	        obs.onCompleted();
	      };
	      worker.onerror = function (event) {
	        obs.onError('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
	      };

	      worker.postMessage({ data: data });
	      obs.catch(function (e) {
	        return worker.terminate();
	      });
	    })();
	  } else {
	    try {
	      var result = (0, _parseHelpers.parseSteps)(data);
	      obs.onNext({ progress: 1, total: result.positions.length });
	      obs.onNext(result);
	      obs.onCompleted();
	    } catch (error) {
	      obs.onError(error);
	    }
	  }

	  return obs;
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"./parseHelpers":5,"composite-detect":2,"fast.js/object/assign":3}],5:[function(require,module,exports){
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.parseSteps = parseSteps;
	exports.parseBinary = parseBinary;
	exports.parseASCII = parseASCII;

	var _utils = require('./utils');

	function parseSteps(data) {
	  data = (0, _utils.ensureBinary)(data);
	  var isBinary = (0, _utils.isDataBinary)(data);

	  var result = null;
	  if (isBinary) {
	    result = parseBinary(data);
	  } else {
	    result = parseASCII((0, _utils.ensureString)(data));
	  }
	  return result;
	}

	function parseBinary(data) {
	  var reader = new DataView(data);
	  var faces = reader.getUint32(80, true);
	  var dataOffset = 84;
	  var faceLength = 12 * 4 + 2;
	  var offset = 0;

	  var positions = new Float32Array(faces * 3 * 3);
	  var normals = new Float32Array(faces * 3 * 3);

	  for (var face = 0; face < faces; face++) {

	    var start = dataOffset + face * faceLength;

	    for (var i = 1; i <= 3; i++) {

	      var vertexstart = start + i * 12;

	      positions[offset] = reader.getFloat32(vertexstart, true);
	      positions[offset + 1] = reader.getFloat32(vertexstart + 4, true);
	      positions[offset + 2] = reader.getFloat32(vertexstart + 8, true);

	      normals[offset] = reader.getFloat32(start, true);
	      normals[offset + 1] = reader.getFloat32(start + 4, true);
	      normals[offset + 2] = reader.getFloat32(start + 8, true);
	      offset += 3;
	    }
	  }
	  return { positions: positions, normals: normals };
	}

	//ASCII stl parsing
	function parseASCII(data) {

	  var normal, patternFace, patternNormal, patternVertex, result, text;
	  patternFace = /facet([\s\S]*?)endfacet/g;

	  var posArray = [];
	  var normArray = [];
	  var indicesArray = [];
	  var faces = 0;

	  while ((result = patternFace.exec(data)) !== null) {
	    var length = 0;

	    text = result[0];
	    patternNormal = /normal[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

	    while ((result = patternNormal.exec(text)) !== null) {
	      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
	      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
	      normArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
	    }

	    patternVertex = /vertex[\s]+([\-+]?[0-9]+\.?[0-9]*([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+[\s]+([\-+]?[0-9]*\.?[0-9]+([eE][\-+]?[0-9]+)?)+/g;

	    while ((result = patternVertex.exec(text)) !== null) {

	      posArray.push(parseFloat(result[1]), parseFloat(result[3]), parseFloat(result[5]));
	      length += 1;
	    }
	    faces += 1;
	  }

	  var positions = new Float32Array(faces * 3 * 3);
	  var normals = new Float32Array(faces * 3 * 3);

	  positions.set(posArray);
	  normals.set(normArray);

	  return { positions: positions, normals: normals };
	}

	},{"./utils":6}],6:[function(require,module,exports){
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.ensureString = ensureString;
	exports.ensureBinary = ensureBinary;
	exports.isDataBinary = isDataBinary;
	function ensureString(buf) {

	  if (typeof buf !== "string") {
	    var array_buffer = new Uint8Array(buf);
	    var str = '';
	    for (var i = 0; i < buf.byteLength; i++) {
	      str += String.fromCharCode(array_buffer[i]); // implicitly assumes little-endian
	    }
	    return str;
	  } else {
	    return buf;
	  }
	}

	function ensureBinary(buf) {

	  if (typeof buf === "string") {
	    var array_buffer = new Uint8Array(buf.length);
	    for (var i = 0; i < buf.length; i++) {
	      array_buffer[i] = buf.charCodeAt(i) & 0xff; // implicitly assumes little-endian
	    }
	    return array_buffer.buffer || array_buffer;
	  } else {
	    return buf;
	  }
	}

	function isDataBinary(data) {
	  var expect, face_size, n_faces, reader;
	  reader = new DataView(data);
	  face_size = 32 / 8 * 3 + 32 / 8 * 3 * 3 + 16 / 8;

	  n_faces = reader.getUint32(80, true);
	  expect = 80 + 32 / 8 + n_faces * face_size;
	  return expect === reader.byteLength;
	}

	},{}]},{},[4])(4)
	});


/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var require;var require;/*** IMPORTS FROM imports-loader ***/
	var Rx = __webpack_require__(26);

	(function(f){if(true){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.objParser = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return require(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
	// shim for using process in browser

	var process = module.exports = {};
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = setTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue.length;
	    while(len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    clearTimeout(timeout);
	}

	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        setTimeout(drainQueue, 0);
	    }
	};

	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};

	function noop() {}

	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;

	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};

	process.cwd = function () { return '/' };
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function() { return 0; };

	},{}],2:[function(require,module,exports){
	(function (process){
	(function () {
	  // Hueristics.
	  var isNode = typeof process !== 'undefined' && process.versions && !!process.versions.node;
	  var isBrowser = typeof window !== 'undefined';
	  var isModule = typeof module !== 'undefined' && !!module.exports;

	  // Export.
	  var detect = (isModule ? exports : (this.detect = {}));
	  detect.isNode = isNode;
	  detect.isBrowser = isBrowser;
	  detect.isModule = isModule;
	}).call(this);
	}).call(this,require('_process'))
	},{"_process":1}],3:[function(require,module,exports){
	'use strict';

	/**
	 * Analogue of Object.assign().
	 * Copies properties from one or more source objects to
	 * a target object. Existing keys on the target object will be overwritten.
	 *
	 * > Note: This differs from spec in some important ways:
	 * > 1. Will throw if passed non-objects, including `undefined` or `null` values.
	 * > 2. Does not support the curious Exception handling behavior, exceptions are thrown immediately.
	 * > For more details, see:
	 * > https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
	 *
	 *
	 *
	 * @param  {Object} target      The target object to copy properties to.
	 * @param  {Object} source, ... The source(s) to copy properties from.
	 * @return {Object}             The updated target object.
	 */
	module.exports = function fastAssign (target) {
	  var totalArgs = arguments.length,
	      source, i, totalKeys, keys, key, j;

	  for (i = 1; i < totalArgs; i++) {
	    source = arguments[i];
	    keys = Object.keys(source);
	    totalKeys = keys.length;
	    for (j = 0; j < totalKeys; j++) {
	      key = keys[j];
	      target[key] = source[key];
	    }
	  }
	  return target;
	};

	},{}],4:[function(require,module,exports){
	(function (global){
	'use strict';

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.inputDataType = exports.outputs = undefined;
	exports.default = parse;

	var _compositeDetect = require('composite-detect');

	var _compositeDetect2 = _interopRequireDefault(_compositeDetect);

	var _assign = require('fast.js/object/assign');

	var _assign2 = _interopRequireDefault(_assign);

	var _rx = typeof window !== "undefined" ? window['Rx'] : typeof global !== "undefined" ? global['Rx'] : null;

	var _rx2 = _interopRequireDefault(_rx);

	var _obj = require('./obj');

	var _obj2 = _interopRequireDefault(_obj);

	var _parseHelpers = require('./parseHelpers');

	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}

	var outputs = exports.outputs = ["geometry"]; //to be able to auto determine data type(s) fetched by parser
	/**
	 * @author mrdoob / http://mrdoob.com/
	 * @author kaosat-dev
	 */

	var inputDataType = exports.inputDataType = "arrayBuffer"; //to be able to set required input data type

	function parse(data) {
	  var parameters = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	  var defaults = {
	    useWorker: _compositeDetect2.default.isBrowser === true,
	    offsets: [0]
	  };
	  parameters = (0, _assign2.default)({}, defaults, parameters);

	  var _parameters = parameters;
	  var useWorker = _parameters.useWorker;
	  var offsets = _parameters.offsets;

	  var obs = new _rx2.default.ReplaySubject(1);

	  if (useWorker) {
	    (function () {
	      var worker = new Worker(window.URL.createObjectURL(new Blob(['(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module \'"+o+"\'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){\n"use strict";\n\nObject.defineProperty(exports, "__esModule", {\n\tvalue: true\n});\nvar OBJ = function OBJ() {};\n\nOBJ.prototype = {\n\tconstructor: OBJ\n};\n\nOBJ.prototype.parseIndex = function (index, type) {\n\n\tindex = parseInt(index);\n\tvar dataArray = this.currentObject._attributes[type];\n\n\treturn index >= 0 ? index - 1 : index + dataArray.length;\n};\n\nOBJ.prototype._handle_face_line = function (rawData, rIndices, indices, type) {\n\tvar data = [];\n\n\tvar tmpIdx = [];\n\tfor (var i = 0; i < rIndices.length; i++) {\n\t\tvar idx = rIndices[i];\n\t\t//console.log(data[ idx ]);\n\t\t//data.push( parseInt( rawData[ idx] ) );\n\t\tdata.push(this.parseIndex(rawData[idx], type));\n\t}\n\n\tif (isNaN(data[3])) {\n\t\tindices.push(data[0], data[1], data[2]);\n\t\t//indices.push( this.parseIndex( data[ 0 ], type) , this.parseIndex( data[ 1 ], type) , this.parseIndex( data[ 2 ], type) );\n\t} else {\n\t\t\tindices.push(data[0], data[1], data[3], data[1], data[2], data[3]);\n\t\t}\n};\n\nOBJ.prototype._newObject = function () {\n\tvar currentObject = {};\n\tcurrentObject._attributes = {};\n\tcurrentObject._attributes["position"] = [];\n\tcurrentObject._attributes["normal"] = [];\n\tcurrentObject._attributes["uv"] = [];\n\tcurrentObject._attributes["indices"] = [];\n\tcurrentObject.faceCount = 0;\n\treturn currentObject;\n};\n\nOBJ.prototype.getData = function (text) {\n\tvar vertex_pattern = /v( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// vn float float float\n\tvar normal_pattern = /vn( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// vt float float\n\tvar uv_pattern = /vt( +[\\d|\\.|\\+|\\-|e]+)( +[\\d|\\.|\\+|\\-|e]+)/;\n\t// f vertex vertex vertex ...\n\tvar face_pattern1 = /f( +\\d+)( +\\d+)( +\\d+)( +\\d+)?/;\n\t// f vertex/uv vertex/uv vertex/uv ...\n\tvar face_pattern2 = /f( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+))?/;\n\t// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...\n\tvar face_pattern3 = /f( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))( +(\\d+)\\/(\\d+)\\/(\\d+))?/;\n\t// f vertex//normal vertex//normal vertex//normal ...\n\tvar face_pattern4 = /f( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))( +(\\d+)\\/\\/(\\d+))?/;\n\n\ttext = text.replace(/\\\\\\r\\n/g, \'\'); // handles line continuations\n\tvar lines = text.split(\'\\n\');\n\n\tvar vertices = [];\n\tvar normals = [];\n\tvar uvs = [];\n\tvar indices = [];\n\tvar normIndices = [];\n\tvar uvIndices = [];\n\n\tvar faceCount = 0;\n\tvar face_offset = 0;\n\n\tvar defaultNormal = [1, 1, 1];\n\tvar defaultUv = [0, 0];\n\n\tvar objects = [];\n\tvar textures = {};\n\tvar materials = {};\n\n\tvar currentObject = this._newObject();\n\tthis.currentObject = currentObject;\n\tvar currentMaterial = {};\n\n\tvertices = currentObject._attributes["position"];\n\tnormals = currentObject._attributes["normal"];\n\tuvs = currentObject._attributes["uv"];\n\tindices = currentObject._attributes["indices"];\n\n\tfor (var i = 0; i < lines.length; i++) {\n\t\tvar line = lines[i];\n\t\tline = line.trim().toLowerCase(); //needed because of some "exponent" values in upper case\n\t\tvar result;\n\n\t\t//console.log(line);\n\n\t\tif (line.length === 0 || line.charAt(0) === \'#\') {\n\t\t\tcontinue;\n\t\t} else if ((result = vertex_pattern.exec(line)) !== null) {\n\t\t\t// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\tvertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));\n\t\t} else if ((result = normal_pattern.exec(line)) !== null) {\n\t\t\t// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]\n\t\t\tnormals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));\n\t\t} else if ((result = uv_pattern.exec(line)) !== null) {\n\t\t\t// ["vt 0.1 0.2", "0.1", "0.2"]\n\t\t\tuvs.push(parseFloat(result[1]), parseFloat(result[2]));\n\t\t} else if ((result = face_pattern1.exec(line)) !== null) {\n\t\t\t// ["f 1 2 3", "1", "2", "3", undefined]\n\t\t\t//console.log("result v1");\n\t\t\tthis._handle_face_line(result, [1, 2, 3, 4], indices, "position");\n\t\t\t//faces, uvs, normals_inds, geometry,face_offset, normals, uvs\n\t\t} else if ((result = face_pattern2.exec(line)) !== null) {\n\t\t\t\t// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]\n\t\t\t\t//console.log("result v2");\n\t\t\t\tthis._handle_face_line(result, [2, 5, 8, 11], indices, "position"); //2,5,8,11//possible winding order change of for some stuff11,8,5,2\n\t\t\t\tthis._handle_face_line(result, [3, 6, 9, 12], uvIndices, "uv");\n\t\t\t} else if ((result = face_pattern3.exec(line)) !== null) {\n\t\t\t\t// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]\n\t\t\t\t//console.log("result v3");\n\t\t\t\t//result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ]\n\t\t\t\tthis._handle_face_line(result, [2, 6, 10, 14], indices, "position"); //2,6,10,14\n\t\t\t\tthis._handle_face_line(result, [4, 8, 12, 16], normIndices, "normal");\n\t\t\t\tthis._handle_face_line(result, [3, 7, 11, 15], uvIndices, "uv");\n\t\t\t} else if ((result = face_pattern4.exec(line)) !== null) {\n\t\t\t\t//console.log("result v4");\n\t\t\t\t// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]\n\t\t\t\tthis._handle_face_line(result, [2, 5, 8, 11], indices, "position");\n\t\t\t\tthis._handle_face_line(result, [3, 6, 9, 12], normIndices, "normal");\n\t\t\t} else if (/^o /.test(line)) {\n\t\t\t\t// object\n\t\t\t\t//console.log("object")\n\t\t\t\tif (currentObject) {\n\t\t\t\t\t//if (!(geometry === undefined)) {\n\t\t\t\t\tface_offset = face_offset + vertices.length;\n\n\t\t\t\t\t//console.log("oldobject")\n\t\t\t\t\t//console.log( currentObject)\n\t\t\t\t\tcurrentObject.faceCount = indices.length;\n\n\t\t\t\t\t//reset all for next object\n\t\t\t\t\tcurrentObject = this._newObject();\n\t\t\t\t\tcurrentObject.name = line.substring(2).trim();\n\t\t\t\t\tvertices = currentObject._attributes["position"];\n\t\t\t\t\tnormals = currentObject._attributes["normal"];\n\t\t\t\t\tuvs = currentObject._attributes["uv"];\n\t\t\t\t\tindices = currentObject._attributes["indices"];\n\t\t\t\t\tnormIndices = currentObject._attributes["normIndices"];\n\t\t\t\t\tuvIndices = currentObject._attributes["uvIndices"];\n\n\t\t\t\t\tobjects.push(currentObject);\n\t\t\t\t}\n\t\t\t} else if (/^g /.test(line)) {\n\t\t\t\t// group\n\t\t\t\t//console.log("group");\n\t\t\t} else if (/^usemtl /.test(line)) {\n\t\t\t\t\t// material\n\t\t\t\t\tcurrentMaterial.name = line.substring(7).trim();\n\t\t\t\t} else if (/^mtllib /.test(line)) {\n\t\t\t\t\t// mtl file\n\t\t\t\t\tcurrentMaterial = {};\n\t\t\t\t} else if (/^s /.test(line)) {\n\t\t\t\t\t// smooth shading\n\t\t\t\t} else {\n\t\t\t\t\t\t// console.log( "OBJParser: Unhandled line " + line );\n\t\t\t\t\t}\n\t}\n\n\tif (objects.indexOf(currentObject) == -1) {\n\t\tobjects.push(currentObject);\n\t}\n\tcurrentObject.faceCount = indices.length / 3;\n\n\treturn {\n\t\tobjects: objects\n\t};\n};\n\n/*\n  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not\n*/\nOBJ.prototype._unindexData = function (object) {\n\tvar resultPositions = [];\n\tvar resultNormals = [];\n\tvar resultUv = [];\n\n\tvar vertices = object._attributes["position"];\n\tvar normals = object._attributes["normal"];\n\tvar uvs = object._attributes["uv"];\n\n\tfor (var i = 0; i < object.indices.length; i++) {\n\t\t//resultPositions.push( data. );\n\t}\n};\nexports.default = OBJ;\n\n},{}],2:[function(require,module,exports){\n\'use strict\';\n\nvar _obj = require(\'./obj\');\n\nvar _obj2 = _interopRequireDefault(_obj);\n\nfunction _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }\n\nself.onmessage = function (event) {\n\n  var data = event.data;\n  data = data.data;\n\n  var result = new _obj2.default().getData(data);\n\n  self.postMessage({ data: result });\n  self.close();\n};\n\n},{"./obj":1}]},{},[2])'], { type: "text/javascript" }))); //browserify

	      worker.onmessage = function (event) {
	        if ("data" in event.data) {
	          var data = event.data.data;
	          data.objects.forEach(function (modelData, index) {
	            obs.onNext({ progress: (index + 1) / Object.keys(data.objects).length, total: undefined });
	            obs.onNext((0, _parseHelpers.createModelBuffers)(modelData));
	          });
	          obs.onNext({ progress: 1, total: undefined });
	          obs.onCompleted();
	        } else if ("progress" in event.data) {
	          //console.log("got progress", event.data.progress);
	          obs.onNext({ progress: event.data.progress, total: Math.NaN });
	        }
	      };
	      worker.onerror = function (event) {
	        obs.onError('filename:' + event.filename + ' lineno: ' + event.lineno + ' error: ' + event.message);
	      };
	      worker.postMessage({ data: data });
	      obs.catch(function (e) {
	        return worker.terminate();
	      });
	    })();
	  } else {
	    data = new _obj2.default().getData(data);

	    data.objects.forEach(function (modelData, index) {
	      obs.onNext({ progress: (index + 1) / Object.keys(data.objects).length, total: undefined });
	      obs.onNext((0, _parseHelpers.createModelBuffers)(modelData));
	    });

	    obs.onNext({ progress: 1, total: undefined });
	    obs.onCompleted();
	  }
	  return obs;
	}

	}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
	},{"./obj":5,"./parseHelpers":6,"composite-detect":2,"fast.js/object/assign":3}],5:[function(require,module,exports){
	"use strict";

	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	var OBJ = function OBJ() {};

	OBJ.prototype = {
		constructor: OBJ
	};

	OBJ.prototype.parseIndex = function (index, type) {

		index = parseInt(index);
		var dataArray = this.currentObject._attributes[type];

		return index >= 0 ? index - 1 : index + dataArray.length;
	};

	OBJ.prototype._handle_face_line = function (rawData, rIndices, indices, type) {
		var data = [];

		var tmpIdx = [];
		for (var i = 0; i < rIndices.length; i++) {
			var idx = rIndices[i];
			//console.log(data[ idx ]);
			//data.push( parseInt( rawData[ idx] ) );
			data.push(this.parseIndex(rawData[idx], type));
		}

		if (isNaN(data[3])) {
			indices.push(data[0], data[1], data[2]);
			//indices.push( this.parseIndex( data[ 0 ], type) , this.parseIndex( data[ 1 ], type) , this.parseIndex( data[ 2 ], type) );
		} else {
				indices.push(data[0], data[1], data[3], data[1], data[2], data[3]);
			}
	};

	OBJ.prototype._newObject = function () {
		var currentObject = {};
		currentObject._attributes = {};
		currentObject._attributes["position"] = [];
		currentObject._attributes["normal"] = [];
		currentObject._attributes["uv"] = [];
		currentObject._attributes["indices"] = [];
		currentObject.faceCount = 0;
		return currentObject;
	};

	OBJ.prototype.getData = function (text) {
		var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
		// vn float float float
		var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
		// vt float float
		var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
		// f vertex vertex vertex ...
		var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;
		// f vertex/uv vertex/uv vertex/uv ...
		var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;
		// f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
		var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;
		// f vertex//normal vertex//normal vertex//normal ...
		var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/;

		text = text.replace(/\\\r\n/g, ''); // handles line continuations
		var lines = text.split('\n');

		var vertices = [];
		var normals = [];
		var uvs = [];
		var indices = [];
		var normIndices = [];
		var uvIndices = [];

		var faceCount = 0;
		var face_offset = 0;

		var defaultNormal = [1, 1, 1];
		var defaultUv = [0, 0];

		var objects = [];
		var textures = {};
		var materials = {};

		var currentObject = this._newObject();
		this.currentObject = currentObject;
		var currentMaterial = {};

		vertices = currentObject._attributes["position"];
		normals = currentObject._attributes["normal"];
		uvs = currentObject._attributes["uv"];
		indices = currentObject._attributes["indices"];

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			line = line.trim().toLowerCase(); //needed because of some "exponent" values in upper case
			var result;

			//console.log(line);

			if (line.length === 0 || line.charAt(0) === '#') {
				continue;
			} else if ((result = vertex_pattern.exec(line)) !== null) {
				// ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
				vertices.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
			} else if ((result = normal_pattern.exec(line)) !== null) {
				// ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
				normals.push(parseFloat(result[1]), parseFloat(result[2]), parseFloat(result[3]));
			} else if ((result = uv_pattern.exec(line)) !== null) {
				// ["vt 0.1 0.2", "0.1", "0.2"]
				uvs.push(parseFloat(result[1]), parseFloat(result[2]));
			} else if ((result = face_pattern1.exec(line)) !== null) {
				// ["f 1 2 3", "1", "2", "3", undefined]
				//console.log("result v1");
				this._handle_face_line(result, [1, 2, 3, 4], indices, "position");
				//faces, uvs, normals_inds, geometry,face_offset, normals, uvs
			} else if ((result = face_pattern2.exec(line)) !== null) {
					// ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
					//console.log("result v2");
					this._handle_face_line(result, [2, 5, 8, 11], indices, "position"); //2,5,8,11//possible winding order change of for some stuff11,8,5,2
					this._handle_face_line(result, [3, 6, 9, 12], uvIndices, "uv");
				} else if ((result = face_pattern3.exec(line)) !== null) {
					// ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
					//console.log("result v3");
					//result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ]
					this._handle_face_line(result, [2, 6, 10, 14], indices, "position"); //2,6,10,14
					this._handle_face_line(result, [4, 8, 12, 16], normIndices, "normal");
					this._handle_face_line(result, [3, 7, 11, 15], uvIndices, "uv");
				} else if ((result = face_pattern4.exec(line)) !== null) {
					//console.log("result v4");
					// ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
					this._handle_face_line(result, [2, 5, 8, 11], indices, "position");
					this._handle_face_line(result, [3, 6, 9, 12], normIndices, "normal");
				} else if (/^o /.test(line)) {
					// object
					//console.log("object")
					if (currentObject) {
						//if (!(geometry === undefined)) {
						face_offset = face_offset + vertices.length;

						//console.log("oldobject")
						//console.log( currentObject)
						currentObject.faceCount = indices.length;

						//reset all for next object
						currentObject = this._newObject();
						currentObject.name = line.substring(2).trim();
						vertices = currentObject._attributes["position"];
						normals = currentObject._attributes["normal"];
						uvs = currentObject._attributes["uv"];
						indices = currentObject._attributes["indices"];
						normIndices = currentObject._attributes["normIndices"];
						uvIndices = currentObject._attributes["uvIndices"];

						objects.push(currentObject);
					}
				} else if (/^g /.test(line)) {
					// group
					//console.log("group");
				} else if (/^usemtl /.test(line)) {
						// material
						currentMaterial.name = line.substring(7).trim();
					} else if (/^mtllib /.test(line)) {
						// mtl file
						currentMaterial = {};
					} else if (/^s /.test(line)) {
						// smooth shading
					} else {
							// console.log( "OBJParser: Unhandled line " + line );
						}
		}

		if (objects.indexOf(currentObject) == -1) {
			objects.push(currentObject);
		}
		currentObject.faceCount = indices.length / 3;

		return {
			objects: objects
		};
	};

	/*
	  extracts data based on indices since obj has different indices for normals, uvs etc, while webgl does not
	*/
	OBJ.prototype._unindexData = function (object) {
		var resultPositions = [];
		var resultNormals = [];
		var resultUv = [];

		var vertices = object._attributes["position"];
		var normals = object._attributes["normal"];
		var uvs = object._attributes["uv"];

		for (var i = 0; i < object.indices.length; i++) {
			//resultPositions.push( data. );
		}
	};
	exports.default = OBJ;

	},{}],6:[function(require,module,exports){
	"use strict";

	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	exports.createModelBuffers = createModelBuffers;
	//TODO: potential candidate for re-use across parsers with a few changes
	function createModelBuffers(modelData) {
	  //console.log("creating model buffers",modelData, modelData._attributes)

	  var faces = modelData.faceCount;
	  var colorSize = 3;

	  var positions = new Float32Array(faces * 3 * 3);
	  var normals = new Float32Array(faces * 3 * 3);
	  //let colors  = new Float32Array( faces *3 * colorSize )
	  var indices = new Uint32Array(faces * 3);

	  //vertices.set( modelData.position );
	  //normals.set( modelData.normal );
	  //indices.set( modelData.indices );

	  positions.set(modelData._attributes.position);
	  normals.set(modelData._attributes.normal);
	  indices.set(modelData._attributes.indices);

	  //materials = []
	  return { positions: positions, indices: indices, normals: normals };
	}

	/*
	OBJParser.prototype._parse = function( text )
	{
	  var object = new THREE.Object3D();
	  var geometry, material, mesh;
	  var face_offset = 0;

	  // create mesh if no objects in text
	  if ( /^o /gm.test( text ) === false ) {

	    geometry = new THREE.Geometry();
	    material = new THREE.MeshLambertMaterial();
	    mesh = new THREE.Mesh( geometry, material );
	    object.add( mesh );

	  }

	    var vertices = [];
	    var verticesCount = 0;
	    var normals = [];
	    var uvs = [];
	    // v float float float
	    var vertex_pattern = /v( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	    // vn float float float
	    var normal_pattern = /vn( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	    // vt float float
	    var uv_pattern = /vt( +[\d|\.|\+|\-|e]+)( +[\d|\.|\+|\-|e]+)/;
	    // f vertex vertex vertex ...
	    var face_pattern1 = /f( +\d+)( +\d+)( +\d+)( +\d+)?/;
	    // f vertex/uv vertex/uv vertex/uv ...
	    var face_pattern2 = /f( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))( +(\d+)\/(\d+))?/;
	    // f vertex/uv/normal vertex/uv/normal vertex/uv/normal ...
	    var face_pattern3 = /f( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))( +(\d+)\/(\d+)\/(\d+))?/;
	    // f vertex//normal vertex//normal vertex//normal ...
	    var face_pattern4 = /f( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))( +(\d+)\/\/(\d+))?/

	    var lines = text.split( '\n' );

	    for ( var i = 0; i < lines.length; i ++ ) {
	      var line = lines[ i ];
	      line = line.trim();
	      var result;

	      if ( line.length === 0 || line.charAt( 0 ) === '#' ) {
	        continue;
	      } else if ( ( result = vertex_pattern.exec( line ) ) !== null ) {
	        // ["v 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
	        geometry.vertices.push( vector(
	          parseFloat( result[ 1 ] ),
	          parseFloat( result[ 2 ] ),
	          parseFloat( result[ 3 ] )
	        ) );
	      } else if ( ( result = normal_pattern.exec( line ) ) !== null ) {
	        // ["vn 1.0 2.0 3.0", "1.0", "2.0", "3.0"]
	        normals.push( vector(
	          parseFloat( result[ 1 ] ),
	          parseFloat( result[ 2 ] ),
	          parseFloat( result[ 3 ] )
	        ) );
	      } else if ( ( result = uv_pattern.exec( line ) ) !== null ) {
	        // ["vt 0.1 0.2", "0.1", "0.2"]
	        uvs.push( uv(
	          parseFloat( result[ 1 ] ),
	          parseFloat( result[ 2 ] )
	        ) );
	      } else if ( ( result = face_pattern1.exec( line ) ) !== null ) {
	        // ["f 1 2 3", "1", "2", "3", undefined]
	        handle_face_line([ result[ 1 ], result[ 2 ], result[ 3 ], result[ 4 ] ], geometry,face_offset, normals, uvs);
	      } else if ( ( result = face_pattern2.exec( line ) ) !== null ) {
	        // ["f 1/1 2/2 3/3", " 1/1", "1", "1", " 2/2", "2", "2", " 3/3", "3", "3", undefined, undefined, undefined]
	        handle_face_line(
	          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
	          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //uv
	          , geometry, face_offset, normals, uvs
	        );
	      } else if ( ( result = face_pattern3.exec( line ) ) !== null ) {
	        // ["f 1/1/1 2/2/2 3/3/3", " 1/1/1", "1", "1", "1", " 2/2/2", "2", "2", "2", " 3/3/3", "3", "3", "3", undefined, undefined, undefined, undefined]
	        handle_face_line(
	          [ result[ 2 ], result[ 6 ], result[ 10 ], result[ 14 ] ], //faces
	          [ result[ 3 ], result[ 7 ], result[ 11 ], result[ 15 ] ], //uv
	          [ result[ 4 ], result[ 8 ], result[ 12 ], result[ 16 ] ] //normal
	          , geometry, face_offset, normals, uvs
	        );
	      } else if ( ( result = face_pattern4.exec( line ) ) !== null ) {
	        // ["f 1//1 2//2 3//3", " 1//1", "1", "1", " 2//2", "2", "2", " 3//3", "3", "3", undefined, undefined, undefined]
	        handle_face_line(
	          [ result[ 2 ], result[ 5 ], result[ 8 ], result[ 11 ] ], //faces
	          [ ], //uv
	          [ result[ 3 ], result[ 6 ], result[ 9 ], result[ 12 ] ] //normal
	          , geometry, face_offset, normals, uvs
	        );

	      } else if ( /^o /.test( line ) ) {
	        // object
	        if (!(geometry === undefined)) {
	          face_offset = face_offset + geometry.vertices.length;
	        }

	        geometry = new THREE.Geometry();
	        material = new THREE.MeshLambertMaterial();

	        mesh = new THREE.Mesh( geometry, material );
	        mesh.name = line.substring( 2 ).trim();
	        object.add( mesh );

	        verticesCount = 0;

	      } else if ( /^g /.test( line ) ) {
	        // group
	      } else if ( /^usemtl /.test( line ) ) {
	        // material
	        material.name = line.substring( 7 ).trim();
	      } else if ( /^mtllib /.test( line ) ) {
	        // mtl file
	      } else if ( /^s /.test( line ) ) {
	        // smooth shading
	      } else {
	        // console.log( "OBJParser: Unhandled line " + line );
	      }
	    }

	    for ( var i = 0, l = object.children.length; i < l; i ++ ) {
	      var geometry = object.children[ i ].geometry;
	    }

	    return object;
	}


	    function vector( x, y, z ) {
	      return new THREE.Vector3( x, y, z );
	    }

	    function uv( u, v ) {
	      return new THREE.Vector2( u, v );
	    }

	    function face3( a, b, c, normals ) {
	      return new THREE.Face3( a, b, c, normals );
	    }


	    function add_face( a, b, c, normals_inds, geometry ,face_offset, normals) {
	      if ( normals_inds === undefined ) {
	        geometry.faces.push( face3(
	          parseInt( a ) - (face_offset + 1),
	          parseInt( b ) - (face_offset + 1),
	          parseInt( c ) - (face_offset + 1)
	        ) );
	      } else {
	        geometry.faces.push( face3(
	          parseInt( a ) - (face_offset + 1),
	          parseInt( b ) - (face_offset + 1),
	          parseInt( c ) - (face_offset + 1),
	          [
	            normals[ parseInt( normals_inds[ 0 ] ) - 1 ].clone(),
	            normals[ parseInt( normals_inds[ 1 ] ) - 1 ].clone(),
	            normals[ parseInt( normals_inds[ 2 ] ) - 1 ].clone()
	          ]
	        ) );
	      }
	    }

	    function add_uvs( a, b, c, geometry , uvs) {
	      geometry.faceVertexUvs[ 0 ].push( [
	        uvs[ parseInt( a ) - 1 ].clone(),
	        uvs[ parseInt( b ) - 1 ].clone(),
	        uvs[ parseInt( c ) - 1 ].clone()
	      ] );
	    }

	    function handle_face_line(faces, uvs, normals_inds, geometry,face_offset, normals, uvs) {
	      if ( faces[ 3 ] === undefined ) {
	        add_face( faces[ 0 ], faces[ 1 ], faces[ 2 ], normals_inds, geometry,face_offset, normals );
	        if (!(uvs === undefined) && uvs.length > 0) {
	          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 2 ] , geometry , uvs);
	        }
	      } else {
	        if (!(normals_inds === undefined) && normals_inds.length > 0) {
	          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], [ normals_inds[ 0 ], normals_inds[ 1 ], normals_inds[ 3 ] ], geometry,face_offset, normals);
	          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], [ normals_inds[ 1 ], normals_inds[ 2 ], normals_inds[ 3 ] ], geometry,face_offset, normals);
	        } else {
	          add_face( faces[ 0 ], faces[ 1 ], faces[ 3 ], geometry,face_offset, normals);
	          add_face( faces[ 1 ], faces[ 2 ], faces[ 3 ], geometry,face_offset, normals);
	        }
	        if (!(uvs === undefined) && uvs.length > 0) {
	          add_uvs( uvs[ 0 ], uvs[ 1 ], uvs[ 3 ] , geometry,face_offset, normals);
	          add_uvs( uvs[ 1 ], uvs[ 2 ], uvs[ 3 ] , geometry,face_offset, normals);
	        }
	      }
	    }*/

	},{}]},{},[4])(4)
	});


/***/ }
/******/ ]);