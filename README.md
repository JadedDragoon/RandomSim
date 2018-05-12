A simple project to simulate random wins in a game over large numbers of iterations. Currently only intended to be run locally from terminal. Web-capable version planned for v2.0.0.

## Installation:

First, (download and extract)[https://github.com/JadedDragoon/RandomSim/releases] the latest release into it's own folder. Windows users should download the "zip" version.

Then change to the folder you extracted it into and run:
```bash
npm install -P
```
This will download and install all required dependencies.

On linux you may also have to `chmod +x randsim.sh` to make the start script executable.

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

