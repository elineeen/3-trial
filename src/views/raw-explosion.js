import * as THREE from "https://cdn.skypack.dev/three@0.124.0";
import ky from "https://cdn.skypack.dev/kyouka@1.2.2";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/GLTFLoader";
import { FBXLoader } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/loaders/FBXLoader";
import { EffectComposer } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/EffectComposer";
import Stats from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/libs/stats.module";
import * as dat from "https://cdn.skypack.dev/dat.gui@0.7.7";
import imagesLoaded from "https://cdn.skypack.dev/imagesloaded@4.1.4";
import { RenderPass } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "https://cdn.skypack.dev/three@0.124.0/examples/jsm/postprocessing/UnrealBloomPass.js";
import gsap from "https://cdn.skypack.dev/gsap@3.6.0";

const calcAspect = (el: HTMLElement) => el.clientWidth / el.clientHeight;

const getNormalizedMousePos = (e: MouseEvent | Touch) => {
    return {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: -(e.clientY / window.innerHeight) * 2 + 1
    };
};

class DOMMeshObject {
    el!: Element;
    rect!: DOMRect;
    mesh!: THREE.Mesh | THREE.Points;
    constructor(
        el: Element,
        scene: THREE.Scene,
        material: THREE.Material = new THREE.MeshBasicMaterial({ color: 0xff0000 }),
        isPoints = false
    ) {

        this.el = el;
        const rect = el.getBoundingClientRect();
        this.rect = rect;
        const { width, height } = rect;
        const geometry = new THREE.PlaneBufferGeometry(
            width,
            height,
            width,
            height
        );
        const mesh = isPoints
            ? new THREE.Points(geometry, material)
            : new THREE.Mesh(geometry, material);
        scene.add(mesh);
        this.mesh = mesh;
    }
    setPosition() {
        const { mesh, rect } = this;
        const { top, left, width, height } = rect;
        const x = left + width / 2 - window.innerWidth / 2;
        const y = -(top + height / 2 - window.innerHeight / 2) + window.scrollY;
        mesh.position.set(x, y, 0);
    }
}

const preloadImages = (sel = "img") => {
    return new Promise((resolve) => {
        imagesLoaded(sel, { background: true }, resolve);
    });
};

