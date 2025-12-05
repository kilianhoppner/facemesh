// Face Mesh Detection - Triangulated Face Mapping  

let video;
let faceMesh;
let faces = [];
let triangles;

// Mesh parameters
let meshColor = [0, 255, 0]; // RGB color for mesh fill/stroke
let lineWidth = 0.7; // stroke weight for triangles
let dotSize = 4;       // size of vertex dots

// Toggles
let useBlackBackground = true; // background toggle ('b')
let fillMesh = false;           // filled mesh toggle ('f')
let hideLines = false;          // hide triangle lines toggle ('h')

function preload() {
  // Load FaceMesh model 
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  console.log(faces);

  // Toggle fullscreen
  let fs = fullscreen();
  fullscreen(!fs);
}

function keyPressed() {
  if (key === 'b' || key === 'B') {
    useBlackBackground = !useBlackBackground; // toggle background
  }
  if (key === 'f' || key === 'F') {
    fillMesh = !fillMesh; // toggle mesh fill
  }
  if (key === 'h' || key === 'H') {
    hideLines = !hideLines; // toggle hiding the connecting lines
  }
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight); // full window canvas
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480); // webcam native resolution
  video.hide();

  // Start detecting faces
  faceMesh.detectStart(video, gotFaces);

  // Get predefined triangle connections
  triangles = faceMesh.getTriangles();
}

function draw() {
  video.loadPixels();

  // Calculate scaling to fit the window while preserving aspect ratio
  let scaleX = width / video.width;
  let scaleY = height / video.height;
  let scaleFactor = max(scaleX, scaleY); // scale to cover full window without skewing
  let videoWidth = video.width * scaleFactor;
  let videoHeight = video.height * scaleFactor;
  let offsetX = (width - videoWidth) / 2;
  let offsetY = (height - videoHeight) / 2;

  // Draw background or scaled webcam
  if (useBlackBackground) {
    background(0);
  } else {
    image(video, offsetX, offsetY, videoWidth, videoHeight);
  }

  if (faces.length > 0) {
    let face = faces[0];

    randomSeed(5);
    beginShape(TRIANGLES);

    for (let i = 0; i < triangles.length; i++) {
      let tri = triangles[i];
      let [a, b, c] = tri;
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      // Scale and offset keypoints to match resized video
      let ax = pointA.x * scaleFactor + offsetX;
      let ay = pointA.y * scaleFactor + offsetY;
      let bx = pointB.x * scaleFactor + offsetX;
      let by = pointB.y * scaleFactor + offsetY;
      let cx = pointC.x * scaleFactor + offsetX;
      let cy = pointC.y * scaleFactor + offsetY;

      // Calculate centroid for color sampling
      let centroidX = (ax + bx + cx) / 3;
      let centroidY = (ay + by + cy) / 3;

      // Map centroid back to video pixels
      let px = floor((centroidX - offsetX) / scaleFactor);
      let py = floor((centroidY - offsetY) / scaleFactor);
      let index = (px + py * video.width) * 4;

      let rr = video.pixels[index];
      let gg = video.pixels[index + 1];
      let bb = video.pixels[index + 2];

      // Decide stroke/fill behavior, respecting the new hideLines toggle
      if (fillMesh) {
        // If fill is enabled we keep the fill and do not draw stroke
        noStroke();
        fill(meshColor[0], meshColor[1], meshColor[2]);
      } else {
        // If fill is disabled, normally we draw stroked triangles.
        // When hideLines is true we suppress stroke and also suppress fill so triangles don't show.
        if (hideLines) {
          noStroke();
          noFill();
        } else {
          stroke(meshColor[0], meshColor[1], meshColor[2]);
          strokeWeight(lineWidth);
          noFill();
        }
      }

      vertex(ax, ay);
      vertex(bx, by);
      vertex(cx, cy);
    }

    endShape();

    // ---- Draw dots at triangle vertices (always visible) ----
    noStroke();
    fill(meshColor[0], meshColor[1], meshColor[2]);

    for (let i = 0; i < triangles.length; i++) {
      let [a, b, c] = triangles[i];
      let A = face.keypoints[a];
      let B = face.keypoints[b];
      let C = face.keypoints[c];

      let ax = A.x * scaleFactor + offsetX;
      let ay = A.y * scaleFactor + offsetY;
      let bx = B.x * scaleFactor + offsetX;
      let by = B.y * scaleFactor + offsetY;
      let cx = C.x * scaleFactor + offsetX;
      let cy = C.y * scaleFactor + offsetY;

      circle(ax, ay, dotSize);
      circle(bx, by, dotSize);
      circle(cx, cy, dotSize);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}