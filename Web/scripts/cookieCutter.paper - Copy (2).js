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
    var spaceInvader = [[0,13], [1,13],
                        [1,15], [2,15], [2,13], [3,13], [3,14], [8,14], [8,13], [9,13], [9,15],
                        [10,15], [10,13], [11,13], [11,16], [10,16], [10,17], [9,17], [9,18],
                        [8,18], [8,19], [7,19], [7,18], [4,18], [4,19], [3,19], [3,18], [2,18],
                        [2,17], [1,17], [1,16], [0,16], [0,13] ];



    var selfIntersectionCount = 0;
    var flattenValue = 50;
    var cookieCutterPath = null;

    var circle = new Path.Circle({
        center: new Point(-10, -10),
        radius: 3,
        fillColor: 'red'
    });

    var hitOptions = {
        segments: true,
        stroke: true,
        fill: true,
        tolerance: 10
    };

    var redCircleGroup = new Group();
    var editModeButton = new Path.Circle({
        center: new Point(100, 100),
        radius: 40,
        visible : false,
        fillColor: '#AAFF00',
        onMouseDown: function () {
          

        },
        /*onFrame: function (event) {
            this.scale(1 + 0.002 * Math.sin(event.count / 5));
        }*/

    });
    editModeButton.bringToFront();
    var lastPointIndicator = new Path.Circle({
        center: new Point(-10, -10),
        radius: 5,
        visible: true,
        fillColor: "orange",
       
    });

    var firstPointIndicator = new Path.Circle({
        center: new Point(-10, -10),
        radius: 15,
        visible: true,
        fillColor: "green",
        onClick: function (event) {
            console.log("hi");
            if (this)
                this.visible = false;
            if (cookieCutterPath) {
                cookieCutterPath.closed = true;
                cookieCutterPath.fillColor = {
                    hue: 360 * Math.random(),
                    saturation: 1,
                    brightness: 1,
                    alpha: 0.5
                };
            }
            setMode("EDIT");
            editModeButton.visible = false;
            stickyMouse.visible = false;
        }
    });

    var grid = null;

    var raster = null;
    var i = 0;
    var textItem = new PointText({
        content: 'Utilise la souris pour dessiner & clique sur le carré gris pour fermer la forme.',
        point: new Point(20, 30),
        fillColor: 'white',
        fontSize: '20'
    });


    var textItem2 = new PointText({
        content: "",
        point: new Point(20, 70),
        fillColor: 'white',
        fontSize: '20'
    });

    //prePostPoints(cookieCutterPath);

    var segment;

    var group;
    var currentIndex = 0 ;
    function onFrame()
    {
        if (mode == "RESTART")
        {


            stickyMouse.visible = false;
            lastPointIndicator.visible = false;

            console.log("restart");
            if (cookieCutterPath) {
                cookieCutterPath.remove();
                cookieCutterPath = null;
            }

            for (var i = 0 ; redCircleGroup && i < redCircleGroup.children.length; i++)
            {
                redCircleGroup.children[i].visible = false;
            }

            setMode("PEN");
            textItem.content = "Utilise la souris pour dessiner.";

            editModeButton.visible = false

        }
        if (mode == "PEN")
        {;
        }
        if (mode == "EDIT") {
            textItem.content = "Modifie la forme en ajoutant, supprimant (avec majuscule) ou en déplaçant les points";
            editModeButton.visible = false;
            stickyMouse.visible = false;
            lastPointIndicator.visible = false;
        }

    }
    var stickyMouse = new Path([new Point(0,0) , new Point(10,10), ] );
    stickyMouse.strokeColor = "green";
    stickyMouse.closed = true;
    
    function onMouseMove(event)
    {/*
        if (cookieCutterPath && lastPointIndicator && lastPointIndicator.visible)
        {
            stickyMouse.firstSegment.point = cookieCutterPath.lastSegment.point;
            stickyMouse.segments[1].point = new Point( event.point.x +3 , event.point.y +3);
       //     stickyMouse.lastSegment.point = cookieCutterPath.firstSegment.point;
        }
        */
    }
     
    function onMouseDown(event) {
        //If we produced a path before, deselect it:
        if (mode == "PEN") {
            if (!cookieCutterPath) {
                //    cookieCutterPath.remove();
                cookieCutterPath = new Path({
                    segments: [event.point],
                    
                    strokeColor: 'blue',
                    // Select the path, so we can see its segment points:
                    selected: 'true',
                });
                editModeButton.visible = true;
                stickyMouse.visible = true;
                lastPointIndicator.visible = true;
            }
            cookieCutterPath.add(event.point);
            prePostPoints(cookieCutterPath);
        }
        if( mode == "DELETE")
        {
            tool.minDistance = 5;
            var hitResult = cookieCutterPath.hitTest(event.point, hitOptions);
            if (hitResult && hitResult.type == 'segment') {
                    hitResult.segment.remove();
            }

        }
        if (mode == "EDIT") {
            tool.minDistance = 5;
            var hitResult = cookieCutterPath.hitTest(event.point, hitOptions);
            if (hitResult) 
            {

                if (event.modifiers.shift) {
                    if (hitResult.type == 'segment') {
                        hitResult.segment.remove();
                    };
                    return;
                }
                if (hitResult.type == 'segment') {
                    segment = hitResult.segment;
                } else if (hitResult.type == 'stroke') {
                    var location = hitResult.location;
                    segment = cookieCutterPath.insert(location.index + 1, event.point);
                }
            }
        }

    }
 
    
    function onMouseDrag(event) {
        if (mode == "PEN") {
            tool.minDistance = 20;
            if (!selfIntersectionning(cookieCutterPath, event.point))
            {
                cookieCutterPath.add(event.point);
            
                prePostPoints(cookieCutterPath);
            }
        }
        if (mode == "EDIT") {


            if (segment) {
                segment.point += event.delta;
            } else {
                cookieCutterPath.position += event.delta;
                if(raster!=null)
                    raster.position += event.delta;
               
            }
            //            cookieCutterPath.smooth();
        }
        i = 0;
        fixIntersections(cookieCutterPath);

    }

    function prePostPoints(path) {
        lastPointIndicator.position = path.lastSegment.point;
        firstPointIndicator.position = path.firstSegment.point
        var clonedPath = path.clone();

        var scalex = 800 / clonedPath.bounds.width;
        var scaley = 800 / clonedPath.bounds.height;
        var scale = scalex;
        if (scalex > scaley) {
            scale = scaley;
        }
        clonedPath.scale(scale);
        clonedPath.translate(new Point(-clonedPath.position.x + 100, -clonedPath.position.y));
        var simplePoints = offsetPoints(clonedPath, 0, 0); //cookieCutterPath.bounds.center.x,cookieCutterPath.bounds.center.y);

        clonedPath.flatten(25);
        var points = offsetPoints(clonedPath, 0, 0); //cookieCutterPath.bounds.center.x,cookieCutterPath.bounds.center.y);

        clonedPath.remove();
        postPoints(points, simplePoints,selfIntersectionCount );
    }


    function selfIntersectionning(path1, point) {
        if (path1.segments.length > 0) {
            var old_point = path1.lastSegment.point;
            var test_segment = [old_point, point];
            var test_path = new Path(test_segment);
            var intersection = path1.getIntersections(test_path);

            if (intersection && intersection.length > 0) {
                if (path1.lastSegment.index - intersection[0]._segment2.index < intersection[0]._segment2.index) {
                    path1.removeSegments(intersection[0]._segment2.index, path1.lastSegment.index + 1);
                } else {
                    path1.removeSegments(path1.firstSegment.index, intersection[0]._segment2.index);
                }
                return true;
            }
            test_path.remove();
        }

        return false;

    }


    function fixIntersections(path)
    {
        selfIntersectionCount = 0;
        for(var i = 0 ; i < path.curves.length; i++)
        {
            var p = new Path(path.curves[i].segment1,path.curves[i].segment2);
            var inter = p.getIntersections(path );
            p.remove();
            if(inter.length >= 3)
            {
                for (var j = 0; j < inter.length; j++) {
                   if( ! ((inter[j].point.x == p.curves[0].segment1.point.x && inter[j].point.y == p.curves[0].segment1.point.y  ) || inter[j].point.x == p.curves[0].segment2.point.x && inter[j].point.y == p.curves[0].segment2.point.y  ) )
                   {
                      var p =   new Path.Circle({
                            center: inter[j].point,
                            radius: 5,
                            fillColor: '#fa0000',
                      }).removeOnDrag().removeOnDown();

                      redCircleGroup.addChild(p);

                     selfIntersectionCount ++;

                   }
                }
            }
        }
    }

    function onMouseUp(event) {
        if (mode == "PEN") {
            
        }
        
        fixIntersections(cookieCutterPath);

        prePostPoints(cookieCutterPath);

       
        segment = null;
    }




    function offsetPoints(path, offsetX, offsetY) {
        var points = [];
        for (var i = 0; i < path.segments.length; i++) {
            points.push([path.segments[i].point.x + offsetY, path.segments[i].point.y + offsetY]);
        }
        
        return points;
    }

    function handleImage(image) {
     
        if (raster)
        {
            raster.remove();
        }
        raster = new Raster(image);
        raster.fitBounds(view.bounds, false);
        raster.scale(1);
        raster.sendToBack();
    }


    function onDocumentDrag(event) {
        event.preventDefault();
    }

    function onDocumentDrop(event) {
        event.preventDefault();

        var file = event.dataTransfer.files[0];
        var reader = new FileReader();

        reader.onload = function (event) {
            var image = document.createElement('img');
            image.onload = function () {
                handleImage(image);
                view.update();
            };
            image.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }

    DomEvent.add(document, {
        drop: onDocumentDrop,
        dragover: onDocumentDrag,
        dragleave: onDocumentDrag
    });


// Key binding

    function onKeyUp(event) {
        if (mode == "SAVE")
            return;
        var refresh = false;
        var rotate = true;
        var newPoints = [];

        if (event.key == 'k') {
            refresh = true;
            newPoints = kikkSegments;
        }
      

        if (event.key == '/') {
            var cutters = $.jStorage.get("cookieCutters");
            if (cutters.length > 0) {
                if (currentIndex >= cutters.length) {
                    currentIndex = 0;
                }
                newPoints = cutters[currentIndex].points;
                textItem2.content = cutters[currentIndex].name;
                currentIndex++;
            }
            refresh = true;
            rotate = false;
        }
        if (event.key == 's') {
            var c = new Path.Star(350, 320, 20, 230, 250);
            newPoints = c.segments;
            c.remove();
            refresh = true;
        }

        if (event.key == 'e') {
            var c = new Path.Star(350, 320, 5, 150, 250);
            newPoints = c.segments;
            c.remove();
            refresh = true;
        }
        if (event.key == 'c') {
            //alert("c")
            var c = new Path.Circle({
                center: new Point(350, 320),
                radius: 200,
            });
            c.flatten(55);
            newPoints = c.segments;
            c.remove();
            refresh = true;
        }
        if (event.key == 'x') {
            var c = new Path({
                segments: spaceInvader
            });
            c.scale(40);
            c.translate(300, 200);
            c.remove();
            newPoints = c.segments;
            refresh = true;

        }
        if (event.key == 'r') {
            //alert("c")
            var c = new Path.Rectangle(new Point(150, 120), new Size(400, 300));
            c.flatten(50);
            newPoints = c.segments;
            c.remove();
            refresh = true;
        }
        if (event.key == '+' || event.key == '-') {
            var w = cookieCutterPath.bounds.width;
            var h = cookieCutterPath.bounds.height;
            if (event.key == '-') {
                cookieCutterPath.scale(0.9);
                raster.scale(0.9);
            }
            else
            {
                cookieCutterPath.scale(1.1);
                raster.scale(1.1);
            }
                
            cookieCutterPath.translate((cookieCutterPath.bounds.width - w) / 2, (cookieCutterPath.bounds.height - h) / 2);
            
            prePostPoints(cookieCutterPath);

        }
      
        
        if (event.key == 'f')
        {
            cookieCutterPath.flatten(flattenValue);
            setMode("EDIT");
        }
        if (event.key == 'd')
        {
            cookieCutterPath.simplify(10);
            cookieCutterPath.flatten(flattenValue);
            setMode("EDIT");
        }

        if (event.key == '<')
        {
            
            flattenValue -= 5;
            if (flattenValue < 5)
            {
                flattenValue = 5;
            }
            cookieCutterPath.flatten(flattenValue);
           setMode("EDIT");
        }

        if (event.key == '>') {

            flattenValue += 5;
            if (flattenValue > 150) {
                flattenValue = 150;
            }
            cookieCutterPath.flatten(flattenValue);
            setMode("EDIT");
        }

        if (refresh) {

            if (cookieCutterPath) {
                cookieCutterPath.remove();
               }
            cookieCutterPath = new Path({
                segments: newPoints,
                fillColor: {
                    hue: 360 * Math.random(),
                    saturation: 1,
                    brightness: 1,
                    alpha: 0.5
                },
                strokeColor: 'blue',
                // Select the path, so we can see its segment points:
                selected: 'true',
                closed: 'true'
            });
            if (rotate) cookieCutterPath.rotate(180);
            cookieCutterPath.translate((-cookieCutterPath.bounds.x + 50), (-cookieCutterPath.bounds.y + 50));

            setMode("EDIT");
            prePostPoints(cookieCutterPath);

        }
    }
