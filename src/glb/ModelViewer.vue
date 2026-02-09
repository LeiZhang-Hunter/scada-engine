<template>
  <div class="model-viewer">
    <!-- 3D渲染区域 -->
    <div ref="renderContainer" class="render-container"></div>

    <!-- 加载/错误状态 -->
    <div class="status-bar" v-if="isLoading || errorMessage">
      <div v-if="isLoading" class="loading-status">
        <div class="spinner"></div>
        <span>加载中: {{ loadProgress }}%</span>
      </div>
      <div v-else class="error-status">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ errorMessage }}</span>
      </div>
    </div>

    <!-- 顶部控制栏 -->
    <div class="control-bar" v-if="models.length > 0 && !isLoading && !errorMessage">
      <button @click="resetView" class="control-btn">
        <i class="fas fa-redo"></i> 重置视图
      </button>
      <button @click="toggleAutoRotate" class="control-btn">
        <i class="fas" :class="isAutoRotating ? 'fa-pause' : 'fa-play'"></i>
        {{ isAutoRotating ? '停止旋转' : '自动旋转' }}
      </button>
      <button @click="toggleModelDrag" class="control-btn primary">
        <i class="fas" :class="isModelDragMode ? 'fa-hand-stop' : 'fa-hand-paper'"></i>
        {{ isModelDragMode ? '退出拖拽' : '模型拖拽' }}
      </button>
    </div>

    <!-- 选中模型控制面板 -->
    <div class="model-control-panel" v-if="selectedModel && !isLoading && !errorMessage">
      <h3>{{ selectedModel.name }}</h3>
      <div class="position-controls">
        <div class="control-item" v-for="axis in ['x', 'y', 'z']" :key="axis">
          <label>{{ axis.toUpperCase() }} 轴</label>
          <input
              type="range"
              :min="positionRange.min"
              :max="positionRange.max"
              step="0.1"
              :value="selectedModel.position[axis]"
              @input="updateModelPosition(axis, $event.target.value)"
          >
          <span>{{ selectedModel.position[axis].toFixed(1) }}</span>
        </div>
      </div>
      <button @click="deselectModel" class="close-btn">关闭</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import * as TWEEN from '@tweenjs/tween.js';

// 定义父组件可传递的Props
const props = defineProps({
  models: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(item =>
          item.name && item.url &&
          typeof item.scale === 'number' &&
          item.initialPosition &&
          typeof item.initialPosition.x === 'number' &&
          item.startPoint && typeof item.startPoint.x === 'number' &&
          item.endPoint && typeof item.endPoint.x === 'number'
      );
    }
  },
  relations: {
    type: Array,
    default: () => [],
    validator: (value) => {
      return value.every(item =>
          typeof item.source === 'number' &&
          typeof item.target === 'number' &&
          ['start', 'end'].includes(item.sourcePoint) &&
          ['start', 'end'].includes(item.targetPoint) &&
          ['connection', 'dependency', 'dataflow'].includes(item.type)
      );
    }
  },
  positionRange: {
    type: Object,
    default: () => ({ min: -15, max: 15 })
  },
  bgColor: {
    type: String,
    default: '#f5f5f5'
  },
  useDraco: {
    type: Boolean,
    default: true
  },
  lightIntensity: {
    type: Object,
    default: () => ({
      ambient: 0.9,
      main: 1.2,
      secondary: 0.8
    })
  },
  lineConfig: {
    type: Object,
    default: () => ({
      arrowLength: 1.2
    })
  }
});

// 定义子组件对外的事件
const emits = defineEmits(['model-loaded', 'relation-updated', 'error']);

// 组件内部状态
const renderContainer = ref(null);
const isLoading = ref(false);
const loadProgress = ref(0);
const errorMessage = ref('');
const isAutoRotating = ref(false);
const isModelDragMode = ref(false);
const selectedModel = ref(null);
const loadedModels = ref([]);
const relationObjects = ref([]);

// Three.js核心对象
let scene, camera, renderer, controls;
let animationId = null;
let dracoLoader = null;
let dragState = { isDragging: false, lastX: 0, lastY: 0 };

