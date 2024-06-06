var utils = new Utils({width : 2100, height : 2100});

utils.initShader({
    vertexShader : `#version 300 es
precision mediump float;

in vec2 aPosition;
in vec2 texCoords;
// Criar novo Uniform

out vec2 textureCoords; 

void main(){
  gl_Position = vec4(aPosition, 0.0, 1.0);
  textureCoords = texCoords;
}`,
    fragmentShader : `#version 300 es
precision highp float;

in vec2 textureCoords;

uniform sampler2D uSampler;
uniform vec2 uTextureSize;

uniform float uKernel[9];

out vec4 fColor;

void main(){
    vec2 onePixel = vec2(1.0, 1.0) / uTextureSize;

    vec4 soma = texture(uSampler, textureCoords + onePixel * vec2(-1,-1)) * uKernel[0] + 
    texture(uSampler, textureCoords + onePixel * vec2(-1,0)) * uKernel[1] + 
    texture(uSampler, textureCoords + onePixel * vec2(-1,1)) * uKernel[2] + 
    texture(uSampler, textureCoords + onePixel * vec2(0,-1)) * uKernel[3] + 
    texture(uSampler, textureCoords + onePixel * vec2(0,0)) * uKernel[4] + 
    texture(uSampler, textureCoords + onePixel * vec2(0,1)) * uKernel[5] + 
    texture(uSampler, textureCoords + onePixel * vec2(1,-1)) * uKernel[6] + 
    texture(uSampler, textureCoords + onePixel * vec2(1,0)) * uKernel[7] + 
    texture(uSampler, textureCoords + onePixel * vec2(1,1)) * uKernel[8];

    fColor = soma;

    fColor.a = 1.0;
}`
});

/******************************
 Posições do Quadrado
******************************/
var pxi = -0.4;
var pyi = -0.4;
var pxf = 0.4;
var pyf = 0.4;

vertices = [
    pxi, pyi, pxi, pyf, pxf, pyf,
    pxi, pyi, pxf, pyi, pxf, pyf
]

/******************************
Posições da Textura
******************************/
var txi = 1.0;
var tyi = 1.0;
var txf = 0.0;
var tyf = 0.0;

textureCoordinates = [
    txi, tyi, txi, tyf, txf, tyf,
    txi, tyi, txf, tyi, txf, tyf
]


/******************************
 Linkando com a GPU
******************************/
utils.initBuffer(
     {vertices : vertices}
);
utils.linkBuffer();

utils.initBuffer({vertices: textureCoordinates});
utils.linkBuffer({reading : 2, variable : "texCoords"});

/******************************
 Configurando as texturas
******************************/
var textureGatoPersa, textureBolinha;
var gatoPersaSize, bolinhaSize;
var loaded = 0;

// Carregar a imagem de textura
var gatoPersaImage = new Image();
gatoPersaImage.onload = function() {
    textureGatoPersa = utils.initTexture({image : gatoPersaImage});
    gatoPersaSize = [gatoPersaImage.width, gatoPersaImage.height];
    console.log(gatoPersaSize);
    loaded++;
};
gatoPersaImage.src = 'texturas/01_gato_persa.webp';

var bolinhasImage = new Image();
bolinhasImage.onload = function() {
    textureBolinha = utils.initTexture({image : bolinhasImage});
    bolinhaSize = [bolinhasImage.width, bolinhasImage.height];
    console.log(bolinhaSize);
    loaded++;
};
bolinhasImage.src = 'texturas/03_bolinhas.webp';

var speed = 300;

var kernel = [
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9
];


count = 0;
function render(){
    utils.activateTexture(textureGatoPersa, 0);
    utils.activateTexture(textureBolinha, 1);

    utils.linkUniformVariable({shaderName: "uKernel", value: kernel, kind: "1fv"})


    if (loaded == 2) {

        
        utils.linkUniformVariable({shaderName : "uSampler", value : count % 2, kind : "1i"})
        
        if ( count % 2 == 0) { utils.linkUniformVariable({shaderName : "uTextureSize", value : gatoPersaSize, kind : "2fv"}) } 
        
        else { utils.linkUniformVariable({shaderName : "uTextureSize", value : bolinhaSize, kind : "2fv"}) }
        
        utils.drawElements({method : "TRIANGLES"});
        
    }
        
    count = count + 1;
    setTimeout(
	function () {render();},
	speed
    );
}

render();