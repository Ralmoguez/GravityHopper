import { writeFileSync } from "fs";

function createCubeGeometry() {
  const positions = [];
  const normals = [];
  const uvs = [];
  const indices = [];

  const faces = [
    { // +X
      normal: [1, 0, 0],
      corners: [
        [0.5, -0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, 0.5, 0.5],
        [0.5, -0.5, 0.5],
      ],
    },
    { // -X
      normal: [-1, 0, 0],
      corners: [
        [-0.5, -0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, 0.5, -0.5],
        [-0.5, -0.5, -0.5],
      ],
    },
    { // +Y
      normal: [0, 1, 0],
      corners: [
        [-0.5, 0.5, 0.5],
        [0.5, 0.5, 0.5],
        [0.5, 0.5, -0.5],
        [-0.5, 0.5, -0.5],
      ],
    },
    { // -Y
      normal: [0, -1, 0],
      corners: [
        [-0.5, -0.5, -0.5],
        [0.5, -0.5, -0.5],
        [0.5, -0.5, 0.5],
        [-0.5, -0.5, 0.5],
      ],
    },
    { // +Z
      normal: [0, 0, 1],
      corners: [
        [0.5, -0.5, 0.5],
        [0.5, 0.5, 0.5],
        [-0.5, 0.5, 0.5],
        [-0.5, -0.5, 0.5],
      ],
    },
    { // -Z
      normal: [0, 0, -1],
      corners: [
        [-0.5, -0.5, -0.5],
        [-0.5, 0.5, -0.5],
        [0.5, 0.5, -0.5],
        [0.5, -0.5, -0.5],
      ],
    },
  ];

  faces.forEach(face => {
    const start = positions.length / 3;
    face.corners.forEach(([x, y, z], cornerIndex) => {
      positions.push(x, y, z);
      normals.push(...face.normal);
      const u = cornerIndex === 0 || cornerIndex === 3 ? 0 : 1;
      const v = cornerIndex === 0 || cornerIndex === 1 ? 0 : 1;
      uvs.push(u, v);
    });
    indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
  });

  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    uvs: new Float32Array(uvs),
    indices: new Uint16Array(indices),
  };
}

function quaternionFromAxisAngle(axis, angle) {
  const [ax, ay, az] = axis;
  const half = angle / 2;
  const s = Math.sin(half);
  const c = Math.cos(half);
  const length = Math.hypot(ax, ay, az) || 1;
  return [
    (ax / length) * s,
    (ay / length) * s,
    (az / length) * s,
    c,
  ];
}

function addBufferResource(state, array, opts) {
  const { buffers, bufferViews, accessors } = state;
  const componentType = opts.componentType;
  const type = opts.type;
  const count = opts.count ?? array.length / (opts.components || 1);
  const target = opts.target;
  const normalized = opts.normalized;
  const min = opts.min;
  const max = opts.max;

  const padding = (4 - (state.byteLength % 4)) % 4;
  if (padding) {
    buffers.push(Buffer.alloc(padding));
    state.byteLength += padding;
  }

  const buffer = Buffer.from(
    array.buffer,
    array.byteOffset,
    array.byteLength
  );
  buffers.push(buffer);

  const bufferViewIndex = bufferViews.length;
  bufferViews.push({
    buffer: 0,
    byteOffset: state.byteLength,
    byteLength: array.byteLength,
    ...(target ? { target } : {}),
  });

  state.byteLength += array.byteLength;

  const accessorIndex = accessors.length;
  accessors.push({
    bufferView: bufferViewIndex,
    componentType,
    count,
    type,
    ...(normalized ? { normalized: true } : {}),
    ...(min ? { min } : {}),
    ...(max ? { max } : {}),
  });

  return accessorIndex;
}