// 链接关系样式配置
const relationStyles = {
  connection: { color: 0x3b82f6, lineWidth: 2 },
  dependency: { color: 0xf59e0b, lineWidth: 2 },
  dataflow: { color: 0x10b981, lineWidth: 3 }
};

// 初始化Three.js场景
function initScene() {
  // 创建场景
  scene = new THREE.Scene();
  scene.background = new THREE.Color(props.bgColor);

  // 增强光照系统
  const ambientLight = new THREE.AmbientLight(0xffffff, props.lightIntensity.ambient);
  scene.add(ambientLight);

  const mainLight = new THREE.DirectionalLight(0xffffff, props.lightIntensity.main);
  mainLight.position.set(15, 30, 20);
  mainLight.castShadow = true;
  mainLight.shadow.mapSize.set(4096, 4096);
  mainLight.shadow.camera.near = 0.1;
  mainLight.shadow.camera.far = 100;
  mainLight.shadow.camera.left = -50;
  mainLight.shadow.camera.right = 50;
  mainLight.shadow.camera.top = 50;
  mainLight.shadow.camera.bottom = -50;
  scene.add(mainLight);

  const secondaryLight = new THREE.DirectionalLight(0xffffff, props.lightIntensity.secondary);
  secondaryLight.position.set(-20, 25, -10);
  secondaryLight.castShadow = true;
  secondaryLight.shadow.mapSize.set(2048, 2048);
  secondaryLight.shadow.camera.near = 0.1;
  secondaryLight.shadow.camera.far = 100;
  scene.add(secondaryLight);

  const bottomLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.4);
  bottomLight.position.set(0, -20, 0);
  scene.add(bottomLight);

  // 创建相机
  camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
  );
  camera.position.set(0, 10, 20);

  // 渲染器配置
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  renderContainer.value.appendChild(renderer.domElement);

  // 初始化控制器
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.minDistance = 5;
  controls.maxDistance = 50;

  // 初始化DRACO加载器
  if (props.useDraco) {
    initDracoLoader();
  }

  // 窗口大小监听
  window.addEventListener('resize', handleWindowResize);

  // 模型点击选择
  setupModelSelection();

  // 启动动画循环
  startAnimationLoop();
}

// 初始化DRACO加载器
function initDracoLoader() {
  dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
  dracoLoader.preload();
}

