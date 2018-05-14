A simple project to simulate random wins in a game over large numbers of iterations. Currently only intended to be run locally from terminal. Web-capable version planned for v2.0.0.

## Installation:

Node.js 8.11.1 or newer is required to run RandomSim. You may download it from the [Node.js site](https://nodejs.org/en/download/) or install it via package manager. Once installed run `node --version` from a command prompt/terminal to ensure your installed version is recent enough.

With node.js 8.11.1 or newer installed, download and extract [the latest release](https://github.com/JadedDragoon/RandomSim/releases) of RandomSim into it's own folder. Windows users should download the "zip" version.

Then, at a command prompt/terminal, change to the folder you extracted RandomSim into and run `npm install --production`. This will download and install all required dependencies. On linux/bsd you will also have to `chmod +x randsim.sh` to make the start script executable.

## Usage:
```45678901234567890123456789012345678901234567890123456789012345678901234567890
Usage (Win ): randsim.bat <field_size> <win_count> <iterations> <chunk_size>
Usage (*nix): randsim.sh <field_size> <win_count> <iterations> <chunk_size>

  field_size    [Default: 1024] The total number of unique results possible in
                each simulation.                
  
  win_count     [Default: 16] The number of winning results in each simulation.
                Must be less than field_size. Increasing this will somewhat
                increase memory requirements and significantly increase
                execution time.
                
  iterations    [Default: 102400] The total number of simulations that will be
                run. Increasing this will significantly increase both the disk
                space required and the execution time.
                
  chunk_size    [Default: 1024] The number of simulations that will be run
                before writing the result to disk. Increasing this will
                significantly increase how much memory is needed.
```

Copyright Jeremy Cliff Armstrong,
All rights reserved except where explicitly stated otherwise.
