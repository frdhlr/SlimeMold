const sensorLength = 10;
const sensorAngle  = 22;
const sensorRadius = 5;

const moveLength = 5;
const moveAngle  = 22;
const lifeTime   = 300;

const coreRadius = 5;

const nbParticles = 2000;
const particles   = [];
const slimes      = [];

const slimeRadius   = 0;
const slimeQuantity = 200;
const slimeDecay    = 2;


const map = [];

const emptyParticle = {
    posX:  0,
    posY:  0,
    angle: 0,
    life:  0
};

const emptySlime = {
    posX: 0,
    posY: 0,
    quantity: 0
};

function createParticle(posX, posY, angle, lifeTime) {
    const newParticle = Object.assign({}, emptyParticle);

    newParticle.posX     = posX;
    newParticle.posY     = posY;
    newParticle.angle    = angle;
    newParticle.lifeTime = lifeTime;

    return newParticle;
}

function createSlime(posX, posY, quantity) {
    const newSlime = Object.assign({}, emptySlime);

    newSlime.posX     = posX;
    newSlime.posY     = posY;
    newSlime.quantity = quantity;

    return newSlime;
}

function removeParticleFromMap(particle) {
    let index = 0;

    while(map[particle.posX][particle.posY].particles[index] != particle) {
        index++;
    }

    map[particle.posX][particle.posY].particles.splice(index, 1);
}

function resetParticle(particle) {
    if(particle.lifeTime <= 0) {

        removeParticleFromMap(particle);

        const posX = floor(width / 2.0 + (random(coreRadius * 2.0) - coreRadius));
        const posY = floor(height / 2.0 + (random(coreRadius * 2.0) - coreRadius));

        particle.posX     = posX;
        particle.posY     = posY;
        particle.angle    = floor(random(-180, 181));
        particle.lifeTime = lifeTime;

        map[particle.posX][particle.posY].particles.push(particle);
    }
}

function getSensorStimulus(particle, angle) {
    const totalAngle = particle.angle + angle;

    const sensorPosX = particle.posX + round(sensorLength * cos(totalAngle));
    const sensorPosY = particle.posY + round(sensorLength * sin(totalAngle));

    let stimulus = 0;

    for(let x = -sensorRadius; x <= sensorRadius; x++) {
        const stimulusPosX = sensorPosX + x;

        if(stimulusPosX >= 0 && stimulusPosX < width) {
            for(let y = -sensorRadius; y <= sensorRadius; y++) {
                const stimulusPosY = sensorPosY + y;

                if(stimulusPosY >= 0 && stimulusPosY < height) {
                    if(map[stimulusPosX][stimulusPosY].slimes.length === 1) {
                        stimulus += map[stimulusPosX][stimulusPosY].slimes[0].quantity;
                    }
                }
            }
        }
    }

    return stimulus;
}

function constraintAngle(angle) {
    let constrainedAngle = angle;

    if(angle < -180) {
        constrainedAngle += 360;
    }
    else if(angle > 180) {
        constrainedAngle -= 360;
    }

    return constrainedAngle;
}

function getNewAngle(particle) {
    const leftSensorStimulus   = getSensorStimulus(particle, -sensorAngle);
    const middleSensorStimulus = getSensorStimulus(particle, 0);
    const rightSensorStimulus  = getSensorStimulus(particle, sensorAngle);

    let angleDeviation = 0;

    if(leftSensorStimulus > middleSensorStimulus) {
        if(leftSensorStimulus === rightSensorStimulus) {
            if(random(1) < 0.5) {
                angleDeviation = -1;
            }
            else {
                angleDeviation = 1;
            }
        }
        else if(leftSensorStimulus > rightSensorStimulus) {
            angleDeviation = -1;
        }
        else {
            angleDeviation = 1;
        }
    }
    else if(rightSensorStimulus > middleSensorStimulus) {
        if(rightSensorStimulus === leftSensorStimulus) {
            if(random(1) < 0.5) {
                angleDeviation = -1;
            }
            else {
                angleDeviation = 1;
            }
        }
        else if(rightSensorStimulus > leftSensorStimulus) {
            angleDeviation = 1;
        }
        else {
            angleDeviation = -1;
        }
    }
    else if(middleSensorStimulus === leftSensorStimulus && middleSensorStimulus === rightSensorStimulus) {
        angleDeviation = floor(random(1, 4) - 2);
    }

    return constraintAngle(particle.angle + moveAngle * angleDeviation);
}