// 模型加载与关系渲染
async function loadAllModels() {
  if (!renderContainer.value) return;

  isLoading.value = true;
  loadProgress.value = 0;
  loadedModels.value = [];
  clearRelationObjects();

  const loader = new GLTFLoader();
  if (props.useDraco && dracoLoader) {
    loader.setDRACOLoader(dracoLoader);
  }

  try {
    // 遍历加载每个模型
    for (let i = 0; i < props.models.length; i++) {
      const modelConfig = props.models[i];

      // 验证模型配置完整性
      if (!modelConfig.startPoint || !modelConfig.endPoint) {
        throw new Error(`模型「${modelConfig.name}」配置不完整，缺少startPoint或endPoint`);
      }
      if (typeof modelConfig.startPoint.x !== 'number' ||
          typeof modelConfig.startPoint.y !== 'number' ||
          typeof modelConfig.startPoint.z !== 'number') {
        throw new Error(`模型「${modelConfig.name}」的startPoint坐标不完整`);
      }
      if (typeof modelConfig.endPoint.x !== 'number' ||
          typeof modelConfig.endPoint.y !== 'number' ||
          typeof modelConfig.endPoint.z !== 'number') {
        throw new Error(`模型「${modelConfig.name}」的endPoint坐标不完整`);
      }

      await new Promise((resolve, reject) => {
        loader.load(
            modelConfig.url,
            (gltf) => {
              const modelInstance = gltf.scene;
              modelInstance.name = modelConfig.name;
              modelInstance.userData.modelIndex = i;
              // 存储模型首尾点的局部坐标
              modelInstance.userData.startPoint = new THREE.Vector3(
                  modelConfig.startPoint.x,
                  modelConfig.startPoint.y,
                  modelConfig.startPoint.z
              );
              modelInstance.userData.endPoint = new THREE.Vector3(
                  modelConfig.endPoint.x,
                  modelConfig.endPoint.y,
                  modelConfig.endPoint.z
              );

              modelInstance.scale.set(modelConfig.scale, modelConfig.scale, modelConfig.scale);
              modelInstance.position.set(
                  modelConfig.initialPosition.x,
                  modelConfig.initialPosition.y,
                  modelConfig.initialPosition.z
              );

              // 模型材质增强
              modelInstance.traverse(obj => {
                if (obj.isMesh) {
                  obj.castShadow = true;
                  obj.receiveShadow = true;
                  if (obj.material) {
                    obj.material.shininess = 30;
                    obj.material.emissiveIntensity = 0.25;
                    if (obj.material instanceof THREE.MeshStandardMaterial ||
                        obj.material instanceof THREE.MeshPhysicalMaterial) {
                      obj.material.roughness = 0.4;
                      obj.material.metalness = 0.3;
                    }
                    obj.material.needsUpdate = true;
                  }
                }
              });

              // 添加到场景和实例列表
              scene.add(modelInstance);
              loadedModels.value.push({
                name: modelConfig.name,
                instance: modelInstance,
                position: modelInstance.position.clone(),
                index: i
              });

              // 更新进度
              loadProgress.value = Math.round(((i + 1) / props.models.length) * 100);
              resolve();
            },
            () => {},
            (error) => {
              reject(new Error(`模型「${modelConfig.name}」加载失败: ${error.message}`));
            }
        );
      });
    }

    // 渲染模型首尾连接线
    renderRelations();
    errorMessage.value = '';
    emits('model-loaded', loadedModels.value);
  } catch (err) {
    errorMessage.value = err.message;
    emits('error', err.message);
  } finally {
    isLoading.value = false;
  }
}

// 计算模型首尾点的世界坐标
function getModelPointInWorldSpace(modelInstance, pointType) {
  const localPoint = pointType === 'start'
      ? modelInstance.userData.startPoint
      : modelInstance.userData.endPoint;

  return new THREE.Vector3().copy(localPoint)
      .applyMatrix4(modelInstance.matrixWorld);
}

// 渲染模型首尾连接线
function renderRelations() {
  clearRelationObjects();

  props.relations.forEach((relation, relationIndex) => {
    const sourceModel = loadedModels.value.find(m => m.index === relation.source);
    const targetModel = loadedModels.value.find(m => m.index === relation.target);

    if (!sourceModel || !targetModel) {
      console.warn(`关系${relationIndex}：源模型或目标模型不存在`);
      return;
    }

    const sourcePos = getModelPointInWorldSpace(sourceModel.instance, relation.sourcePoint);
    const targetPos = getModelPointInWorldSpace(targetModel.instance, relation.targetPoint);

    const lineGeometry = new THREE.BufferGeometry().setFromPoints([sourcePos, targetPos]);
    const style = relationStyles[relation.type];
    const lineMaterial = new THREE.LineBasicMaterial({
      color: style.color,
      linewidth: style.lineWidth,
      transparent: true,
      opacity: 0.9,
      linecap: 'round'
    });
    const line = new THREE.Line(lineGeometry, lineMaterial);

    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos).normalize();
    const arrowPosition = targetPos.clone().sub(direction.multiplyScalar(props.lineConfig.arrowLength));
    const arrow = new THREE.ArrowHelper(
        direction,
        arrowPosition,
        props.lineConfig.arrowLength,
        style.color,
        0.4,
        0.25
    );

    scene.add(line);
    scene.add(arrow);
    relationObjects.value.push({
      line,
      arrow,
      relation,
      sourceModel: sourceModel.index,
      targetModel: targetModel.index
    });
  });

  emits('relation-updated', props.relations);
}

