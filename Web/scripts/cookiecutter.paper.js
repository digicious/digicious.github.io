/* Objects initialization */

var segment;
var selfIntersectionCount = 0;
var flattenValue = 50;
var currentIndex = 0;
var stWidth = 5;

var group;
var cookieCutterPath;
var grid = null;
var raster = null;
var scale = 1;

var hitOptions = {
    segments: true,
    stroke: true,
    fill: true,
    tolerance: 1
};

paper.settings.handleSize = 10;
var startPoint;
var stickyMouse;
var textItem2;

var btnRestart = new Path.Rectangle();
var redCircleGroup ;

paper.loadImage = function(img){
    handleImage(img);
};

paper.restart = function() {

    if (cookieCutterPath) {
        cookieCutterPath.remove();

    }
    /*if(raster)
    {
        raster.remove();
        raster = null;
    }*/
    cookieCutterPath = new Path({
        strokeColor: "#009dec",
        strokeWidth: stWidth,
        selected: true,
        strokeJoin: "round",
        strokeCap: "round"
    });


    if (startPoint) {
        startPoint.remove();

    }
    startPoint = new Path.Circle({
        center: new Point(20, 20),
        radius: 10,
        fillColor: "#009dec",
        visible: false,

    });;

    if (stickyMouse) {
        stickyMouse.remove();

    }
    stickyMouse = new Path([new Point(-10, -10), new Point(-10, -30), ]);
    stickyMouse.strokeColor = "#009dec";
    stickyMouse.strokeWidth = stWidth;
    stickyMouse.selected = false;
    stickyMouse.strokeJoin = "round";
    stickyMouse.strokeCap = "round";
    stickyMouse.sendToBack();

    if (textItem2) {
        textItem2.remove();
    }
    textItem2 = new PointText({
        content: "",
        point: new Point(20, 70),
        fillColor: 'white',
        fontSize: '20'
    });

    if (redCircleGroup) {
        redCircleGroup.remove();
    }
    redCircleGroup = new Group();
    if(raster)
    {
        raster.sendToBack();
        
    }
    
    setMode("PEN");
}

paper.restart();

/* Mouse events and interactions */
function onMouseMove(event) {



    if (mode == "PEN") {
        if (startPoint.visible && cookieCutterPath && cookieCutterPath.lastSegment) {
            stickyMouse.firstSegment.point = cookieCutterPath.lastSegment.point;
            stickyMouse.lastSegment.point = event.point;




            var closingPath = startPoint.hitTest(event.point, hitOptions);
            if (closingPath) {
                startPoint.fillColor = "#009dec";
                cookieCutterPath.strokeColor = "#009dec";
            } else {
                var intersectionCount = stickyMouse.getIntersections(cookieCutterPath).length;

                if (intersectionCount < 2) {
                    startPoint.fillColor = "blue";
                    cookieCutterPath.strokeColor = "#009dec";

                } else {
                    startPoint.fillColor = "grey";
                    cookieCutterPath.strokeColor = "grey";
                }
            }
        }

        


    }
}


