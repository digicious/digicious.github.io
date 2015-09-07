			  //if ( ! Detector.webgl ) Detector.addGetWebGLMessage();
			 var containerDiv;
			 var camera, scene, renderer;
			 var projector, plane;
			 var mouse2D, mouse3D, raycaster,
			     rollOveredFace, isShiftDown = false,
			     theta = 45 * 0.5,
			     isCtrlDown = false;
			 var mesh, parent;
			 var rollOverMesh, rollOverMaterial, voxelPosition = new THREE.Vector3(),
			     tmpVec = new THREE.Vector3();
			 var i, intersector;
			 var th = 12;
			 var baseTh = 20;
			 var h = 72;
		 	 var logo;

			 function init3D(container, height, width) {

			     containerDiv = container;
			     camera = new THREE.PerspectiveCamera(25, 300 / 200, 1, 10000);
			     camera.position.y = 800;

			     scene = new THREE.Scene();


			     parent = new THREE.Object3D();
			     parent.position.y = h + 2 * th;
			     parent.rotation.x = -Math.PI / 2;
			     scene.add(parent);


			     // picking

			     projector = new THREE.Projector();

			     // grid

			     plane = new THREE.Mesh(new THREE.PlaneGeometry(1000, 1000, 20, 20),
			         new THREE.MeshBasicMaterial({
			             color: 0x555555,
			             wireframe: true,

			         }));
			     plane.rotation.x = -Math.PI / 2;
			     scene.add(plane);

			     mouse2D = new THREE.Vector3(0, 10000, 0.5);

			     // Lights

			     var ambientLight = new THREE.AmbientLight(0x606060);
			     scene.add(ambientLight);

			     var directionalLight = new THREE.DirectionalLight(0xffffff);
			     directionalLight.position.set(1, 0.75, 0.5).normalize();
			     scene.add(directionalLight);

			     var directionalLight2 = new THREE.DirectionalLight(0xaaaaaa);
			     directionalLight2.position.set(-1, 0.75, 0.5).normalize();
			     scene.add(directionalLight2);
			     if (Detector.webgl) {

			         renderer = new THREE.WebGLRenderer({
			             antialias: true,
			             preserveDrawingBuffer: true
			         });
			     } else {
			         renderer = new THREE.CanvasRenderer();

			     }

			     renderer.setSize(container.width(), container.height());

			     container.append(renderer.domElement);


			 }
			 function clearScene()
			 {
			     parent.remove(mesh);
			 }
			 function getRealIntersector(intersects) {

			     for (i = 0; i < intersects.length; i++) {

			         intersector = intersects[i];

			         if (intersector.object != rollOverMesh) {

			             return intersector;

			         }

			     }

			     return null;

			 }


			 function animate3D() {

			     requestAnimationFrame(animate3D);

			     render();

			 }

			 function render() {
                 
			     theta += 0.51;

			     camera.position.x = 1400 * Math.sin(THREE.Math.degToRad(theta));
			     camera.position.z = 1400 * Math.cos(THREE.Math.degToRad(theta));
			     var kikkSegments = [
			         [222, 160],
			         [302, 76],
			         [386, 156],
			         [470, 76],
			         [558, 156],
			         [558, 324],
			         [390, 488],
			         [390, 324],
			         [302, 404],
			         [222, 332],
			         [302, 244],
			         [222, 160]
			     ];
                 
			     camera.lookAt(scene.position);

			     renderer.render(scene, camera);

			 }

			 function fitToSize3D() {
			     var aspectRatio = containerDiv.innerWidth() / containerDiv.innerHeight();
			     camera.aspect = aspectRatio;
			     camera.updateProjectionMatrix();

			     renderer.setSize(containerDiv.innerWidth(), containerDiv.innerHeight());
			 }

			 function addMesh(points) {
			     
			     function addGeometry(geometry, color, x, y, z, rx, ry, rz, s) {

			         // 3d shape
			         var mat = new THREE.MeshPhongMaterial({
			             ambient: 0x000000,
			             color: 0xffaa00,
			             specular: 0x555555,
			             shininess: 30
			         });
			         parent.remove(mesh);

			         mesh = new THREE.Mesh(geometry, mat);

			         mesh.position.set(x, y, z - 0);
			         // mesh.rotation.set( rx, ry, rz );
			         mesh.scale.set(s, s, s);

			         parent.add(mesh);

			     }

			     var extrudeSettings = {
			         amount: 200,
			         bevelEnabled: true,
			         bevelSegments: 0,
			         steps: 500
			     }; // 

			     extrudeSettings.bevelEnabled = false;

			     var extrusionPts = [];
			     for (var i = 0; i < points.length ; i++) {
			         extrusionPts.push(new THREE.Vector3(points[i][0], points[i][1], 0));
			     }
			     //Close the loop


			     logo = new THREE.ClosedSplineCurve3(extrusionPts);
			

			     extrudeSettings.extrudePath = logo;

			     var cookieCutterProfile = new THREE.Shape();

			     cookieCutterProfile.moveTo(0, 0);
			     cookieCutterProfile.lineTo(0, -th);
			     cookieCutterProfile.lineTo( h,-th);
			     cookieCutterProfile.lineTo(h,-th - baseTh);
			     cookieCutterProfile.lineTo( h + th,-th - baseTh);
			     cookieCutterProfile.lineTo(h + th,baseTh);
			     cookieCutterProfile.lineTo(  h,baseTh );
			     cookieCutterProfile.lineTo( h,0 );
			     cookieCutterProfile.lineTo(0, 0);

			     var circle3d = cookieCutterProfile.extrude(extrudeSettings);
			     addGeometry(circle3d, 0x000099, -100, 0, 0, 0, 0, 0, 1);


			 }



			function startExport(simplePoints){
			
		  	var scale = new THREE.Vector3(0.12,0.12,0.15);
		  	var extrusionPts = [];
		     for (var i = 0; i < simplePoints.length ; i++) {
	         	extrusionPts.push(new THREE.Vector3(simplePoints[i][0] * scale.x,
	         										simplePoints[i][1]* scale.y,
	         										0));
		     }


	 		var llllShape = new THREE.Shape(extrusionPts);
				 
				  var llllShapeSettings = {
			         amount: 100 * scale.z,
			         bevelEnabled: false,
			         bevelSegments: 0,
			     }; //
			     var lll3d =  llllShape.extrude( llllShapeSettings);


			var geometry = removeDuplicateFaces( lll3d );
			THREE.GeometryUtils.triangulateQuads( geometry );

			var stl = generateSTL( geometry );
			return stl;
			}


		  function save( simplePoints,name) {

		  	var storage = $.jStorage.get("cookieCutters", []);
        	
        	storage.push ( { name : name, points: simplePoints});
 			$.jStorage.set("cookieCutters", storage);



	  		var stl = startExport(simplePoints);

		    var blob = new Blob([stl], {type: 'text/plain'});
		    if(! name)
	  		{
	  		 	name = "";
		  	}
		    saveAs(blob, 'cookieCutter_'+slug(name)+'.stl');
		  }

			 var Detector = {

			     canvas: !!window.CanvasRenderingContext2D,
			     webgl: (function() {
			         try {
			             return !!window.WebGLRenderingContext && !!document.createElement('canvas').getContext('experimental-webgl');
			         } catch (e) {
			             return false;
			         }
			     })(),
			     workers: !!window.Worker,
			     fileapi: window.File && window.FileReader && window.FileList && window.Blob,

			 };

			 var slug = function(str) {
				str = str.replace(/^\s+|\s+$/g, ''); // trim
				str = str.toLowerCase();

				// remove accents, swap ñ for n, etc
				var from = "ãàáäâẽèéëêìíïîõòóöôùúüûñç·/_,:;";
				var to   = "aaaaaeeeeeiiiiooooouuuunc------";
				for (var i=0, l=from.length ; i<l ; i++) {
				str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
				}

				str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
				.replace(/\s+/g, '-') // collapse whitespace and replace by -
				.replace(/-+/g, '-'); // collapse dashes

				return str;
				};