// 更新连接线
function updateRelationObjects() {
  relationObjects.value.forEach(({ line, arrow, relation }) => {
    const sourceModel = loadedModels.value.find(m => m.index === relation.source);
    const targetModel = loadedModels.value.find(m => m.index === relation.target);

    if (!sourceModel || !targetModel) return;

    const sourcePos = getModelPointInWorldSpace(sourceModel.instance, relation.sourcePoint);
    const targetPos = getModelPointInWorldSpace(targetModel.instance, relation.targetPoint);

    line.geometry.setFromPoints([sourcePos, targetPos]);
    line.geometry.attributes.position.needsUpdate = true;

    const direction = new THREE.Vector3().subVectors(targetPos, sourcePos).normalize();
    const arrowPosition = targetPos.clone().sub(direction.multiplyScalar(props.lineConfig.arrowLength));
    arrow.setDirection(direction);
    arrow.position.copy(arrowPosition);
  });
}

// 清除链接关系
function clearRelationObjects() {
  relationObjects.value.forEach(({ line, arrow }) => {
    scene.remove(line);
    scene.remove(arrow);
    line.geometry.dispose();
    line.material.dispose();
  });
  relationObjects.value = [];
}

// 画布自动旋转
function toggleAutoRotate() {
  isAutoRotating.value = !isAutoRotating.value;
  if (isAutoRotating.value && isModelDragMode.value) {
    toggleModelDrag();
  }
}

// 模型拖拽模式
function toggleModelDrag() {
  isModelDragMode.value = !isModelDragMode.value;

  if (isModelDragMode.value) {
    controls.enableRotate = false;
    controls.enablePan = false;
    renderContainer.value.style.cursor = 'grab';

    if (!selectedModel.value && loadedModels.value.length > 0) {
      errorMessage.value = '请先点击选择一个模型再拖拽';
      setTimeout(() => errorMessage.value = '', 3000);
    }
  } else {
    controls.enableRotate = true;
    controls.enablePan = true;
    renderContainer.value.style.cursor = '';
    dragState.isDragging = false;
  }
}

// 模型点击选择
function setupModelSelection() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  renderContainer.value.addEventListener('click', (event) => {
    if (isLoading.value || (isModelDragMode.value && dragState.isDragging)) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(
        loadedModels.value.map(m => m.instance),
        true
    );

    if (intersects.length > 0) {
      const modelInstance = intersects[0].object;
      const parentModel = findModelParent(modelInstance);
      const selected = loadedModels.value.find(m => m.instance === parentModel);
      if (selected) {
        selectedModel.value = {
          name: selected.name,
          position: selected.position.clone(),
          index: selected.index,
          instance: selected.instance
        };
      }
    } else {
      selectedModel.value = null;
    }
  });

  // 模型拖拽逻辑
  renderContainer.value.addEventListener('mousedown', (event) => {
    if (!isModelDragMode.value || !selectedModel.value) return;
    dragState.isDragging = true;
    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
    renderContainer.value.style.cursor = 'grabbing';
  });

  renderContainer.value.addEventListener('mousemove', (event) => {
    if (!isModelDragMode.value || !dragState.isDragging || !selectedModel.value) return;

    const deltaX = event.clientX - dragState.lastX;
    const deltaY = event.clientY - dragState.lastY;
    const rotateSpeed = 0.008;

    const model = selectedModel.value.instance;
    model.rotation.y += deltaX * rotateSpeed;
    model.rotation.x += deltaY * rotateSpeed;
    model.rotation.x = Math.max(-Math.PI/3, Math.min(Math.PI/3, model.rotation.x));

    dragState.lastX = event.clientX;
    dragState.lastY = event.clientY;
  });

  window.addEventListener('mouseup', () => {
    if (dragState.isDragging) {
      dragState.isDragging = false;
      renderContainer.value.style.cursor = 'grab';
    }
  });

  window.addEventListener('mouseleave', () => {
    if (dragState.isDragging) {
      dragState.isDragging = false;
      renderContainer.value.style.cursor = 'grab';
    }
  });
}