function onMouseDown(event) {

    if (mode == "PEN") {

        var closingPath = startPoint.hitTest(event.point, hitOptions);
        if (closingPath) {
            cookieCutterPath.closed = true;
            var color = {
                hue: 360 * Math.random(),
                saturation: 1,
                brightness: 1,
                alpha: 0.5
            };

            cookieCutterPath.fillColor = color;
            cookieCutterPath.strokeColor = "#009dec";
            cookieCutterPath.selected = true;
            prePostPoints(cookieCutterPath);
            setMode("EDIT");
            startPoint.visible = false;
            stickyMouse.visible = false;
        } else {
            if (!startPoint.visible) {
                startPoint.visible = true;
                startPoint.position = event.point;
            }
            var intersectionCount = stickyMouse.getIntersections(cookieCutterPath).length;

            if (intersectionCount < 2) {
                cookieCutterPath.add(event.point);
            }

        }
    }
    if (mode == "EDIT") {
        segment = null;
        console.log("edit")

        var hitResult = cookieCutterPath.hitTest(event.point, hitOptions);

        if (hitResult) {

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




    if (mode == "EDIT") {

        if (segment) {
            segment.point += event.delta;
            prePostPoints(cookieCutterPath);
        } else {
            cookieCutterPath.position += event.delta;
        }
        fixIntersections(cookieCutterPath);
    }
}


/* END Mouse interaction */

function prePostPoints(path) {
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
    postPoints(points, simplePoints, selfIntersectionCount);
}

function offsetPoints(path, offsetX, offsetY) {
    var points = [];
    for (var i = 0; i < path.segments.length; i++) {
        points.push([path.segments[i].point.x + offsetY, path.segments[i].point.y + offsetY]);
    }

    return points;
}



function fixIntersections(path) {
    selfIntersectionCount = 0;
    for (var i = 0; i < path.curves.length; i++) {
        var p = new Path(path.curves[i].segment1, path.curves[i].segment2);
        var inter = p.getIntersections(path);
        p.remove();
        if (inter.length >= 3) {
            for (var j = 0; j < inter.length; j++) {
                if (!((inter[j].point.x == p.curves[0].segment1.point.x && inter[j].point.y == p.curves[0].segment1.point.y) || inter[j].point.x == p.curves[0].segment2.point.x && inter[j].point.y == p.curves[0].segment2.point.y)) {
                    var p = new Path.Circle({
                        center: inter[j].point,
                        radius: 5,
                        fillColor: '#fa0000',
                    }).removeOnDrag().removeOnDown();

                    redCircleGroup.addChild(p);
                    redCircleGroup.bringToFront();
                    selfIntersectionCount++;

                }
            }
        }
    }
}


/* background management */

function handleImage(image) {
    count = 0;
    if (group)
        group.remove();
    if( raster)
    {
        raster.remove();
    }
    raster = new Raster(image);
    raster.fitBounds(view.bounds, false);
    raster.scale(0.7);
    raster.position = new Point(view.bounds.width /2,raster.bounds.height/2 +20);
    raster.sendToBack();
}





function onDocumentDrag(event) {
    event.preventDefault();
}

function onDocumentDrop(event) {
    event.preventDefault();

    var file = event.dataTransfer.files[0];
    var reader = new FileReader();

    reader.onload = function(event) {
        var image = document.createElement('img');
        image.onload = function() {
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




/* Keyboard */

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

    if(event.key =='p')
    {
        cookieCutterPath.selected = ! cookieCutterPath.selected ;
    }

    if (event.key == "g") {
        if (grid) {
            grid.remove();
            grid = null;
        } else {

            grid = new Group();
            for (var r =
                0; r < view.bounds.height; r += 20) {
                var p = new Path.Line(new Point(0, r), new Point(view.bounds.width, r));
                p.strokeColor = {
                    color: "black",
                    alpha: "0.1"
                };
           }

            for (var r = 0; r < view.bounds.width; r += 20) {
                var p = new Path.Line(new Point(r, 0), new Point(r, view.bounds.height));
                p.strokeColor = {
                    color: "black",
                    alpha: "0.1"
                };
                grid.addChild(p);
            }
        }
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
        refresh =true;
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
            if (raster) raster.scale(0.9);
        } else {
            cookieCutterPath.scale(1.1);
            if (raster) raster.scale(1.1);
        }

        cookieCutterPath.translate((cookieCutterPath.bounds.width - w) / 2, (cookieCutterPath.bounds.height - h) / 2);

        prePostPoints(cookieCutterPath);

    }


    if (event.key == 'f') {
        cookieCutterPath.flatten(flattenValue);
        setMode("EDIT");
    }
    if (event.key == 'd') {
        cookieCutterPath.simplify(10);
        cookieCutterPath.flatten(flattenValue);
        setMode("EDIT");
    }

    if (event.key == '<') {

        flattenValue -= 5;
        if (flattenValue < 5) {
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
            strokeColor: "#009dec",
            strokeWidth: 10,
            selected: true,
            strokeJoin: "round",
            closed: true,
        });
        if (rotate) cookieCutterPath.rotate(180);
        cookieCutterPath.translate((-cookieCutterPath.bounds.x + 50), (-cookieCutterPath.bounds.y + 50));

        setMode("EDIT");
        prePostPoints(cookieCutterPath);

    }
}


/* data */
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
var spaceInvader = [
    [0, 13],
    [1, 13],
    [1, 15],
    [2, 15],
    [2, 13],
    [3, 13],
    [3, 14],
    [8, 14],
    [8, 13],
    [9, 13],
    [9, 15],
    [10, 15],
    [10, 13],
    [11, 13],
    [11, 16],
    [10, 16],
    [10, 17],
    [9, 17],
    [9, 18],
    [8, 18],
    [8, 19],
    [7, 19],
    [7, 18],
    [4, 18],
    [4, 19],
    [3, 19],
    [3, 18],
    [2, 18],
    [2, 17],
    [1, 17],
    [1, 16],
    [0, 16],
    [0, 13]
];
