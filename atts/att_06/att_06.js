var sceneSize = 200
let utils = new Utils({ width: sceneSize * 4, height: sceneSize * 3, a: .2 });

let rotationXCtrl = new Controls("rotation-x", "Baixo", "Cima")
let rotationYCtrl = new Controls("rotation-y", "Direita", "Esquerda")
let rotationZCtrl = new Controls("rotation-z", "Horário", "Anti-Horário")
let scaleCtrl = new Controls("scale", "Aumentando", "Diminuindo", { increment: .01 })
let translationCtrl = new Controls("translation", "Pra Frente", "Pra Trás", { increment: .01 })
let speedSlider = window.document.querySelector("#spd-slider")
let speedValueEl = window.document.querySelector("#speed-value")

speedSlider.addEventListener("input", () => {
    speed = -speedSlider.value
    speedValueEl.innerText = -speedSlider.value
})

let vertices = [];
let colors = [];

let cubeVertices = [
    [-.5, -.5, .5],
    [-.5, .5, .5],
    [-.5, .5, -.5],
    [-.5, -.5, -.5],
    [.5, -.5, .5],
    [.5, .5, .5],
    [.5, .5, -.5],
    [.5, -.5, -.5]
];

let textureCoordinates = [
    // 0
    0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
    0.0, 0.0, 1.0, 1.0, 0.0, 1.0,
]
let drawColors = {
    azul: [0.015625, 0.3125, 0.56640625],
    ciano: [0.26171875, 0.7421875, 0.84375],
    amarelo: [1, 0.87109375, 0],
    verde: [0, 0.609, 0.230],
    vermelho: [1, 0, 0],
    branco: [1, 1, 1],
    preto: [0, 0, 0]
};

utils.initShader({
    vertexShader: `#version 300 es
                        precision mediump float;

                        in vec3 aPosition;
                        
                        in vec3 aColor;
                        out vec4 vColor;

                        uniform float resize;
                        uniform vec3 theta;
                        uniform float translate;

                        uniform mat4 uViewMatrix;
                        uniform mat4 uProjectionMatrix;

                        in vec2 texCoords;
                        out vec2 textureCoords;

                        void main(){

                            vec3 angles = radians(theta);
                            vec3 c = cos(angles);
                            vec3 s = sin(angles);

                            mat4 rx = mat4( 1.0, 0.0, 0.0, 0.0,
                                            0.0, c.x, -s.x, 0.0,
                                            0.0, s.x, c.x,  0.0,
                                            0.0, 0.0, 0.0, 1.0);

                            mat4 ry = mat4( c.y, 0.0, s.y, 0.0,
                                            0.0, 1.0, 0.0, 0.0,
                                            -s.y, 0.0, c.y, 0.0,
                                            0.0, 0.0, 0.0, 1.0);

                            mat4 rz = mat4( c.z, -s.z, 0.0, 0.0,
                                            s.z, c.z, 0.0, 0.0,
                                            0.0, 0.0, 1.0, 0.0,
                                            0.0, 0.0, 0.0, 1.0);

                            gl_PointSize = 10.0;
                            gl_Position = rx * ry * rz * vec4(aPosition, 1.0);
                            gl_Position.x = (gl_Position.x * resize) + translate;
                            gl_Position.y = (gl_Position.y * resize) + translate;
                            vColor = vec4(aColor, 1.0);
                            textureCoords = texCoords;
                        }`,

    fragmentShader: `#version 300 es
                        precision highp float;
                        
                        in vec2 textureCoords;

                        uniform sampler2D uSampler;
                        
                        out vec4 fColor;

                        void main(){
                            fColor = texture(uSampler, textureCoords);
                        }`
});

let theta = [0, 0, 0]
let size = 1;
let translate_x_y = 0;

let speed = 10;

try {
    let textures = [
        startupTexture("assets/casa_bw.jpg"),           // 0
        startupTexture("assets/lobo.jpg"),              // 1
        startupTexture("assets/metro.jpg"),             // 2
        startupTexture("assets/montanha_neve.jpg"),     // 3
        startupTexture("assets/pessoa_de_costas.jpg"),  // 4
        startupTexture("assets/pontos_luz.jpg")         // 5
    ];
    activateTextures(textures)
} catch (e) {
    console.error(e)
}

utils.initBuffer({ vertices: textureCoordinates });
utils.linkBuffer({ variable: "texCoords", reading: 2 });

render()

function render() {

    theta[0] += rotationXCtrl.currValue;
    theta[1] += rotationYCtrl.currValue;
    theta[2] += rotationZCtrl.currValue
    size += scaleCtrl.currValue;
    translate_x_y += translationCtrl.currValue;

    // Frente: Casa
    drawFace(
        [2, 6, 7, 3],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "branco",
            uSamplerID: 0

        }
    )

    // Esquerda: Lobo
    drawFace(
        [0, 1, 2, 3],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "vermelho",
            uSamplerID: 1
        }
    )

    // Baixo: Metro
    drawFace(
        [3, 7, 4, 0],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "azul",
            uSamplerID: 2
        }
    )
    

    // Atras: Montanha
    drawFace(
        [4, 5, 1, 0],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "verde",
            uSamplerID: 3
        }
    )


    // Cima: Pessoas
    drawFace(
        [5, 6, 2, 1],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "amarelo",
            uSamplerID: 4
        }
    )


    // Direita: Pontos
    drawFace(
        [6, 5, 4, 7],
        {
            theta: theta,
            resize: size,
            translation: translate_x_y,
            clear: false,
            cor: "ciano",
            uSamplerID: 5
        }
    ) 

    window.setTimeout(() => render(), speed)
}

function drawFace(vertices_info, { theta = [0, 0, 0], resize = 1, translation = 0, method = "TRIANGLES", clear = false, reading = 3, uSamplerID = 0, cor = "preto" }) {

    makeFace(...vertices_info, cor);


    utils.initBuffer({ vertices });
    utils.linkBuffer({ variable: "aPosition", reading: reading });

    utils.initBuffer({ vertices: colors });
    utils.linkBuffer({ variable: "aColor", reading: 3 });

    utils.linkUniformVariable({ shaderName: "resize", value: resize, kind: "1f" })
    utils.linkUniformVariable({ shaderName: "theta", value: theta, kind: "3fv" })
    utils.linkUniformVariable({ shaderName: "translate", value: translation, kind: "1f" })

    utils.linkUniformVariable({ shaderName: "uSampler", value: uSamplerID, kind: "1i" })

    utils.drawElements({ method: method, clear })
}

function activateTextures(textures) {
    let gl = utils.gl;
    textures.forEach((tex, idx) => {
        gl.activeTexture(gl[`TEXTURE${idx}`])
        gl.bindTexture(gl.TEXTURE_2D, tex)
    })
}

function startupTexture(src) {
    let gl = utils.gl;
    let texture = gl.createTexture();
    var img = new Image();
    img.onload = function () {
        // Configuraremos a textureBolinha aqui.
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    }
    img.src = src;
    return texture;
}

function makeFace(v1, v2, v3, v4, cor) {
    clearVerticesAndColors()

    let triangulos = [];

    triangulos.push(v1, v2, v3);
    triangulos.push(v1, v3, v4);

    triangulos.forEach(vertice => {
        vertices.push(...cubeVertices[vertice]);
        colors.push(...drawColors[cor]);
    })
    console.log(vertices)
}

function clearVerticesAndColors() {
    vertices = []
    colors = []
}