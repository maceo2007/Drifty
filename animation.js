const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

function loadImages(path, count) {
    const images = [];
    for (let i = 0; i < count; i++) {
        const img = new Image();
        img.src = `${path}/${i}.png`;
        images.push(img);
    }
    return images;
}

function loadMultipleImages(path, width, height, count, direction) {
    const images = [];
    const img = new Image();
    img.src = path;
    img.onload = () => {
        for (let i = 0; i < count; i++) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const context = tempCanvas.getContext('2d');
            context.drawImage(img, (-i * width) * direction[0], (-i * height) * direction[1]);
            images.push(tempCanvas);
        }
    };
    return images;
}

function drawCar() {
    for (let i = 0; i < cars.length; i++) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2 - i * 5);
        ctx.rotate(angle);
        ctx.drawImage(cars[i], -cars[i].width / 2, -cars[i].height / 2);
        ctx.restore();
    }
}

function drawFire(angle, driftTime) {
    angle += Math.PI;
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(angle);
    if (fireFrame < start_fire.length) {
        ctx.drawImage(start_fire[Math.floor(fireFrame)], -start_fire[0].width / 2, -start_fire[0].height / 2 - 110);
    } else {
        const currentFire = driftTime > 30 ? super_fire : fire;
        ctx.drawImage(currentFire[Math.floor(fireFrame - start_fire.length)], -currentFire[0].width / 2, -currentFire[0].height / 2 - 110);
    }
    ctx.restore();

    fireFrame += 0.3;
    if (fireFrame >= (start_fire.length + fire.length)) {
        fireFrame = start_fire.length;
    }
}

function drawTraces() {
    traces.forEach((trace) => {
        trace[0] += dx;
        trace[1] += dy;

        ctx.save();
        ctx.translate(trace[0], trace[1]);
        ctx.rotate(trace[2]);
        ctx.drawImage(wheels, -wheels.width / 2, -wheels.height / 2);
        ctx.restore();
    });
}

function drawRoads() {
    roads.forEach((road) => {
        let posX = road[0] * tiles[0].width + canvas.width / 2 - tiles[0].width / 2 + mx;
        let posY = road[1] * tiles[0].height + canvas.height / 2 - tiles[0].height / 2 + my;
        ctx.drawImage(tiles[road[2]], posX, posY);
    });
}

function handleDrift() {
    if (angle > drift) {
        drift += 0.016;
    }
    if (angle < drift) {
        drift -= 0.016;
    }
    if (angle > Math.PI / 2) {
        angle = Math.PI / 2;
    }
    if (angle < -Math.PI / 2) {
        angle = -Math.PI / 2;
    }

    if (Math.abs(drift - angle) > 0.3) {
        traces.push([canvas.width / 2, canvas.height / 2, angle]);
        driftTime++;
        if (traces.length > 100) {
            traces.shift();
        }
    } else {
        driftTime = 0;
        fireFrame = 0;
    }
}

function add() {
    roads.push([x, y, 0]);
    y -= 1;
    let r = Math.random() < 0.5 ? -1 : 1;
    if (r === -1) {
        roads.push([x, y, 1]);
        x += r;
        roads.push([x, y, 3]);
        y -= 1;
    } else {
        roads.push([x, y, 2]);
        x += r;
        roads.push([x, y, 4]);
        y -= 1;
    }
}

function clearScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'rgb(0, 100, 0)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function updateAngle() {
    if (keyState['ArrowLeft']) {
        angle -= speed / 175;
    } else if (keyState['ArrowRight']) {
        angle += speed / 175;
    }
}

function updateSpeed() {
    if (fuel > 1) {
        score += 0.5;
        if (inside()) {
            if (speed < 6) {
                speed += 0.1;
            }
            if (speed > 6) {
                speed -= 0.1;
            }
        } else {
            if (speed > 4) {
                speed -= 0.1;
            }
            driftTime = 0;
        }
        if (driftTime > 5) {
            if (driftTime < 30) {
                speed = 6.5;
                fuel += 0.1;
            } else {
                speed = 7;
                fuel += 0.15;
            }
            drawFire(angle, driftTime);
        }
    } else {
        if (speed > 0) {
            speed -= 0.1;
        }
        if (speed < 0) {
            speed = 0;
        }
    }
}

function updateRoads() {
    roads = roads.filter(road => road[1] * tiles[0].height + canvas.height / 2 - tiles[0].height / 2 + my < canvas.height);
    if (roads.length < 6) add();
}

function inside() {
    for (let road of roads) {
        let posX = road[0] * tiles[0].width + canvas.width / 2 - tiles[0].width / 2 + mx;
        let posY = road[1] * tiles[0].height + canvas.height / 2 - tiles[0].height / 2 + my;

        if (posX < canvas.width / 2 && canvas.width / 2 < posX + tiles[0].width &&
            posY < canvas.height / 2 && canvas.height / 2 < posY + tiles[0].height) {
            return true;
        }
    }
    return false;
}

