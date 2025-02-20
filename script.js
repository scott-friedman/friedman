// Only run physics on index page
if (window.location.pathname === '/' || window.location.pathname.endsWith('index.html')) {
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

    // Create boundaries
    const ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 50, window.innerWidth, 100, { isStatic: true, render: { visible: false } });
    const leftWall = Bodies.rectangle(-50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { visible: false } });
    const rightWall = Bodies.rectangle(window.innerWidth + 50, window.innerHeight / 2, 100, window.innerHeight, { isStatic: true, render: { visible: false } });

    // Create link bodies with spaced-out starting positions
    const navLinks = document.querySelectorAll('.nav-link');
    const linkBodies = [];
    const initialPositions = [];

    navLinks.forEach((link, index) => {
        const rect = link.getBoundingClientRect();
        const startX = window.innerWidth / 4 + index * (window.innerWidth / 4); // Spread across width
        const body = Bodies.rectangle(
            startX,
            50,
            rect.width + 20,
            rect.height + 20,
            {
                restitution: 0.8, // Bounciness
                friction: 0.05,   // Less friction for more sliding
                density: 0.001,   // Lighter for varied falling
                render: { visible: false }
            }
        );
        linkBodies.push(body);
        initialPositions.push({ x: startX, y: 50 });
        World.add(engine.world, body);
        body.linkElement = link;
    });

    // Mouse interaction
    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
        mouse: mouse,
        constraint: { stiffness: 0.2 }
    });
    World.add(engine.world, mouseConstraint);

    // Add world objects and run
    World.add(engine.world, [ground, leftWall, rightWall, ...linkBodies]);
    Engine.run(engine);
    Render.run(render);

    // Update link positions
    Matter.Events.on(engine, 'afterUpdate', () => {
        linkBodies.forEach((body) => {
            const link = body.linkElement;
            link.style.position = 'absolute';
            link.style.left = `${body.position.x - link.offsetWidth / 2}px`;
            link.style.top = `${body.position.y - link.offsetHeight / 2}px`;
        });
    });

    // Drop after 2 seconds
    setTimeout(() => {
        linkBodies.forEach(body => Matter.Body.setStatic(body, false));
    }, 2000);

    // Reset function
    function resetLinks() {
        linkBodies.forEach((body, index) => {
            Matter.Body.setPosition(body, initialPositions[index]);
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
            Matter.Body.setStatic(body, true); // Hold until next drop
        });
        setTimeout(() => {
            linkBodies.forEach(body => Matter.Body.setStatic(body, false));
        }, 2000); // Drop again after reset
    }

    // Double-click to reset
    document.body.addEventListener('dblclick', resetLinks);
}
