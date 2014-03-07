require([
	'goo/entities/GooRunner',
	'goo/renderer/Material',
	'goo/renderer/Camera',
	'goo/entities/components/CameraComponent',
	'goo/shapes/ShapeCreator',
	'goo/renderer/TextureCreator',
	'goo/entities/components/ScriptComponent',
	'goo/renderer/shaders/ShaderLib',
	'goo/entities/World',
	'goo/scripts/OrbitCamControlScript',
	'goo/math/Vector3',
	'goo/entities/components/TransformComponent',
	'goo/addons/ammo/AmmoSystem',
	'goo/addons/ammo/AmmoRigidbodyComponent',
	'goo/addons/ammo/AmmoSphereColliderComponent',
	'goo/addons/ammo/AmmoBoxColliderComponent',
	'goo/addons/ammo/AmmoCapsuleColliderComponent',
	'goo/addons/ammo/AmmoPlaneColliderComponent',
	'goo/renderer/light/PointLight',
	'goo/entities/components/LightComponent'
], function (
	GooRunner,
	Material,
	Camera,
	CameraComponent,
	ShapeCreator,
	TextureCreator,
	ScriptComponent,
	ShaderLib,
	World,
	OrbitCamControlScript,
	Vector3,
	TransformComponent,
	AmmoSystem,
	AmmoRigidbodyComponent,
	AmmoSphereColliderComponent,
	AmmoBoxColliderComponent,
	AmmoCapsuleColliderComponent,
	AmmoPlaneColliderComponent,
	PointLight,
	LightComponent
) {
	"use strict";

	var resourcePath = "../../resources";

	function init() {
		var goo = new GooRunner({
			showStats : true
		});
		goo.renderer.domElement.id = 'goo';
		document.body.appendChild(goo.renderer.domElement);

		var ammoSystem = window.ammoSystem = new AmmoSystem();
		goo.world.setSystem(ammoSystem);

		function addPrimitives() {
			for (var i=0;i<20;i++) {
				var x = Math.random() * 16 - 8;
				var y = Math.random() * 16 + 8;
				var z = Math.random() * 16 - 8;
				if (Math.random() < 0.5) {
					var h = new Vector3(0.5+Math.random(), 0.5+Math.random(), 0.5+Math.random());
					createEntity(goo, ShapeCreator.createBox(2*h.x,2*h.y,2*h.z),
						{mass:1},
						[x,y,z],
						new AmmoBoxColliderComponent({
							halfExtents : h,
						})
					);
				} else {
					var radius = 1+Math.random();
					createEntity(goo, ShapeCreator.createSphere(10, 10, radius),
						{mass:1},
						[x,y,z],
						new AmmoSphereColliderComponent({
							radius : radius,
						})
					);
				}
			}
		}

		//addPrimitives();
		document.addEventListener('keypress', addPrimitives, false);

		var h = new Vector3(2.5,2.5,2.5);
		createEntity(goo, ShapeCreator.createBox(2*h.x,2*h.y,2*h.z),   {mass: 0}, [0,-7.5,0], new AmmoBoxColliderComponent({ halfExtents:h }));
		h = new Vector3(10,5,0.5);
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-5,10],  new AmmoBoxColliderComponent({ halfExtents:h }));
		createEntity(goo, ShapeCreator.createBox(20, 10, 1), {mass: 0}, [0,-5,-10], new AmmoBoxColliderComponent({ halfExtents:h }));
		h = new Vector3(0.5,5,10);
		createEntity(goo, ShapeCreator.createBox(1, 10, 20), {mass: 0}, [10,-5,0],  new AmmoBoxColliderComponent({ halfExtents:h }));
		createEntity(goo, ShapeCreator.createBox(1, 10, 20), {mass: 0}, [-10,-5,0], new AmmoBoxColliderComponent({ halfExtents:h }));

		var planeEntity = createEntity(goo, ShapeCreator.createQuad(1000, 1000, 100, 100), {mass: 0}, [0,-10,0],
			new AmmoPlaneColliderComponent({
				normal:new Vector3(0,0,1) // Goo quad faces in the z direction
			})
		);
		planeEntity.transformComponent.transform.setRotationXYZ(-Math.PI/2, 0, 0);

		// Create compound
		var compoundEntity = window.compoundEntity = goo.world.createEntity(new Vector3(0,3,0));
		compoundEntity.addToWorld();
		compoundEntity.setComponent(new AmmoRigidbodyComponent({ mass : 1 /*, isTrigger:true*/ }));
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		var h1 = new Vector3(1,2,1),
			h2 = new Vector3(1,1,1),
			h3 = new Vector3(1,1,1),
			radius=1;
		var subEntity1 = goo.world.createEntity(ShapeCreator.createSphere(10,10,radius), material, new Vector3( 0,0, 2));
		var subEntity2 = goo.world.createEntity(ShapeCreator.createBox(h2.x*2,h2.y*2,h2.z*2), material, new Vector3( 0,0,-2));
		var subEntity3 = goo.world.createEntity(ShapeCreator.createBox(h3.x*2,h3.y*2,h3.z*2), material, new Vector3( 0,-2,-2));
		subEntity1.addToWorld();
		subEntity2.addToWorld();
		subEntity3.addToWorld();
		subEntity1.setComponent(new AmmoSphereColliderComponent({ radius:radius }));
		subEntity2.setComponent(new AmmoBoxColliderComponent({ halfExtents:h2 }));
		subEntity3.setComponent(new AmmoBoxColliderComponent({ halfExtents:h3 }));
		compoundEntity.attachChild(subEntity1);
		compoundEntity.attachChild(subEntity2);
		compoundEntity.attachChild(subEntity3);
		subEntity1.transformComponent.transform.rotation.fromAngles(Math.PI/6,0,0);
		subEntity1.transformComponent.setUpdated();

		var light = new PointLight();
		var lightEntity = goo.world.createEntity('light');
		lightEntity.setComponent(new LightComponent(light));
		lightEntity.transformComponent.setTranslation(0, 100, -10);
		lightEntity.addToWorld();

		var camera = new Camera(45, 1, 0.1, 1000);
		var cameraEntity = goo.world.createEntity("CameraEntity");
		cameraEntity.setComponent(new CameraComponent(camera));
		var scripts = new ScriptComponent();
		scripts.scripts.push(new OrbitCamControlScript({
			domElement : goo.renderer.domElement,
			spherical : new Vector3(40, 0, Math.PI/4)
		}));
		cameraEntity.setComponent(scripts);
		cameraEntity.addToWorld();
	}

	function createEntity(goo, meshData, ammoSettings, pos, colliderComponent) {
		var material = Material.createMaterial(ShaderLib.texturedLit, 'BoxMaterial');
		var texture = new TextureCreator().loadTexture2D(resourcePath + '/goo.png');
		material.setTexture('DIFFUSE_MAP', texture);
		var entity = goo.world.createEntity(meshData, material, pos);
		entity.addToWorld();
		entity.setComponent(colliderComponent);
		entity.setComponent(new AmmoRigidbodyComponent(ammoSettings));
		return entity;
	}

	init();
});