A simple project to simulate random wins in a game over large numbers of iterations. Currently only intended to be run locally from terminal. Web-capable version planned for v2.0.0.

## Installation:

Node.js 8.11.1 or newer is required to run RandomSim. You may download it from the [Node.js site](https://nodejs.org/en/download/) or install it via package manager. Once installed run `node --version` from a command prompt/terminal to ensure your installed version is recent enough.

With node.js 8.11.1 or newer installed, download and extract [the latest release](https://github.com/JadedDragoon/RandomSim/releases) of RandomSim into it's own folder. Windows users should download the "zip" version.

Then, at a command prompt/terminal, change to the folder you extracted RandomSim into and run `npm install --production`. This will download and install all required dependencies. On linux/bsd you will also have to `chmod +x randsim.sh` to make the start script executable.

## Usage:
```
Usage (Win ): randsim.bat <field_size> <win_count> <iterations> <chunk_size>
Usage (*nix): randsim.sh <field_size> <win_count> <iterations> <chunk_size>

  field_size    The total number of unique results possible in each simulation.
                [Default: 1024]
  
  win_count     The number of winning results in each simulation. Must be less
                than field_size. [Default: 16]
                
  iterations    The total number of simulations that will be run.
                [Default: 102400]
                
  chunk_size    The number of sumilations that will be run concurently before
                writing the result to disk. [Default: 1024]
```

Copyright Jeremy Cliff Armstrong,
All rights reserved except where explicitly stated otherwise.