const particleExplodeVertexShader = `
vec4 permute(vec4 x){return mod(((x*34.)+1.)*x,289.);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-.85373472095314*r;}

float snoise(vec3 v){
    const vec2 C=vec2(1./6.,1./3.);
    const vec4 D=vec4(0.,.5,1.,2.);
    
    // First corner
    vec3 i=floor(v+dot(v,C.yyy));
    vec3 x0=v-i+dot(i,C.xxx);
    
    // Other corners
    vec3 g=step(x0.yzx,x0.xyz);
    vec3 l=1.-g;
    vec3 i1=min(g.xyz,l.zxy);
    vec3 i2=max(g.xyz,l.zxy);
    
    //  x0 = x0 - 0. + 0.0 * C
    vec3 x1=x0-i1+1.*C.xxx;
    vec3 x2=x0-i2+2.*C.xxx;
    vec3 x3=x0-1.+3.*C.xxx;
    
    // Permutations
    i=mod(i,289.);
    vec4 p=permute(permute(permute(
                i.z+vec4(0.,i1.z,i2.z,1.))
                +i.y+vec4(0.,i1.y,i2.y,1.))
                +i.x+vec4(0.,i1.x,i2.x,1.));
                
                // Gradients
                // ( N*N points uniformly over a square, mapped onto an octahedron.)
                float n_=1./7.;// N=7
                vec3 ns=n_*D.wyz-D.xzx;
                
                vec4 j=p-49.*floor(p*ns.z*ns.z);//  mod(p,N*N)
                
                vec4 x_=floor(j*ns.z);
                vec4 y_=floor(j-7.*x_);// mod(j,N)
                
                vec4 x=x_*ns.x+ns.yyyy;
                vec4 y=y_*ns.x+ns.yyyy;
                vec4 h=1.-abs(x)-abs(y);
                
                vec4 b0=vec4(x.xy,y.xy);
                vec4 b1=vec4(x.zw,y.zw);
                
                vec4 s0=floor(b0)*2.+1.;
                vec4 s1=floor(b1)*2.+1.;
                vec4 sh=-step(h,vec4(0.));
                
                vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
                vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
                
                vec3 p0=vec3(a0.xy,h.x);
                vec3 p1=vec3(a0.zw,h.y);
                vec3 p2=vec3(a1.xy,h.z);
                vec3 p3=vec3(a1.zw,h.w);
                
                //Normalise gradients
                vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
                p0*=norm.x;
                p1*=norm.y;
                p2*=norm.z;
                p3*=norm.w;
                
                // Mix final noise value
                vec4 m=max(.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.);
                m=m*m;
                return 42.*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),
                dot(p2,x2),dot(p3,x3)));
            }
            
            vec3 snoiseVec3(vec3 x){
                return vec3(snoise(vec3(x)*2.-1.),
                snoise(vec3(x.y-19.1,x.z+33.4,x.x+47.2))*2.-1.,
                snoise(vec3(x.z+74.2,x.x-124.5,x.y+99.4)*2.-1.)
            );
        }
        
        vec3 curlNoise(vec3 p){
            const float e=.1;
            vec3 dx=vec3(e,0.,0.);
            vec3 dy=vec3(0.,e,0.);
            vec3 dz=vec3(0.,0.,e);
            
            vec3 p_x0=snoiseVec3(p-dx);
            vec3 p_x1=snoiseVec3(p+dx);
            vec3 p_y0=snoiseVec3(p-dy);
            vec3 p_y1=snoiseVec3(p+dy);
            vec3 p_z0=snoiseVec3(p-dz);
            vec3 p_z1=snoiseVec3(p+dz);
            
            float x=p_y1.z-p_y0.z-p_z1.y+p_z0.y;
            float y=p_z1.x-p_z0.x-p_x1.z+p_x0.z;
            float z=p_x1.y-p_x0.y-p_y1.x+p_y0.x;
            
            const float divisor=1./(2.*e);
            return normalize(vec3(x,y,z)*divisor);
        }
        
        uniform float uTime;
        uniform float uProgress;
        varying vec2 vUv;
        
        void main(){
            vec3 noise=curlNoise(vec3(position.x*.02,position.y*.008,uTime*.05));
            vec3 distortion=vec3(position.x*2.,position.y,1.)*noise*uProgress;
            vec3 newPos=position+distortion;
            vec4 modelPosition=modelMatrix*vec4(newPos,1.);
            vec4 viewPosition=viewMatrix*modelPosition;
            vec4 projectedPosition=projectionMatrix*viewPosition;
            gl_Position=projectedPosition;
            gl_PointSize=2.;
            
            vUv=uv;
        }
`;

const particleExplodeFragmentShader = `
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uTexture;

varying vec2 vUv;

void main(){
    vec4 color=texture2D(uTexture,vUv);
    if(color.r<.1&&color.g<.1&&color.b<.1){
        discard;
    }
    gl_FragColor=color;
}
`;