// 查找模型根节点
function findModelParent(child) {
  let parent = child;
  while (parent.parent && !parent.userData.modelIndex) {
    parent = parent.parent;
  }
  return parent;
}

// 更新模型位置
function updateModelPosition(axis, value) {
  if (!selectedModel.value) return;

  const model = selectedModel.value.instance;
  const numericValue = parseFloat(value);
  model.position[axis] = numericValue;
  selectedModel.value.position[axis] = numericValue;

  updateRelationObjects();
}

// 取消模型选择
function deselectModel() {
  selectedModel.value = null;
  dragState.isDragging = false;
}

// 重置视图
function resetView() {
  new TWEEN.Tween(camera.position)
      .to({ x: 0, y: 10, z: 20 }, 1000)
      .easing(TWEEN.Easing.Quadratic.InOut)
      .start();

  scene.rotation.set(0, 0, 0);
  isAutoRotating.value = false;
  if (isModelDragMode.value) {
    toggleModelDrag();
  }
  selectedModel.value = null;

  loadedModels.value.forEach((model, index) => {
    const initialPos = props.models[index].initialPosition;
    model.instance.position.set(initialPos.x, initialPos.y, initialPos.z);
    model.instance.rotation.set(0, 0, 0);
    model.position.set(initialPos.x, initialPos.y, initialPos.z);
  });

  renderRelations();
}

// 窗口大小调整
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// 动画循环
function startAnimationLoop() {
  const animate = () => {
    animationId = requestAnimationFrame(animate);

    if (isAutoRotating.value && !isModelDragMode.value) {
      scene.rotation.y += 0.003;
    }

    if (relationObjects.value.length > 0) {
      updateRelationObjects();
    }

    controls.update();
    TWEEN.update();
    renderer.render(scene, camera);
  };
  animate();
}

// 监听Props变化
watch([() => props.models, () => props.relations], () => {
  if (scene) {
    loadAllModels();
  }
}, { deep: true });

// 组件挂载
onMounted(() => {
  initScene();
  loadAllModels();
});

// 组件卸载
onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId);
  window.removeEventListener('resize', handleWindowResize);

  if (scene) {
    loadedModels.value.forEach(model => scene.remove(model.instance));
    clearRelationObjects();
  }

  if (renderer) {
    renderer.dispose();
    const gl = renderer.domElement.getContext('webgl');
    if (gl && gl.getExtension('WEBGL_lose_context')) {
      gl.getExtension('WEBGL_lose_context').loseContext();
    }
  }
});
</script>

<style scoped>
.model-viewer {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
}

.render-container {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.render-container:active {
  cursor: grabbing;
}

.status-bar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 100;
}

.loading-status {
  background-color: rgba(255, 255, 255, 0.9);
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-status {
  background-color: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 8px;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #ddd;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.control-bar {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 10px;
  z-index: 100;
}

.control-btn {
  background-color: #475569;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: background-color 0.2s;
}

.control-btn:hover {
  background-color: #334155;
}

.control-btn.primary {
  background-color: #10b981;
}

.control-btn.primary:hover {
  background-color: #059669;
}

.model-control-panel {
  position: absolute;
  bottom: 20px;
  right: 20px;
  width: 320px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 16px;
  z-index: 100;
}

.model-control-panel h3 {
  margin: 0 0 16px 0;
  color: #1e293b;
  font-size: 1.1rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.position-controls {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.control-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.control-item label {
  width: 60px;
  font-size: 0.9rem;
  color: #475569;
}

.control-item input {
  flex: 1;
  height: 6px;
  accent-color: #3b82f6;
}

.control-item span {
  width: 40px;
  text-align: right;
  font-size: 0.9rem;
  color: #1e293b;
}

.close-btn {
  width: 100%;
  padding: 8px;
  background-color: #f1f5f9;
  border: none;
  border-radius: 4px;
  color: #475569;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #e2e8f0;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .control-bar {
    top: auto;
    bottom: 20px;
    left: 20px;
    right: 20px;
    justify-content: center;
  }

  .model-control-panel {
    width: calc(100% - 40px);
  }
}
</style>
