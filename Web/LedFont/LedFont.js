input = document.getElementById("input");
input.addEventListener("input", function () {
  draw(input.value || input.placeholder);
});
const circleInfo = {
  size: 8,
  spacing: 2,
  color: "rgb(33, 33, 33)",
};

function draw(text) {
  output = document.getElementById("output");
  output.innerHTML = "";
  canvas = document.createElement("canvas");
  canvas.width = 400;
  canvas.height = 100;
  ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  rowCount =
    (canvas.height - circleInfo.spacing) /
    (circleInfo.size + circleInfo.spacing);
  columnCount =
    (canvas.width - circleInfo.spacing) /
    (circleInfo.size + circleInfo.spacing);
  function drawCircle() {
    ctx.fillStyle = circleInfo.color;
    for (let i = 0; i < rowCount; i++) {
      for (let j = 0; j < columnCount; j++) {
        ctx.beginPath();
        ctx.arc(
          j * (circleInfo.size + circleInfo.spacing) +
            circleInfo.spacing +
            circleInfo.size / 2,
          i * (circleInfo.size + circleInfo.spacing) +
            circleInfo.spacing +
            circleInfo.size / 2,
          circleInfo.size / 2,
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    }
  }
  drawCircle();
  ctx.beginPath();
  ctx.globalCompositeOperation = "source-atop";
  ctx.fillStyle = "white";
  ctx.font = "80px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let { actualBoundingBoxAscent, actualBoundingBoxDescent } =
    ctx.measureText(text);
  ctx.fillText(
    text,
    canvas.width / 2,
    canvas.height / 2 + (actualBoundingBoxAscent - actualBoundingBoxDescent) / 2
  );
  output.appendChild(canvas);
}
draw(input.value || input.placeholder);