class Base {
    debug: boolean;
    container: HTMLElement | null;
    scene!: THREE.Scene;
    camera!: THREE.PerspectiveCamera | THREE.OrthographicCamera;
    rendererParams!: Record<string, any>;
    perspectiveCameraParams!: Record<string, any>;
    orthographicCameraParams!: Record<string, any>;
    cameraPosition!: THREE.Vector3;
    lookAtPosition!: THREE.Vector3;
    renderer!: THREE.WebGLRenderer;
    controls!: OrbitControls;
    mousePos!: THREE.Vector2;
    raycaster!: THREE.Raycaster;
    sound!: THREE.Audio;
    stats!: Stats;
    composer!: EffectComposer;
    constructor(sel: string, debug = false) {
        this.debug = debug;
        this.container = document.querySelector(sel);
        this.perspectiveCameraParams = {
            fov: 75,
            near: 0.1,
            far: 100
        };
        this.orthographicCameraParams = {
            zoom: 2,
            near: -100,
            far: 1000
        };
        this.cameraPosition = new THREE.Vector3(0, 3, 10);
        this.lookAtPosition = new THREE.Vector3(0, 0, 0);
        this.rendererParams = {
            outputEncoding: THREE.LinearEncoding,
            config: {
                alpha: true,
                antialias: true
            }
        };
        this.mousePos = new THREE.Vector2(0, 0);
    }
    // 初始化
    init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createMesh({});
        this.createLight();
        this.createOrbitControls();
        this.addListeners();
        this.setLoop();
    }
    // 创建场景
    createScene() {
        const scene = new THREE.Scene();
        if (this.debug) {
            scene.add(new THREE.AxesHelper());
            const stats = Stats();
            this.container!.appendChild(stats.dom);
            this.stats = stats;
        }
        this.scene = scene;
    }
    // 创建透视相机
    createPerspectiveCamera() {
        const { perspectiveCameraParams, cameraPosition, lookAtPosition } = this;
        const { fov, near, far } = perspectiveCameraParams;
        const aspect = calcAspect(this.container!);
        const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 创建正交相机
    createOrthographicCamera() {
        const { orthographicCameraParams, cameraPosition, lookAtPosition } = this;
        const { left, right, top, bottom, near, far } = orthographicCameraParams;
        const camera = new THREE.OrthographicCamera(
            left,
            right,
            top,
            bottom,
            near,
            far
        );
        camera.position.copy(cameraPosition);
        camera.lookAt(lookAtPosition);
        this.camera = camera;
    }
    // 更新正交相机参数
    updateOrthographicCameraParams() {
        const { container } = this;
        const { zoom, near, far } = this.orthographicCameraParams;
        const aspect = calcAspect(container!);
        this.orthographicCameraParams = {
            left: -zoom * aspect,
            right: zoom * aspect,
            top: zoom,
            bottom: -zoom,
            near,
            far,
            zoom
        };
    }
    // 创建渲染
    createRenderer(useWebGL1 = false) {
        const { rendererParams } = this;
        const { outputEncoding, config } = rendererParams;
        const renderer = !useWebGL1
            ? new THREE.WebGLRenderer(config)
            : new THREE.WebGL1Renderer(config);
        renderer.setSize(this.container!.clientWidth, this.container!.clientHeight);
        renderer.outputEncoding = outputEncoding;
        this.resizeRendererToDisplaySize();
        this.container?.appendChild(renderer.domElement);
        this.renderer = renderer;
        this.renderer.setClearColor(0x000000, 0);
    }
    // 允许投影
    enableShadow() {
        this.renderer.shadowMap.enabled = true;
    }
    // 调整渲染器尺寸
    resizeRendererToDisplaySize() {
        const { renderer } = this;
        if (!renderer) {
            return;
        }
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const { clientWidth, clientHeight } = canvas;
        const width = (clientWidth * pixelRatio) | 0;
        const height = (clientHeight * pixelRatio) | 0;
        const isResizeNeeded = canvas.width !== width || canvas.height !== height;
        if (isResizeNeeded) {
            renderer.setSize(width, height, false);
        }
        return isResizeNeeded;
    }
    // 创建网格
    createMesh(
        meshObject: MeshObject,
        container: THREE.Scene | THREE.Mesh = this.scene
    ) {
        const {
            geometry = new THREE.BoxGeometry(1, 1, 1),
            material = new THREE.MeshStandardMaterial({
                color: new THREE.Color("#d9dfc8")
            }),
            position = new THREE.Vector3(0, 0, 0)
        } = meshObject;
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(position);
        container.add(mesh);
        return mesh;
    }
    // 创建光源
    createLight() {
        const dirLight = new THREE.DirectionalLight(
            new THREE.Color("#ffffff"),
            0.5
        );
        dirLight.position.set(0, 50, 0);
        this.scene.add(dirLight);
        const ambiLight = new THREE.AmbientLight(new THREE.Color("#ffffff"), 0.4);
        this.scene.add(ambiLight);
    }
    // 创建轨道控制
    createOrbitControls() {
        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        const { lookAtPosition } = this;
        controls.target.copy(lookAtPosition);
        controls.update();
        this.controls = controls;
    }
    // 监听事件
    addListeners() {
        this.onResize();
    }
    // 监听画面缩放
    onResize() {
        window.addEventListener("resize", (e) => {
            if (this.camera instanceof THREE.PerspectiveCamera) {
                const aspect = calcAspect(this.container!);
                const camera = this.camera as THREE.PerspectiveCamera;
                camera.aspect = aspect;
                camera.updateProjectionMatrix();
            } else if (this.camera instanceof THREE.OrthographicCamera) {
                this.updateOrthographicCameraParams();
                const camera = this.camera as THREE.OrthographicCamera;
                const {
                    left,
                    right,
                    top,
                    bottom,
                    near,
                    far
                } = this.orthographicCameraParams;
                camera.left = left;
                camera.right = right;
                camera.top = top;
                camera.bottom = bottom;
                camera.near = near;
                camera.far = far;
                camera.updateProjectionMatrix();
            }
            this.renderer.setSize(
                this.container!.clientWidth,
                this.container!.clientHeight
        );
        });
    }
    // 动画
    update() {
        console.log("animation");
    }
    // 渲染
    setLoop() {
        this.renderer.setAnimationLoop(() => {
            this.resizeRendererToDisplaySize();
            this.update();
            if (this.controls) {
                this.controls.update();
            }
            if (this.stats) {
                this.stats.update();
            }
            if (this.composer) {
                this.composer.render();
            } else {
                this.renderer.render(this.scene, this.camera);
            }
        });
    }
    // 创建文本
    createText(
        text = "",
        config: THREE.TextGeometryParameters,
        material: THREE.Material = new THREE.MeshStandardMaterial({
            color: "#ffffff"
        })
    ) {
        const geo = new THREE.TextGeometry(text, config);
        const mesh = new THREE.Mesh(geo, material);
        return mesh;
    }
    // 创建音效源
    createAudioSource() {
        const listener = new THREE.AudioListener();
        this.camera.add(listener);
        const sound = new THREE.Audio(listener);
        this.sound = sound;
    }
    // 加载音效
    loadAudio(url: string): Promise<AudioBuffer> {
        const loader = new THREE.AudioLoader();
        return new Promise((resolve) => {
            loader.load(url, (buffer) => {
                this.sound.setBuffer(buffer);
                resolve(buffer);
            });
        });
    }
    // 加载模型
    loadModel(url: string): Promise<THREE.Object3D> {
        const loader = new GLTFLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (gltf) => {
                    const model = gltf.scene;
                    resolve(model);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }
    // 加载FBX模型
    loadFBXModel(url: string): Promise<THREE.Object3D> {
        const loader = new FBXLoader();
        return new Promise((resolve, reject) => {
            loader.load(
                url,
                (obj) => {
                    resolve(obj);
                },
                undefined,
                (err) => {
                    console.log(err);
                    reject();
                }
            );
        });
    }
    // 加载字体
    loadFont(url: string): Promise<THREE.Font> {
        const loader = new THREE.FontLoader();
        return new Promise((resolve) => {
            loader.load(url, (font) => {
                resolve(font);
            });
        });
    }
    // 创建点选模型
    createRaycaster() {
        this.raycaster = new THREE.Raycaster();
        this.trackMousePos();
    }
    // 追踪鼠标位置
    trackMousePos() {
        window.addEventListener("mousemove", (e) => {
            this.setMousePos(e);
        });
        window.addEventListener("mouseout", () => {
            this.clearMousePos();
        });
        window.addEventListener("mouseleave", () => {
            this.clearMousePos();
        });
        window.addEventListener(
            "touchstart",
            (e: TouchEvent) => {
                this.setMousePos(e.touches[0]);
            },
            { passive: false }
        );
        window.addEventListener("touchmove", (e: TouchEvent) => {
            this.setMousePos(e.touches[0]);
        });
        window.addEventListener("touchend", () => {
            this.clearMousePos();
        });
    }
    // 设置鼠标位置
    setMousePos(e: MouseEvent | Touch) {
        const { x, y } = getNormalizedMousePos(e);
        this.mousePos.x = x;
        this.mousePos.y = y;
    }
    // 清空鼠标位置
    clearMousePos() {
        this.mousePos.x = -100000;
        this.mousePos.y = -100000;
    }
    // 获取点击物
    getInterSects(): THREE.Intersection[] {
        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const intersects = this.raycaster.intersectObjects(
            this.scene.children,
            true
        );
        return intersects;
    }
    // 选中点击物时
    onChooseIntersect(target: THREE.Object3D) {
        const intersects = this.getInterSects();
        const intersect = intersects[0];
        if (!intersect || !intersect.face) {
            return null;
        }
        const { object } = intersect;
        return target === object ? intersect : null;
    }
}

class ParticleExplode extends Base {
    clock!: THREE.Clock;
    particleExplodeMaterial!: THREE.ShaderMaterial;
    params!: any;
    bloomPass!: UnrealBloomPass;
    imageDOMMeshObj!: DOMMeshObject;
    image!: Element;
    isOpen!: boolean;
    constructor(sel: string, debug: boolean) {
        super(sel, debug);
        this.clock = new THREE.Clock();
        this.cameraPosition = new THREE.Vector3(0, 0, 1500);
        const fov = this.getScreenFov();
        this.perspectiveCameraParams = {
            fov,
            near: 0.1,
            far: 5000
        };
        this.params = {
            exposure: 1,
            bloomStrength: 0,
            bloomThreshold: 0,
            bloomRadius: 0
        };
        this.isOpen = false;
    }
    // 初始化
    async init() {
        this.createScene();
        this.createPerspectiveCamera();
        this.createRenderer();
        this.createParticleExplodeMaterial();
        await preloadImages();
        this.createPoints();
        this.createPostprocessingEffect();
        this.createClickEffect();
        this.createLight();
        this.trackMousePos();
        this.createOrbitControls();
        // this.createDebugPanel();
        this.addListeners();
        this.setLoop();
    }
    // 获取跟屏幕同像素的fov角度
    getScreenFov() {
        return ky.rad2deg(
            2 * Math.atan(window.innerHeight / 2 / this.cameraPosition.z)
        );
    }
    // 创建材质
    createParticleExplodeMaterial() {
        const particleExplodeMaterial = new THREE.ShaderMaterial({
            vertexShader: particleExplodeVertexShader,
            fragmentShader: particleExplodeFragmentShader,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: {
                    value: 0
                },
                uMouse: {
                    value: new THREE.Vector2(0, 0)
                },
                uResolution: {
                    value: new THREE.Vector2(window.innerWidth, window.innerHeight)
                },
                uProgress: {
                    value: 0
                },
                uTexture: {
                    value: null
                }
            }
        });
        this.particleExplodeMaterial = particleExplodeMaterial;
    }
    // 创建点
    createPoints() {
        const image = document.querySelector("img")!;
        this.image = image;
        const texture = new THREE.Texture(image);
        texture.needsUpdate = true;
        const material = this.particleExplodeMaterial.clone();
        material.uniforms.uTexture.value = texture;
        const imageDOMMeshObj = new DOMMeshObject(
            image,
            this.scene,
            material,
            true
        );
        imageDOMMeshObj.setPosition();
        this.imageDOMMeshObj = imageDOMMeshObj;
    }
    // 创建后期特效
    createPostprocessingEffect() {
        const renderScene = new RenderPass(this.scene, this.camera);
        const bloomPass = new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,
            0.4,
            0.85
        );
        bloomPass.threshold = this.params.bloomThreshold;
        bloomPass.strength = this.params.bloomStrength;
        bloomPass.radius = this.params.bloomRadius;
        this.bloomPass = bloomPass;
        this.composer = new EffectComposer(this.renderer);
        this.composer.addPass(renderScene);
        this.composer.addPass(bloomPass);
    }
    // 创建点击效果
    createClickEffect() {
        const material = this.imageDOMMeshObj.mesh.material as any;
        const image = this.image;
        image.addEventListener("click", () => {
            if (!this.isOpen) {
                gsap.to(material.uniforms.uProgress, {
                    value: 3,
                    duration: 1
                });
                this.isOpen = true;
            } else {
                gsap.to(material.uniforms.uProgress, {
                    value: 0,
                    duration: 1
                });
                this.isOpen = false;
            }
        });
    }
    // 动画
    update() {
        const elapsedTime = this.clock.getElapsedTime();
        const mousePos = this.mousePos;
        if (this.imageDOMMeshObj) {
            const material = this.imageDOMMeshObj.mesh.material as any;
            material.uniforms.uTime.value = elapsedTime;
            material.uniforms.uMouse.value = mousePos;
        }
        this.bloomPass.strength = this.params.bloomStrength;
    }
    // 创建调试面板
    createDebugPanel() {
        const gui = new dat.GUI();
        const material = this.imageDOMMeshObj.mesh.material as any;
        const uniforms = material.uniforms;
        const params = this.params;
        gui
            .add(uniforms.uProgress, "value")
            .min(0)
            .max(3)
            .step(0.01)
            .name("progress");
        gui.add(params, "bloomStrength").min(0).max(10).step(0.01);
    }
}

const start = () => {
    const particleExplode = new ParticleExplode(".particle-explode", false);
    particleExplode.init();
};

start();
