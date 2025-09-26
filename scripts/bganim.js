"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof =
  typeof Symbol === "function" && typeof Symbol.iterator === "symbol"
    ? function(obj) {
        return typeof obj;
      }
    : function(obj) {
        return obj &&
          typeof Symbol === "function" &&
          obj.constructor === Symbol &&
          obj !== Symbol.prototype
          ? "symbol"
          : typeof obj;
      };

var _pixi = require("./pixi.min");

var PIXI = _interopRequireWildcard(_pixi);

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};
    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key))
          newObj[key] = obj[key];
      }
    }
    newObj.default = obj;
    return newObj;
  }
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) {
      arr2[i] = arr[i];
    }
    return arr2;
  } else {
    return Array.from(arr);
  }
}

var copyComputedStyle = function(from, to) {
  var computed_style_object = false;
  var property;
  //trying to figure out which style object we need to use depense on the browser support
  //so we try until we have one
  computed_style_object =
    from.currentStyle || document.defaultView.getComputedStyle(from, null);

  //if the browser dose not support both methods we will return null
  if (!computed_style_object) return null;

  var stylePropertyValid = function(name, value) {
    //checking that the value is not a undefined
    return (
      typeof value !== "undefined" &&
      //checking that the value is not a object
      typeof value !== "object" &&
      //checking that the value is not a function
      typeof value !== "function" &&
      //checking that we dosent have empty string
      value.length > 0 &&
      //checking that the property is not int index ( happens on some browser
      value != parseInt(value)
    );
  };

  //we iterating the computed style object and compy the style props and the values
  for (property in computed_style_object) {
    //checking if the property and value we get are valid sinse browser have different implementations
    if (stylePropertyValid(property, computed_style_object[property])) {
      //applying the style property to the target element
      to.style[property] = computed_style_object[property];
    }
  }
};

var bgAnimator = function bgAnimator(options) {
  var stageWidth = 800,
    stageHeight = 600,
    playSpeed = options.playSpeed ? options.playSpeed : [5, 3],
    displaceScale = options.displaceScale ? options.displaceScale : [200, 70],
    displacementImage = options.displacementImage,
    interactive = false,
    noDOMProcessing = options.noDOMProcessing,
    bgImage = void 0,
    domElement = options.domElement,
    renderer = void 0,
    bgImageTexture = void 0,
    displacementSprite = void 0,
    displacementFilter = void 0,
    stage = void 0,
    slidesContainer = void 0,
    ticker = void 0,
    texture = void 0,
    imageSprite = void 0;

  var getBackgroudImage = function getBackgroudImage(element) {
    var style = element.currentStyle || window.getComputedStyle(element, false);
    var bgImage = style.backgroundImage.slice(4, -1).replace(/["']/g, "");
    return bgImage;
  };

  var rotateSprite = function rotateSprite() {
    displacementSprite.rotation += 0.001;
    rafHandler = requestAnimationFrame(rotateSprite);
  };

  //Creates another div and move child elements to keep it visible
  var adjustDOM = function adjustDOM() {
    //Make the parent element position relative
    var newDiv = document.createElement("div");
    copyComputedStyle(domElement, newDiv);
    domElement.style.position = "relative";
    var siblings = [].concat(_toConsumableArray(domElement.children));
    var i = void 0;
    newDiv.setAttribute(
      "style",
      "\n      position:absolute;\n      width:100%;\n      height:100%;\n      top:0;\n      left:0;\n      background-color: transparent;\n      z-index:1;\n    "
    );
    domElement.appendChild(newDiv);
    for (i = 0; i < siblings.length; i++) {
      domElement.removeChild(siblings[i]);
      newDiv.appendChild(siblings[i]);
    }
  };

  var initPixi = function initPixi() {
    if (noDOMProcessing !== true) {
      adjustDOM();
    }
    domElement.appendChild(renderer.view);

    stage.addChild(slidesContainer);

    // Enable Interactions
    stage.interactive = true;

    domElement.style.overflow = "hidden";

    // Fit renderer to the screen

    renderer.view.style.objectFit = "cover";
    renderer.view.style.width = "100%";
    renderer.view.style.height = "100%";
    renderer.view.style.top = "0";
    renderer.view.style.left = "0";
    renderer.view.style.position = "absolute";
    // renderer.view.style.webkitTransform =
    //   "translate( -50%, -50% ) scale(1.2)";
    // renderer.view.style.transform = "translate( -50%, -50% ) scale(1.2)";

    displacementSprite.texture.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT;

    // Set the filter to stage and set some default values for the animation
    stage.filters = [displacementFilter];

    if (options.autoPlay === false) {
      displacementFilter.scale.x = 0;
      displacementFilter.scale.y = 0;
    }

    // if (options.wacky === true) {
    //   displacementSprite.anchor.set(0.5);
    //   displacementSprite.x = renderer.width / 2;
    //   displacementSprite.y = renderer.height / 2;
    // }

    displacementSprite.scale.x = 2;
    displacementSprite.scale.y = 2;

    // PIXI tries to fit the filter bounding box to the renderer so we optionally bypass
    displacementFilter.autoFit = false;

    stage.addChild(displacementSprite);
  };

  var init = function init() {
    initPixi();
    ticker = new PIXI.ticker.Ticker();
    ticker.autoStart = true;

    ticker.add(function(delta) {
      displacementSprite.x += playSpeed[0] * delta;
      displacementSprite.y += playSpeed[1];
      renderer.render(stage);
    });

    if (typeof options.onInitComplete === "function") {
      options.onInitComplete();
    }
  };

  var setup = function setup() {
    "Loading complete", "Setting width";
    renderer.resize(stageWidth, stageHeight);
    init();
  };

  switch (_typeof(options.domElement)) {
    case "string":
      domElement = document.querySelector(options.domElement);
      break;
    case "object":
      domElement = options.domElement;
      break;
    default:
      domElement = null;
  }

  if (!(domElement instanceof Element)) {
    console.info("Aborting, supplied element is not valid");
    return;
  }
  bgImage = getBackgroudImage(domElement);
  if (!bgImage) {
    console.info("Aborting, supplied element has no background image");
  }
  if (!displacementImage) {
    console.info("Aborting, no displacement image");
  }

  var loader = new PIXI.loaders.Loader();
  loader.add("displacementImg", displacementImage);
  loader.add("bgImage", bgImage);

  renderer = new PIXI.autoDetectRenderer({
    transparent: true,
    resolution: 1
  });

  stage = new PIXI.Container();
  slidesContainer = new PIXI.Container();

  loader.on("complete", function(loader, resources, IMAGE) {
    displacementSprite = new PIXI.Sprite(resources.displacementImg.texture);
    displacementFilter = new PIXI.filters.DisplacementFilter(
      displacementSprite
    );
    bgImageTexture = new PIXI.Sprite(resources.bgImage.texture);
    slidesContainer.addChild(bgImageTexture);
    stageWidth = bgImageTexture.width;
    stageHeight = bgImageTexture.height;
  });
  loader.load(setup);
};

exports.bgAnimator = bgAnimator;
