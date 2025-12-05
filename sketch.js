// Face Mesh Detection - Triangulated Face Mapping  

let video;
let faceMesh;
let faces = [];
let triangles;

// Mesh parameters
let meshColor = [0, 255, 0]; // RGB color for mesh fill/stroke
let lineWidth = 0.45; // base stroke weight
let dotSize = 2.5;     // base dot size

// Toggles
let useBlackBackground = true; // background toggle ('b')
let fillMesh = false;          // filled mesh toggle ('f')
let hideLines = false;         // hide triangle lines toggle ('h')

function preload() {
  faceMesh = ml5.faceMesh({ maxFaces: 1, flipped: true });
}

function mousePressed() {
  console.log(faces);
  let fs = fullscreen();
  fullscreen(!fs);
}

function keyPressed() {
  if (key === 'b' || key === 'B') useBlackBackground = !useBlackBackground;
  if (key === 'f' || key === 'F') fillMesh = !fillMesh;
  if (key === 'h' || key === 'H') hideLines = !hideLines;
}

function gotFaces(results) {
  faces = results;
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO, { flipped: true });
  video.size(640, 480);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
  triangles = faceMesh.getTriangles();
}

function draw() {
  video.loadPixels();

  let scaleX = width / video.width;
  let scaleY = height / video.height;
  let scaleFactor = max(scaleX, scaleY);

  let videoWidth = video.width * scaleFactor;
  let videoHeight = video.height * scaleFactor;
  let offsetX = (width - videoWidth) / 2;
  let offsetY = (height - videoHeight) / 2;

  // NEW — dynamic scaling
  let scaledLineWidth = lineWidth * scaleFactor;
  let scaledDotSize = dotSize * scaleFactor;

  if (useBlackBackground) background(0);
  else image(video, offsetX, offsetY, videoWidth, videoHeight);

  if (faces.length > 0) {
    let face = faces[0];

    randomSeed(5);
    beginShape(TRIANGLES);

    for (let i = 0; i < triangles.length; i++) {
      let [a, b, c] = triangles[i];
      let pointA = face.keypoints[a];
      let pointB = face.keypoints[b];
      let pointC = face.keypoints[c];

      let ax = pointA.x * scaleFactor + offsetX;
      let ay = pointA.y * scaleFactor + offsetY;
      let bx = pointB.x * scaleFactor + offsetX;
      let by = pointB.y * scaleFactor + offsetY;
      let cx = pointC.x * scaleFactor + offsetX;
      let cy = pointC.y * scaleFactor + offsetY;

      let centroidX = (ax + bx + cx) / 3;
      let centroidY = (ay + by + cy) / 3;

      let px = floor((centroidX - offsetX) / scaleFactor);
      let py = floor((centroidY - offsetY) / scaleFactor);
      let index = (px + py * video.width) * 4;

      let rr = video.pixels[index];
      let gg = video.pixels[index + 1];
      let bb = video.pixels[index + 2];

      if (fillMesh) {
        noStroke();
        fill(meshColor[0], meshColor[1], meshColor[2]);
      } else {
        if (hideLines) {
          noStroke();
          noFill();
        } else {
          stroke(meshColor[0], meshColor[1], meshColor[2]);
          strokeWeight(scaledLineWidth); // ← UPDATED
          noFill();
        }
      }

      vertex(ax, ay);
      vertex(bx, by);
      vertex(cx, cy);
    }

    endShape();

    // Draw dots (scaled)
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

      circle(ax, ay, scaledDotSize); // ← UPDATED
      circle(bx, by, scaledDotSize); // ← UPDATED
      circle(cx, cy, scaledDotSize); // ← UPDATED
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}