function moveParticle(particle) {
    particle.angle = getNewAngle(particle);

    const newPosX = particle.posX + round(moveLength * cos(particle.angle));
    const newPosY = particle.posY + round(moveLength * sin(particle.angle));

    if(newPosX >=0 && newPosX < width && newPosY >= 0 && newPosY < height) {
        if(map[newPosX][newPosY].particles.length === 0) {
            removeParticleFromMap(particle);

            particle.posX = newPosX;
            particle.posY = newPosY;

            map[particle.posX][particle.posY].particles.push(particle);
        }
        else {
            particle.angle = floor(random(-180, 181));
        }
    }
    else {
        particle.angle = floor(random(-180, 181));
    }

    particle.lifeTime--;
}

function generateSlime(particle) {
    for(let x = -slimeRadius; x <= slimeRadius; x++) {
        const slimePosX = particle.posX + x;

        if(slimePosX >= 0 && slimePosX < width) {
            for(let y = -slimeRadius; y <= slimeRadius; y++) {
                const slimePosY = particle.posY + y;

                if(slimePosY >= 0 && slimePosY < height) {
                    if(map[slimePosX][slimePosY].slimes.length === 0) {
                        const newSlime = createSlime(slimePosX, slimePosY, slimeQuantity);

                        map[slimePosX][slimePosY].slimes.push(newSlime);
                        slimes.push(newSlime);
                    }
                    else {
                        map[slimePosX][slimePosY].slimes[0].quantity = slimeQuantity;
                    }
                }
            }
        }
    }
}

function decaySlime(slime, slimeIndex) {
    slime.quantity -= slimeDecay;

    if(slime.quantity <= 0) {
        map[slime.posX][slime.posY].slimes.pop()
        slimes.splice(slimeIndex, 1);
    }
}

function displayParticle(particle) {
    fill(255);
    noStroke();

    circle(particle.posX, particle.posY, 2);

    const leftSensorX   = particle.posX + sensorLength * cos(particle.angle - sensorAngle);
    const middleSensorX = particle.posX + sensorLength * cos(particle.angle);
    const rightSensorX  = particle.posX + sensorLength * cos(particle.angle + sensorAngle);
    const leftSensorY   = particle.posY + sensorLength * sin(particle.angle - sensorAngle);
    const middleSensorY = particle.posY + sensorLength * sin(particle.angle);
    const rightSensorY  = particle.posY + sensorLength * sin(particle.angle + sensorAngle);

    noFill();
    stroke(255);

    line(particle.posX, particle.posY, leftSensorX,   leftSensorY);
    line(particle.posX, particle.posY, middleSensorX, middleSensorY);
    line(particle.posX, particle.posY, rightSensorX,  rightSensorY);

    circle(leftSensorX,   leftSensorY,   sensorRadius);
    circle(middleSensorX, middleSensorY, sensorRadius);
    circle(rightSensorX,  rightSensorY,  sensorRadius);
}

function displaySlime(slime) {
    stroke(255, slime.quantity);
    point(slime.posX, slime.posY);
}

function setup() {
    createCanvas(700, 700);

    background(0);
    angleMode(DEGREES);

    for(let i = 0; i < width; i++) {
        map.push(new Array(height));
    }

    for(let x = 0; x < width; x++) {
        for(let y = 0; y < height; y++) {
            map[x][y] = {slimes:    [],
                              particles: []};
        }
    }

    for(let i = 0; i < nbParticles; i++) {
        const posX  = floor(width / 2.0 + (random(coreRadius * 2.0) - coreRadius));
        const posY  = floor(height / 2.0 + (random(coreRadius * 2.0) - coreRadius));
        const angle = round(random(-180, 181));

        const newParticle = createParticle(posX, posY, angle, lifeTime);

        particles.push(newParticle);
        map[posX][posY].particles.push(newParticle);
    }
}

function draw() {
    background(0);

    for(let i = 0; i < particles.length; i++) {
        moveParticle(particles[i]);
        resetParticle(particles[i]);
        generateSlime(particles[i]);

        // displayParticle(particles[i]);
    }

    for(let i = 0; i < slimes.length; i++) {
        displaySlime(slimes[i]);
        decaySlime(slimes[i], i);
    }
}