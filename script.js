// Matter.js setup
const { Engine, Render, World, Bodies, Mouse, MouseConstraint } = Matter;

// Create engine and renderer
const engine = Engine.create();
const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false,
        background: 'transparent'
    }
});

// Create ground (bottom boundary)
const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, {
    isStatic: true,
    render: { visible: false }
});

// Create navigation links as physical bodies
const navLinks = document.querySelectorAll('.nav-link');
const linkBodies = [];
const initialPositions = []; // Store original positions

navLinks.forEach((link, index) => {
    const rect = link.getBoundingClientRect();
    const body = Bodies.rectangle(
        rect.left + rect.width / 2,
        50, // Start near top
        rect.width,
        rect.height,
        {
            restitution: 0.8, // Bounciness
            friction: 0.1,
            render: { visible: false } // Invisible physics body
        }
    );
    linkBodies.push(body);
    initialPositions.push({ x: rect.left + rect.width / 2, y: 50 });
    World.add(engine.world, body);

    // Bind link to its physics body
    body.linkElement = link;
});

// Add mouse control for dragging
const mouse = Mouse.create(render.canvas);
const mouseConstraint = MouseConstraint.create(engine, {
    mouse: mouse,
    constraint: { stiffness: 0.2 }
});
World.add(engine.world, mouseConstraint);

// Add ground and run the engine
World.add(engine.world, ground);
Engine.run(engine);
Render.run(render);

// Animate links to follow their physics bodies
Matter.Events.on(engine, 'afterUpdate', () => {
    linkBodies.forEach((body, index) => {
        const link = body.linkElement;
        link.style.position = 'absolute';
        link.style.left = `${body.position.x - link.offsetWidth / 2}px`;
        link.style.top = `${body.position.y - link.offsetHeight / 2}px`;
    });
});

// Reset links to original positions (optional manual reset)
function resetLinks() {
    linkBodies.forEach((body, index) => {
        Matter.Body.setPosition(body, initialPositions[index]);
        Matter.Body.setVelocity(body, { x: 0, y: 0 });
    });
}

// Trigger gravity drop after 2 seconds (or on event like hover)
setTimeout(() => {
    linkBodies.forEach(body => {
        Matter.Body.setStatic(body, false); // Let them fall
    });
}, 2000);

// Click handler for links (works even when fallen)
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        document.getElementById(targetId).scrollIntoView({ behavior: 'smooth' });
    });
});

// Optional: Reset on double-click (for fun)
document.body.addEventListener('dblclick', resetLinks);
