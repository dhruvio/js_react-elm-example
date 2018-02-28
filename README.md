# The Elm Architecture with React

## Quick Start

### With Nix

```bash
nix-shell
npm start
#navigate to localhost:3000 in your browser
```

### Without Nix

- Ensure you have Node.js >= 8 installed.

```bash
npm install
npm start
#navigate to localhost:3000 in your browser
```

## TODO

- Define different component types:
  - Standard component
  - "Page" component (handles routing, receives route params)
- Each component creates its `PropTypes` with a helper function
  - `definePropTypes :: StatePropType -> ComponentPropTypes`
- Client-side routing.
- Managing asynchronous data requirements declaratively scoped to a component.
- Global state mutation.
- Helper to standardise testing.
  - `testComponent :: Component -> Specification -> IO TestResults`