function drawScore() {
    ctx.font = '30px "Press Start 2P"';
    const scoreText = `Score:${Math.floor(score)}`;
    const textWidth = ctx.measureText(scoreText).width;
    const textHeight = 30;
    const xPosition = (canvas.width - textWidth) / 2;
    const yPosition = 45;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(xPosition - 15, yPosition - textHeight - 15, textWidth + 30, textHeight + 30);

    ctx.fillStyle = 'white';
    ctx.fillText(scoreText, xPosition, yPosition);
}

function drawFuel() {
    if (start) {
        fuel -= 0.1;
    }
    if (fuel < 0) {
        fuel = 0;
    }
    if (fuel > 100) {
        fuel = 100;
    }

    ctx.fillStyle = 'rgb(0, 0, 0)';
    ctx.fillRect(canvas.width / 2 - 200, canvas.height - 40, 400, 40);

    let red, green;
    if (fuel > 50) {
        red = Math.floor(255 * ((100 - fuel) / 50));
        green = 255;
    } else {
        red = 255;
        green = Math.floor(255 * (fuel / 50));
    }
    ctx.fillStyle = `rgb(${red}, ${green}, 0)`;

    ctx.fillRect(canvas.width / 2 - 195, canvas.height - 35, fuel * 3.9, 30);
}

function drawEnd() {
    if (fuel < 1 && speed < 1) {
        if (transparency < 0.7) {
            transparency += 0.01;
        }
        if (!arrived) {
            if (restartY > canvas.height / 2 - restart.height / 2) {
                restartY -= 10;
            } else {
                arrived = true;
            }
        }
        if (arrived) {
            restartY = canvas.height / 2 - restart.height / 2
        }
        ctx.fillStyle = `rgba(0, 0, 0, ${transparency})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(restart, canvas.width / 2 - restart.width / 2, restartY);
    }
}

function restartGame() {
    x = 0;
    y = 0;
    dx = 0;
    dy = 0;
    mx = 0;
    my = 0;
    speed = 0;
    angle = 0;
    drift = 0;
    score = 0;
    driftTime = 0;
    fireFrame = 0;
    transparency = 0;
    fuel = 100;
    roads = [];
    traces = [];
    keyState = {};
    press = false;
    start = false;
    arrived = false;
    restart = restart0;
    restartY = canvas.height;
}

canvas.addEventListener('mousemove', function(event) {
    if (fuel < 1 && speed < 1) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const restartX = canvas.width / 2 - restart.width / 2;
        const restartY = canvas.height / 2 - restart.height / 2;

        if (mouseX >= restartX && mouseX <= restartX + restart.width &&
            mouseY >= restartY && mouseY <= restartY + restart.height) {
            restart = restart1;
        } else {
            restart = restart0;
        }
    }
});

canvas.addEventListener('click', function(event) {
    start = true;
    if (fuel < 1 && speed < 1) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        const restartX = canvas.width / 2 - restart.width / 2;
        const restartY = canvas.height / 2 - restart.height / 2;

        if (mouseX >= restartX && mouseX <= restartX + restart.width &&
            mouseY >= restartY && mouseY <= restartY + restart.height) {
            restartGame();
        }
    }
});

document.addEventListener('keydown', (event) => {
    keyState[event.key] = true;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === ' ') {
        start = true;
    }
    if (event.key === ' ') {
        if (fuel < 1 && speed < 1) {
            restart = restart1;
            press = true;
        }
    }
});

document.addEventListener('keyup', (event) => {
    keyState[event.key] = false;
    if (event.key == ' ' && press) {
        restartGame();
    }
});

function updateAngle() {
    if (keyState['ArrowLeft']) {
        angle -= speed / 175;
    } else if (keyState['ArrowRight']) {
        angle += speed / 175;
    }
}

const start_fire = loadMultipleImages('img/start_fire.png', 96, 128, 4, [1, 0]);
const fire = loadMultipleImages('img/fire.png', 96, 128, 8, [1, 0]);
const super_fire = loadMultipleImages('img/super_fire.png', 96, 128, 8, [1, 0]);
const cars = loadMultipleImages('img/cars.png', 70, 100, 6, [0, 1]);
const tiles = loadImages('img/tiles', 5);

const wheels = new Image();
wheels.src = 'img/wheels.png';

const restart0 = new Image();
restart0.src = 'img/restart0.png';

const restart1 = new Image();
restart1.src = 'img/restart1.png';

let x = 0;
let y = 0;
let dx = 0;
let dy = 0;
let mx = 0;
let my = 0;
let speed = 0;
let angle = 0;
let drift = 0;
let score = 0;
let driftTime = 0;
let fireFrame = 0;
let transparency = 0;
let fuel = 100;
let roads = [];
let traces = [];
let keyState = {};
let press = false;
let start = false;
let arrived = false;
let restart = restart0;
let restartY = canvas.height;

function animate() {
    clearScreen();
    updateAngle();
    updateRoads();
    drawRoads();

    dx = Math.cos(drift + Math.PI / 2) * speed;
    dy = Math.sin(drift + Math.PI / 2) * speed;

    mx += dx;
    my += dy;

    drawTraces();
    handleDrift();
    drawCar();

    if (start) updateSpeed();

    drawScore();
    drawFuel();
    drawEnd();

    requestAnimationFrame(animate);
}

animate();