function createAstronautGltf() {
  const cube = createCubeGeometry();

  const state = {
    buffers: [],
    bufferViews: [],
    accessors: [],
    byteLength: 0,
  };

  const positionAccessor = addBufferResource(state, cube.positions, {
    componentType: 5126,
    type: "VEC3",
    components: 3,
    count: cube.positions.length / 3,
    target: 34962,
    min: [-0.5, -0.5, -0.5],
    max: [0.5, 0.5, 0.5],
  });

  const normalAccessor = addBufferResource(state, cube.normals, {
    componentType: 5126,
    type: "VEC3",
    components: 3,
    count: cube.normals.length / 3,
    target: 34962,
  });

  const uvAccessor = addBufferResource(state, cube.uvs, {
    componentType: 5126,
    type: "VEC2",
    components: 2,
    count: cube.uvs.length / 2,
    target: 34962,
  });

  const indexAccessor = addBufferResource(state, cube.indices, {
    componentType: 5123,
    type: "SCALAR",
    components: 1,
    count: cube.indices.length,
    target: 34963,
  });

  const idleTimes = new Float32Array([0, 1, 2]);
  const idleRotations = new Float32Array([
    ...quaternionFromAxisAngle([0, 1, 0], -0.05),
    ...quaternionFromAxisAngle([0, 1, 0], 0.05),
    ...quaternionFromAxisAngle([0, 1, 0], -0.05),
  ]);

  const idleTimeAccessor = addBufferResource(state, idleTimes, {
    componentType: 5126,
    type: "SCALAR",
    components: 1,
    count: idleTimes.length,
  });

  const idleRotationAccessor = addBufferResource(state, idleRotations, {
    componentType: 5126,
    type: "VEC4",
    components: 4,
    count: idleRotations.length / 4,
  });

  const jumpTimes = new Float32Array([0, 0.5, 1]);
  const jumpTranslations = new Float32Array([
    0, 0, 0,
    0, 1.2, 0,
    0, 0, 0,
  ]);

  const jumpTimeAccessor = addBufferResource(state, jumpTimes, {
    componentType: 5126,
    type: "SCALAR",
    components: 1,
    count: jumpTimes.length,
  });

  const jumpTranslationAccessor = addBufferResource(state, jumpTranslations, {
    componentType: 5126,
    type: "VEC3",
    components: 3,
    count: jumpTranslations.length / 3,
    min: [0, 0, 0],
    max: [0, 1.2, 0],
  });

  const combinedBuffer = Buffer.concat(state.buffers);
  const bufferUri = `data:application/octet-stream;base64,${combinedBuffer.toString("base64")}`;

  const gltf = {
    asset: {
      version: "2.0",
      generator: "custom-script",
    },
    scene: 0,
    scenes: [
      {
        name: "AstronautScene",
        nodes: [0],
      },
    ],
    nodes: [
      {
        name: "AstronautRoot",
        children: [1, 2, 3],
      },
      {
        name: "Suit",
        mesh: 0,
        translation: [0, 0.75, 0],
        scale: [1, 1.4, 0.8],
      },
      {
        name: "Visor",
        mesh: 1,
        translation: [0, 1.1, 0.35],
        scale: [0.6, 0.4, 0.2],
      },
      {
        name: "Backpack",
        mesh: 2,
        translation: [0, 0.9, -0.45],
        scale: [0.5, 0.7, 0.3],
      },
    ],
    meshes: [
      {
        name: "SuitMesh",
        primitives: [
          {
            attributes: {
              POSITION: positionAccessor,
              NORMAL: normalAccessor,
              TEXCOORD_0: uvAccessor,
            },
            indices: indexAccessor,
            material: 0,
          },
        ],
      },
      {
        name: "VisorMesh",
        primitives: [
          {
            attributes: {
              POSITION: positionAccessor,
              NORMAL: normalAccessor,
              TEXCOORD_0: uvAccessor,
            },
            indices: indexAccessor,
            material: 1,
          },
        ],
      },
      {
        name: "BackpackMesh",
        primitives: [
          {
            attributes: {
              POSITION: positionAccessor,
              NORMAL: normalAccessor,
              TEXCOORD_0: uvAccessor,
            },
            indices: indexAccessor,
            material: 2,
          },
        ],
      },
    ],
    materials: [
      {
        name: "SuitMaterial",
        pbrMetallicRoughness: {
          baseColorFactor: [0.92, 0.92, 0.95, 1],
          metallicFactor: 0.2,
          roughnessFactor: 0.6,
        },
        emissiveFactor: [0.02, 0.02, 0.02],
      },
      {
        name: "VisorMaterial",
        pbrMetallicRoughness: {
          baseColorFactor: [0.1, 0.2, 0.4, 0.85],
          metallicFactor: 0.8,
          roughnessFactor: 0.1,
        },
        emissiveFactor: [0.02, 0.05, 0.1],
        alphaMode: "BLEND",
      },
      {
        name: "BackpackMaterial",
        pbrMetallicRoughness: {
          baseColorFactor: [0.35, 0.4, 0.45, 1],
          metallicFactor: 0.4,
          roughnessFactor: 0.7,
        },
        emissiveFactor: [0.05, 0.05, 0.05],
      },
    ],
    buffers: [
      {
        uri: bufferUri,
        byteLength: combinedBuffer.length,
      },
    ],
    bufferViews: state.bufferViews,
    accessors: state.accessors,
    animations: [
      {
        name: "Idle",
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: "rotation",
            },
          },
        ],
        samplers: [
          {
            input: idleTimeAccessor,
            interpolation: "LINEAR",
            output: idleRotationAccessor,
          },
        ],
      },
      {
        name: "Jump",
        channels: [
          {
            sampler: 0,
            target: {
              node: 0,
              path: "translation",
            },
          },
        ],
        samplers: [
          {
            input: jumpTimeAccessor,
            interpolation: "LINEAR",
            output: jumpTranslationAccessor,
          },
        ],
      },
    ],
  };

  const json = JSON.stringify(gltf, null, 2);
  writeFileSync("client/public/models/astronaut.gltf", json);
}

createAstronautGltf();
